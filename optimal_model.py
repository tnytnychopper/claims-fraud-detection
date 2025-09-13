# -*- coding: utf-8 -*-
"""
Healthcare Fraud Detection - Optimized Model
Addresses data leakage by treating this as a provider-level prediction problem
"""

import pandas as pd
import numpy as np
import matplotlib.pyplot as plt
import seaborn as sns
from collections import Counter
import warnings
warnings.filterwarnings('ignore')

# ML imports
from sklearn.model_selection import train_test_split, cross_val_score, StratifiedKFold
from sklearn.preprocessing import StandardScaler, LabelEncoder
from sklearn.ensemble import RandomForestClassifier, GradientBoostingClassifier
from sklearn.linear_model import LogisticRegression
from sklearn.metrics import (classification_report, confusion_matrix, 
                           roc_auc_score, f1_score, precision_score, recall_score, accuracy_score)
import joblib
import json

# Optional libraries
try:
    import xgboost as xgb
    XGB_AVAILABLE = True
except ImportError:
    print("XGBoost not available")
    XGB_AVAILABLE = False

def load_and_merge_data():
    """Load all data files and merge appropriately"""
    print("Loading data files...")
    
    # Load main files
    train_providers = pd.read_csv("./content/Train-1542865627584.csv")
    test_providers = pd.read_csv("./content/Test-1542969243754.csv")
    
    train_beneficiary = pd.read_csv("./content/Train_Beneficiarydata-1542865627584.csv")
    test_beneficiary = pd.read_csv("./content/Test_Beneficiarydata-1542969243754.csv")
    
    train_inpatient = pd.read_csv("./content/Train_Inpatientdata-1542865627584.csv")
    test_inpatient = pd.read_csv("./content/Test_Inpatientdata-1542969243754.csv")
    
    train_outpatient = pd.read_csv("./content/Train_Outpatientdata-1542865627584.csv")
    test_outpatient = pd.read_csv("./content/Test_Outpatientdata-1542969243754.csv")
    
    print(f"Loaded {len(train_providers)} training providers, {len(test_providers)} test providers")
    
    return (train_providers, test_providers, train_beneficiary, test_beneficiary,
            train_inpatient, test_inpatient, train_outpatient, test_outpatient)

