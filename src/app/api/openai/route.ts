import OpenAI from "openai";
import { NextResponse } from "next/server";
import { auth, currentUser } from "@clerk/nextjs/server";
const openai = new OpenAI({
  apiKey: process.env.OPENAI_API_KEY,
});

let assistant: any;
let thread: any;

async function initializeAssistant() {
  if (!assistant) {
    assistant = await openai.beta.assistants.create({
      name: "Medical Examiner Assistant",
      instructions: `You are an AI medical examiner tasked with generating comprehensive HTML reports based on the conversation history between the AI and the user. The conversation will be provided in the following format:

      [{
          sender: 'AI' | "User",
          text: ""
      }]

      Your task is to create two HTML reports and a risk assessment score:

      1. **Patient Report**:
         - Include the patient's profile information such as height, weight, BMI, smoking status, and exercise frequency.
         - Summarize the key findings from the conversation, highlighting any health concerns or recommendations made during the assessment.
         - Provide lifestyle recommendations based on the conversation.
         - Include suggested follow-up actions.
         - Ensure the report is HIPAA compliant, FDA registered, and ISO certified.
         - Format the report for PDF download with appropriate styling.

      2. **Underwriting Report**:
         - Summarize the risk assessment based on the conversation.
         - Highlight key medical findings relevant to underwriting.
         - Discuss lifestyle risk factors identified during the assessment.
         - Include any insurance implications based on the patient's profile and conversation.
         - Provide a risk classification recommendation.
         - Ensure the report is HIPAA compliant, FDA registered, and ISO certified.
         - Format the report for PDF download with appropriate styling.

      3. **Risk Assessment Score**:
         - Provide a risk assessment score based on the medical examination results, out of 100 (high being good, low being bad).

      Ensure that the reports are well-structured, easy to read, and formatted in HTML. Use appropriate HTML tags for headings, paragraphs, and lists to enhance readability. 

      Maintain a professional tone throughout the reports, and ensure that all information complies with HIPAA regulations. 

      The output should be a JSON object containing three keys: "patientReport", "underwritingReport", and "riskAssessmentScore", each containing the respective content.`,
      tools: [],
      model: "gpt-4-turbo-preview"
    });
    thread = await openai.beta.threads.create();
  }
  return { assistant, thread };
}

export async function POST(request: Request) {
  try {
    const { conversation } = await request.json(); // Expecting conversation data in the request body

    const { userId } = await auth().catch(() => {
      return null;
    }) || { userId: null };

    const user = await currentUser().catch(() => {
      return null;
    });

    // Validate the conversation format
    if (!Array.isArray(conversation) || conversation.length === 0) {
      return NextResponse.json({ error: "Invalid conversation format" }, { status: 400 });
    }

    const { assistant, thread } = await initializeAssistant();

    // Prepare the conversation for the OpenAI API
    const formattedConversation = conversation.map(({ sender, text }) => ({
      role: sender === 'AI' ? 'assistant' : 'user', // Adjust role for OpenAI API
      content: text,
    }));

    // Add the user's message to the thread
    await openai.beta.threads.messages.create(thread.id, {
      role: "user",
      content: JSON.stringify(formattedConversation) // Send the formatted conversation
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
        // Assuming the last message contains the command to generate reports
        if (lastMessage.content[0].text.value.includes('\b')) {
          // Process report generation here
          const reportsResponse = await fetch("/api/openai", {
            method: "POST",
            headers: { "Content-Type": "application/json" },
            body: JSON.stringify({
              conversation: formattedConversation,
            }),
          });

          const { patientReport, underwritingReport } = await reportsResponse.json();
          return NextResponse.json({
            patientReport,
            underwritingReport,
          });
        }

        return NextResponse.json({ reply: lastMessage.content[0].text.value });
      }
    }

    return NextResponse.json({ error: "Failed to generate reports" }, { status: 500 });
  } catch (error) {
    console.error("Error in OpenAI Assistant API:", error);
    return NextResponse.json({ error: "Failed to process request" }, { status: 500 });
  }
} 