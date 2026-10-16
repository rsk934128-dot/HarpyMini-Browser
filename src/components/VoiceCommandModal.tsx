import React, { useState, useEffect, useRef } from 'react';
import { Mic, MicOff, X, Sparkles, Volume2, CheckCircle2, AlertCircle } from 'lucide-react';

interface VoiceCommandModalProps {
  isOpen: boolean;
  onClose: () => void;
  currentUrl: string;
  onExecuteCommand: (action: {
    intent: string;
    target?: string;
    query?: string;
    spokenResponse?: string;
  }) => void;
}

export const VoiceCommandModal: React.FC<VoiceCommandModalProps> = ({
  isOpen,
  onClose,
  currentUrl,
  onExecuteCommand,
}) => {
  const [isListening, setIsListening] = useState(false);
  const [transcript, setTranscript] = useState('');
  const [statusMessage, setStatusMessage] = useState('Listening for browser commands...');
  const [feedbackResponse, setFeedbackResponse] = useState('');
  const [isProcessing, setIsProcessing] = useState(false);
  const recognitionRef = useRef<any>(null);

  useEffect(() => {
    if (!isOpen) {
      if (recognitionRef.current) {
        recognitionRef.current.stop();
      }
      setIsListening(false);
      setTranscript('');
      setFeedbackResponse('');
      return;
    }

    const SpeechRecognition =
      (window as any).SpeechRecognition || (window as any).webkitSpeechRecognition;

    if (!SpeechRecognition) {
      setStatusMessage('Voice recognition is not supported in this browser engine.');
      return;
    }

    try {
      const recognition = new SpeechRecognition();
      recognition.continuous = false;
      recognition.interimResults = true;
      recognition.lang = 'en-US';

      recognition.onstart = () => {
        setIsListening(true);
        setStatusMessage('Listening... Try saying "Go to Wikipedia" or "Summarize this page"');
      };

      recognition.onresult = (event: any) => {
        let currentTranscript = '';
        for (let i = event.resultIndex; i < event.results.length; ++i) {
          currentTranscript += event.results[i][0].transcript;
        }
        setTranscript(currentTranscript);
      };

      recognition.onerror = (event: any) => {
        console.error('Speech error:', event.error);
        setIsListening(false);
        setStatusMessage(`Mic notice: ${event.error}. You can also type commands below.`);
      };

      recognition.onend = () => {
        setIsListening(false);
      };

      recognitionRef.current = recognition;
      recognition.start();
    } catch (e: any) {
      console.warn('Voice init warning:', e);
      setStatusMessage('Click the microphone icon to activate voice input.');
    }

    return () => {
      if (recognitionRef.current) {
        recognitionRef.current.stop();
      }
    };
  }, [isOpen]);

  const handleManualProcess = async (textToProcess: string) => {
    if (!textToProcess.trim() || isProcessing) return;

    setIsProcessing(true);
    setStatusMessage('Analyzing command intent with Gemini AI...');

    try {
      const res = await fetch('/api/ai/voice-intent', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          transcript: textToProcess,
          currentUrl,
        }),
      });

      const parsed = await res.json();
      setFeedbackResponse(parsed.spokenResponse || 'Command processed.');

      // Voice response output
      if ('speechSynthesis' in window && parsed.spokenResponse) {
        const utter = new SpeechSynthesisUtterance(parsed.spokenResponse);
        utter.rate = 1.05;
        window.speechSynthesis.speak(utter);
      }

      setTimeout(() => {
        onExecuteCommand(parsed);
        onClose();
      }, 1200);
    } catch (err: any) {
      console.error('Command parse error:', err);
      // Fallback: search query
      onExecuteCommand({
        intent: 'SEARCH',
        query: textToProcess,
        spokenResponse: `Searching for ${textToProcess}`,
      });
      onClose();
    } finally {
      setIsProcessing(false);
    }
  };

  const toggleListening = () => {
    if (!recognitionRef.current) return;
    if (isListening) {
      recognitionRef.current.stop();
      setIsListening(false);
    } else {
      setTranscript('');
      recognitionRef.current.start();
    }
  };

  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/75 backdrop-blur-md animate-in fade-in duration-150 select-none">
      <div className="w-full max-w-md bg-slate-900 border border-slate-700/80 rounded-3xl shadow-2xl overflow-hidden p-6 text-center space-y-6">
        {/* Header */}
        <div className="flex items-center justify-between">
          <div className="flex items-center gap-2">
            <Sparkles className="w-4 h-4 text-cyan-400" />
            <span className="text-xs font-bold text-white tracking-wide">
              HarpyMini Voice Navigation
            </span>
          </div>
          <button
            onClick={onClose}
            className="p-1 rounded-lg hover:bg-slate-800 text-slate-400 hover:text-white transition-colors"
          >
            <X className="w-4 h-4" />
          </button>
        </div>

        {/* Pulsing Mic Visualizer */}
        <div className="py-4 flex flex-col items-center justify-center">
          <button
            onClick={toggleListening}
            className={`relative w-20 h-20 rounded-full flex items-center justify-center transition-all ${
              isListening
                ? 'bg-gradient-to-tr from-cyan-500 to-indigo-600 shadow-xl shadow-cyan-500/40 ring-4 ring-cyan-500/30 animate-pulse'
                : 'bg-slate-800 hover:bg-slate-700 text-slate-300'
            }`}
          >
            {isListening ? (
              <Mic className="w-8 h-8 text-white" />
            ) : (
              <MicOff className="w-8 h-8 text-slate-400" />
            )}
          </button>
          <div className="mt-3 text-xs font-semibold text-cyan-400">
            {isListening ? 'Listening...' : 'Microphone Paused'}
          </div>
        </div>

        {/* Live Transcript / Input */}
        <div className="p-3.5 rounded-2xl bg-slate-800/80 border border-slate-700 min-h-[72px] flex items-center justify-center">
          {transcript ? (
            <p className="text-sm font-medium text-white italic">"{transcript}"</p>
          ) : (
            <p className="text-xs text-slate-400">{statusMessage}</p>
          )}
        </div>

        {feedbackResponse && (
          <div className="flex items-center justify-center gap-2 text-xs font-semibold text-emerald-400 bg-emerald-950/60 p-2 rounded-xl border border-emerald-800/60">
            <CheckCircle2 className="w-4 h-4" />
            <span>{feedbackResponse}</span>
          </div>
        )}

        {/* Quick Voice Command Shortcuts */}
        <div className="space-y-1.5 text-left">
          <div className="text-[11px] font-semibold text-slate-400 uppercase tracking-wider px-1">
            Example Commands:
          </div>
          <div className="grid grid-cols-2 gap-2 text-xs">
            <button
              onClick={() => handleManualProcess('Open Apps Market')}
              className="p-2 rounded-xl bg-slate-800/60 hover:bg-slate-800 text-slate-300 hover:text-cyan-300 border border-slate-700/60 text-left transition-colors"
            >
              🛍️ "Open Apps Market"
            </button>
            <button
              onClick={() => handleManualProcess('Go to Wikipedia')}
              className="p-2 rounded-xl bg-slate-800/60 hover:bg-slate-800 text-slate-300 hover:text-cyan-300 border border-slate-700/60 text-left transition-colors"
            >
              🗣️ "Go to Wikipedia"
            </button>
            <button
              onClick={() => handleManualProcess('Summarize this page')}
              className="p-2 rounded-xl bg-slate-800/60 hover:bg-slate-800 text-slate-300 hover:text-cyan-300 border border-slate-700/60 text-left transition-colors"
            >
              🗣️ "Summarize this page"
            </button>
            <button
              onClick={() => handleManualProcess('Turn on Data Saver')}
              className="p-2 rounded-xl bg-slate-800/60 hover:bg-slate-800 text-slate-300 hover:text-cyan-300 border border-slate-700/60 text-left transition-colors"
            >
              🗣️ "Turn on Data Saver"
            </button>
          </div>
        </div>

        {/* Manual Process Button if user spoke */}
        {transcript && (
          <button
            onClick={() => handleManualProcess(transcript)}
            disabled={isProcessing}
            className="w-full py-2.5 rounded-xl bg-cyan-600 hover:bg-cyan-500 text-white text-xs font-bold shadow-md shadow-cyan-600/30 transition-all"
          >
            {isProcessing ? 'Executing...' : 'Run Voice Command'}
          </button>
        )}
      </div>
    </div>
  );
};
