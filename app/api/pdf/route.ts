import { NextResponse } from 'next/server';
import { PDFDocument } from 'pdf-lib';
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
  const font = await pdfDoc.embedFont('Helvetica-Bold');
  const fontSize = 24;
  
  // Calculate text width to center properly
  const textWidth = font.widthOfTextAtSize(title, fontSize);
  
  page.drawText(`${title}`, {
    x: (width - textWidth) / 2, // Centered using actual text width
    y: height - 100,            // Position from top
    size: fontSize,
    font: font,
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