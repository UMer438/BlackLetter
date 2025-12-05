import { AlertTriangle, CheckCircle2 } from 'lucide-react';
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
}

export function AuditorPanel({ riskScore, violations, onViolationClick, isAuditing, onRunAudit, canAudit }: AuditorPanelProps) {
    const getScoreColor = (score: number) => {
        if (score < 30) return 'text-green-500';
        if (score < 70) return 'text-yellow-500';
        return 'text-alert-red';
    };

    return (
        <div className="w-96 bg-white border-l border-gray-200 h-screen flex flex-col shadow-xl z-20">
            <div className="p-8 border-b border-gray-100 bg-white">
                <div className="flex items-center justify-between mb-2">
                    <h2 className="text-lg font-serif font-bold text-navy-900">Compliance Audit</h2>
                    <div className="px-2 py-1 bg-blue-50 text-blue-600 rounded text-[10px] font-bold uppercase tracking-wider">AI Powered</div>
                </div>
                <p className="text-xs text-gray-500 leading-relaxed">Automated risk assessment and clause analysis engine.</p>

                <button
                    onClick={onRunAudit}
                    disabled={!canAudit || isAuditing}
                    className={cn(
                        "mt-6 w-full py-3 px-4 rounded-lg text-sm font-semibold tracking-wide transition-all duration-300 shadow-md hover:shadow-lg transform active:scale-[0.98]",
                        canAudit && !isAuditing
                            ? "bg-navy-900 text-white hover:bg-[#0B1120] ring-1 ring-navy-900"
                            : "bg-gray-100 text-gray-400 cursor-not-allowed ring-1 ring-gray-200"
                    )}
                >
                    {isAuditing ? (
                        <span className="flex items-center justify-center gap-2">
                            <span className="w-4 h-4 border-2 border-white/30 border-t-white rounded-full animate-spin"></span>
                            Running Analysis...
                        </span>
                    ) : "Run Compliance Audit"}
                </button>
            </div>

            <div className="p-8 border-b border-gray-100 flex flex-col items-center bg-gray-50/50">
                <div className="relative w-40 h-40 flex items-center justify-center">
                    {/* Premium Gauge Visualization */}
                    <svg className="w-full h-full transform -rotate-90 drop-shadow-md">
                        <circle
                            cx="80"
                            cy="80"
                            r="70"
                            stroke="#E2E8F0"
                            strokeWidth="12"
                            fill="transparent"
                            strokeLinecap="round"
                        />
                        <circle
                            cx="80"
                            cy="80"
                            r="70"
                            stroke="currentColor"
                            strokeWidth="12"
                            fill="transparent"
                            strokeDasharray={439.82}
                            strokeDashoffset={439.82 - (439.82 * riskScore) / 100}
                            strokeLinecap="round"
                            className={cn("transition-all duration-1000 ease-out", getScoreColor(riskScore))}
                        />
                    </svg>
                    <div className="absolute flex flex-col items-center">
                        <span className={cn("text-4xl font-bold tracking-tight", getScoreColor(riskScore))}>{riskScore}</span>
                        <span className="text-[10px] text-gray-400 uppercase tracking-[0.2em] font-semibold mt-1">Risk Score</span>
                    </div>
                </div>
            </div>

            <div className="flex-1 overflow-y-auto p-6 bg-gray-50/30">
                <div className="flex items-center justify-between mb-6">
                    <h3 className="text-xs font-bold text-gray-400 uppercase tracking-widest">Detected Violations</h3>
                    <span className="text-xs font-medium text-gray-400 bg-gray-100 px-2 py-0.5 rounded-full">{violations.length}</span>
                </div>

                {isAuditing ? (
                    <div className="space-y-4">
                        {[1, 2, 3].map((i) => (
                            <div key={i} className="h-28 bg-white border border-gray-100 rounded-xl p-4 shadow-sm animate-pulse">
                                <div className="h-4 bg-gray-100 rounded w-3/4 mb-3"></div>
                                <div className="h-3 bg-gray-100 rounded w-full mb-2"></div>
                                <div className="h-3 bg-gray-100 rounded w-2/3"></div>
                            </div>
                        ))}
                    </div>
                ) : violations.length === 0 ? (
                    <div className="flex flex-col items-center justify-center py-12 text-gray-400 border-2 border-dashed border-gray-200 rounded-xl bg-white/50">
                        <CheckCircle2 className="w-12 h-12 mb-3 text-green-500 opacity-80" />
                        <p className="font-medium text-sm text-gray-600">Clean Record</p>
                        <p className="text-xs mt-1">No critical violations found.</p>
                    </div>
                ) : (
                    <div className="space-y-3">
                        {violations.map((violation, idx) => (
                            <button
                                key={idx}
                                onClick={() => onViolationClick(violation)}
                                className="w-full text-left p-4 rounded-xl bg-white border border-gray-200 hover:border-red-200 hover:shadow-md hover:shadow-red-500/5 transition-all duration-300 group relative overflow-hidden"
                            >
                                <div className="absolute left-0 top-0 w-1 h-full bg-red-500 opacity-0 group-hover:opacity-100 transition-opacity"></div>
                                <div className="flex items-start gap-3">
                                    <div className="p-1.5 bg-red-50 text-red-500 rounded-md shrink-0 group-hover:bg-red-100 transition-colors">
                                        <AlertTriangle className="w-4 h-4" />
                                    </div>
                                    <div>
                                        <h4 className="text-sm font-semibold text-gray-900 group-hover:text-red-600 transition-colors leading-tight">
                                            {violation.checklist_item}
                                        </h4>
                                        <p className="text-xs text-gray-500 mt-2 leading-relaxed line-clamp-2 group-hover:text-gray-600">
                                            {violation.explanation}
                                        </p>
                                    </div>
                                </div>
                            </button>
                        ))}
                    </div>
                )}
            </div>
        </div>
    );
}
