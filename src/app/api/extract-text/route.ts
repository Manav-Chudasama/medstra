import { NextResponse } from 'next/server';

export async function POST(request: Request) {
  try {
    const formData = await request.formData();
    const file = formData.get('file') as File;
    
    if (!file) {
      return NextResponse.json({ error: 'No file provided' }, { status: 400 });
    }

    // Convert file to base64
    const buffer = await file.arrayBuffer();
    const base64Data = Buffer.from(buffer).toString('base64');
    const mimeType = file.type;
    const dataUrl = `data:${mimeType};base64,${base64Data}`;

    // Call OpenAI Vision API
    const response = await fetch('https://api.openai.com/v1/chat/completions', {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        'Authorization': `Bearer ${process.env.OPENAI_API_KEY}`
      },
      body: JSON.stringify({
        model: 'gpt-4-vision-preview',
        messages: [
          {
            role: 'user',
            content: [
              {
                type: 'text',
                text: `You are a medical expert specialized in interpreting doctors' handwriting and medical documents. Please:

1. Carefully analyze this medical document, paying special attention to:
   - Handwritten prescriptions and notes
   - Medical abbreviations and symbols
   - Dosage instructions and frequencies
   - Diagnostic notes and medical terminology

2. Extract and structure the following information:
   - Patient Information (if present)
   - Vital Signs/Measurements
   - Diagnoses (both primary and secondary)
   - Prescribed Medications (including dosages and frequencies)
   - Treatment Plans
   - Lab Results
   - Follow-up Instructions
   - Any warnings or special instructions

3. If you encounter unclear handwriting:
   - Use medical context to make informed interpretations
   - Indicate any uncertainties with [?]
   - Consider common medical abbreviations and shorthand
   - Cross-reference with standard medical terminology

Please format the information in a clear, structured way and explain any medical terminology in layman's terms where appropriate.`
              },
              {
                type: 'image',
                image_url: {
                  url: dataUrl
                }
              }
            ]
          }
        ],
        max_tokens: 4096
      })
    });

    if (!response.ok) {
      throw new Error('Failed to analyze document with GPT-4 Vision');
    }

    const result = await response.json();
    const analyzedText = result.choices[0].message.content;

    // Format the extracted text with improved structure
    const formattedText = `
Medical Report Analysis
======================
Document Information:
-------------------
Type: ${file.type}
Name: ${file.name}
Processed: ${new Date().toLocaleString()}

Content Analysis:
---------------
${analyzedText.trim()}

Processing Notes:
---------------
- Document has been analyzed using GPT-4 Vision AI
- Analysis includes interpretation of both textual and visual elements
- This report will be incorporated into your medical assessment
======================
`;

    return NextResponse.json({ 
      text: formattedText,
      metadata: {
        fileType: file.type,
        fileName: file.name,
        processedAt: new Date().toISOString(),
        processingMethod: 'GPT-4 Vision Analysis'
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