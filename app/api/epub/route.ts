import { NextResponse } from 'next/server';
import fetch from 'node-fetch';
import epub from 'epub-gen-memory';
import type { Chapter } from 'epub-gen-memory';

async function fetchGoogleDoc(docId: string): Promise<string | null> {
  const baseUrl = "https://docs.google.com/document/d/";
  const exportUrl = `/export?format=html`;
  const url = `${baseUrl}${docId}${exportUrl}`;

  try {
    const response = await fetch(url);
    if (!response.ok) {
      console.error(`Failed to download HTML for docId: ${docId}, status: ${response.status}`);
      return null;
    }
    return await response.text();
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

    const htmlContents = await Promise.all(docIds.map(fetchGoogleDoc));
    const validContents = htmlContents.filter(content => content !== null) as string[];

    if (validContents.length === 0) {
      return NextResponse.json({ error: "Failed to fetch any documents" }, { status: 400 });
    }

    const chapters: Chapter[] = validContents.map((content, index) => ({
      title: `Document ${index + 1}`,
      content: content,
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