import { useRef } from 'react';

interface ReaderProps {
    text: string;
    highlights: Array<{ text: string; type: 'risk' | 'warning' }>;
    activeHighlight: string | null;
}

// Mock text for now since we don't have full PDF-to-text on frontend yet
// In a real app, we'd fetch the text content or use a PDF viewer
export function Reader({ text }: ReaderProps) {
    const containerRef = useRef<HTMLDivElement>(null);

    // Simple text rendering for prototype
    // In production, this would be a sophisticated PDF viewer or rich text editor

    return (
        <div className="flex-1 h-screen overflow-y-auto bg-[#F1F5F9] p-8 md:p-8 pb-20 md:pb-0 relative" ref={containerRef}>
            {/* Background Pattern */}
            <div className="absolute inset-0 opacity-[0.03] pointer-events-none" style={{ backgroundImage: 'radial-gradient(#64748b 1px, transparent 1px)', backgroundSize: '24px 24px' }}></div>

            <div className="max-w-4xl mx-auto bg-white shadow-2xl min-h-[1100px] relative transition-all duration-300 ease-in-out">
                {/* Header/Watermark */}
                <div className="absolute top-0 left-0 w-full h-2 bg-gradient-to-r from-blue-900 via-blue-700 to-blue-900 opacity-80"></div>

                <div className="p-6 md:p-16">
                    <div className="font-serif text-[17px] leading-[2.2] text-gray-800 whitespace-pre-wrap text-justify selection:bg-blue-100 selection:text-blue-900">
                        {text || (
                            <div className="flex flex-col items-center justify-center h-[600px] text-gray-400 border-2 border-dashed border-gray-200 rounded-xl bg-gray-50/50">
                                <div className="w-16 h-16 bg-gray-100 rounded-full flex items-center justify-center mb-4">
                                    <div className="w-8 h-8 border-2 border-gray-300 rounded-sm"></div>
                                </div>
                                <p className="font-sans font-medium text-gray-500">No Document Loaded</p>
                                <p className="font-sans text-sm text-gray-400 mt-2">Upload a contract from the docket to begin.</p>
                            </div>
                        )}
                    </div>
                </div>

                {/* Page Footer Effect */}
                <div className="absolute bottom-0 left-0 w-full h-16 bg-gradient-to-t from-white to-transparent pointer-events-none"></div>
            </div>
        </div>
    );
}
