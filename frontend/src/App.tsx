import { useState } from 'react';
import { useMutation } from '@tanstack/react-query';
import axios from 'axios';
import { Docket } from './components/Docket';
import { Reader } from './components/Reader';
import { AuditorPanel } from './components/AuditorPanel';

// API Configuration
// API Configuration
const API_URL = import.meta.env.VITE_API_URL || '';

interface Violation {
    checklist_item: string;
    risk_score: number;
    clause_text: string;
    explanation: string;
}

interface AuditReport {
    overall_risk_score: number;
    violations: Violation[];
}

function App() {
    const [docId, setDocId] = useState<string | null>(null);
    const [mobileTab, setMobileTab] = useState<'docket' | 'reader' | 'audit'>('docket');
    const [fileName, setFileName] = useState<string | null>(null);
    const [report, setReport] = useState<AuditReport | null>(null);
    const [activeViolation, setActiveViolation] = useState<Violation | null>(null);

    const [checklist, setChecklist] = useState<string[]>([
        "Does this contract allow for unlimited liability?",
        "Is there a hidden arbitration clause?",
        "Does this violate GDPR data retention rules?",
        "Is there a termination for convenience clause?",
        "Are there any indemnification obligations?"
    ]);

    // Upload Mutation
    const uploadMutation = useMutation({
        mutationFn: async (file: File) => {
            const formData = new FormData();
            formData.append('file', file);
            const res = await axios.post(`${API_URL}/api/upload`, formData, {
                headers: { 'Content-Type': 'multipart/form-data' },
            });
            return res.data;
        },
        onSuccess: (data, variables) => {
            setDocId(data.doc_id);
            setFileName(variables.name);
        },
    });

    // Audit Mutation
    const auditMutation = useMutation({
        mutationFn: async (documentId: string) => {
            const res = await axios.post(`${API_URL}/api/audit`, {
                doc_id: documentId,
                checklist: checklist
            });
            return res.data;
        },
        onSuccess: (data) => {
            setReport(data);
        },
    });

    // Chat Mutation
    const chatMutation = useMutation({
        mutationFn: async (question: string) => {
            const res = await axios.post(`${API_URL}/api/chat`, {
                doc_id: docId,
                question: question
            });
            return res.data.answer;
        }
    });

    const handleViolationClick = (violation: Violation) => {
        setActiveViolation(violation);
        // In a real app, we would scroll to the specific text here
        // For now, we just highlight it in the reader (mocked)
    };

    return (
        <div className="flex h-screen bg-gray-50 overflow-hidden flex-col md:flex-row">
            {/* Desktop: Show Docket always. Mobile: Show only if tab is 'docket' */}
            <div className={`
                ${mobileTab === 'docket' ? 'flex' : 'hidden'} 
                md:flex z-30
            `}>
                <Docket
                    onUpload={(file) => uploadMutation.mutate(file)}
                    isUploading={uploadMutation.isPending}
                    uploadStatus={uploadMutation.isError ? 'error' : uploadMutation.isSuccess ? 'success' : 'idle'}
                    fileName={fileName}
                />
            </div>

            {/* Desktop: Show Reader always. Mobile: Show only if tab is 'reader' */}
            <div className={`
                flex-1 flex overflow-hidden
                ${mobileTab === 'reader' ? 'flex' : 'hidden md:flex'}
            `}>
                <Reader
                    text={activeViolation ? `...${activeViolation.clause_text}...` : "Upload a document to see the analysis."}
                    highlights={[]}
                    activeHighlight={null}
                />
            </div>

            {/* Desktop: Show Auditor always. Mobile: Show only if tab is 'audit' */}
            <div className={`
                ${mobileTab === 'audit' ? 'flex' : 'hidden'} 
                md:flex z-30
            `}>
                <AuditorPanel
                    riskScore={report?.overall_risk_score || 0}
                    violations={report?.violations || []}
                    onViolationClick={(v) => {
                        handleViolationClick(v);
                        setMobileTab('reader'); // Switch to reader on mobile when clicking a violation
                    }}
                    isAuditing={auditMutation.isPending}
                    onRunAudit={() => docId && auditMutation.mutate(docId)}
                    canAudit={!!docId}
                    checklist={checklist}
                    onUpdateChecklist={setChecklist}
                    onChat={chatMutation.mutateAsync}
                    isChatting={chatMutation.isPending}
                />
            </div>

            {/* Mobile Navigation Bar */}
            <div className="md:hidden fixed bottom-0 left-0 right-0 bg-white border-t border-gray-200 shadow-[0_-4px_6px_-1px_rgba(0,0,0,0.05)] z-50 px-6 py-3 flex justify-between items-center text-[10px] font-medium uppercase tracking-widest text-gray-400">
                <button
                    onClick={() => setMobileTab('docket')}
                    className={`flex flex-col items-center gap-1.5 transition-colors ${mobileTab === 'docket' ? 'text-blue-600' : 'hover:text-gray-600'}`}
                >
                    <div className={`p-2 rounded-lg transition-all ${mobileTab === 'docket' ? 'bg-blue-50' : 'bg-transparent'}`}>
                        <svg className="w-5 h-5" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 11H5m14 0a2 2 0 012 2v6a2 2 0 01-2 2H5a2 2 0 01-2-2v-6a2 2 0 012-2m14 0V9a2 2 0 00-2-2M5 11V9a2 2 0 012-2m0 0V5a2 2 0 012-2h6a2 2 0 012 2v2M7 7h10" />
                        </svg>
                    </div>
                    <span>Files</span>
                </button>
                <button
                    onClick={() => setMobileTab('reader')}
                    className={`flex flex-col items-center gap-1.5 transition-colors ${mobileTab === 'reader' ? 'text-blue-600' : 'hover:text-gray-600'}`}
                >
                    <div className={`p-2 rounded-lg transition-all ${mobileTab === 'reader' ? 'bg-blue-50' : 'bg-transparent'}`}>
                        <svg className="w-5 h-5" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 12h6m-6 4h6m2 5H7a2 2 0 01-2-2V5a2 2 0 012-2h5.586a1 1 0 01.707.293l5.414 5.414a1 1 0 01.293.707V19a2 2 0 01-2 2z" />
                        </svg>
                    </div>
                    <span>Reader</span>
                </button>
                <button
                    onClick={() => setMobileTab('audit')}
                    className={`flex flex-col items-center gap-1.5 transition-colors ${mobileTab === 'audit' ? 'text-blue-600' : 'hover:text-gray-600'}`}
                >
                    <div className={`p-2 rounded-lg transition-all ${mobileTab === 'audit' ? 'bg-blue-50' : 'bg-transparent'}`}>
                        <svg className="w-5 h-5" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 5H7a2 2 0 00-2 2v12a2 2 0 002 2h10a2 2 0 002-2V7a2 2 0 00-2-2h-2M9 5a2 2 0 002 2h2a2 2 0 002-2M9 5a2 2 0 012-2h2a2 2 0 012 2" />
                        </svg>
                    </div>
                    <span>Audit</span>
                </button>
            </div>
        </div>
    );
}

export default App;