def create_provider_features(providers_df, beneficiary_df, inpatient_df, outpatient_df):
    """Create aggregated features at provider level to avoid leakage"""
    
    # Combine inpatient and outpatient data
    all_claims = []
    
    # Process inpatient data
    if len(inpatient_df) > 0:
        inpatient_claims = inpatient_df.copy()
        inpatient_claims['ClaimType'] = 'Inpatient'
        inpatient_claims['AdmissionDt'] = pd.to_datetime(inpatient_claims['AdmissionDt'], errors='coerce')
        inpatient_claims['DischargeDt'] = pd.to_datetime(inpatient_claims['DischargeDt'], errors='coerce')
        inpatient_claims['LengthOfStay'] = (inpatient_claims['DischargeDt'] - inpatient_claims['AdmissionDt']).dt.days
        all_claims.append(inpatient_claims)
    
    # Process outpatient data  
    if len(outpatient_df) > 0:
        outpatient_claims = outpatient_df.copy()
        outpatient_claims['ClaimType'] = 'Outpatient'
        outpatient_claims['LengthOfStay'] = 0  # Outpatients don't stay
        all_claims.append(outpatient_claims)
    
    # Combine all claims
    if all_claims:
        claims_df = pd.concat(all_claims, ignore_index=True)
        
        # Calculate claim durations
        claims_df['ClaimStartDt'] = pd.to_datetime(claims_df['ClaimStartDt'], errors='coerce')
        claims_df['ClaimEndDt'] = pd.to_datetime(claims_df['ClaimEndDt'], errors='coerce')
        claims_df['ClaimDuration'] = (claims_df['ClaimEndDt'] - claims_df['ClaimStartDt']).dt.days
        
        # Provider-level aggregations
        provider_stats = claims_df.groupby('Provider').agg({
            'ClaimID': 'count',  # Total claims
            'InscClaimAmtReimbursed': ['sum', 'mean', 'std', 'max'],
            'DeductibleAmtPaid': ['sum', 'mean', 'std'],
            'ClaimDuration': ['mean', 'std', 'max'],
            'LengthOfStay': ['mean', 'std', 'max'],
            'ClaimType': lambda x: (x == 'Inpatient').sum(),  # Count of inpatient claims
        }).round(2)
        
        # Flatten column names
        provider_stats.columns = ['_'.join(col).strip() if col[1] else col[0] 
                                for col in provider_stats.columns.values]
        provider_stats.rename(columns={'ClaimID_count': 'TotalClaims',
                                     'ClaimType_<lambda>': 'InpatientClaims'}, inplace=True)
        
        # Calculate outpatient claims
        provider_stats['OutpatientClaims'] = provider_stats['TotalClaims'] - provider_stats['InpatientClaims']
        provider_stats['InpatientRatio'] = provider_stats['InpatientClaims'] / provider_stats['TotalClaims']
        
    else:
        # Create empty provider stats if no claims
        provider_stats = pd.DataFrame(index=providers_df['Provider'])
        for col in ['TotalClaims', 'InpatientClaims', 'OutpatientClaims']:
            provider_stats[col] = 0
    
    # Beneficiary-level aggregations per provider
    if len(beneficiary_df) > 0:
        # Process dates and age
        beneficiary_df['DOB'] = pd.to_datetime(beneficiary_df['DOB'], errors='coerce')
        beneficiary_df['DOD'] = pd.to_datetime(beneficiary_df['DOD'], errors='coerce')
        
        # Calculate age (use 2009-12-01 as reference for living patients)
        reference_date = pd.to_datetime('2009-12-01')
        beneficiary_df['Age'] = np.where(
            beneficiary_df['DOD'].notna(),
            (beneficiary_df['DOD'] - beneficiary_df['DOB']).dt.days / 365.25,
            (reference_date - beneficiary_df['DOB']).dt.days / 365.25
        )
        
        # Merge beneficiary with claims to get provider mapping
        if len(claims_df) > 0:
            provider_beneficiary = claims_df[['Provider', 'BeneID']].drop_duplicates().merge(
                beneficiary_df, on='BeneID', how='left'
            )
            
            # Provider-level beneficiary aggregations
            beneficiary_stats = provider_beneficiary.groupby('Provider').agg({
                'BeneID': 'count',  # Unique beneficiaries per provider
                'Age': ['mean', 'std', 'min', 'max'],
                'Gender': lambda x: (x == 1).sum() / len(x),  # Proportion male
                'RenalDiseaseIndicator': lambda x: (x == 'Y').sum(),
                'IPAnnualReimbursementAmt': ['sum', 'mean'],
                'OPAnnualReimbursementAmt': ['sum', 'mean'],
                'NoOfMonths_PartACov': 'mean',
                'NoOfMonths_PartBCov': 'mean',
            }).round(2)
            
            # Flatten column names
            beneficiary_stats.columns = ['_'.join(col).strip() if col[1] else col[0] 
                                       for col in beneficiary_stats.columns.values]
            beneficiary_stats.rename(columns={'BeneID_count': 'UniqueBeneficiaries',
                                            'Gender_<lambda>': 'MaleRatio',
                                            'RenalDiseaseIndicator_<lambda>': 'RenalDiseaseCount'}, inplace=True)
            
            # Calculate chronic conditions
            chronic_cols = [col for col in beneficiary_df.columns if col.startswith('ChronicCond_')]
            for col in chronic_cols:
                chronic_stats = provider_beneficiary.groupby('Provider')[col].agg(['sum', 'mean'])
                beneficiary_stats[f'{col}_Count'] = chronic_stats['sum']
                beneficiary_stats[f'{col}_Rate'] = chronic_stats['mean']
        else:
            beneficiary_stats = pd.DataFrame(index=providers_df['Provider'])
    else:
        beneficiary_stats = pd.DataFrame(index=providers_df['Provider'])
    
    # Merge provider stats with provider labels
    provider_features = providers_df.set_index('Provider')
    
    if not provider_stats.empty:
        provider_features = provider_features.join(provider_stats, how='left')
    if not beneficiary_stats.empty:
        provider_features = provider_features.join(beneficiary_stats, how='left')
    
    # Fill missing values
    provider_features = provider_features.fillna(0)
    
    print(f"Created {len(provider_features)} provider records with {len(provider_features.columns)} features")
    
    return provider_features.reset_index()

