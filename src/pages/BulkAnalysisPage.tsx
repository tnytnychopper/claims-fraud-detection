import React, { useCallback, useState } from 'react';
import { motion } from 'framer-motion';
import { ParticleBackground } from '../components/ParticleBackground';
import { GlassmorphicCard } from '../components/GlassmorphicCard';
import { Button } from '../components/Button';
import { UploadIcon, AlertTriangleIcon, CheckCircleIcon, InfoIcon, FileIcon, TrashIcon, ExternalLinkIcon } from 'lucide-react';
interface FileWithStatus {
  id: string;
  name: string;
  size: number;
  type: string;
  progress: number;
  status: 'uploading' | 'processing' | 'complete' | 'error';
  risk: 'high' | 'medium' | 'low' | null;
}
interface AnalysisResult {
  totalFiles: number;
  highRisk: number;
  mediumRisk: number;
  lowRisk: number;
  files: FileWithStatus[];
}
export function BulkAnalysisPage() {
  const [isDragging, setIsDragging] = useState(false);
  const [files, setFiles] = useState<FileWithStatus[]>([]);
  const [isAnalyzing, setIsAnalyzing] = useState(false);
  const [analysisResult, setAnalysisResult] = useState<AnalysisResult | null>(null);
  const [selectedFile, setSelectedFile] = useState<string | null>(null);
  const handleDragEnter = useCallback((e: React.DragEvent) => {
    e.preventDefault();
    e.stopPropagation();
    setIsDragging(true);
  }, []);
  const handleDragLeave = useCallback((e: React.DragEvent) => {
    e.preventDefault();
    e.stopPropagation();
    setIsDragging(false);
  }, []);
  const handleDragOver = useCallback((e: React.DragEvent) => {
    e.preventDefault();
    e.stopPropagation();
  }, []);
  const handleDrop = useCallback((e: React.DragEvent) => {
    e.preventDefault();
    e.stopPropagation();
    setIsDragging(false);
    const droppedFiles = Array.from(e.dataTransfer.files);
    addFiles(droppedFiles);
  }, []);
  const handleFileInput = useCallback((e: React.ChangeEvent<HTMLInputElement>) => {
    if (e.target.files) {
      const selectedFiles = Array.from(e.target.files);
      addFiles(selectedFiles);
    }
  }, []);
  const addFiles = (newFiles: File[]) => {
    const filesToAdd = newFiles.map(file => ({
      id: `file-${Date.now()}-${Math.random().toString(36).substr(2, 9)}`,
      name: file.name,
      size: file.size,
      type: file.type,
      progress: 0,
      status: 'uploading' as const,
      risk: null as 'high' | 'medium' | 'low' | null
    }));
    setFiles(prev => [...prev, ...filesToAdd]);
    // Simulate file upload progress
    filesToAdd.forEach(file => {
      const interval = setInterval(() => {
        setFiles(prevFiles => {
          const updatedFiles = prevFiles.map(f => {
            if (f.id === file.id) {
              const newProgress = f.progress + 10;
              if (newProgress >= 100) {
                clearInterval(interval);
                return {
                  ...f,
                  progress: 100,
                  status: 'complete'
                };
              }
              return {
                ...f,
                progress: newProgress
              };
            }
            return f;
          });
          return updatedFiles;
        });
      }, 300);
    });
  };
  const removeFile = (id: string) => {
    setFiles(prev => prev.filter(file => file.id !== id));
  };
  const startAnalysis = () => {
    setIsAnalyzing(true);
    // Simulate analysis process
    setTimeout(() => {
      const analyzedFiles = files.map(file => {
        // Randomly assign risk levels for demo purposes
        const riskLevels: ('high' | 'medium' | 'low')[] = ['high', 'medium', 'low'];
        const risk = riskLevels[Math.floor(Math.random() * riskLevels.length)];
        return {
          ...file,
          risk,
          status: 'complete'
        };
      });
      const highRiskCount = analyzedFiles.filter(file => file.risk === 'high').length;
      const mediumRiskCount = analyzedFiles.filter(file => file.risk === 'medium').length;
      const lowRiskCount = analyzedFiles.filter(file => file.risk === 'low').length;
      setAnalysisResult({
        totalFiles: analyzedFiles.length,
        highRisk: highRiskCount,
        mediumRisk: mediumRiskCount,
        lowRisk: lowRiskCount,
        files: analyzedFiles
      });
      setIsAnalyzing(false);
    }, 3000);
  };
  const resetAnalysis = () => {
    setFiles([]);
    setAnalysisResult(null);
    setSelectedFile(null);
  };
  return <div className="min-h-screen pt-20 pb-12 px-4 relative">
      <ParticleBackground className="opacity-50" />
      <div className="max-w-6xl mx-auto">
        <motion.div className="text-center mb-12" initial={{
        opacity: 0,
        y: 20
      }} animate={{
        opacity: 1,
        y: 0
      }} transition={{
        duration: 0.5
      }}>
          <h1 className="text-4xl font-bold mb-4">Bulk Document Analysis</h1>
          <p className="text-xl text-gray-300">
            Upload multiple healthcare claims for batch processing and fraud
            detection.
          </p>
        </motion.div>
        {!analysisResult ? <>
            <GlassmorphicCard className="mb-8">
              <div onDragEnter={handleDragEnter} onDragOver={handleDragOver} onDragLeave={handleDragLeave} onDrop={handleDrop} className={`border-2 border-dashed rounded-xl p-8 text-center transition-all ${isDragging ? 'border-[#00BFFF] bg-[#00BFFF]/10' : 'border-gray-600 hover:border-[#00BFFF]/50'}`}>
                <UploadIcon className="w-12 h-12 mx-auto mb-4 text-gray-400" />
                <h3 className="text-xl font-bold mb-2">Upload Documents</h3>
                <p className="text-gray-400 mb-6">
                  Drag and drop your files here, or click to browse
                </p>
                <input type="file" id="file-upload" multiple className="hidden" onChange={handleFileInput} />
                <label htmlFor="file-upload">
                  <Button as="span" className="cursor-pointer">
                    Browse Files
                  </Button>
                </label>
                <p className="mt-4 text-sm text-gray-500">
                  Supported formats: PDF, CSV, XLSX, JSON
                </p>
              </div>
            </GlassmorphicCard>
            {files.length > 0 && <GlassmorphicCard className="mb-8">
                <h3 className="text-xl font-bold mb-4">Uploaded Files</h3>
                <div className="space-y-4 mb-6">
                  {files.map(file => <div key={file.id} className="bg-[#0A0F1A]/50 rounded-lg p-4 flex items-center">
                      <FileIcon className="w-5 h-5 mr-3 text-[#00BFFF]" />
                      <div className="flex-1">
                        <div className="flex justify-between items-center mb-1">
                          <p className="font-medium">{file.name}</p>
                          <button onClick={() => removeFile(file.id)} className="text-gray-400 hover:text-[#FF4136] transition-colors">
                            <TrashIcon className="w-4 h-4" />
                          </button>
                        </div>
                        <div className="w-full bg-gray-700 rounded-full h-2 mb-1">
                          <div className={`h-2 rounded-full ${file.status === 'error' ? 'bg-[#FF4136]' : 'bg-[#00BFFF]'}`} style={{
                    width: `${file.progress}%`
                  }} />
                        </div>
                        <div className="flex justify-between items-center text-xs text-gray-400">
                          <span>
                            {file.status === 'uploading' ? `Uploading... ${file.progress}%` : file.status === 'error' ? 'Error uploading file' : 'Upload complete'}
                          </span>
                          <span>{(file.size / 1024).toFixed(0)} KB</span>
                        </div>
                      </div>
                    </div>)}
                </div>
                <div className="flex justify-end">
                  <Button onClick={startAnalysis} disabled={files.some(file => file.status === 'uploading') || isAnalyzing}>
                    {isAnalyzing ? <>
                        <div className="animate-spin mr-2">
                          <LoaderIcon className="w-5 h-5" />
                        </div>
                        Analyzing...
                      </> : 'Start Analysis'}
                  </Button>
                </div>
              </GlassmorphicCard>}
          </> : <AnalysisResultView result={analysisResult} selectedFile={selectedFile} setSelectedFile={setSelectedFile} onReset={resetAnalysis} />}
      </div>
    </div>;
}
interface AnalysisResultViewProps {
  result: AnalysisResult;
  selectedFile: string | null;
  setSelectedFile: (id: string | null) => void;
  onReset: () => void;
}
function AnalysisResultView({
  result,
  selectedFile,
  setSelectedFile,
  onReset
}: AnalysisResultViewProps) {
  const selectedFileData = selectedFile ? result.files.find(file => file.id === selectedFile) : null;
  return <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
      <div className="lg:col-span-3">
        <GlassmorphicCard>
          <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
            <SummaryCard title="Files Analyzed" value={result.totalFiles} icon={<FileIcon className="w-5 h-5" />} color="text-[#00BFFF]" />
            <SummaryCard title="High Risk" value={result.highRisk} icon={<AlertTriangleIcon className="w-5 h-5" />} color="text-[#FF4136]" />
            <SummaryCard title="Medium Risk" value={result.mediumRisk} icon={<AlertTriangleIcon className="w-5 h-5" />} color="text-[#FFA500]" />
            <SummaryCard title="Low Risk" value={result.lowRisk} icon={<CheckCircleIcon className="w-5 h-5" />} color="text-green-500" />
          </div>
        </GlassmorphicCard>
      </div>
      <div className="lg:col-span-2">
        <GlassmorphicCard className="h-full">
          <div className="flex justify-between items-center mb-6">
            <h3 className="text-xl font-bold">Analysis Results</h3>
            <Button variant="outline" onClick={onReset} className="text-sm py-2">
              Analyze New Files
            </Button>
          </div>
          <div className="overflow-x-auto">
            <table className="w-full">
              <thead>
                <tr className="border-b border-white/10">
                  <th className="text-left py-3 px-4 font-medium">File Name</th>
                  <th className="text-left py-3 px-4 font-medium">
                    Risk Level
                  </th>
                  <th className="text-left py-3 px-4 font-medium">Size</th>
                  <th className="text-left py-3 px-4 font-medium">Actions</th>
                </tr>
              </thead>
              <tbody>
                {result.files.map(file => <tr key={file.id} className={`border-b border-white/5 hover:bg-white/5 transition-colors ${selectedFile === file.id ? 'bg-[#00BFFF]/10' : ''}`}>
                    <td className="py-3 px-4">
                      <div className="flex items-center">
                        <FileIcon className="w-4 h-4 mr-2 text-gray-400" />
                        <span className="truncate max-w-[200px]">
                          {file.name}
                        </span>
                      </div>
                    </td>
                    <td className="py-3 px-4">
                      <RiskBadge risk={file.risk} />
                    </td>
                    <td className="py-3 px-4 text-gray-400">
                      {(file.size / 1024).toFixed(0)} KB
                    </td>
                    <td className="py-3 px-4">
                      <button onClick={() => setSelectedFile(file.id)} className="text-[#00BFFF] hover:text-[#33FFDD] transition-colors">
                        View Details
                      </button>
                    </td>
                  </tr>)}
              </tbody>
            </table>
          </div>
        </GlassmorphicCard>
      </div>
      <div className="lg:col-span-1">
        <GlassmorphicCard className="h-full">
          {selectedFileData ? <>
              <div className="flex justify-between items-center mb-6">
                <h3 className="text-xl font-bold">File Details</h3>
                <button onClick={() => setSelectedFile(null)} className="text-gray-400 hover:text-white transition-colors">
                  Close
                </button>
              </div>
              <div className="mb-6">
                <p className="text-gray-400 mb-1">File Name</p>
                <p className="font-medium">{selectedFileData.name}</p>
              </div>
              <div className="mb-6">
                <p className="text-gray-400 mb-1">Risk Assessment</p>
                <RiskBadge risk={selectedFileData.risk} />
              </div>
              <div className="mb-6">
                <h4 className="font-bold mb-2">Risk Factors</h4>
                <div className="space-y-3">
                  {selectedFileData.risk === 'high' && <>
                      <RiskFactor title="Multiple billing for same service" description="This provider has billed for the same service multiple times within a short period" />
                      <RiskFactor title="Unusual billing pattern" description="Billing pattern deviates significantly from peers in same specialty" />
                      <RiskFactor title="Excessive service units" description="Number of service units exceeds clinical guidelines" />
                    </>}
                  {selectedFileData.risk === 'medium' && <>
                      <RiskFactor title="Unusual service combination" description="Services billed together are not typically performed on the same day" />
                      <RiskFactor title="Geographic anomaly" description="Provider and beneficiary addresses are unusually distant" />
                    </>}
                  {selectedFileData.risk === 'low' && <div className="bg-green-500/10 rounded-lg p-4">
                      <div className="flex items-start">
                        <CheckCircleIcon className="w-5 h-5 text-green-500 mr-2 mt-0.5" />
                        <p>No significant risk factors detected</p>
                      </div>
                    </div>}
                </div>
              </div>
              <div>
                <Button className="w-full">
                  <ExternalLinkIcon className="w-4 h-4 mr-2" />
                  Export Full Report
                </Button>
              </div>
            </> : <div className="flex flex-col items-center justify-center h-full text-center py-8">
              <InfoIcon className="w-12 h-12 text-gray-500 mb-4" />
              <h3 className="text-xl font-bold mb-2">No File Selected</h3>
              <p className="text-gray-400">
                Select a file from the table to view detailed analysis
              </p>
            </div>}
        </GlassmorphicCard>
      </div>
    </div>;
}
interface SummaryCardProps {
  title: string;
  value: number;
  icon: React.ReactNode;
  color: string;
}
function SummaryCard({
  title,
  value,
  icon,
  color
}: SummaryCardProps) {
  return <div className="bg-[#0A0F1A]/50 rounded-xl p-5 border border-white/5">
      <div className="flex items-center justify-between mb-4">
        <h4 className="text-gray-300 font-medium">{title}</h4>
        <div className={`p-2 rounded-full bg-opacity-10 ${color.replace('text-', 'bg-')}`}>
          <div className={color}>{icon}</div>
        </div>
      </div>
      <p className="text-3xl font-bold">{value}</p>
    </div>;
}
function RiskBadge({
  risk
}: {
  risk: 'high' | 'medium' | 'low' | null;
}) {
  if (!risk) return null;
  const colors = {
    high: 'bg-[#FF4136]/20 text-[#FF4136]',
    medium: 'bg-[#FFA500]/20 text-[#FFA500]',
    low: 'bg-green-500/20 text-green-500'
  };
  return <span className={`px-2 py-1 rounded-md text-xs font-medium ${colors[risk]}`}>
      {risk.charAt(0).toUpperCase() + risk.slice(1)} Risk
    </span>;
}
interface RiskFactorProps {
  title: string;
  description: string;
}
function RiskFactor({
  title,
  description
}: RiskFactorProps) {
  return <div className="bg-[#FF4136]/10 rounded-lg p-4">
      <div className="flex items-start">
        <AlertTriangleIcon className="w-5 h-5 text-[#FF4136] mr-2 mt-0.5" />
        <div>
          <p className="font-medium">{title}</p>
          <p className="text-sm text-gray-400">{description}</p>
        </div>
      </div>
    </div>;
}
function LoaderIcon({
  className
}: {
  className?: string;
}) {
  return <svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" className={className}>
      <line x1="12" y1="2" x2="12" y2="6"></line>
      <line x1="12" y1="18" x2="12" y2="22"></line>
      <line x1="4.93" y1="4.93" x2="7.76" y2="7.76"></line>
      <line x1="16.24" y1="16.24" x2="19.07" y2="19.07"></line>
      <line x1="2" y1="12" x2="6" y2="12"></line>
      <line x1="18" y1="12" x2="22" y2="12"></line>
      <line x1="4.93" y1="19.07" x2="7.76" y2="16.24"></line>
      <line x1="16.24" y1="7.76" x2="19.07" y2="4.93"></line>
    </svg>;
}