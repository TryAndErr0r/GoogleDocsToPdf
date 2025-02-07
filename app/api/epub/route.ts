import { NextResponse } from 'next/server';
import fetch from 'node-fetch';
import epub from 'epub-gen-memory';
import type { Chapter } from 'epub-gen-memory';

async function fetchGoogleDoc(docId: string): Promise<{ content: string; filename: string } | null> {
  const baseUrl = "https://docs.google.com/document/d/";
  const exportUrl = `/export?format=html`;
  const url = `${baseUrl}${docId}${exportUrl}`;

  try {
    const response = await fetch(url);
    if (!response.ok) {
      console.error(`Failed to download HTML for docId: ${docId}, status: ${response.status}`);
      return null;
    }
    
    // Get filename from Content-Disposition header
    const contentDisposition = response.headers.get('content-disposition');
    let filename = 'Document';
    if (contentDisposition) {
      // First try to get the UTF-8 encoded filename
      const utf8FilenameMatch = contentDisposition.match(/filename\*=UTF-8''([^;]*)/);
      if (utf8FilenameMatch && utf8FilenameMatch[1]) {
        filename = decodeURIComponent(utf8FilenameMatch[1]);
      } else {
        // Fall back to regular filename if UTF-8 version is not available
        const filenameMatch = contentDisposition.match(/filename="([^"]*)"/)
        if (filenameMatch && filenameMatch[1]) {
          filename = filenameMatch[1];
        }
      }
      // Remove file extension if present and clean up the filename
      filename = filename
        .replace(/\.html$/, '')
        .replace(/\.htm$/, '');
    }

    const content = await response.text();
    return { content, filename };
  } catch (error) {
    console.error(`Error downloading HTML for docId: ${docId}`, error);
    return null;
  }
}

export async function POST(req: Request) {
  try {
    const { docIds } = await req.json();

    if (!Array.isArray(docIds) || docIds.length === 0) {
      return NextResponse.json({ error: "No document IDs provided" }, { status: 400 });
    }

    const results = await Promise.all(docIds.map(fetchGoogleDoc));
    const validResults = results.filter((result): result is { content: string; filename: string } => result !== null);

    if (validResults.length === 0) {
      return NextResponse.json({ error: "Failed to fetch any documents" }, { status: 400 });
    }

    const chapters: Chapter[] = validResults.map((result, index) => ({
      title: result.filename || `Document ${index + 1}`,
      content: result.content,
      excludeFromToc: false,
      beforeToc: false
    }));

    const epubBuffer = await epub('Merged Documents', chapters, 3, true);

    return new NextResponse(epubBuffer, {
      status: 200,
      headers: {
        'Content-Type': 'application/epub+zip',
        'Content-Disposition': 'attachment; filename="merged-documents.epub"',
      },
    });
  } catch (error) {
    console.error("Error in API route:", error);
    return NextResponse.json({ error: "Failed to generate EPUB" }, { status: 500 });
  }
} 