def prepare_features(train_data, test_data):
    """Prepare features for modeling"""
    
    # Encode target variable for training data
    train_data = train_data.copy()
    if 'PotentialFraud' in train_data.columns:
        train_data['PotentialFraud'] = (train_data['PotentialFraud'] == 'Yes').astype(int)
    
    # Select numeric features (exclude Provider and target)
    feature_cols = [col for col in train_data.columns 
                   if col not in ['Provider', 'PotentialFraud'] and 
                   train_data[col].dtype in ['int64', 'float64']]
    
    print(f"Selected {len(feature_cols)} features for modeling")
    
    # Handle infinite values
    for col in feature_cols:
        train_data[col] = train_data[col].replace([np.inf, -np.inf], np.nan)
        test_data[col] = test_data[col].replace([np.inf, -np.inf], np.nan)
    
    # Fill remaining NaN values with median
    for col in feature_cols:
        median_val = train_data[col].median()
        train_data[col] = train_data[col].fillna(median_val)
        test_data[col] = test_data[col].fillna(median_val)
    
    X_train = train_data[feature_cols]
    y_train = train_data['PotentialFraud'] if 'PotentialFraud' in train_data.columns else None
    X_test = test_data[feature_cols]
    
    return X_train, y_train, X_test, feature_cols

def evaluate_models(X_train, y_train):
    """Evaluate multiple models with proper cross-validation"""
    
    print(f"Training on {len(X_train)} providers")
    print(f"Class distribution: {Counter(y_train)}")
    
    # Define models
    models = {
        'LogisticRegression': LogisticRegression(random_state=42, max_iter=1000),
        'RandomForest': RandomForestClassifier(n_estimators=200, max_depth=10, 
                                             min_samples_split=10, random_state=42),
        'GradientBoosting': GradientBoostingClassifier(n_estimators=200, max_depth=6,
                                                     learning_rate=0.1, random_state=42)
    }
    
    if XGB_AVAILABLE:
        models['XGBoost'] = xgb.XGBClassifier(n_estimators=200, max_depth=6,
                                            learning_rate=0.1, random_state=42,
                                            eval_metric='logloss')
    
    # Scale features
    scaler = StandardScaler()
    X_scaled = scaler.fit_transform(X_train)
    
    # Stratified K-Fold for provider-level validation
    cv = StratifiedKFold(n_splits=5, shuffle=True, random_state=42)
    
    results = {}
    trained_models = {}
    
    print("\\n=== Model Evaluation with 5-Fold Cross-Validation ===")
    
    for name, model in models.items():
        print(f"\\nTraining {name}...")
        
        # Use scaled data for LogisticRegression, original for tree-based models
        X_model = X_scaled if name == 'LogisticRegression' else X_train
        
        # Cross-validation scores
        cv_scores = cross_val_score(model, X_model, y_train, cv=cv, scoring='roc_auc')
        cv_f1 = cross_val_score(model, X_model, y_train, cv=cv, scoring='f1')
        
        # Train on full data for final model
        model.fit(X_model, y_train)
        
        results[name] = {
            'CV_AUC_mean': cv_scores.mean(),
            'CV_AUC_std': cv_scores.std(),
            'CV_F1_mean': cv_f1.mean(),
            'CV_F1_std': cv_f1.std(),
        }
        
        trained_models[name] = (model, scaler if name == 'LogisticRegression' else None)
        
        print(f"  CV AUC: {cv_scores.mean():.4f} (+/- {cv_scores.std()*2:.4f})")
        print(f"  CV F1:  {cv_f1.mean():.4f} (+/- {cv_f1.std()*2:.4f})")
    
    # Select best model based on CV AUC
    best_model_name = max(results.keys(), key=lambda x: results[x]['CV_AUC_mean'])
    best_model, best_scaler = trained_models[best_model_name]
    
    print(f"\\nBest model: {best_model_name} (CV AUC: {results[best_model_name]['CV_AUC_mean']:.4f})")
    
    return best_model, best_scaler, best_model_name, results

