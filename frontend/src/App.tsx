import { useState } from 'react';
import { useMutation } from '@tanstack/react-query';
import axios from 'axios';
import { Docket } from './components/Docket';
import { Reader } from './components/Reader';
import { AuditorPanel } from './components/AuditorPanel';

// API Configuration
const API_URL = 'http://localhost:8001';

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
            const res = await axios.post(`${API_URL}/upload`, formData, {
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
            const res = await axios.post(`${API_URL}/audit`, {
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
            const res = await axios.post(`${API_URL}/chat`, {
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
        <div className="flex h-screen bg-gray-50 overflow-hidden">
            <Docket
                onUpload={(file) => uploadMutation.mutate(file)}
                isUploading={uploadMutation.isPending}
                uploadStatus={uploadMutation.isError ? 'error' : uploadMutation.isSuccess ? 'success' : 'idle'}
                fileName={fileName}
            />

            <Reader
                text={activeViolation ? `...${activeViolation.clause_text}...` : "Upload a document to see the analysis."}
                highlights={[]}
                activeHighlight={null}
            />

            <AuditorPanel
                riskScore={report?.overall_risk_score || 0}
                violations={report?.violations || []}
                onViolationClick={handleViolationClick}
                isAuditing={auditMutation.isPending}
                onRunAudit={() => docId && auditMutation.mutate(docId)}
                canAudit={!!docId}
                checklist={checklist}
                onUpdateChecklist={setChecklist}
                onChat={chatMutation.mutateAsync}
                isChatting={chatMutation.isPending}
            />
        </div>
    );
}

export default App;
