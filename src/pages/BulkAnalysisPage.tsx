import React, { useState } from 'react';
import { motion } from 'framer-motion';
import { ParticleBackground } from '../components/ParticleBackground';
import { GlassmorphicCard } from '../components/GlassmorphicCard';
import { Button } from '../components/Button';
import { UploadIcon, DownloadIcon, AlertTriangleIcon, CheckCircleIcon, BarChartIcon, FileTextIcon } from 'lucide-react';

type AnalysisState = 'idle' | 'uploading' | 'analyzing' | 'completed';

type BulkResult = {
  results: Array<{
    provider_index: number;
    prediction: number;
    probability: number;
    shap_values: number[];
    base_value: number;
  }>;
  summary: {
    total_providers: number;
    fraud_detected: number;
    fraud_rate: number;
    average_probability: number;
  };
  feature_names: string[];
};
export function BulkAnalysisPage() {
  const [analysisState, setAnalysisState] = useState<AnalysisState>('idle');
  const [results, setResults] = useState<BulkResult | null>(null);
  const [file, setFile] = useState<File | null>(null);

  const handleFileUpload = (e: React.ChangeEvent<HTMLInputElement>) => {
    const uploadedFile = e.target.files?.[0];
    if (uploadedFile && uploadedFile.type === 'text/csv') {
      setFile(uploadedFile);
    } else {
      alert('Please upload a CSV file');
    }
  };

  const parseCSV = (csvText: string) => {
    const lines = csvText.split('\n').filter(line => line.trim());
    const headers = lines[0].split(',').map(h => h.trim());
    
    const providers = lines.slice(1).map(line => {
      const values = line.split(',').map(v => v.trim());
      const provider: any = {};
      headers.forEach((header, index) => {
        provider[header] = parseFloat(values[index]) || 0;
      });
      return provider;
    });
    
    return providers;
  };

  const handleAnalyze = async () => {
    if (!file) return;

    setAnalysisState('uploading');
    
    try {
      const text = await file.text();
      const providers = parseCSV(text);
      
      setAnalysisState('analyzing');
      
      const response = await fetch('http://localhost:8000/bulk', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify(providers),
      });

      if (!response.ok) {
        throw new Error('Analysis failed');
      }

      const data: BulkResult = await response.json();
      setResults(data);
      setAnalysisState('completed');
    } catch (error) {
      console.error('Error:', error);
      alert('Analysis failed. Please check your file format and try again.');
      setAnalysisState('idle');
    }
  };

  const downloadResults = () => {
    if (!results) return;

    const csvContent = [
      ['Provider Index', 'Fraud Prediction', 'Fraud Probability', 'Risk Level'].join(','),
      ...results.results.map(result => [
        result.provider_index,
        result.prediction === 1 ? 'Fraud' : 'Not Fraud',
        (result.probability * 100).toFixed(2) + '%',
        result.probability > 0.7 ? 'High' : result.probability > 0.3 ? 'Medium' : 'Low'
      ].join(','))
    ].join('\n');

    const blob = new Blob([csvContent], { type: 'text/csv' });
    const url = window.URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = url;
    a.download = 'fraud_analysis_results.csv';
    a.click();
    window.URL.revokeObjectURL(url);
  };

  const downloadTemplate = () => {
    const template = [
      ['BeneID', 'ClaimID', 'InscClaimAmtReimbursed', 'DeductibleAmtPaid', 'NoOfMonths_PartACov', 'NoOfMonths_PartBCov', 'IPAnnualReimbursementAmt', 'IPAnnualDeductibleAmt', 'OPAnnualReimbursementAmt', 'OPAnnualDeductibleAmt'].join(','),
      ['100', '500', '100000', '20000', '10', '8', '50000', '10000', '30000', '5000'].join(','),
      ['85', '320', '85000', '15000', '12', '9', '40000', '8000', '25000', '4000'].join(',')
    ].join('\n');

    const blob = new Blob([template], { type: 'text/csv' });
    const url = window.URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = url;
    a.download = 'provider_analysis_template.csv';
    a.click();
    window.URL.revokeObjectURL(url);
  };

  const resetAnalysis = () => {
    setAnalysisState('idle');
    setResults(null);
    setFile(null);
  };
  return (
    <div className="min-h-screen pt-20 pb-12 px-4 relative">
      <ParticleBackground className="opacity-50" />
      <div className="max-w-6xl mx-auto">
        <motion.div 
          className="text-center mb-12"
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.5 }}
        >
          <h1 className="text-4xl font-bold mb-4">Bulk Provider Analysis</h1>
          <p className="text-xl text-gray-300">
            Upload a CSV file to analyze multiple healthcare providers for fraud risk simultaneously.
          </p>
        </motion.div>

        {analysisState === 'idle' && (
          <GlassmorphicCard className="mb-8">
            <div className="text-center py-12">
              <div className="mb-8">
                <div className="w-24 h-24 mx-auto mb-6 rounded-full bg-[#00BFFF]/10 flex items-center justify-center">
                  <UploadIcon className="w-12 h-12 text-[#00BFFF]" />
                </div>
                <h3 className="text-2xl font-bold mb-4">Upload Provider Data</h3>
                <p className="text-gray-300 mb-6 max-w-2xl mx-auto">
                  Upload a CSV file containing provider aggregated data. Each row should represent one provider with the required features.
                </p>
              </div>

              <div className="mb-6">
                <input
                  type="file"
                  accept=".csv"
                  onChange={handleFileUpload}
                  className="hidden"
                  id="csv-upload"
                />
                <label
                  htmlFor="csv-upload"
                  className="inline-flex items-center px-6 py-3 bg-[#00BFFF] hover:bg-[#0095CC] text-white rounded-lg cursor-pointer transition-colors"
                >
                  <FileTextIcon className="w-5 h-5 mr-2" />
                  Choose CSV File
                </label>
              </div>

              {file && (
                <div className="mb-6 p-4 bg-green-500/10 rounded-lg max-w-md mx-auto">
                  <p className="text-green-500 font-medium">File selected: {file.name}</p>
                  <p className="text-sm text-gray-300">Ready to analyze</p>
                </div>
              )}

              <div className="flex flex-col sm:flex-row gap-4 justify-center mb-6">
                <Button
                  onClick={handleAnalyze}
                  disabled={!file}
                  className="disabled:opacity-50 disabled:cursor-not-allowed"
                >
                  <BarChartIcon className="w-5 h-5 mr-2" />
                  Analyze Providers
                </Button>
                <Button variant="outline" onClick={downloadTemplate}>
                  <DownloadIcon className="w-5 h-5 mr-2" />
                  Download Template
                </Button>
              </div>

              <div className="text-sm text-gray-400 max-w-md mx-auto">
                <p className="mb-2">Required CSV columns:</p>
                <p>BeneID, ClaimID, InscClaimAmtReimbursed, DeductibleAmtPaid, NoOfMonths_PartACov, NoOfMonths_PartBCov, IPAnnualReimbursementAmt, IPAnnualDeductibleAmt, OPAnnualReimbursementAmt, OPAnnualDeductibleAmt</p>
              </div>
            </div>
          </GlassmorphicCard>
        )}

        {(analysisState === 'uploading' || analysisState === 'analyzing') && (
          <GlassmorphicCard>
            <div className="text-center py-16">
              <div className="relative w-32 h-32 mx-auto mb-8">
                <motion.div 
                  className="absolute inset-0 rounded-full border-4 border-[#00BFFF]/30"
                  animate={{ rotate: 360 }}
                  transition={{ duration: 3, ease: 'linear', repeat: Infinity }}
                />
                <motion.div 
                  className="absolute inset-2 rounded-full border-4 border-t-[#33FFDD] border-r-transparent border-b-transparent border-l-transparent"
                  animate={{ rotate: -360 }}
                  transition={{ duration: 2, ease: 'linear', repeat: Infinity }}
                />
              </div>
              <h3 className="text-2xl font-bold mb-2">
                {analysisState === 'uploading' ? 'Processing File...' : 'Analyzing Providers...'}
              </h3>
              <p className="text-gray-300">
                {analysisState === 'uploading' 
                  ? 'Reading and validating your CSV data...'
                  : 'Running fraud detection models and generating explanations...'
                }
              </p>
            </div>
          </GlassmorphicCard>
        )}

        {analysisState === 'completed' && results && (
          <div className="space-y-8">
            {/* Summary Cards */}
            <div className="grid grid-cols-1 md:grid-cols-4 gap-6">
              <GlassmorphicCard className="text-center p-6">
                <div className="text-3xl font-bold text-[#00BFFF] mb-2">{results.summary.total_providers}</div>
                <div className="text-gray-300">Total Providers</div>
              </GlassmorphicCard>
              <GlassmorphicCard className="text-center p-6">
                <div className="text-3xl font-bold text-[#FF4136] mb-2">{results.summary.fraud_detected}</div>
                <div className="text-gray-300">Fraud Detected</div>
              </GlassmorphicCard>
              <GlassmorphicCard className="text-center p-6">
                <div className="text-3xl font-bold text-yellow-500 mb-2">
                  {(results.summary.fraud_rate * 100).toFixed(1)}%
                </div>
                <div className="text-gray-300">Fraud Rate</div>
              </GlassmorphicCard>
              <GlassmorphicCard className="text-center p-6">
                <div className="text-3xl font-bold text-[#33FFDD] mb-2">
                  {(results.summary.average_probability * 100).toFixed(1)}%
                </div>
                <div className="text-gray-300">Avg Risk Score</div>
              </GlassmorphicCard>
            </div>

            {/* Results Table */}
            <GlassmorphicCard>
              <div className="p-6">
                <div className="flex justify-between items-center mb-6">
                  <h3 className="text-xl font-bold">Detailed Analysis Results</h3>
                  <div className="flex gap-4">
                    <Button onClick={downloadResults}>
                      <DownloadIcon className="w-5 h-5 mr-2" />
                      Download Results
                    </Button>
                    <Button variant="outline" onClick={resetAnalysis}>
                      Analyze New File
                    </Button>
                  </div>
                </div>

                <div className="overflow-x-auto">
                  <table className="w-full text-sm">
                    <thead>
                      <tr className="border-b border-gray-700">
                        <th className="text-left p-3">Provider #</th>
                        <th className="text-left p-3">Status</th>
                        <th className="text-left p-3">Risk Score</th>
                        <th className="text-left p-3">Risk Level</th>
                      </tr>
                    </thead>
                    <tbody>
                      {results.results.map((result, index) => (
                        <tr key={index} className="border-b border-gray-800 hover:bg-white/5">
                          <td className="p-3">Provider {result.provider_index + 1}</td>
                          <td className="p-3">
                            <div className="flex items-center">
                              {result.prediction === 1 ? (
                                <>
                                  <AlertTriangleIcon className="w-4 h-4 text-[#FF4136] mr-2" />
                                  <span className="text-[#FF4136] font-medium">Fraud Risk</span>
                                </>
                              ) : (
                                <>
                                  <CheckCircleIcon className="w-4 h-4 text-green-500 mr-2" />
                                  <span className="text-green-500 font-medium">Low Risk</span>
                                </>
                              )}
                            </div>
                          </td>
                          <td className="p-3">
                            <div className="flex items-center">
                              <div className="w-20 bg-gray-700 rounded-full h-2 mr-3">
                                <div 
                                  className={`h-2 rounded-full ${
                                    result.probability > 0.7 ? 'bg-[#FF4136]' : 
                                    result.probability > 0.3 ? 'bg-yellow-500' : 'bg-green-500'
                                  }`}
                                  style={{ width: `${result.probability * 100}%` }}
                                />
                              </div>
                              <span>{(result.probability * 100).toFixed(1)}%</span>
                            </div>
                          </td>
                          <td className="p-3">
                            <span className={`px-2 py-1 rounded text-xs font-medium ${
                              result.probability > 0.7 ? 'bg-[#FF4136]/20 text-[#FF4136]' :
                              result.probability > 0.3 ? 'bg-yellow-500/20 text-yellow-500' :
                              'bg-green-500/20 text-green-500'
                            }`}>
                              {result.probability > 0.7 ? 'High Risk' : 
                               result.probability > 0.3 ? 'Medium Risk' : 'Low Risk'}
                            </span>
                          </td>
                        </tr>
                      ))}
                    </tbody>
                  </table>
                </div>
              </div>
            </GlassmorphicCard>
          </div>
        )}
      </div>
    </div>
  );
}
