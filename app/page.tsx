"use client";
import { useState, useEffect } from 'react';
import Header from './components/Header';
import DocInput from './components/DocInput';

export default function Home() {
  const [mounted, setMounted] = useState(false);
  const [docLinks, setDocLinks] = useState<string[]>([""]); // Start with default value
  const [isGenerating, setIsGenerating] = useState(false);
  const [downloadUrl, setDownloadUrl] = useState<string | null>(null);

  // Handle localStorage after mount
  useEffect(() => {
    const saved = localStorage.getItem('docLinks');
    if (saved) {
      const parsed = JSON.parse(saved);
      setDocLinks(parsed.length > 0 ? parsed : [""]); 
    }
    setMounted(true);
  }, []);

  // Save to localStorage when docLinks changes
  useEffect(() => {
    if (mounted) {
      localStorage.setItem('docLinks', JSON.stringify(docLinks));
    }
  }, [docLinks, mounted]);

  const handleGeneratePdf = async () => {
    setIsGenerating(true);
    setDownloadUrl(null);

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
      const response = await fetch('/api/pdf', {
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
      console.error("Error generating PDF:", error);
      // Handle error states in UI if needed
    } finally {
      setIsGenerating(false);
    }
  };

  const handleClear = () => {
    setDocLinks([""]);
    setDownloadUrl(null);
    localStorage.removeItem('docLinks');
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
          onGenerate={handleGeneratePdf}
          onClear={handleClear}
          downloadUrl={downloadUrl}
        />
      </div>
    </div>
  );
}
