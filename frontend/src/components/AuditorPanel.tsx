import { useState } from 'react';
import { AlertTriangle, CheckCircle2, MessageSquare, Plus, X, Send } from 'lucide-react';
import { cn } from '../lib/utils';

interface Violation {
    checklist_item: string;
    risk_score: number;
    clause_text: string;
    explanation: string;
}

interface AuditorPanelProps {
    riskScore: number;
    violations: Violation[];
    onViolationClick: (violation: Violation) => void;
    isAuditing: boolean;
    onRunAudit: () => void;
    canAudit: boolean;
    checklist: string[];
    onUpdateChecklist: (checklist: string[]) => void;
    onChat: (question: string) => Promise<string>;
    isChatting: boolean;
}

export function AuditorPanel({
    riskScore,
    violations,
    onViolationClick,
    isAuditing,
    onRunAudit,
    canAudit,
    checklist,
    onUpdateChecklist,
    onChat,
    isChatting
}: AuditorPanelProps) {
    const [activeTab, setActiveTab] = useState<'audit' | 'chat' | 'settings'>('audit');
    const [chatInput, setChatInput] = useState('');
    const [chatHistory, setChatHistory] = useState<{ role: 'user' | 'ai', content: string }[]>([]);
    const [newItem, setNewItem] = useState('');

    const getScoreColor = (score: number) => {
        if (score < 30) return 'text-green-500';
        if (score < 70) return 'text-yellow-500';
        return 'text-alert-red';
    };

    const handleChatSubmit = async (e: React.FormEvent) => {
        e.preventDefault();
        if (!chatInput.trim()) return;

        const question = chatInput;
        setChatInput('');
        setChatHistory(prev => [...prev, { role: 'user', content: question }]);

        try {
            const answer = await onChat(question);
            setChatHistory(prev => [...prev, { role: 'ai', content: answer }]);
        } catch (error) {
            setChatHistory(prev => [...prev, { role: 'ai', content: "Sorry, I couldn't get an answer." }]);
        }
    };

    const addChecklistItem = (e: React.FormEvent) => {
        e.preventDefault();
        if (newItem.trim()) {
            onUpdateChecklist([...checklist, newItem.trim()]);
            setNewItem('');
        }
    };

    const removeChecklistItem = (index: number) => {
        onUpdateChecklist(checklist.filter((_, i) => i !== index));
    };

    return (
        <div className="w-full md:w-96 bg-white border-l border-gray-200 h-screen flex flex-col shadow-xl z-20 transition-all duration-300 pb-20 md:pb-0">
            {/* Header */}
            <div className="p-6 border-b border-gray-100 bg-white">
                <div className="flex items-center justify-between mb-4">
                    <h2 className="text-lg font-serif font-bold text-navy-900">Compliance Audit</h2>
                    <div className="px-2 py-1 bg-blue-50 text-blue-600 rounded text-[10px] font-bold uppercase tracking-wider">AI Powered</div>
                </div>

                {/* Tabs */}
                <div className="flex bg-gray-100 p-1 rounded-lg">
                    <button
                        onClick={() => setActiveTab('audit')}
                        className={cn("flex-1 py-1.5 text-xs font-medium rounded-md transition-all", activeTab === 'audit' ? "bg-white shadow-sm text-navy-900" : "text-gray-500 hover:text-gray-700")}
                    >
                        Audit
                    </button>
                    <button
                        onClick={() => setActiveTab('chat')}
                        className={cn("flex-1 py-1.5 text-xs font-medium rounded-md transition-all", activeTab === 'chat' ? "bg-white shadow-sm text-navy-900" : "text-gray-500 hover:text-gray-700")}
                    >
                        Chat
                    </button>
                    <button
                        onClick={() => setActiveTab('settings')}
                        className={cn("flex-1 py-1.5 text-xs font-medium rounded-md transition-all", activeTab === 'settings' ? "bg-white shadow-sm text-navy-900" : "text-gray-500 hover:text-gray-700")}
                    >
                        Checklist
                    </button>
                </div>
            </div>

            {/* Content */}
            <div className="flex-1 overflow-y-auto bg-gray-50/30">

                {/* AUDIT TAB */}
                {activeTab === 'audit' && (
                    <div className="p-6">
                        <div className="flex flex-col items-center mb-8">
                            <div className="relative w-32 h-32 flex items-center justify-center mb-4">
                                <svg className="w-full h-full transform -rotate-90 drop-shadow-md">
                                    <circle cx="64" cy="64" r="56" stroke="#E2E8F0" strokeWidth="8" fill="transparent" strokeLinecap="round" />
                                    <circle cx="64" cy="64" r="56" stroke="currentColor" strokeWidth="8" fill="transparent"
                                        strokeDasharray={351.86}
                                        strokeDashoffset={351.86 - (351.86 * riskScore) / 100}
                                        strokeLinecap="round"
                                        className={cn("transition-all duration-1000 ease-out", getScoreColor(riskScore))}
                                    />
                                </svg>
                                <div className="absolute flex flex-col items-center">
                                    <span className={cn("text-3xl font-bold tracking-tight", getScoreColor(riskScore))}>{riskScore}</span>
                                    <span className="text-[9px] text-gray-400 uppercase tracking-[0.2em] font-semibold mt-1">Risk</span>
                                </div>
                            </div>

                            <button
                                onClick={onRunAudit}
                                disabled={!canAudit || isAuditing}
                                className={cn(
                                    "w-full py-2.5 px-4 rounded-lg text-sm font-semibold tracking-wide transition-all duration-300 shadow-sm",
                                    canAudit && !isAuditing
                                        ? "bg-navy-900 text-white hover:bg-[#0B1120]"
                                        : "bg-gray-200 text-gray-400 cursor-not-allowed"
                                )}
                            >
                                {isAuditing ? "Running Analysis..." : "Run Compliance Audit"}
                            </button>
                        </div>

                        <div className="space-y-3">
                            <h3 className="text-xs font-bold text-gray-400 uppercase tracking-widest mb-3">Audit Results</h3>
                            {isAuditing ? (
                                <div className="space-y-3">
                                    {[1, 2].map((i) => (
                                        <div key={i} className="h-20 bg-white border border-gray-100 rounded-xl animate-pulse"></div>
                                    ))}
                                </div>
                            ) : violations.length === 0 ? (
                                <div className="text-center py-8 text-gray-400 border-2 border-dashed border-gray-200 rounded-xl">
                                    <p className="text-sm">No results yet.</p>
                                </div>
                            ) : (
                                violations.map((violation, idx) => {
                                    const isSafe = violation.risk_score === 0;
                                    return (
                                        <button
                                            key={idx}
                                            onClick={() => onViolationClick(violation)}
                                            className={cn(
                                                "w-full text-left p-3 rounded-xl bg-white border transition-all duration-300 group relative overflow-hidden",
                                                isSafe ? "border-gray-200 hover:border-green-200" : "border-gray-200 hover:border-red-200"
                                            )}
                                        >
                                            <div className={cn("absolute left-0 top-0 w-1 h-full opacity-0 group-hover:opacity-100 transition-opacity", isSafe ? "bg-green-500" : "bg-red-500")}></div>
                                            <div className="flex items-start gap-3">
                                                <div className={cn("p-1 rounded-md shrink-0", isSafe ? "bg-green-50 text-green-500" : "bg-red-50 text-red-500")}>
                                                    {isSafe ? <CheckCircle2 className="w-3.5 h-3.5" /> : <AlertTriangle className="w-3.5 h-3.5" />}
                                                </div>
                                                <div>
                                                    <h4 className="text-xs font-semibold text-gray-900 leading-tight">{violation.checklist_item}</h4>
                                                    <p className="text-[10px] text-gray-500 mt-1 line-clamp-2">{violation.explanation}</p>
                                                </div>
                                            </div>
                                        </button>
                                    );
                                })
                            )}
                        </div>
                    </div>
                )}

                {/* CHAT TAB */}
                {activeTab === 'chat' && (
                    <div className="flex flex-col h-full">
                        <div className="flex-1 p-4 space-y-4 overflow-y-auto">
                            {chatHistory.length === 0 && (
                                <div className="text-center py-12 text-gray-400">
                                    <MessageSquare className="w-8 h-8 mx-auto mb-2 opacity-50" />
                                    <p className="text-sm">Ask questions about the document.</p>
                                </div>
                            )}
                            {chatHistory.map((msg, idx) => (
                                <div key={idx} className={cn("flex", msg.role === 'user' ? "justify-end" : "justify-start")}>
                                    <div className={cn(
                                        "max-w-[85%] p-3 rounded-2xl text-sm",
                                        msg.role === 'user' ? "bg-navy-900 text-white rounded-br-none" : "bg-white border border-gray-200 text-gray-800 rounded-bl-none shadow-sm"
                                    )}>
                                        {msg.content}
                                    </div>
                                </div>
                            ))}
                            {isChatting && (
                                <div className="flex justify-start">
                                    <div className="bg-gray-100 p-3 rounded-2xl rounded-bl-none animate-pulse">
                                        <div className="flex gap-1">
                                            <span className="w-1.5 h-1.5 bg-gray-400 rounded-full animate-bounce"></span>
                                            <span className="w-1.5 h-1.5 bg-gray-400 rounded-full animate-bounce delay-75"></span>
                                            <span className="w-1.5 h-1.5 bg-gray-400 rounded-full animate-bounce delay-150"></span>
                                        </div>
                                    </div>
                                </div>
                            )}
                        </div>
                        <div className="p-4 bg-white border-t border-gray-100">
                            <form onSubmit={handleChatSubmit} className="relative">
                                <input
                                    type="text"
                                    value={chatInput}
                                    onChange={(e) => setChatInput(e.target.value)}
                                    placeholder="Ask a question..."
                                    className="w-full pl-4 pr-10 py-2.5 bg-gray-50 border border-gray-200 rounded-xl text-sm focus:outline-none focus:ring-2 focus:ring-navy-900/10 focus:border-navy-900 transition-all"
                                />
                                <button
                                    type="submit"
                                    disabled={!chatInput.trim() || isChatting}
                                    className="absolute right-2 top-2 p-1 text-navy-900 hover:bg-gray-200 rounded-lg transition-colors disabled:opacity-50"
                                >
                                    <Send className="w-4 h-4" />
                                </button>
                            </form>
                        </div>
                    </div>
                )}

                {/* SETTINGS TAB (Checklist) */}
                {activeTab === 'settings' && (
                    <div className="p-6">
                        <h3 className="text-xs font-bold text-gray-400 uppercase tracking-widest mb-4">Audit Checklist</h3>

                        <form onSubmit={addChecklistItem} className="flex gap-2 mb-6">
                            <input
                                type="text"
                                value={newItem}
                                onChange={(e) => setNewItem(e.target.value)}
                                placeholder="Add new criteria..."
                                className="flex-1 px-3 py-2 bg-white border border-gray-200 rounded-lg text-sm focus:outline-none focus:border-navy-900"
                            />
                            <button
                                type="submit"
                                disabled={!newItem.trim()}
                                className="p-2 bg-navy-900 text-white rounded-lg hover:bg-[#0B1120] disabled:opacity-50"
                            >
                                <Plus className="w-4 h-4" />
                            </button>
                        </form>

                        <div className="space-y-2">
                            {checklist.map((item, idx) => (
                                <div key={idx} className="group flex items-center justify-between p-3 bg-white border border-gray-200 rounded-lg hover:border-gray-300 transition-all">
                                    <span className="text-sm text-gray-700">{item}</span>
                                    <button
                                        onClick={() => removeChecklistItem(idx)}
                                        className="text-gray-400 hover:text-red-500 opacity-0 group-hover:opacity-100 transition-all"
                                    >
                                        <X className="w-4 h-4" />
                                    </button>
                                </div>
                            ))}
                        </div>
                    </div>
                )}
            </div>
        </div>
    );
}
