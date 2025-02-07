export default function Header() {
    return (
        <div className="w-full flex flex-col items-center gap-4 mb-10 md:mb-16">
            <h1 className="text-3xl md:text-4xl font-bold text-center text-gray-900 dark:text-gray-100">
                Google Docs Converter
            </h1>
            <p className="text-lg text-gray-600 dark:text-gray-400 text-center max-w-2xl">
                Convert and merge multiple Google Docs into a single PDF or EPUB file. Simply paste your Google Doc links below, one per line.
            </p>
        </div>
    );
} 