from fastapi import FastAPI
from fastapi.middleware.cors import CORSMiddleware
from pydantic import BaseModel
from typing import List
import pickle
import pandas as pd

app = FastAPI(title="Healthcare Fraud Detection API", description="API for predicting healthcare fraud with SHAP explainability")

# Add CORS middleware
app.add_middleware(
    CORSMiddleware,
    allow_origins=["*"],  # Allows all origins
    allow_credentials=True,
    allow_methods=["*"],  # Allows all methods
    allow_headers=["*"],  # Allows all headers
)

# Load the best model
with open('./models/best_model.pkl', 'rb') as f:
    model = pickle.load(f)

# Load SHAP explainer
with open('./models/shap_explainer.pkl', 'rb') as f:
    explainer = pickle.load(f)

# Define input model based on aggregated features
class PredictionInput(BaseModel):
    BeneID: float
    ClaimID: float
    InscClaimAmtReimbursed: float
    DeductibleAmtPaid: float
    NoOfMonths_PartACov: float
    NoOfMonths_PartBCov: float
    IPAnnualReimbursementAmt: float
    IPAnnualDeductibleAmt: float
    OPAnnualReimbursementAmt: float
    OPAnnualDeductibleAmt: float

@app.post("/predict")
def predict(input_data: PredictionInput):
    # Convert to DataFrame
    data = pd.DataFrame([input_data.dict()])

    # Make prediction
    prediction = model.predict(data)[0]
    probability = model.predict_proba(data)[0][1]

    # SHAP explanation
    shap_values = explainer(data)

    # Return result
    return {
        "prediction": int(prediction),
        "probability": float(probability),
        "shap_values": shap_values.values.tolist()[0],  # For the single sample
        "base_value": float(shap_values.base_values[0]),
        "feature_names": data.columns.tolist()
    }

@app.post("/bulk")
def predict_bulk(providers: List[PredictionInput]):
    # Convert list of providers to DataFrame
    data = pd.DataFrame([provider.dict() for provider in providers])
    
    # Make predictions
    predictions = model.predict(data)
    probabilities = model.predict_proba(data)[:, 1]
    
    # SHAP explanations for all providers
    shap_values = explainer(data)
    
    # Prepare results
    results = []
    for i in range(len(providers)):
        results.append({
            "provider_index": i,
            "prediction": int(predictions[i]),
            "probability": float(probabilities[i]),
            "shap_values": shap_values.values[i].tolist(),
            "base_value": float(shap_values.base_values[i]),
        })
    
    # Summary statistics
    fraud_count = sum(predictions)
    total_count = len(predictions)
    avg_probability = float(probabilities.mean())
    
    return {
        "results": results,
        "summary": {
            "total_providers": total_count,
            "fraud_detected": int(fraud_count),
            "fraud_rate": float(fraud_count / total_count) if total_count > 0 else 0,
            "average_probability": avg_probability,
        },
        "feature_names": data.columns.tolist()
    }

@app.get("/")
def read_root():
    return {"message": "Healthcare Fraud Detection API is running"}

if __name__ == "__main__":
    import uvicorn
    uvicorn.run(app, host="0.0.0.0", port=8000)