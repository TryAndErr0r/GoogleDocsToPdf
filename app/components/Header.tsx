import Image from "next/image";

export default function Header() {
  return (
    <div className="w-full flex flex-col items-center gap-4 mb-8">
      <Image
        className="dark:invert"
        src="/next.svg"
        alt="Next.js logo"
        width={180}
        height={38}
        priority
      />
      <h1 className="text-2xl font-bold text-center">
        Google Docs to PDF Converter
      </h1>
      <p className="text-gray-600 dark:text-gray-400 text-center max-w-2xl">
        Convert and merge multiple Google Docs into a single PDF file. Simply paste your Google Doc links below, one per line.
      </p>
    </div>
  );
} 