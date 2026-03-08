import pandas as pd
import numpy as np
import os

def calculate_risk(row):
    # Simplified version of the hybrid risk logic in main.py
    prob = 0.1 # Base probability for "safe" looking transactions
    
    # Amount-based boosts
    if row['Amount'] > 200000:
        prob += 0.6
    elif row['Amount'] > 50000 and (row['Type'] == 'TRANSFER' or row['Type'] == 'NEFT'):
        prob += 0.2
        
    # Type-specific boosts
    if row['Type'] == 'NEFT':
        if row['BeneficiaryStatus'] == 'unknown':
            prob += 0.3
        if row['BankType'] == 'different':
            prob += 0.15
            
    elif row['Type'] == 'Credit Card':
        if row['IsInternational'] == 'international':
            prob += 0.4
            
    elif row['Type'] == 'Debit Card':
        if row['MerchantCategory'] == 'individual':
            prob += 0.2
        if row['DebitChannel'] == 'atm' and row['Amount'] > 50000:
            prob += 0.1
            
    elif row['Type'] == 'UPI':
        if row['IsKnownEntity'] == 'no':
            prob += 0.25
            
    prob = min(prob, 1.0)
    
    status = "Safe"
    if prob >= 0.7:
        status = "Danger"
    elif prob >= 0.4:
        status = "Medium"
        
    return prob, status

def generate_neft(n=1000):
    data = []
    for _ in range(n):
        amount = np.random.exponential(scale=20000) + 100
        ben_status = np.random.choice(['known', 'unknown'], p=[0.7, 0.3])
        bank_type = np.random.choice(['same', 'different'], p=[0.8, 0.2])
        
        row = {'Type': 'NEFT', 'Amount': round(amount, 2), 'BeneficiaryStatus': ben_status, 'BankType': bank_type}
        prob, status = calculate_risk(row)
        row['RiskProbability'] = round(prob, 4)
        row['Status'] = status
        data.append(row)
    return pd.DataFrame(data)

def generate_credit_card(n=1000):
    data = []
    cities = ['Mumbai', 'Delhi', 'Bangalore', 'London', 'New York', 'Singapore', 'Dubai']
    for _ in range(n):
        amount = np.random.exponential(scale=15000) + 50
        is_intl = np.random.choice(['local', 'international'], p=[0.9, 0.1])
        loc = np.random.choice(cities)
        
        row = {'Type': 'Credit Card', 'Amount': round(amount, 2), 'Location': loc, 'IsInternational': is_intl}
        prob, status = calculate_risk(row)
        row['RiskProbability'] = round(prob, 4)
        row['Status'] = status
        data.append(row)
    return pd.DataFrame(data)

def generate_debit_card(n=1000):
    data = []
    cats = ['retail', 'food', 'individual', 'entertainment', 'utilities']
    channels = ['online', 'pos', 'atm']
    for _ in range(n):
        amount = np.random.exponential(scale=10000) + 20
        cat = np.random.choice(cats)
        chan = np.random.choice(channels)
        
        row = {'Type': 'Debit Card', 'Amount': round(amount, 2), 'MerchantCategory': cat, 'DebitChannel': chan}
        prob, status = calculate_risk(row)
        row['RiskProbability'] = round(prob, 4)
        row['Status'] = status
        data.append(row)
    return pd.DataFrame(data)

def generate_upi(n=1000):
    data = []
    for _ in range(n):
        amount = np.random.exponential(scale=5000) + 1
        known = np.random.choice(['yes', 'no'], p=[0.85, 0.15])
        
        row = {'Type': 'UPI', 'Amount': round(amount, 2), 'IsKnownEntity': known}
        prob, status = calculate_risk(row)
        row['RiskProbability'] = round(prob, 4)
        row['Status'] = status
        data.append(row)
    return pd.DataFrame(data)

if __name__ == "__main__":
    print("Generating large datasets (1000 rows each)...")
    generate_neft().to_csv('neft_dataset_large.csv', index=False)
    generate_credit_card().to_csv('credit_card_dataset_large.csv', index=False)
    generate_debit_card().to_csv('debit_card_dataset_large.csv', index=False)
    generate_upi().to_csv('upi_dataset_large.csv', index=False)
    print("Large datasets generated successfully.")
