import pandas as pd

try:
    df = pd.read_csv('model/bank_transactions_data_2.csv')
    print("Columns:", df.columns.tolist())
    
    # Filter for fraud
    fraud_df = df[df['IsFraud'] == 1]
    
    if not fraud_df.empty:
        print("\nFraud Example:")
        print(fraud_df.iloc[0])
    else:
        print("\nNo fraud records found.")
except Exception as e:
    print(f"Error: {e}")
