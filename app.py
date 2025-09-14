from fastapi import FastAPI
from fastapi.middleware.cors import CORSMiddleware
from pydantic import BaseModel
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

@app.get("/")
def read_root():
    return {"message": "Healthcare Fraud Detection API is running"}