from flask import Flask, request, jsonify
import joblib

app = Flask(__name__)

model = joblib.load("model.pkl")

@app.route("/predict", methods=["POST"])
def predict():
    data = request.json["features"]

    pred = model.predict([data])[0]
    prob = model.predict_proba([data])[0][1]

    return jsonify({
        "fraud": int(pred),
        "riskScore": float(prob * 100)
    })

app.run(port=5001)

@app.route("/api/auth/login", methods=["POST"])
def login():
    data = request.json
    email = data.get("email")
    password = data.get("password")

    # 🔥 ADMIN LOGIN
    if email == "admin@gmail.com" and password == "123456":
        return jsonify({
            "token": "admin-token",
            "user": {
                "name": "Bank Manager",
                "email": email,
                "role": "admin"   # ✅ IMPORTANT
            }
        })

    # 🔥 EMPLOYEE LOGIN
    elif email == "employee@gmail.com" and password == "123456":
        return jsonify({
            "token": "emp-token",
            "user": {
                "name": "Bank Employee",
                "email": email,
                "role": "employee"   # ✅ IMPORTANT
            }
        })

    return jsonify({"error": "Invalid credentials"}), 401