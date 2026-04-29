import pandas as pd
from sklearn.ensemble import RandomForestClassifier
import joblib

df = pd.read_csv("creditcard.csv")

df["hour"] = df["transaction_hour"]

X = df[["amount", "hour"]]
y = df["is_fraud"]

model = RandomForestClassifier()
model.fit(X, y)

joblib.dump(model, "model.pkl")

print("Model trained")