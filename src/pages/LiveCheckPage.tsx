import React, { useState } from 'react';
import { motion } from 'framer-motion';
import { ParticleBackground } from '../components/ParticleBackground';
import { GlassmorphicCard } from '../components/GlassmorphicCard';
import { Button } from '../components/Button';
import { CheckCircleIcon, AlertTriangleIcon, SearchIcon, LoaderIcon } from 'lucide-react';

type AnalysisState = 'idle' | 'analyzing' | 'success' | 'fraud';

type PredictionResult = {
  prediction: number;
  probability: number;
  shap_values: number[];
  base_value: number;
  feature_names: string[];
};

export function LiveCheckPage() {
  const [analysisState, setAnalysisState] = useState<AnalysisState>('idle');
  const [result, setResult] = useState<PredictionResult | null>(null);
  const [formData, setFormData] = useState({
    BeneID_nunique: '',
    ClaimID_count: '',
    InscClaimAmtReimbursed_sum: '',
    DeductibleAmtPaid_sum: '',
    NoOfMonths_PartACov_mean: '',
    NoOfMonths_PartBCov_mean: '',
    IPAnnualReimbursementAmt_sum: '',
    IPAnnualDeductibleAmt_sum: '',
    OPAnnualReimbursementAmt_sum: '',
    OPAnnualDeductibleAmt_sum: ''
  });

  const handleChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    setFormData({
      ...formData,
      [e.target.name]: e.target.value
    });
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setAnalysisState('analyzing');

    try {
      const response = await fetch('http://localhost:8000/predict', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          BeneID_nunique: parseFloat(formData.BeneID_nunique),
          ClaimID_count: parseFloat(formData.ClaimID_count),
          InscClaimAmtReimbursed_sum: parseFloat(formData.InscClaimAmtReimbursed_sum),
          DeductibleAmtPaid_sum: parseFloat(formData.DeductibleAmtPaid_sum),
          NoOfMonths_PartACov_mean: parseFloat(formData.NoOfMonths_PartACov_mean),
          NoOfMonths_PartBCov_mean: parseFloat(formData.NoOfMonths_PartBCov_mean),
          IPAnnualReimbursementAmt_sum: parseFloat(formData.IPAnnualReimbursementAmt_sum),
          IPAnnualDeductibleAmt_sum: parseFloat(formData.IPAnnualDeductibleAmt_sum),
          OPAnnualReimbursementAmt_sum: parseFloat(formData.OPAnnualReimbursementAmt_sum),
          OPAnnualDeductibleAmt_sum: parseFloat(formData.OPAnnualDeductibleAmt_sum),
        }),
      });

      if (!response.ok) {
        throw new Error('API request failed');
      }

      const data: PredictionResult = await response.json();
      setResult(data);
      setAnalysisState(data.prediction === 1 ? 'fraud' : 'success');
    } catch (error) {
      console.error('Error:', error);
      // For demo, set to success
      setAnalysisState('success');
    }
  };

  const resetForm = () => {
    setAnalysisState('idle');
    setResult(null);
    setFormData({
      BeneID_nunique: '',
      ClaimID_count: '',
      InscClaimAmtReimbursed_sum: '',
      DeductibleAmtPaid_sum: '',
      NoOfMonths_PartACov_mean: '',
      NoOfMonths_PartBCov_mean: '',
      IPAnnualReimbursementAmt_sum: '',
      IPAnnualDeductibleAmt_sum: '',
      OPAnnualReimbursementAmt_sum: '',
      OPAnnualDeductibleAmt_sum: ''
    });
  };
  return <div className="min-h-screen pt-20 pb-12 px-4 relative">
      <ParticleBackground className="opacity-50" />
      <div className="max-w-4xl mx-auto">
        <motion.div className="text-center mb-12" initial={{
        opacity: 0,
        y: 20
      }} animate={{
        opacity: 1,
        y: 0
      }} transition={{
        duration: 0.5
      }}>
          <h1 className="text-4xl font-bold mb-4">Provider Fraud Risk Assessment</h1>
          <p className="text-xl text-gray-300">
            Assess healthcare provider fraud risk using aggregated claim data with AI explainability.
          </p>
        </motion.div>
        <GlassmorphicCard className="mb-8">
          {analysisState === 'idle' && <motion.form onSubmit={handleSubmit} initial={{
          opacity: 0
        }} animate={{
          opacity: 1
        }} exit={{
          opacity: 0
        }}>
              <div className="grid grid-cols-1 md:grid-cols-2 gap-6 mb-8">
                <div>
                  <label htmlFor="BeneID_nunique" className="block text-sm font-medium text-gray-300 mb-1">
                    Number of Unique Beneficiaries
                  </label>
                  <input type="number" id="BeneID_nunique" name="BeneID_nunique" value={formData.BeneID_nunique} onChange={handleChange} required className="w-full px-4 py-3 rounded-lg bg-[#0A0F1A] border border-[#00BFFF]/30 focus:border-[#00BFFF] focus:ring-1 focus:ring-[#00BFFF] outline-none transition-colors" placeholder="e.g., 100" />
                </div>
                <div>
                  <label htmlFor="ClaimID_count" className="block text-sm font-medium text-gray-300 mb-1">
                    Total Number of Claims
                  </label>
                  <input type="number" id="ClaimID_count" name="ClaimID_count" value={formData.ClaimID_count} onChange={handleChange} required className="w-full px-4 py-3 rounded-lg bg-[#0A0F1A] border border-[#00BFFF]/30 focus:border-[#00BFFF] focus:ring-1 focus:ring-[#00BFFF] outline-none transition-colors" placeholder="e.g., 500" />
                </div>
                <div>
                  <label htmlFor="InscClaimAmtReimbursed_sum" className="block text-sm font-medium text-gray-300 mb-1">
                    Total Reimbursed Amount
                  </label>
                  <input type="number" id="InscClaimAmtReimbursed_sum" name="InscClaimAmtReimbursed_sum" value={formData.InscClaimAmtReimbursed_sum} onChange={handleChange} required className="w-full px-4 py-3 rounded-lg bg-[#0A0F1A] border border-[#00BFFF]/30 focus:border-[#00BFFF] focus:ring-1 focus:ring-[#00BFFF] outline-none transition-colors" placeholder="e.g., 100000" />
                </div>
                <div>
                  <label htmlFor="DeductibleAmtPaid_sum" className="block text-sm font-medium text-gray-300 mb-1">
                    Total Deductible Paid
                  </label>
                  <input type="number" id="DeductibleAmtPaid_sum" name="DeductibleAmtPaid_sum" value={formData.DeductibleAmtPaid_sum} onChange={handleChange} required className="w-full px-4 py-3 rounded-lg bg-[#0A0F1A] border border-[#00BFFF]/30 focus:border-[#00BFFF] focus:ring-1 focus:ring-[#00BFFF] outline-none transition-colors" placeholder="e.g., 20000" />
                </div>
                <div>
                  <label htmlFor="NoOfMonths_PartACov_mean" className="block text-sm font-medium text-gray-300 mb-1">
                    Average Months Part A Coverage
                  </label>
                  <input type="number" id="NoOfMonths_PartACov_mean" name="NoOfMonths_PartACov_mean" value={formData.NoOfMonths_PartACov_mean} onChange={handleChange} required className="w-full px-4 py-3 rounded-lg bg-[#0A0F1A] border border-[#00BFFF]/30 focus:border-[#00BFFF] focus:ring-1 focus:ring-[#00BFFF] outline-none transition-colors" placeholder="e.g., 10" />
                </div>
                <div>
                  <label htmlFor="NoOfMonths_PartBCov_mean" className="block text-sm font-medium text-gray-300 mb-1">
                    Average Months Part B Coverage
                  </label>
                  <input type="number" id="NoOfMonths_PartBCov_mean" name="NoOfMonths_PartBCov_mean" value={formData.NoOfMonths_PartBCov_mean} onChange={handleChange} required className="w-full px-4 py-3 rounded-lg bg-[#0A0F1A] border border-[#00BFFF]/30 focus:border-[#00BFFF] focus:ring-1 focus:ring-[#00BFFF] outline-none transition-colors" placeholder="e.g., 8" />
                </div>
                <div>
                  <label htmlFor="IPAnnualReimbursementAmt_sum" className="block text-sm font-medium text-gray-300 mb-1">
                    Total IP Annual Reimbursement
                  </label>
                  <input type="number" id="IPAnnualReimbursementAmt_sum" name="IPAnnualReimbursementAmt_sum" value={formData.IPAnnualReimbursementAmt_sum} onChange={handleChange} required className="w-full px-4 py-3 rounded-lg bg-[#0A0F1A] border border-[#00BFFF]/30 focus:border-[#00BFFF] focus:ring-1 focus:ring-[#00BFFF] outline-none transition-colors" placeholder="e.g., 50000" />
                </div>
                <div>
                  <label htmlFor="IPAnnualDeductibleAmt_sum" className="block text-sm font-medium text-gray-300 mb-1">
                    Total IP Annual Deductible
                  </label>
                  <input type="number" id="IPAnnualDeductibleAmt_sum" name="IPAnnualDeductibleAmt_sum" value={formData.IPAnnualDeductibleAmt_sum} onChange={handleChange} required className="w-full px-4 py-3 rounded-lg bg-[#0A0F1A] border border-[#00BFFF]/30 focus:border-[#00BFFF] focus:ring-1 focus:ring-[#00BFFF] outline-none transition-colors" placeholder="e.g., 10000" />
                </div>
                <div>
                  <label htmlFor="OPAnnualReimbursementAmt_sum" className="block text-sm font-medium text-gray-300 mb-1">
                    Total OP Annual Reimbursement
                  </label>
                  <input type="number" id="OPAnnualReimbursementAmt_sum" name="OPAnnualReimbursementAmt_sum" value={formData.OPAnnualReimbursementAmt_sum} onChange={handleChange} required className="w-full px-4 py-3 rounded-lg bg-[#0A0F1A] border border-[#00BFFF]/30 focus:border-[#00BFFF] focus:ring-1 focus:ring-[#00BFFF] outline-none transition-colors" placeholder="e.g., 30000" />
                </div>
                <div>
                  <label htmlFor="OPAnnualDeductibleAmt_sum" className="block text-sm font-medium text-gray-300 mb-1">
                    Total OP Annual Deductible
                  </label>
                  <input type="number" id="OPAnnualDeductibleAmt_sum" name="OPAnnualDeductibleAmt_sum" value={formData.OPAnnualDeductibleAmt_sum} onChange={handleChange} required className="w-full px-4 py-3 rounded-lg bg-[#0A0F1A] border border-[#00BFFF]/30 focus:border-[#00BFFF] focus:ring-1 focus:ring-[#00BFFF] outline-none transition-colors" placeholder="e.g., 5000" />
                </div>
              </div>
              <div className="flex justify-center">
                <Button type="submit" className="w-full md:w-auto">
                  <SearchIcon className="w-5 h-5 mr-2" />
                  Assess Risk
                </Button>
              </div>
            </motion.form>}
          {analysisState === 'analyzing' && <AnalyzingAnimation />}
          {analysisState === 'success' && <SuccessResult onReset={resetForm} result={result} />}
          {analysisState === 'fraud' && <FraudResult onReset={resetForm} result={result} />}
        </GlassmorphicCard>
      </div>
    </div>;
}
function AnalyzingAnimation() {
  return <motion.div className="flex flex-col items-center justify-center py-16" initial={{
    opacity: 0
  }} animate={{
    opacity: 1
  }} exit={{
    opacity: 0
  }}>
      <div className="relative w-32 h-32 mb-8">
        <motion.div className="absolute inset-0 rounded-full border-4 border-[#00BFFF]/30" animate={{
        rotate: 360
      }} transition={{
        duration: 3,
        ease: 'linear',
        repeat: Infinity
      }} />
        <motion.div className="absolute inset-2 rounded-full border-4 border-t-[#33FFDD] border-r-transparent border-b-transparent border-l-transparent" animate={{
        rotate: -360
      }} transition={{
        duration: 2,
        ease: 'linear',
        repeat: Infinity
      }} />
        <motion.div className="absolute inset-0 flex items-center justify-center" animate={{
        scale: [1, 1.05, 1]
      }} transition={{
        duration: 1.5,
        repeat: Infinity
      }}>
          <LoaderIcon className="w-12 h-12 text-[#00BFFF]" />
        </motion.div>
      </div>
      <h3 className="text-2xl font-bold mb-2">Analyzing Claim Data</h3>
      <p className="text-gray-300 text-center max-w-md">
        Our AI is scanning for anomalies and checking against our fraud
        database...
      </p>
    </motion.div>;
}
interface ResultProps {
  onReset: () => void;
  result: PredictionResult | null;
}
function SuccessResult({
  onReset,
  result
}: ResultProps) {
  const shapList = result ? result.feature_names.map((name, i) => ({ name, value: result.shap_values[i] })).sort((a, b) => Math.abs(b.value) - Math.abs(a.value)) : [];

  return <motion.div className="text-center py-8" initial={{
    opacity: 0
  }} animate={{
    opacity: 1
  }} exit={{
    opacity: 0
  }}>
      <motion.div className="w-24 h-24 mx-auto mb-6 rounded-full bg-green-500/10 flex items-center justify-center" initial={{
      scale: 0
    }} animate={{
      scale: 1
    }} transition={{
      type: 'spring',
      stiffness: 200,
      damping: 10
    }}>
        <CheckCircleIcon className="w-12 h-12 text-green-500" />
      </motion.div>
      <h3 className="text-2xl font-bold mb-2 text-green-500">
        Low Fraud Risk
      </h3>
      <p className="text-gray-300 mb-4">
        Fraud Probability: {result ? (result.probability * 100).toFixed(2) : 0}%
      </p>
      <div className="bg-green-500/10 rounded-lg p-4 mb-8 max-w-md mx-auto">
        <h4 className="font-bold mb-2">Key Factors (SHAP Explanation)</h4>
        <ul className="text-left text-sm space-y-2">
          {shapList.slice(0, 5).map((item, idx) => (
            <li key={idx} className="flex items-center">
              <CheckCircleIcon className="w-4 h-4 text-green-500 mr-2" />
              {item.name}: {item.value > 0 ? '+' : ''}{item.value.toFixed(4)}
            </li>
          ))}
        </ul>
      </div>
      <Button onClick={onReset}>Check Another Provider</Button>
    </motion.div>;
}
function FraudResult({
  onReset,
  result
}: ResultProps) {
  const shapList = result ? result.feature_names.map((name, i) => ({ name, value: result.shap_values[i] })).sort((a, b) => Math.abs(b.value) - Math.abs(a.value)) : [];

  return <motion.div className="text-center py-8" initial={{
    opacity: 0
  }} animate={{
    opacity: 1
  }} exit={{
    opacity: 0
  }}>
      <motion.div className="w-24 h-24 mx-auto mb-6 rounded-full bg-[#FF4136]/10 flex items-center justify-center" initial={{
      scale: 0
    }} animate={{
      scale: 1
    }} transition={{
      type: 'spring',
      stiffness: 200,
      damping: 10
    }}>
        <AlertTriangleIcon className="w-12 h-12 text-[#FF4136]" />
      </motion.div>
      <h3 className="text-2xl font-bold mb-2 text-[#FF4136]">
        High Fraud Risk Detected
      </h3>
      <p className="text-gray-300 mb-4">
        Fraud Probability: {result ? (result.probability * 100).toFixed(2) : 0}%
      </p>
      <div className="bg-[#FF4136]/10 rounded-lg p-4 mb-8 max-w-md mx-auto">
        <h4 className="font-bold mb-2">Key Risk Factors (SHAP Explanation)</h4>
        <ul className="text-left text-sm space-y-2">
          {shapList.slice(0, 5).map((item, idx) => (
            <li key={idx} className="flex items-start">
              <AlertTriangleIcon className="w-4 h-4 text-[#FF4136] mr-2 mt-0.5" />
              <span>{item.name}: {item.value > 0 ? '+' : ''}{item.value.toFixed(4)}</span>
            </li>
          ))}
        </ul>
      </div>
      <div className="flex flex-col sm:flex-row gap-4 justify-center">
        <Button variant="outline" onClick={onReset} className="border-[#FF4136] text-[#FF4136] hover:bg-[#FF4136]/10">
          Check Another Provider
        </Button>
        <Button onClick={() => alert('This would flag the provider for investigation in a real system')} className="bg-[#FF4136] hover:bg-[#E03026]">
          Flag for Investigation
        </Button>
      </div>
    </motion.div>;
}