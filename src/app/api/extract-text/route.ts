import { NextResponse } from 'next/server';
import { createWorker } from 'tesseract.js';
import mammoth from 'mammoth';
import pdf from 'pdf-parse';

export async function POST(request: Request) {
  try {
    const formData = await request.formData();
    const file = formData.get('file') as File;
    const language = formData.get('language') as string || 'eng'; // Default to English if not specified
    
    if (!file) {
      return NextResponse.json({ error: 'No file provided' }, { status: 400 });
    }

    let text = '';
    const fileType = file.type;
    const buffer = await file.arrayBuffer();

    // Handle different file types
    if (fileType === 'application/pdf') {
      try {
        const pdfBuffer = Buffer.from(buffer);
        const data = await pdf(pdfBuffer);
        
        text = data.text;

        if (!text.trim()) {
          throw new Error('No text could be extracted from the PDF');
        }

        // Improve formatting with proper page breaks and section markers
        text = text
          .split('\n')
          .filter(line => line.trim()) // Remove empty lines
          .join('\n\n');
      } catch (pdfError) {
        console.error('PDF processing error:', pdfError);
        throw new Error(pdfError instanceof Error ? pdfError.message : 'Failed to process PDF document');
      }
    } else if (fileType === 'application/msword' || fileType === 'application/vnd.openxmlformats-officedocument.wordprocessingml.document') {
      const result = await mammoth.extractRawText({ arrayBuffer: buffer });
      text = result.value;
    } else if (fileType === 'text/plain') {
      text = new TextDecoder().decode(buffer);
    } else if (fileType.startsWith('image/')) {
      try {
        // Initialize worker with language support
        const worker = await createWorker(language);
        
        // Convert buffer to base64
        const base64Data = Buffer.from(buffer).toString('base64');
        const imageData = `data:${fileType};base64,${base64Data}`;
        
        // Configure worker for better accuracy
        await worker.setParameters({
          tessedit_ocr_engine_mode: 1, // Legacy + LSTM mode
          preserve_interword_spaces: '1',
        });

        // Perform OCR
        const { data } = await worker.recognize(imageData);

        text = data.text;

        // Post-process OCR text
        text = text
          .replace(/[^\S\r\n]+/g, ' ') // Replace multiple spaces with single space
          .replace(/[\r\n]+/g, '\n\n') // Normalize line breaks
          .trim();

        await worker.terminate();
      } catch (ocrError) {
        console.error('OCR processing error:', ocrError);
        throw new Error('Failed to process image document');
      }
    } else {
      return NextResponse.json({ error: 'Unsupported file type' }, { status: 400 });
    }

    // Format the extracted text with improved structure
    const formattedText = `
Medical Report Analysis
======================
Document Information:
-------------------
Type: ${file.type}
Name: ${file.name}
Processed: ${new Date().toLocaleString()}
${fileType.startsWith('image/') ? `OCR Language: ${language}` : ''}

Content Analysis:
---------------
${text.trim()}

Processing Notes:
---------------
- Document has been automatically processed and analyzed
- Text extraction method: ${fileType.startsWith('image/') ? 'OCR (Optical Character Recognition)' : 
  fileType === 'application/pdf' ? 'PDF Text Extraction' :
  fileType.includes('word') ? 'Word Document Processing' : 'Plain Text Processing'}
- This report will be incorporated into your medical assessment
======================
`;

    return NextResponse.json({ 
      text: formattedText,
      metadata: {
        fileType,
        fileName: file.name,
        processedAt: new Date().toISOString(),
        processingMethod: fileType.startsWith('image/') ? 'OCR' : 'Direct Text Extraction'
      }
    });
  } catch (error) {
    console.error('Error processing file:', error);
    return NextResponse.json({ 
      error: error instanceof Error ? error.message : 'Error processing file',
      details: error instanceof Error ? error.stack : undefined
    }, { status: 500 });
  }
} 