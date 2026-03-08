from fastapi import FastAPI, HTTPException
from pydantic import BaseModel
from typing import Optional, Dict, Any
import joblib
import pandas as pd
import numpy as np
import os
from preprocessing import preprocess_data

app = FastAPI()

# Global variables for models
model_rf = None
scaler = None
encoders = None

def load_models():
    global model_rf, scaler, encoders
    try:
        model_rf = joblib.load('model/random_forest.pkl')
        scaler = joblib.load('model/scaler.pkl')
        encoders = joblib.load('model/encoders.pkl')
        print("Models loaded successfully.")
    except Exception as e:
        print(f"Error loading models: {e}")

# Load models on startup
load_models()

class TransactionRequest(BaseModel):
    type: str
    amount: float
    accountBalance: float
    transactionDuration: float
    loginAttempts: int
    details: Optional[Dict[str, Any]] = None

class FraudResponse(BaseModel):
    probability: float
    isFraud: bool
    riskLevel: str

@app.get("/")
def read_root():
    return {"message": "Fraud Lens ML Service is running"}

@app.post("/predict", response_model=FraudResponse)
def predict_fraud(transaction: TransactionRequest):
    global model_rf, scaler, encoders
    
    if model_rf is None:
        return {"probability": 0.0, "isFraud": False, "riskLevel": "ERROR (Model not loaded)"}

    # Map transaction type to internal labels used in generate_dataset.py
    type_mapping = {
        'NEFT': 'TRANSFER',
        'UPI': 'TRANSFER',
        'Credit Card': 'CASH_OUT',
        'Debit Card': 'DEBIT'
    }
    mapped_type = type_mapping.get(transaction.type, 'PAYMENT')

    # Flatten details into the main dict
    input_data = {
        'TransactionAmount': [transaction.amount],
        'TransactionType': [mapped_type],
        'AccountBalance': [transaction.accountBalance],
        'TransactionDuration': [transaction.transactionDuration],
        'LoginAttempts': [transaction.loginAttempts],
    }
    
    # Add optional details if present
    details = transaction.details or {}
    input_data['BeneficiaryStatus'] = [details.get('beneficiaryStatus', 'known')]
    input_data['BankType'] = [details.get('bankType', 'same')]
    input_data['IsInternational'] = [details.get('isInternational', 'local')]
    input_data['MerchantCategory'] = [details.get('merchantCategory', 'retail')]
    input_data['DebitChannel'] = [details.get('debitChannel', 'online')]
    input_data['IsKnownEntity'] = [details.get('isKnownEntity', 'yes')]
    
    df = pd.DataFrame(input_data)
    
    try:
        # Preprocess using the unified feature set
        X_pred, _, _ = preprocess_data(df, is_training=False, encoders=encoders, scaler=scaler)
        
        # Predict Probabilities
        prob = model_rf.predict_proba(X_pred)[0][1]
        print(f"DEBUG PRE-BOOST: Amount={transaction.amount}, Type={transaction.type}, Prob={prob}")

        # SAFETY BOOSTS (Manual overrides to ensure desired UX behavior)
        if transaction.amount > 200000:
             prob += 0.4 # Reduced from 0.6 since model learns this now
             
        # NEFT Specific: Unknown Beneficiary Boost
        if details.get('beneficiaryStatus') == 'unknown':
             prob += 0.2 # Reduced from 0.3
             
        # Credit Card Specific: International Transaction Boost
        if details.get('isInternational') == 'international':
             prob += 0.3 # Reduced from 0.4
             
        # UPI Specific: Unknown Entity Boost
        if details.get('isKnownEntity') == 'no':
             prob += 0.15 # Reduced from 0.25
             
        # Cap at 1.0
        prob = min(prob, 1.0)
        
        is_fraud = prob > 0.5
        risk_level = "LOW"
        if prob > 0.3: risk_level = "MEDIUM"
        if prob > 0.7: risk_level = "HIGH"
            
        return {
            "probability": round(float(prob), 4),
            "isFraud": bool(is_fraud),
            "riskLevel": risk_level
        }
    except Exception as e:
        print(f"Prediction error: {e}")
        raise HTTPException(status_code=500, detail=str(e))

if __name__ == "__main__":
    import uvicorn
    uvicorn.run(app, host="0.0.0.0", port=8000)
