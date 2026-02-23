import pandas as pd
import numpy as np
from sklearn.preprocessing import StandardScaler, LabelEncoder

def preprocess_data(df, is_training=True, le=None, scaler=None):
    # Select relevant columns
    # Using specific columns available in bank_transactions_data_2.csv
    features = ['TransactionAmount', 'TransactionType', 'AccountBalance', 'TransactionDuration', 'LoginAttempts']
    
    # If for prediction (single row), ensure columns exist
    for col in features:
        if col not in df.columns:
            df[col] = 0 # Default value if missing
            
    df = df[features].copy()
    
    # Handle missing values
    df = df.fillna(0)
    
    # Encode TransactionType
    if is_training:
        le = LabelEncoder()
        df['TransactionType'] = le.fit_transform(df['TransactionType'].astype(str))
    else:
        # User transform, handle unseen labels
        df['TransactionType'] = df['TransactionType'].astype(str).map(lambda x: x if x in le.classes_ else 'Unknown')
        # If unknown, map to a default or handle error. For now, map to 0 (first class) if unknown or re-fit for simplicity in this demo context
        # Better approach for demo: just use fit_transform on training and try transform on inference, if fail use 0
        try:
           df['TransactionType'] = le.transform(df['TransactionType']) 
        except:
           # Fallback for unseen labels
           df['TransactionType'] = 0

    # Scale numerical features
    numerical_cols = ['TransactionAmount', 'AccountBalance', 'TransactionDuration', 'LoginAttempts']
    
    if is_training:
        scaler = StandardScaler()
        df[numerical_cols] = scaler.fit_transform(df[numerical_cols])
    else:
        df[numerical_cols] = scaler.transform(df[numerical_cols])
        
    return df, scaler, le
