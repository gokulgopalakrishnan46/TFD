import pandas as pd
import numpy as np
import os

# Create model directory if not exists
if not os.path.exists('model'):
    os.makedirs('model')

def generate_data(n_samples=10000):
    print(f"Generating synthetic dataset with {n_samples} samples...")
    
    # helper for random choices reflecting new fields
    beneficiary_options = ['known', 'unknown']
    bank_options = ['same', 'different']
    intl_options = ['local', 'international']
    merchant_options = ['retail', 'food', 'individual', 'entertainment', 'utilities']
    channel_options = ['online', 'pos', 'atm']
    known_entity_options = ['yes', 'no']

    # 1. Normal Transactions
    data = {
        'TransactionAmount': np.random.uniform(10, 5000, n_samples),
        'TransactionType': np.random.choice(['PAYMENT', 'TRANSFER', 'CASH_OUT', 'DEBIT', 'CASH_IN'], n_samples),
        'AccountBalance': np.random.uniform(100, 100000, n_samples),
        'TransactionDuration': np.random.uniform(15, 300, n_samples),
        'LoginAttempts': np.random.choice([1, 1, 1, 2], n_samples),
        'BeneficiaryStatus': np.random.choice(beneficiary_options, n_samples, p=[0.9, 0.1]),
        'BankType': np.random.choice(bank_options, n_samples, p=[0.9, 0.1]),
        'IsInternational': np.random.choice(intl_options, n_samples, p=[0.95, 0.05]),
        'MerchantCategory': np.random.choice(merchant_options, n_samples),
        'DebitChannel': np.random.choice(channel_options, n_samples),
        'IsKnownEntity': np.random.choice(known_entity_options, n_samples, p=[0.9, 0.1]),
        'IsFraud': np.zeros(n_samples, dtype=int)
    }
    
    df = pd.DataFrame(data)
    
    # 2. Inject Fraud Patterns
    
    # Pattern 1: High Amount + Unknown Beneficiary (NEFT-like)
    n_fraud_neft = int(n_samples * 0.03)
    fraud_neft = pd.DataFrame({
        'TransactionAmount': np.random.uniform(50000, 200000, n_fraud_neft),
        'TransactionType': ['TRANSFER'] * n_fraud_neft,
        'AccountBalance': np.random.uniform(50000, 500000, n_fraud_neft),
        'TransactionDuration': np.random.uniform(10, 60, n_fraud_neft),
        'LoginAttempts': np.random.randint(1, 3, n_fraud_neft),
        'BeneficiaryStatus': ['unknown'] * n_fraud_neft,
        'BankType': np.random.choice(bank_options, n_fraud_neft, p=[0.3, 0.7]),
        'IsInternational': ['local'] * n_fraud_neft,
        'MerchantCategory': ['individual'] * n_fraud_neft,
        'DebitChannel': ['online'] * n_fraud_neft,
        'IsKnownEntity': ['no'] * n_fraud_neft,
        'IsFraud': np.ones(n_fraud_neft, dtype=int)
    })

    # Pattern 2: International CC Fraud
    n_fraud_intl = int(n_samples * 0.02)
    fraud_intl = pd.DataFrame({
        'TransactionAmount': np.random.uniform(10000, 100000, n_fraud_intl),
        'TransactionType': ['CASH_OUT'] * n_fraud_intl,
        'AccountBalance': np.random.uniform(10000, 200000, n_fraud_intl),
        'TransactionDuration': np.random.uniform(5, 40, n_fraud_intl),
        'LoginAttempts': [1] * n_fraud_intl,
        'BeneficiaryStatus': ['known'] * n_fraud_intl,
        'BankType': ['different'] * n_fraud_intl,
        'IsInternational': ['international'] * n_fraud_intl,
        'MerchantCategory': np.random.choice(merchant_options, n_fraud_intl),
        'DebitChannel': ['online'] * n_fraud_intl,
        'IsKnownEntity': ['yes'] * n_fraud_intl,
        'IsFraud': np.ones(n_fraud_intl, dtype=int)
    })
    
    # Pattern 3: ATM Cashout Fraud
    n_fraud_atm = int(n_samples * 0.02)
    fraud_atm = pd.DataFrame({
        'TransactionAmount': np.random.uniform(50000, 100000, n_fraud_atm),
        'TransactionType': ['DEBIT'] * n_fraud_atm,
        'AccountBalance': np.random.uniform(50000, 300000, n_fraud_atm),
        'TransactionDuration': np.random.uniform(30, 120, n_fraud_atm),
        'LoginAttempts': [1] * n_fraud_atm,
        'BeneficiaryStatus': ['known'] * n_fraud_atm,
        'BankType': ['same'] * n_fraud_atm,
        'IsInternational': ['local'] * n_fraud_atm,
        'MerchantCategory': ['individual'] * n_fraud_atm,
        'DebitChannel': ['atm'] * n_fraud_atm,
        'IsKnownEntity': ['no'] * n_fraud_atm,
        'IsFraud': np.ones(n_fraud_atm, dtype=int)
    })
    
    # Combine all
    df_final = pd.concat([df, fraud_neft, fraud_intl, fraud_atm], ignore_index=True)
    
    # Shuffle
    df_final = df_final.sample(frac=1).reset_index(drop=True)
    
    # Save
    output_path = 'model/fraud_dataset.csv'
    df_final.to_csv(output_path, index=False)
    print(f"Dataset saved to {output_path}. Total size: {len(df_final)}")
    return output_path

if __name__ == "__main__":
    generate_data()
