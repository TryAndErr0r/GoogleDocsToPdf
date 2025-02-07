import { NextResponse } from 'next/server';
import { PDFDocument, PDFPage, rgb } from 'pdf-lib';
import fetch from 'node-fetch';

async function downloadPdf(docId: string): Promise<Buffer | null> {
  const baseUrl = "https://docs.google.com/document/d/";
  const exportUrl = `/export?format=pdf`;
  const url = `${baseUrl}${docId}${exportUrl}`;

  try {
    const response = await fetch(url);
    if (!response.ok) {
      console.error(`Failed to download PDF for docId: ${docId}, status: ${response.status}`);
      return null;
    }
    const buffer = await response.arrayBuffer();
    return Buffer.from(buffer);
  } catch (error) {
    console.error(`Error downloading PDF for docId: ${docId}`, error);
    return null;
  }
}

async function addChapterPage(pdfDoc: PDFDocument, chapterNumber: number, title: string): Promise<void> {
  const page = pdfDoc.addPage();
  const { width, height } = page.getSize();

  page.drawText(`Chapter ${chapterNumber}`, {
    x: width / 2 - 50, // Centered X position (approximately)
    y: height - 100,    // Position from top
    size: 24,
    font: await pdfDoc.embedFont('Helvetica-Bold'),
    color: rgb(0, 0, 0),
  });

  page.drawLine({
    start: { x: 50, y: height - 150 },
    end: { x: width - 50, y: height - 150 },
    thickness: 2,
    color: rgb(0, 0, 0),
  });

  page.drawText(title || 'Document Title', {
    x: 50,
    y: height - 200,
    size: 18,
    font: await pdfDoc.embedFont('Helvetica'),
    color: rgb(0, 0, 0),
  });
}

export async function POST(req: Request) {
  try {
    const { docIds } = await req.json();

    if (!Array.isArray(docIds) || docIds.length === 0) {
      return NextResponse.json({ error: "No document IDs provided" }, { status: 400 });
    }

    const pdfBuffers = await Promise.all(docIds.map(downloadPdf));
    const validPdfBuffers = pdfBuffers.filter(buffer => buffer !== null) as Buffer[];

    const mergedPdf = await PDFDocument.create();

    for (let i = 0; i < validPdfBuffers.length; i++) {
      const pdfBuffer = validPdfBuffers[i];
      if (pdfBuffer) {
        try {
          const doc = await PDFDocument.load(pdfBuffer);
          // Attempt to get title from PDF metadata (not always reliable for Google Docs)
          let title = 'Document ' + (i + 1);
          try {
            title = doc.getTitle() || title;
          } catch (metadataError) {
            console.warn("Error reading metadata:", metadataError);
          }

          await addChapterPage(mergedPdf, i + 1, title);
          

          const copiedPages = await mergedPdf.copyPages(doc, doc.getPages().map((pagem,idx) => idx));
          copiedPages.forEach((page) => mergedPdf.addPage(page));
        } catch (loadError) {
          console.error("Error loading PDF buffer:", loadError);
        }
      }
    }

    const pdfBytes = await mergedPdf.save();

    return new NextResponse(pdfBytes, {
      status: 200,
      headers: {
        'Content-Type': 'application/pdf',
        'Content-Disposition': 'attachment; filename="merged-documents.pdf"',
      },
    });
  } catch (error) {
    console.error("Error in API route:", error);
    return NextResponse.json({ error: "Failed to generate PDF" }, { status: 500 });
  }
} 