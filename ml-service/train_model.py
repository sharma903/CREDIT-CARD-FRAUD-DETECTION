import pandas as pd
from sklearn.ensemble import RandomForestClassifier
from sklearn.model_selection import train_test_split
from sklearn.preprocessing import StandardScaler, LabelEncoder
import joblib

# Load dataset
df = pd.read_csv("creditcard.csv")

print("Columns:", df.columns)

# Target column
target_column = "is_fraud"

# Encode categorical column
encoder = LabelEncoder()

df["merchant_category"] = encoder.fit_transform(
    df["merchant_category"]
)

# Features and target
X = df.drop(target_column, axis=1)
y = df[target_column]

# Scale features
scaler = StandardScaler()

X_scaled = scaler.fit_transform(X)

# Split dataset
X_train, X_test, y_train, y_test = train_test_split(
    X_scaled,
    y,
    test_size=0.2,
    random_state=42
)

# Train model
model = RandomForestClassifier(
    n_estimators=100,
    random_state=42
)

model.fit(X_train, y_train)

# Save files
joblib.dump(model, "fraud_model.pkl")
joblib.dump(scaler, "scaler.pkl")
joblib.dump(encoder, "merchant_encoder.pkl")

print("✅ Model trained successfully")