def analyze_feature_importance(model, feature_names, top_n=20):
    """Analyze and display feature importance"""
    
    if hasattr(model, 'feature_importances_'):
        importances = model.feature_importances_
    elif hasattr(model, 'coef_'):
        importances = np.abs(model.coef_[0])
    else:
        print("Model doesn't support feature importance analysis")
        return
    
    # Create feature importance dataframe
    feature_imp = pd.DataFrame({
        'feature': feature_names,
        'importance': importances
    }).sort_values('importance', ascending=False)
    
    print(f"\\n=== Top {top_n} Most Important Features ===")
    for i, (_, row) in enumerate(feature_imp.head(top_n).iterrows()):
        print(f"{i+1:2d}. {row['feature']:<40} {row['importance']:.4f}")
    
    # Plot feature importance
    plt.figure(figsize=(10, 8))
    top_features = feature_imp.head(top_n)
    plt.barh(range(len(top_features)), top_features['importance'])
    plt.yticks(range(len(top_features)), top_features['feature'])
    plt.xlabel('Feature Importance')
    plt.title(f'Top {top_n} Feature Importances')
    plt.gca().invert_yaxis()
    plt.tight_layout()
    plt.savefig('feature_importance.png', dpi=150, bbox_inches='tight')
    plt.show()
    
    return feature_imp

def main():
    """Main execution function"""
    
    # Load data
    (train_providers, test_providers, train_beneficiary, test_beneficiary,
     train_inpatient, test_inpatient, train_outpatient, test_outpatient) = load_and_merge_data()
    
    # Create provider-level features
    print("\\nCreating provider-level features...")
    train_features = create_provider_features(train_providers, train_beneficiary, 
                                            train_inpatient, train_outpatient)
    test_features = create_provider_features(test_providers, test_beneficiary,
                                           test_inpatient, test_outpatient)
    
    # Prepare features for modeling
    X_train, y_train, X_test, feature_cols = prepare_features(train_features, test_features)
    
    # Evaluate models
    best_model, best_scaler, best_model_name, results = evaluate_models(X_train, y_train)
    
    # Analyze feature importance
    feature_imp = analyze_feature_importance(best_model, feature_cols)
    
    # Make predictions on test set
    X_test_scaled = best_scaler.transform(X_test) if best_scaler else X_test
    test_predictions = best_model.predict_proba(X_test_scaled)[:, 1]
    test_pred_binary = best_model.predict(X_test_scaled)
    
    # Create submission dataframe
    submission = pd.DataFrame({
        'Provider': test_features['Provider'],
        'PotentialFraud': ['Yes' if pred == 1 else 'No' for pred in test_pred_binary],
        'FraudProbability': test_predictions
    })
    
    print(f"\\n=== Test Set Predictions ===")
    print(f"Predicted fraud cases: {(test_pred_binary == 1).sum()}/{len(test_pred_binary)}")
    print(f"Fraud rate: {(test_pred_binary == 1).mean():.2%}")
    
    # Save results
    print("\\n=== Saving Results ===")
    
    # Save model
    model_data = {
        'model': best_model,
        'scaler': best_scaler,
        'feature_names': feature_cols,
        'model_name': best_model_name
    }
    joblib.dump(model_data, 'optimal_fraud_model.pkl')
    
    # Save predictions
    submission.to_csv('fraud_predictions.csv', index=False)
    
    # Save model performance
    with open('model_performance.json', 'w') as f:
        json.dump(results, f, indent=2)
    
    # Save feature importance
    if feature_imp is not None:
        feature_imp.to_csv('feature_importance.csv', index=False)
    
    print("\\nFiles saved:")
    print("- optimal_fraud_model.pkl: Trained model")
    print("- fraud_predictions.csv: Test set predictions") 
    print("- model_performance.json: Cross-validation results")
    print("- feature_importance.csv: Feature importance rankings")
    print("- feature_importance.png: Feature importance plot")
    
    return best_model, submission, results

if __name__ == "__main__":
    best_model, predictions, performance = main()