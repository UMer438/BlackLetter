import React from 'react';
import { Upload, FileText } from 'lucide-react';
import { cn } from '../lib/utils';

interface DocketProps {
    onUpload: (file: File) => void;
    isUploading: boolean;
    uploadStatus: 'idle' | 'success' | 'error';
    fileName: string | null;
}

export function Docket({ onUpload, isUploading, uploadStatus, fileName }: DocketProps) {
    const handleFileChange = (e: React.ChangeEvent<HTMLInputElement>) => {
        if (e.target.files && e.target.files[0]) {
            onUpload(e.target.files[0]);
        }
    };

    return (
        <div className="w-72 bg-[#0B1120] text-gray-300 h-screen flex flex-col border-r border-gray-800 shadow-2xl z-10">
            <div className="p-8 border-b border-gray-800/50 bg-[#0B1120]">
                <div className="flex items-center gap-3 mb-1">
                    <div className="w-8 h-8 bg-gradient-to-br from-blue-500 to-blue-700 rounded-lg flex items-center justify-center shadow-lg shadow-blue-500/20">
                        <span className="text-white font-serif font-bold text-lg">B</span>
                    </div>
                    <h1 className="text-xl font-serif font-bold tracking-wide text-white">BlackLetter</h1>
                </div>
                <p className="text-[10px] text-gray-500 uppercase tracking-[0.2em] font-medium ml-11">Legal Compliance AI</p>
            </div>

            <div className="p-6 flex-1 overflow-y-auto">
                <div className="mb-8">
                    <h2 className="text-xs font-bold text-gray-500 uppercase tracking-widest mb-4 pl-1">Case Files</h2>

                    <label className={cn(
                        "group flex flex-col items-center justify-center w-full h-40 border border-dashed rounded-xl cursor-pointer transition-all duration-300",
                        isUploading
                            ? "border-blue-500/50 bg-blue-500/5"
                            : "border-gray-700/50 hover:border-blue-500/50 hover:bg-gray-800/50 hover:shadow-lg hover:shadow-blue-500/5"
                    )}>
                        <div className="flex flex-col items-center justify-center pt-5 pb-6">
                            <div className={cn(
                                "p-3 rounded-full mb-3 transition-colors duration-300",
                                isUploading ? "bg-blue-500/20 text-blue-400" : "bg-gray-800 text-gray-400 group-hover:bg-blue-500/20 group-hover:text-blue-400"
                            )}>
                                <Upload className="w-6 h-6" />
                            </div>
                            <p className="text-sm font-medium text-gray-300 group-hover:text-white transition-colors">
                                {isUploading ? "Processing..." : "Upload Contract"}
                            </p>
                            <p className="text-xs text-gray-500 mt-1">PDF files only</p>
                        </div>
                        <input type="file" className="hidden" accept=".pdf" onChange={handleFileChange} disabled={isUploading} />
                    </label>
                </div>

                {fileName && (
                    <div className="animate-in fade-in slide-in-from-left-4 duration-500">
                        <h2 className="text-xs font-bold text-gray-500 uppercase tracking-widest mb-4 pl-1">Active Document</h2>
                        <div className="bg-gray-800/40 border border-gray-700/50 rounded-xl p-4 flex items-start gap-3 group hover:border-gray-600 transition-colors">
                            <div className="p-2 bg-gray-900 rounded-lg text-gray-400 group-hover:text-blue-400 transition-colors">
                                <FileText className="w-5 h-5" />
                            </div>
                            <div className="flex-1 min-w-0">
                                <p className="text-sm font-medium text-gray-200 truncate leading-tight mb-1">{fileName}</p>
                                <p className="text-xs text-gray-500 flex items-center gap-1.5">
                                    {uploadStatus === 'success' && (
                                        <>
                                            <span className="w-1.5 h-1.5 rounded-full bg-green-500 shadow-[0_0_8px_rgba(34,197,94,0.5)]"></span>
                                            <span className="text-green-400/90">Ready for Audit</span>
                                        </>
                                    )}
                                    {uploadStatus === 'error' && (
                                        <>
                                            <span className="w-1.5 h-1.5 rounded-full bg-red-500"></span>
                                            <span className="text-red-400">Upload Failed</span>
                                        </>
                                    )}
                                </p>
                            </div>
                        </div>
                    </div>
                )}
            </div>

            <div className="p-6 border-t border-gray-800/50 bg-[#0B1120]">
                <div className="flex items-center gap-3 text-xs text-gray-500 bg-gray-900/50 p-3 rounded-lg border border-gray-800">
                    <div className="relative flex h-2 w-2">
                        <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-green-400 opacity-75"></span>
                        <span className="relative inline-flex rounded-full h-2 w-2 bg-green-500"></span>
                    </div>
                    <span className="font-medium tracking-wide">System Operational</span>
                </div>
            </div>
        </div>
    );
}
