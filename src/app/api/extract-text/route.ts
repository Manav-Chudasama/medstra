import { NextResponse } from 'next/server';
import { createWorker } from 'tesseract.js';
import * as pdfjsLib from 'pdfjs-dist';
import mammoth from 'mammoth';

export async function POST(request: Request) {
  try {
    const formData = await request.formData();
    const file = formData.get('file') as File;
    
    if (!file) {
      return NextResponse.json({ error: 'No file provided' }, { status: 400 });
    }

    let text = '';
    const fileType = file.type;
    const buffer = await file.arrayBuffer();

    // Handle different file types
    if (fileType === 'application/pdf') {
      // Process PDF
      const pdf = await pdfjsLib.getDocument({ data: buffer }).promise;
      const numPages = pdf.numPages;
      
      for (let i = 1; i <= numPages; i++) {
        const page = await pdf.getPage(i);
        const content = await page.getTextContent();
        text += content.items.map((item: any) => item.str).join(' ') + '\n';
      }
    } else if (fileType === 'application/msword' || fileType === 'application/vnd.openxmlformats-officedocument.wordprocessingml.document') {
      // Process Word documents
      const result = await mammoth.extractRawText({ arrayBuffer: buffer });
      text = result.value;
    } else if (fileType === 'text/plain') {
      // Process text files
      text = new TextDecoder().decode(buffer);
    } else if (fileType.startsWith('image/')) {
      // Process images using OCR
      const worker = await createWorker();
      
      // Convert the buffer to base64
      const base64Data = Buffer.from(buffer).toString('base64');
      const imageData = `data:${fileType};base64,${base64Data}`;
      
      const { data: { text: extractedText } } = await worker.recognize(imageData);
      await worker.terminate();
      text = extractedText;
    } else {
      return NextResponse.json({ error: 'Unsupported file type' }, { status: 400 });
    }

    return NextResponse.json({ text });
  } catch (error) {
    console.error('Error processing file:', error);
    return NextResponse.json({ error: 'Error processing file' }, { status: 500 });
  }
} 