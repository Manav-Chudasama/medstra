import { useEffect, useRef, useState } from "react";
import StreamingAvatar, {
  AvatarQuality,
  StreamingEvents,
  TaskType,
  VoiceEmotion,
} from "@heygen/streaming-avatar";
import { Button } from "@/components/ui/button";
import { Card } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Mic, MicOff } from "lucide-react";
import { motion } from "framer-motion";
import { AudioRecorder } from "@/lib/audio-handler";

export default function InteractiveAvatar({ preAssessmentData }: { preAssessmentData: {
  height: string;
  weight: string;
  smoker: boolean;
  exerciseFrequency: string;
}  }) {
  const [isLoadingSession, setIsLoadingSession] = useState(false);
  const [stream, setStream] = useState<MediaStream>();
  const [avatar, setAvatar] = useState<StreamingAvatar | null>(null);
  const mediaStream = useRef<HTMLVideoElement>(null);
  const [acceptMessages, setAcceptMessages] = useState(true);
  const [message, setMessage] = useState<string>("");

  async function fetchAccessToken() {
    const response = await fetch("/api/get-access-token", { method: "POST" });
    const token = await response.text();
    return token;
  }

  async function startSession() {
    setIsLoadingSession(true);
    try {
      const token = await fetchAccessToken();
      const newAvatar = new StreamingAvatar({ token });

      newAvatar.on(StreamingEvents.STREAM_READY, (event) => {
        setStream(event.detail);
      });

      // newAvatar.on(StreamingEvents.USER_TALKING_MESSAGE, (message) => {
      //   if (!acceptMessages) return;

      //   const newMessage = message.detail.message;

      //   setAcceptMessages(false);

      //   handleSpeak(newMessage);
      // });

      newAvatar.on(StreamingEvents.USER_SILENCE, () => {
        console.log('User is silent');
      });

      newAvatar.on(StreamingEvents.STREAM_DISCONNECTED, endSession);
      setAvatar(newAvatar);

      await newAvatar.createStartAvatar({
        quality: AvatarQuality.High,
        voice: {
          rate: 1.5,
          emotion: VoiceEmotion.FRIENDLY,
        },
        disableIdleTimeout: true,
        avatarName: "Ann_Doctor_Sitting_public",
        knowledgeBase: `You are an AI medical examiner conducting comprehensive health assessments. Follow this structured approach:

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
- Maintain focus on both immediate and long-term health implications`
      });

      await newAvatar.startVoiceChat({ useSilencePrompt: true });

      // const response = await fetch("/api/openai", {
      //   method: "POST",
      //   headers: { "Content-Type": "application/json" },
      //   body: JSON.stringify({
      //     prompt: "Hey there! Let's start the conversation.",
      //     preAssessmentData: preAssessmentData,
      //   }),
      // });

      // const { reply } = await response.json();
      // await newAvatar.speak({ text: reply, taskType: TaskType.REPEAT });

    } catch (error) {
      console.error("Error starting session:", error);
    } finally {
      setIsLoadingSession(false);
    }
  }

  async function handleSpeak(message: string) {
    if (!avatar || !message) return;

    const response = await fetch("/api/openai", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ prompt: message }),
    });

    const { reply } = await response.json();

    await avatar.speak({ text: reply });

    setMessage("");

    setAcceptMessages(true);
  }

  async function endSession() {
    if (avatar) {
      await avatar.closeVoiceChat();
      await avatar.stopAvatar();
      setStream(undefined);
      setAvatar(null);
    }
  }

  useEffect(() => {
    if (stream && mediaStream.current) {
      mediaStream.current.srcObject = stream;
      mediaStream.current.play();
    }
  }, [stream]);

  return (
    <Card className="overflow-hidden">
      <div className="flex flex-col">
        <div className="relative aspect-video bg-muted">
          {stream && (
            <video 
              ref={mediaStream} 
              autoPlay 
              playsInline 
              className="w-full h-full object-cover"
            />
          )}
          {isLoadingSession && (
            <div className="absolute inset-0 flex items-center justify-center bg-background/50 backdrop-blur-sm">
              <motion.div
                className="w-8 h-8 border-2 border-primary border-t-transparent rounded-full"
                animate={{ rotate: 360 }}
                transition={{ duration: 1, repeat: Infinity, ease: "linear" }}
              />
            </div>
          )}
        </div>

        <div className="grid grid-cols-1 gap-4 p-4">
          <div className="flex gap-2">
            {!avatar ? (
              <Button onClick={startSession} className="w-full">
                Start Session
              </Button>
            ) : (
              <Button onClick={endSession} variant="destructive" className="w-full">
                End Session
              </Button>
            )}
          </div>

          {/* {avatar && (
            <div className="flex gap-2">
              <Input
                placeholder="Type your message..."
                value={message}
                onChange={(e) => setMessage(e.target.value)}
                onKeyDown={handleKeyDown}
                disabled={isAvatarTalking}
                className="flex-1"
              />
              <Button 
                onClick={() => handleSpeak(message)}
                disabled={!message || isAvatarTalking}
              >
                Send
              </Button>
              <Button
                onClick={toggleRecording}
                disabled={isAvatarTalking}
              >
                {isRecording ? <MicOff /> : <Mic />}
              </Button>
            </div>
          )} */}
        </div>

        {/* Chat UI Section
        <div className="mt-4 p-4 border-t border-gray-300">
          <h3 className="text-lg font-semibold">Chat</h3>
          <div className="overflow-y-auto max-h-60 border rounded-lg p-2">
            {messages.map((msg, index) => (
              <div key={index} className={`text-sm ${msg.sender === "AI" ? "text-gray-700" : "text-blue-600"}`}>
                <strong>{msg.sender}: </strong>{msg.text}
              </div>
            ))}
          </div>
        </div> */}
      </div>
    </Card>
  );
}