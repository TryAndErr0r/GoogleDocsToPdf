"use client";
import Image from "next/image";
import { useState } from 'react';
import Header from './components/Header';
import DocInput from './components/DocInput';

export default function Home() {
  const [docLinks, setDocLinks] = useState<string[]>([""]);
  const [isGenerating, setIsGenerating] = useState(false);
  const [downloadUrl, setDownloadUrl] = useState<string | null>(null);

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

  return (
    <div className="min-h-screen bg-gray-50 dark:bg-gray-900">
      <div className="max-w-4xl mx-auto px-4 py-12">
        <Header />
        <DocInput
          docLinks={docLinks}
          onChange={setDocLinks}
          isGenerating={isGenerating}
          onGenerate={handleGeneratePdf}
          downloadUrl={downloadUrl}
        />
      </div>
    </div>
  );
}
