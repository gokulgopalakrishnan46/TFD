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
le = None

def load_models():
    global model_rf, scaler, le
    try:
        model_rf = joblib.load('model/random_forest.pkl')
        scaler = joblib.load('model/scaler.pkl')
        le = joblib.load('model/label_encoder.pkl')
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
    return {"message": "Fraud Detection ML Service is running"}

@app.post("/predict", response_model=FraudResponse)
def predict_fraud(transaction: TransactionRequest):
    global model_rf, scaler, le
    
    if model_rf is None:
        # Fallback if models failed to load
        return {"probability": 0.0, "isFraud": False, "riskLevel": "ERROR (Model not loaded)"}

    # Prepare input dataframe
    input_data = {
        'TransactionAmount': [transaction.amount],
        'TransactionType': [transaction.type],
        'AccountBalance': [transaction.accountBalance],
        'TransactionDuration': [transaction.transactionDuration],
        'LoginAttempts': [transaction.loginAttempts]
    }
    
    df = pd.DataFrame(input_data)
    
    try:
        # Preprocess
        X_pred, _, _ = preprocess_data(df, is_training=False, le=le, scaler=scaler)
        
        # Predict Probabilities
        prob = model_rf.predict_proba(X_pred)[0][1] # Probability of class 1 (Fraud)
        print(f"DEBUG PRE-BOOST: Amount={transaction.amount}, Type={transaction.type}, Prob={prob}")

        
        # HYBRID APPROACH: Boost probability for known high-risk patterns
        # This ensures the model is not solely relied upon if it misses obvious cases
        if transaction.amount > 200000:
             prob += 0.6
             
        if transaction.amount > 50000 and transaction.type == 'TRANSFER':
             prob += 0.2
             
        # Cap at 1.0
        prob = min(prob, 1.0)
        
        is_fraud = prob > 0.5
        
        risk_level = "LOW"
        if prob > 0.3:
            risk_level = "MEDIUM"
        if prob > 0.7:
            risk_level = "HIGH"
            
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
