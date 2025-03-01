import { NextResponse } from 'next/server';
import { createWorker } from 'tesseract.js';
import mammoth from 'mammoth';
import pdf from 'pdf-parse';

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
      try {
        // Convert ArrayBuffer to Buffer for pdf-parse
        const pdfBuffer = Buffer.from(buffer);
        
        // Parse PDF
        const data = await pdf(pdfBuffer);
        text = data.text;

        if (!text.trim()) {
          throw new Error('No text could be extracted from the PDF');
        }

        // Add page breaks for better readability
        text = text.split('\n').join('\n\n');
      } catch (pdfError) {
        console.error('PDF processing error:', pdfError);
        throw new Error(pdfError instanceof Error ? pdfError.message : 'Failed to process PDF document');
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
      try {
        const worker = await createWorker();
        
        // Convert the buffer to base64
        const base64Data = Buffer.from(buffer).toString('base64');
        const imageData = `data:${fileType};base64,${base64Data}`;
        
        const { data: { text: extractedText } } = await worker.recognize(imageData);
        await worker.terminate();
        text = extractedText;
      } catch (ocrError) {
        console.error('OCR processing error:', ocrError);
        throw new Error('Failed to process image document');
      }
    } else {
      return NextResponse.json({ error: 'Unsupported file type' }, { status: 400 });
    }

    // Format the extracted text in a structured way
    const formattedText = `
Previous Medical Report Information:
--------------------------------
Document Type: ${file.type}
Document Name: ${file.name}
Upload Date: ${new Date().toISOString()}

Report Content:
-------------
${text}

Note: This medical report has been automatically processed and added to your assessment. The AI examiner will take this information into account during your assessment.
--------------------------------
`;

    return NextResponse.json({ text: formattedText });
  } catch (error) {
    console.error('Error processing file:', error);
    return NextResponse.json({ 
      error: error instanceof Error ? error.message : 'Error processing file'
    }, { status: 500 });
  }
} 