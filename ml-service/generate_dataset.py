import pandas as pd
import numpy as np
import os

# Create model directory if not exists
if not os.path.exists('model'):
    os.makedirs('model')

def generate_data(n_samples=5000):
    print(f"Generating synthetic dataset with {n_samples} samples...")
    
    # 1. Normal Transactions
    data = {
        'TransactionAmount': np.random.uniform(10, 5000, n_samples),
        'TransactionType': np.random.choice(['PAYMENT', 'TRANSFER', 'CASH_OUT', 'DEBIT', 'CASH_IN'], n_samples),
        'AccountBalance': np.random.uniform(100, 100000, n_samples),
        'TransactionDuration': np.random.uniform(15, 300, n_samples),
        'LoginAttempts': np.random.choice([1, 1, 1, 2], n_samples), # Mostly 1 or 2
        'IsFraud': np.zeros(n_samples, dtype=int)
    }
    
    df = pd.DataFrame(data)
    
    # 2. Inject Fraud Patterns
    
    # Pattern 1: High Amount Fraud (Large Transfers/Cash Outs)
    n_fraud_high = int(n_samples * 0.02)
    fraud_high = pd.DataFrame({
        'TransactionAmount': np.random.uniform(50000, 500000, n_fraud_high),
        'TransactionType': np.random.choice(['TRANSFER', 'CASH_OUT'], n_fraud_high),
        'AccountBalance': np.random.uniform(50000, 1000000, n_fraud_high),
        'TransactionDuration': np.random.uniform(10, 60, n_fraud_high), # Usually faster
        'LoginAttempts': np.random.randint(1, 3, n_fraud_high),
        'IsFraud': np.ones(n_fraud_high, dtype=int)
    })
    
    # Pattern 2: Rapid Bot Fire (Extremely low duration)
    n_fraud_bot = int(n_samples * 0.02)
    fraud_bot = pd.DataFrame({
        'TransactionAmount': np.random.uniform(10, 1000, n_fraud_bot),
        'TransactionType': np.random.choice(['PAYMENT', 'DEBIT'], n_fraud_bot),
        'AccountBalance': np.random.uniform(100, 50000, n_fraud_bot),
        'TransactionDuration': np.random.uniform(0.1, 5, n_fraud_bot),
        'LoginAttempts': np.ones(n_fraud_bot, dtype=int),
        'IsFraud': np.ones(n_fraud_bot, dtype=int)
    })
    
    # Pattern 3: Brute Force Attempt (High login attempts)
    n_fraud_brute = int(n_samples * 0.01)
    fraud_brute = pd.DataFrame({
        'TransactionAmount': np.random.uniform(100, 10000, n_fraud_brute),
        'TransactionType': np.random.choice(['TRANSFER', 'PAYMENT'], n_fraud_brute),
        'AccountBalance': np.random.uniform(1000, 100000, n_fraud_brute),
        'TransactionDuration': np.random.uniform(60, 600, n_fraud_brute),
        'LoginAttempts': np.random.randint(5, 12, n_fraud_brute),
        'IsFraud': np.ones(n_fraud_brute, dtype=int)
    })
    
    # Combine all
    df_final = pd.concat([df, fraud_high, fraud_bot, fraud_brute], ignore_index=True)
    
    # Shuffle
    df_final = df_final.sample(frac=1).reset_index(drop=True)
    
    # Save
    output_path = 'model/fraud_dataset.csv'
    df_final.to_csv(output_path, index=False)
    print(f"Dataset saved to {output_path}. Total size: {len(df_final)}")
    return output_path

if __name__ == "__main__":
    generate_data()
