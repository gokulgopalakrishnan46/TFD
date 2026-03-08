import pandas as pd
import numpy as np
from sklearn.preprocessing import StandardScaler, LabelEncoder

def preprocess_data(df, is_training=True, encoders=None, scaler=None):
    # Expanded feature set
    numeric_features = ['TransactionAmount', 'AccountBalance', 'TransactionDuration', 'LoginAttempts']
    categorical_features = [
        'TransactionType', 'BeneficiaryStatus', 'BankType', 
        'IsInternational', 'MerchantCategory', 'DebitChannel', 'IsKnownEntity'
    ]
    all_features = numeric_features + categorical_features
    
    # Ensure all columns exist
    for col in all_features:
        if col not in df.columns:
            # Default for numeric is 0, for categorical is 'unknown' or 'none'
            if col in numeric_features:
                df[col] = 0.0
            else:
                df[col] = 'unknown' if col != 'IsInternational' else 'local'

    df = df[all_features].copy()
    df = df.fillna(0)
    
    # Handle Categorical Encoding
    if is_training:
        encoders = {}
        for col in categorical_features:
            le = LabelEncoder()
            df[col] = le.fit_transform(df[col].astype(str))
            encoders[col] = le
    else:
        # Inference mode
        for col in categorical_features:
            le = encoders[col]
            # Handle unseen labels by mapping to 0 if transform fails
            df[col] = df[col].astype(str).apply(lambda x: le.transform([x])[0] if x in le.classes_ else 0)

    # Scale numerical features
    if is_training:
        scaler = StandardScaler()
        df[numeric_features] = scaler.fit_transform(df[numeric_features])
    else:
        df[numeric_features] = scaler.transform(df[numeric_features])
        
    return df, scaler, encoders
