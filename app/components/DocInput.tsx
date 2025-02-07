interface DocInputProps {
    docLinks: string[];
    onChange: (updatedDocLinks: string[]) => void;
    isGenerating: boolean;
    onGenerate: (format: 'pdf' | 'epub') => void;
    onClear: () => void;
    downloadUrl: string | null;
    downloadFormat: 'pdf' | 'epub' | null;
    filename: string;
    onFilenameChange: (filename: string) => void;
  }
  
  export default function DocInput({ docLinks, onChange, isGenerating, onGenerate, onClear, downloadUrl, downloadFormat, filename, onFilenameChange }: DocInputProps) {
    const handleInputChange = (index: number, value: string) => {
      const updatedDocLinks = [...docLinks];
      updatedDocLinks[index] = value;
  
      if (index === docLinks.length - 1 && value.trim() !== "") {
        updatedDocLinks.push(""); // Add a new empty input if the last one is filled
      }
      onChange(updatedDocLinks);
    };
  
    const handleRemoveInput = (index: number) => {
      if (docLinks.length <= 1) return; // Prevent removing the last input
      const updatedDocLinks = docLinks.filter((_, i) => i !== index);
      onChange(updatedDocLinks);
    };
  
  
    return (
      <div className="w-full max-w-2xl mx-auto space-y-6 md:space-y-8">
        <div className="space-y-3">
          {docLinks.map((link, index) => (
            <div key={index} className="flex items-center space-x-3">
              <input
                type="text"
                placeholder="https://docs.google.com/document/d/your-doc-id"
                className="w-full p-3 text-sm border border-gray-300 rounded-md shadow-sm dark:bg-gray-800 dark:border-gray-700 focus:ring-2 focus:ring-primary focus:border-primary transition duration-200 ease-in-out"
                value={link}
                onChange={(e) => handleInputChange(index, e.target.value)}
              />
              {docLinks.length > 1 && (
                <button
                  onClick={() => handleRemoveInput(index)}
                  className="p-2 text-red-600 hover:text-red-700 focus:outline-none"
                >
                  <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24" xmlns="http://www.w3.org/2000/svg"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M6 18L18 6M6 6l12 12"></path></svg>
                </button>
              )}
            </div>
          ))}
        </div>
  
  
        <div className="flex flex-col sm:flex-row gap-4 justify-center items-center w-full">
          <div className="flex gap-2 w-full">
            <button
              onClick={() => onGenerate('pdf')}
              disabled={isGenerating}
              className="w-1/2 px-4 py-2.5 rounded-lg focus:outline-none focus:ring-2 focus:ring-primary focus:ring-opacity-50 disabled:opacity-50 disabled:cursor-not-allowed transition duration-200 ease-in-out flex items-center justify-center gap-2 text-base generate-pdf-button"
            >
              {isGenerating && downloadFormat === 'pdf' ? (
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
            <button
              onClick={() => onGenerate('epub')}
              disabled={isGenerating}
              className="w-1/2 px-4 py-2.5 bg-indigo-600 hover:bg-indigo-700 text-white rounded-lg focus:outline-none focus:ring-2 focus:ring-indigo-500 focus:ring-opacity-50 disabled:opacity-50 disabled:cursor-not-allowed transition duration-200 ease-in-out flex items-center justify-center gap-2 text-base"
            >
              {isGenerating && downloadFormat === 'epub' ? (
                <>
                  <svg className="animate-spin h-5 w-5" viewBox="0 0 24 24">
                    <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4" fill="none" />
                    <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z" />
                  </svg>
                  Processing...
                </>
              ) : (
                'Generate EPUB'
              )}
            </button>
          </div>
        </div>

        {downloadUrl ? (
          <div className="flex gap-4 items-center w-full">
            <div className="flex-grow">
              <input
                type="text"
                placeholder="Enter filename (optional)"
                className="w-full p-3 text-sm border border-gray-300 rounded-md shadow-sm dark:bg-gray-800 dark:border-gray-700 focus:ring-2 focus:ring-primary focus:border-primary transition duration-200 ease-in-out"
                value={filename}
                onChange={(e) => onFilenameChange(e.target.value)}
              />
            </div>
            <a
              href={downloadUrl}
              download={filename ? `${filename}.${downloadFormat}` : `merged-documents.${downloadFormat}`}
              className="px-6 py-2.5 bg-secondary hover:bg-secondary-darker text-white rounded-lg focus:outline-none focus:ring-2 focus:ring-secondary focus:ring-opacity-50 transition duration-200 ease-in-out flex items-center justify-center gap-2 text-base whitespace-nowrap"
            >
              <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M4 16v1a3 3 0 003 3h10a3 3 0 003-3v-1m-4-4l-4 4m0 0l-4-4m4 4V4" /></svg>
              Download {downloadFormat?.toUpperCase()}
            </a>
          </div>
        ) : (
          <div className="flex justify-center w-full">
            <button
              onClick={onClear}
              className="px-6 py-2.5 bg-gray-200 hover:bg-gray-300 dark:bg-gray-700 dark:hover:bg-gray-600 text-gray-700 dark:text-gray-200 rounded-lg focus:outline-none focus:ring-2 focus:ring-gray-300 dark:focus:ring-gray-500 focus:ring-opacity-50 transition duration-200 ease-in-out flex items-center justify-center gap-2 text-base"
            >
              <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 7l-.867 12.142A2 2 0 0116.138 21H7.862a2 2 0 01-1.995-1.858L5 7m5 4v6m4-6v6m1-10V4a1 1 0 00-1-1h-4a1 1 0 00-1 1v3M4 7h16" />
              </svg>
              Clear All
            </button>
          </div>
        )}
      </div>
    );
  }