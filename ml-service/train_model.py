import pandas as pd
import numpy as np
from sklearn.ensemble import IsolationForest, RandomForestClassifier
from sklearn.model_selection import train_test_split
import joblib
import os
from preprocessing import preprocess_data

# Create model directory if not exists
if not os.path.exists('model'):
    os.makedirs('model')

def train():
    print("Training models...")
    
    # Load Generated Dataset
    dataset_path = 'model/fraud_dataset.csv'
    if not os.path.exists(dataset_path):
        print(f"Dataset {dataset_path} not found. Running generator...")
        from generate_dataset import generate_data
        generate_data()
        
    try:
        df = pd.read_csv(dataset_path)
        print(f"Dataset loaded successfully with {len(df)} samples.")
    except Exception as e:
        print(f"Error loading dataset: {e}")
        return

    # Map target column
    if 'IsFraud' in df.columns:
        y = df['IsFraud']
    else:
        print("CRITICAL: 'IsFraud' column missing from dataset.")
        return

    # Preprocess
    X, scaler, le = preprocess_data(df, is_training=True)
    
    # 1. Unsupervised: Isolation Forest (for anomaly detection)
    iso_forest = IsolationForest(contamination=0.05, random_state=42)
    iso_forest.fit(X)
    
    # 2. Supervised: Random Forest (for classification)
    X_train, X_test, y_train, y_test = train_test_split(X, y, test_size=0.2, random_state=42, stratify=y)
    
    print(f"Training Random Forest on {len(X_train)} samples...")
    rf_clf = RandomForestClassifier(n_estimators=100, random_state=42)
    rf_clf.fit(X_train, y_train)
    
    # Evaluate briefly
    score = rf_clf.score(X_test, y_test)
    print(f"Model Accuracy (RF): {score:.4f}")
    
    # Save models
    joblib.dump(iso_forest, 'model/isolation_forest.pkl')
    joblib.dump(rf_clf, 'model/random_forest.pkl')
    joblib.dump(scaler, 'model/scaler.pkl')
    joblib.dump(le, 'model/label_encoder.pkl')
    
    print("Models trained and exported to model/ directory.")

if __name__ == "__main__":
    train()
