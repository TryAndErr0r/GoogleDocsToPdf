"use client";
import { useState, useEffect } from 'react';
import Header from './components/Header';
import DocInput from './components/DocInput';

export default function Home() {
  const [mounted, setMounted] = useState(false);
  const [docLinks, setDocLinks] = useState<string[]>([""]); // Start with default value
  const [isGenerating, setIsGenerating] = useState(false);
  const [downloadUrl, setDownloadUrl] = useState<string | null>(null);
  const [downloadFormat, setDownloadFormat] = useState<'pdf' | 'epub' | null>(null);
  const [filename, setFilename] = useState<string>("");

  // Handle localStorage after mount
  useEffect(() => {
    const saved = localStorage.getItem('docLinks');
    const savedFilename = localStorage.getItem('filename');
    if (saved) {
      const parsed = JSON.parse(saved);
      setDocLinks(parsed.length > 0 ? parsed : [""]); 
    }
    if (savedFilename) {
      setFilename(savedFilename);
    }
    setMounted(true);
  }, []);

  // Save to localStorage when docLinks changes
  useEffect(() => {
    if (mounted) {
      localStorage.setItem('docLinks', JSON.stringify(docLinks));
      localStorage.setItem('filename', filename);
    }
  }, [docLinks, filename, mounted]);

  const handleGenerate = async (format: 'pdf' | 'epub') => {
    setIsGenerating(true);
    setDownloadUrl(null);
    setDownloadFormat(format);

    const docIds = docLinks
      .map(link => {
        const trimmedLink = link.trim();
        if (trimmedLink === '') return null;

        const match = trimmedLink.match(/document\/d\/([a-zA-Z0-9-_]+)/);
        if (match && match[1]) {
          return match[1];
        } else {
          return trimmedLink;
        }
      })
      .filter(id => id !== null) as string[];

    if (docIds.length === 0) {
      setIsGenerating(false);
      alert("Please enter at least one Google Doc link or ID.");
      return;
    }

    try {
      const response = await fetch(`/api/${format}`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({ docIds }),
      });

      if (!response.ok) {
        throw new Error(`HTTP error! status: ${response.status}`);
      }

      const blob = await response.blob();
      const url = window.URL.createObjectURL(blob);
      setDownloadUrl(url);
    } catch (error) {
      console.error(`Error generating ${format}:`, error);
      alert(`Failed to generate ${format.toUpperCase()}. Please try again.`);
    } finally {
      setIsGenerating(false);
    }
  };

  const handleClear = () => {
    setDocLinks([""]);
    setDownloadUrl(null);
    setDownloadFormat(null);
    setFilename("");
    localStorage.removeItem('docLinks');
    localStorage.removeItem('filename');
  };

  // Don't render until after mount to prevent hydration mismatch
  if (!mounted) {
    return (
      <div className="min-h-screen bg-gray-50 dark:bg-gray-900 py-12 px-4 sm:px-6 lg:px-8">
        <div className="max-w-3xl mx-auto">
          <Header />
          <DocInput
            docLinks={[""]}
            onChange={() => {}}
            isGenerating={false}
            onGenerate={() => {}}
            onClear={() => {}}
            downloadUrl={null}
            downloadFormat={null}
            filename={""}
            onFilenameChange={() => {}}
          />
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gray-50 dark:bg-gray-900 py-12 px-4 sm:px-6 lg:px-8">
      <div className="max-w-3xl mx-auto">
        <Header />
        <DocInput
          docLinks={docLinks}
          onChange={setDocLinks}
          isGenerating={isGenerating}
          onGenerate={handleGenerate}
          onClear={handleClear}
          downloadUrl={downloadUrl}
          downloadFormat={downloadFormat}
          filename={filename}
          onFilenameChange={setFilename}
        />
      </div>
    </div>
  );
}
