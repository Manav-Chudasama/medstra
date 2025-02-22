"use client";

import { Button } from "@/components/ui/button";
import { Card } from "@/components/ui/card";
import { useState } from "react";
import { Camera, Mic, MicOff, VideoOff, Maximize2, Minimize2 } from "lucide-react";
import { motion, AnimatePresence } from "framer-motion";
import { cn } from "@/lib/utils";

interface VideoAssessmentProps {
  onBack: () => void;
  onNext: () => void;
  assessmentType: string;
}

export function VideoAssessment({ onBack, onNext, assessmentType }: VideoAssessmentProps) {
  const [isVideoOn, setIsVideoOn] = useState(true);
  const [isAudioOn, setIsAudioOn] = useState(true);
  const [isAssessmentStarted, setIsAssessmentStarted] = useState(false);
  const [isFullscreen, setIsFullscreen] = useState(false);

  const getAssessmentTitle = () => {
    switch (assessmentType) {
      case "cardiovascular":
        return "Cardiovascular Health Assessment";
      case "neurological":
        return "Neurological Screening";
      case "respiratory":
        return "Respiratory Function Assessment";
      case "comprehensive":
        return "Full Health Screening";
      default:
        return "Medical Assessment";
    }
  };

  return (
    <motion.div
      layout
      className={cn(
        "space-y-6 transition-all duration-300",
        isFullscreen && "fixed inset-0 bg-background z-50 p-4"
      )}
    >
      <div className="flex items-center justify-between">
        <div>
          <h2 className="text-2xl font-semibold mb-2">{getAssessmentTitle()}</h2>
          <p className="text-muted-foreground">
            Our AI medical examiner will guide you through a series of questions and observations.
          </p>
        </div>
        <Button
          variant="ghost"
          size="icon"
          onClick={() => setIsFullscreen(!isFullscreen)}
        >
          {isFullscreen ? (
            <Minimize2 className="h-5 w-5" />
          ) : (
            <Maximize2 className="h-5 w-5" />
          )}
        </Button>
      </div>

      <div className={cn(
        "grid gap-6",
        isFullscreen ? "grid-cols-2 h-[calc(100vh-12rem)]" : "md:grid-cols-2"
      )}>
        {/* Video Preview */}
        <motion.div layout className="space-y-4 h-full">
          <div className="relative h-full rounded-xl bg-muted flex items-center justify-center overflow-hidden">
            {isAssessmentStarted ? (
              <video
                className="w-full h-full object-cover"
                autoPlay
                muted
                playsInline
              />
            ) : (
              <Camera className="h-12 w-12 text-muted-foreground" />
            )}
            <div className="absolute bottom-4 left-1/2 -translate-x-1/2">
              <div className="flex justify-center gap-2 p-2 rounded-lg bg-background/80 backdrop-blur-sm">
                <Button
                  variant="ghost"
                  size="icon"
                  onClick={() => setIsVideoOn(!isVideoOn)}
                >
                  {isVideoOn ? (
                    <Camera className="h-4 w-4" />
                  ) : (
                    <VideoOff className="h-4 w-4" />
                  )}
                </Button>
                <Button
                  variant="ghost"
                  size="icon"
                  onClick={() => setIsAudioOn(!isAudioOn)}
                >
                  {isAudioOn ? (
                    <Mic className="h-4 w-4" />
                  ) : (
                    <MicOff className="h-4 w-4" />
                  )}
                </Button>
              </div>
            </div>
          </div>
        </motion.div>

        {/* AI Assistant Preview */}
        <motion.div layout className="space-y-4 h-full">
          <div className="relative h-full rounded-xl bg-muted flex items-center justify-center overflow-hidden">
            <div className="text-center p-4">
              <h3 className="text-lg font-semibold mb-2">AI Medical Examiner</h3>
              <AnimatePresence mode="wait">
                <motion.p
                  key={isAssessmentStarted ? "analyzing" : "start"}
                  initial={{ opacity: 0, y: 20 }}
                  animate={{ opacity: 1, y: 0 }}
                  exit={{ opacity: 0, y: -20 }}
                  className="text-muted-foreground"
                >
                  {!isAssessmentStarted
                    ? "Click Start Assessment to begin the examination"
                    : "AI Assistant is analyzing..."}
                </motion.p>
              </AnimatePresence>
            </div>
          </div>
          <Button
            className="w-full"
            onClick={() => setIsAssessmentStarted(!isAssessmentStarted)}
          >
            {isAssessmentStarted ? "End Assessment" : "Start Assessment"}
          </Button>
        </motion.div>
      </div>

      {/* Assessment Progress */}
      {isAssessmentStarted && (
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          className="rounded-lg border bg-card p-4"
        >
          <h3 className="font-semibold mb-2">Current Assessment</h3>
          <p className="text-muted-foreground text-sm mb-4">
            Please follow the AI examiner&apos;s instructions carefully.
          </p>
          <div className="space-y-2">
            <div className="flex justify-between text-sm">
              <span>Progress</span>
              <span>45%</span>
            </div>
            <div className="w-full h-2 bg-muted rounded-full overflow-hidden">
              <motion.div
                className="h-full bg-primary"
                initial={{ width: "0%" }}
                animate={{ width: "45%" }}
                transition={{ duration: 0.5 }}
              />
            </div>
          </div>
        </motion.div>
      )}

      <div className="flex justify-between pt-6">
        <Button variant="outline" onClick={onBack}>
          Back
        </Button>
        <Button onClick={onNext} disabled={!isAssessmentStarted}>
          Continue
        </Button>
      </div>
    </motion.div>
  );
} 