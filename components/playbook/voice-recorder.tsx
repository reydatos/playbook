"use client";

import { useState } from "react";
import { useVoiceTranscription } from "@/hooks/use-voice-transcription";
import { useAIAssist } from "@/hooks/use-ai-assist";
import { Button } from "@/components/ui/button";
import { Mic, MicOff, Loader2, Sparkles, Type, X } from "lucide-react";

interface VoiceRecorderProps {
  onInsert: (content: string) => void;
  aiAvailable?: boolean;
}

export function VoiceRecorder({ onInsert, aiAvailable }: VoiceRecorderProps) {
  const {
    isListening,
    transcript,
    interimTranscript,
    isSupported,
    error: voiceError,
    startListening,
    stopListening,
    resetTranscript,
  } = useVoiceTranscription();

  const {
    isLoading: isStructuring,
    structureContent,
    error: aiError,
  } = useAIAssist();

  const [showPanel, setShowPanel] = useState(false);

  if (!isSupported) return null;

  const handleStartRecording = () => {
    setShowPanel(true);
    startListening();
  };

  const handleStopAndStructure = async () => {
    stopListening();
    const fullTranscript = transcript + interimTranscript;
    if (!fullTranscript.trim()) return;

    const result = await structureContent(fullTranscript);
    if (result) {
      onInsert(result.structured);
      setShowPanel(false);
      resetTranscript();
    }
  };

  const handleStopAndInsertRaw = () => {
    stopListening();
    const fullTranscript = transcript + interimTranscript;
    if (fullTranscript.trim()) {
      onInsert(fullTranscript);
    }
    setShowPanel(false);
    resetTranscript();
  };

  const handleCancel = () => {
    stopListening();
    setShowPanel(false);
    resetTranscript();
  };

  const currentText = transcript + interimTranscript;

  return (
    <div className="relative">
      <Button
        variant="ghost"
        size="icon"
        className={`h-7 w-7 ${isListening ? "text-red-500 animate-pulse" : ""}`}
        title={isListening ? "Recording..." : "Voice input"}
        onClick={isListening ? stopListening : handleStartRecording}
        type="button"
      >
        {isListening ? (
          <MicOff className="h-3.5 w-3.5" />
        ) : (
          <Mic className="h-3.5 w-3.5" />
        )}
      </Button>

      {showPanel && (
        <div className="absolute left-0 top-full z-50 mt-1 w-96 rounded-lg border bg-card p-4 shadow-lg">
          <div className="mb-3 flex items-center justify-between">
            <div className="flex items-center gap-2">
              {isListening && (
                <span className="flex h-2 w-2">
                  <span className="absolute inline-flex h-2 w-2 animate-ping rounded-full bg-red-400 opacity-75"></span>
                  <span className="relative inline-flex h-2 w-2 rounded-full bg-red-500"></span>
                </span>
              )}
              <span className="text-sm font-medium">
                {isListening ? "Listening..." : "Recording stopped"}
              </span>
            </div>
            <Button
              variant="ghost"
              size="icon"
              className="h-6 w-6"
              onClick={handleCancel}
              type="button"
            >
              <X className="h-3 w-3" />
            </Button>
          </div>

          <div className="mb-3 max-h-40 overflow-auto rounded border bg-muted/50 p-2">
            {currentText ? (
              <p className="text-sm whitespace-pre-wrap">
                {transcript}
                {interimTranscript && (
                  <span className="text-muted-foreground">
                    {interimTranscript}
                  </span>
                )}
              </p>
            ) : (
              <p className="text-sm text-muted-foreground">
                Start speaking...
              </p>
            )}
          </div>

          {(voiceError || aiError) && (
            <p className="mb-2 text-xs text-destructive">
              {voiceError || aiError}
            </p>
          )}

          <div className="flex gap-2">
            {aiAvailable && (
              <Button
                size="sm"
                onClick={handleStopAndStructure}
                disabled={!currentText.trim() || isStructuring}
                className="flex-1"
                type="button"
              >
                {isStructuring ? (
                  <Loader2 className="mr-1.5 h-3 w-3 animate-spin" />
                ) : (
                  <Sparkles className="mr-1.5 h-3 w-3" />
                )}
                Structure with AI
              </Button>
            )}
            <Button
              size="sm"
              variant="outline"
              onClick={handleStopAndInsertRaw}
              disabled={!currentText.trim()}
              className="flex-1"
              type="button"
            >
              <Type className="mr-1.5 h-3 w-3" />
              Insert Raw
            </Button>
          </div>
        </div>
      )}
    </div>
  );
}
