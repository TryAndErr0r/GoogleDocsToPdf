interface DocInputProps {
  value: string;
  onChange: (value: string) => void;
  isGenerating: boolean;
  onGenerate: () => void;
  downloadUrl: string | null;
}

export default function DocInput({ value, onChange, isGenerating, onGenerate, downloadUrl }: DocInputProps) {
  return (
    <div className="w-full max-w-2xl mx-auto space-y-4">
      <div className="relative">
        <textarea
          placeholder="https://docs.google.com/document/d/your-doc-id
https://docs.google.com/document/d/another-doc-id"
          className="w-full h-48 p-4 text-sm border rounded-lg shadow-sm 
                     dark:bg-gray-800 dark:border-gray-700 
                     focus:ring-2 focus:ring-blue-500 focus:border-transparent
                     transition duration-200 ease-in-out"
          value={value}
          onChange={(e) => onChange(e.target.value)}
        />
      </div>
      
      <div className="flex flex-col sm:flex-row gap-4 justify-center items-center">
        <button
          onClick={onGenerate}
          disabled={isGenerating}
          className="w-full sm:w-auto px-6 py-3 bg-blue-600 text-white rounded-lg
                     hover:bg-blue-700 disabled:opacity-50 disabled:cursor-not-allowed
                     transition duration-200 ease-in-out flex items-center justify-center gap-2"
        >
          {isGenerating ? (
            <>
              <svg className="animate-spin h-5 w-5" viewBox="0 0 24 24">
                <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4" fill="none" />
                <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z" />
              </svg>
              Processing...
            </>
          ) : (
            'Generate PDF'
          )}
        </button>
        
        {downloadUrl && (
          <a
            href={downloadUrl}
            download="merged-documents.pdf"
            className="w-full sm:w-auto px-6 py-3 bg-green-600 text-white rounded-lg
                       hover:bg-green-700 transition duration-200 ease-in-out
                       flex items-center justify-center gap-2"
          >
            <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M4 16v1a3 3 0 003 3h10a3 3 0 003-3v-1m-4-4l-4 4m0 0l-4-4m4 4V4" />
            </svg>
            Download PDF
          </a>
        )}
      </div>
    </div>
  );
} 