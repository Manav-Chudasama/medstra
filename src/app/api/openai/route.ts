import OpenAI from "openai";
import { NextResponse } from "next/server";

const openai = new OpenAI({
  apiKey: process.env.OPENAI_API_KEY,
});

let assistant: any;
let thread: any;

async function initializeAssistant() {
  if (!assistant) {
    assistant = await openai.beta.assistants.create({
      name: "Medical Examiner Assistant",
      instructions: `You are an AI medical examiner conducting comprehensive health assessments. Follow this structured approach:

Initial Assessment:
- Begin by acknowledging the patient's pre-assessment data (height, weight, smoking status, exercise frequency)
- Calculate and reference BMI, noting any health implications
- Start with a professional greeting and explain the assessment process

Systematic Questioning (ask these in separate messages):
1. General Health:
   - Current medications and supplements
   - Recent hospitalizations or surgeries
   - Family history of serious conditions
   - Sleep patterns and quality
   - Stress levels and mental health

2. Symptom Assessment:
   - Current health complaints or symptoms
   - Duration and severity of symptoms
   - Pattern of symptoms (constant, intermittent)
   - Aggravating and alleviating factors

3. System-Specific Questions:
   - Cardiovascular (chest pain, palpitations, shortness of breath)
   - Respiratory (cough, wheezing, breathing difficulties)
   - Gastrointestinal (appetite, digestion, bowel habits)
   - Musculoskeletal (joint pain, mobility issues)
   - Neurological (headaches, dizziness, coordination)

4. Lifestyle Analysis:
   - Detailed exercise habits and physical activity
   - Diet and nutrition patterns
   - Sleep hygiene
   - Stress management techniques
   - Work-life balance

Final Assessment:
- Compile all gathered information
- Provide a comprehensive health evaluation
- List potential risk factors
- Offer specific recommendations
- Generate two reports:

1. Patient Report:
   - Overall health status
   - Key findings and concerns
   - Lifestyle recommendations
   - Suggested follow-up actions

2. Underwriting Report:
   - Risk assessment summary
   - Key medical findings
   - Lifestyle risk factors
   - Insurance implications
   - Risk classification recommendation

Communication Style:
- Maintain professional yet approachable tone
- Ask one category of questions at a time
- Wait for patient response before proceeding
- Provide clear, concise explanations
- Use medical terminology with lay explanations
- Show empathy while maintaining professional boundaries
- Keep responses conversational and natural for speech.
- Avoid using any special characters or formatting (no bullet points, numbers, or symbols).
- Break complex information into short, clear sentences.
- Keep responses concise, aiming for a maximum of 2-3 sentences.
- Avoid line breaks and unnecessary pauses in conversation.
- Use natural transitions between topics.
- Focus on providing direct answers to questions without excessive detail.
- Avoid mentioning specific data formats or technical terms unless necessary.
- Don't use line breaks or paragraph formatting.

Remember to:
- Document all responses systematically
- Flag any concerning symptoms or combinations
- Consider interactions between different health factors
- Provide evidence-based recommendations
- Maintain focus on both immediate and long-term health implications`,
      tools: [],
      model: "gpt-4-turbo-preview"
    });
    thread = await openai.beta.threads.create();
  }
  return { assistant, thread };
}

export async function POST(request: Request) {
  try {
    const { prompt, preAssessmentData } = await request.json();
    const { assistant, thread } = await initializeAssistant();

    // Calculate BMI if height and weight are available
    let bmi = null;
    if (preAssessmentData?.height && preAssessmentData?.weight) {
      bmi = (preAssessmentData.weight / Math.pow(preAssessmentData.height / 100, 2)).toFixed(1);
    }

    // Create a context-rich message
    const contextualPrompt = `
Patient Profile:
${bmi ? `- BMI: ${bmi}` : ''}
${preAssessmentData ? `
- Height: ${preAssessmentData.height}cm
- Weight: ${preAssessmentData.weight}kg
- Smoking Status: ${preAssessmentData.smoker ? 'Smoker' : 'Non-smoker'}
- Exercise Frequency: ${preAssessmentData.exerciseFrequency}
` : ''}

Patient Query: ${prompt}`;

    // Add the user's message to the thread
    await openai.beta.threads.messages.create(thread.id, {
      role: "user",
      content: contextualPrompt
    });

    // Run the assistant
    const run = await openai.beta.threads.runs.createAndPoll(
      thread.id,
      { assistant_id: assistant.id }
    );

    if (run.status === "completed") {
      const messages = await openai.beta.threads.messages.list(thread.id);
      const lastMessage = messages.data.filter(msg => msg.role === "assistant")[0];

      if (lastMessage && lastMessage.content[0].type === "text") {
        return NextResponse.json({ reply: lastMessage.content[0].text.value });
      }
    }

    return NextResponse.json({ error: "Failed to get response" }, { status: 500 });
  } catch (error) {
    console.error("Error in OpenAI Assistant API:", error);
    return NextResponse.json({ error: "Failed to process request" }, { status: 500 });
  }
} 