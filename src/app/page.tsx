"use client";

import { useCallback, useEffect, useMemo, useRef, useState } from "react";
import CharacterScene from "@/components/CharacterScene";
import { generateCompanionResponse, type CompanionResponse } from "@/lib/responses";
import { PaperAirplaneIcon, MicrophoneIcon, SpeakerWaveIcon, SpeakerXMarkIcon, StopIcon } from "@heroicons/react/24/outline";

type ChatMessage = {
  id: string;
  role: "user" | "companion";
  content: string;
  meta?: CompanionResponse;
};

export default function Home() {
  const [messages, setMessages] = useState<ChatMessage[]>([]);
  const [inputValue, setInputValue] = useState("");
  const [isLoading, setIsLoading] = useState(false);
  const [voiceEnabled, setVoiceEnabled] = useState(true);
  const [isSpeaking, setIsSpeaking] = useState(false);
  const [isListening, setIsListening] = useState(false);
  const [speechSupported, setSpeechSupported] = useState(false);
  const [characterVisible, setCharacterVisible] = useState(false);
  const messageListRef = useRef<HTMLDivElement>(null);
  const recognitionRef = useRef<SpeechRecognition | null>(null);
  const recognitionBuffer = useRef("");
  const utteranceRef = useRef<SpeechSynthesisUtterance | null>(null);

  const companionMessages = useMemo(() => messages.filter((m) => m.role === "companion"), [messages]);
  const lastCompanion = companionMessages[companionMessages.length - 1];

  const speak = useCallback(
    (text: string) => {
      if (typeof window === "undefined") return;
      if (!voiceEnabled) return;
      if (!("speechSynthesis" in window)) return;

      window.speechSynthesis.cancel();
      const utterance = new SpeechSynthesisUtterance(text);
      utterance.pitch = 1.05;
      utterance.rate = 0.97;
      utterance.volume = 0.95;

      const preferredVoice = window
        .speechSynthesis
        .getVoices()
        .find((voice) => voice.lang.startsWith("en") && voice.name.toLowerCase().includes("female"));

      if (preferredVoice) {
        utterance.voice = preferredVoice;
      }

      utterance.onstart = () => setIsSpeaking(true);
      utterance.onend = () => {
        setIsSpeaking(false);
        utteranceRef.current = null;
      };
      utterance.onerror = () => {
        setIsSpeaking(false);
        utteranceRef.current = null;
      };

      utteranceRef.current = utterance;
      window.speechSynthesis.speak(utterance);
    },
    [voiceEnabled],
  );

  useEffect(() => {
    if (typeof window === "undefined") return;
    const hasSpeech = "speechSynthesis" in window;
    const SpeechRecognitionImpl = window.SpeechRecognition || window.webkitSpeechRecognition;
    setSpeechSupported(hasSpeech || Boolean(SpeechRecognitionImpl));

    if (!SpeechRecognitionImpl) return;

    const recognition = new SpeechRecognitionImpl();
    recognition.lang = "en-US";
    recognition.continuous = true;
    recognition.interimResults = true;

    recognition.onresult = (event: SpeechRecognitionEvent) => {
      let interimTranscript = "";
      for (let i = event.resultIndex; i < event.results.length; i += 1) {
        const transcript = event.results[i][0].transcript;
        if (event.results[i].isFinal) {
          recognitionBuffer.current += `${transcript} `;
        } else {
          interimTranscript += transcript;
        }
      }
      const combined = `${recognitionBuffer.current}${interimTranscript}`.trimStart();
      setInputValue(combined);
    };

    recognition.onerror = () => {
      setIsListening(false);
      recognition.stop();
    };

    recognition.onend = () => {
      setIsListening(false);
      recognitionBuffer.current = "";
    };

    recognitionRef.current = recognition;

    return () => {
      recognition.stop();
      recognitionRef.current = null;
    };
  }, []);

  useEffect(() => {
    if (!messageListRef.current) return;
    messageListRef.current.scrollTo({
      top: messageListRef.current.scrollHeight,
      behavior: "smooth",
    });
  }, [messages.length]);

  useEffect(() => {
    return () => {
      if (typeof window !== "undefined" && "speechSynthesis" in window) {
        window.speechSynthesis.cancel();
      }
    };
  }, []);

  const handleSubmit = useCallback(
    async (event?: React.FormEvent<HTMLFormElement>) => {
      event?.preventDefault();
      const trimmed = inputValue.trim();
      if (!trimmed || isLoading) return;

      const id = typeof crypto !== "undefined" && "randomUUID" in crypto ? crypto.randomUUID() : Date.now().toString();
      const userMessage: ChatMessage = {
        id,
        role: "user",
        content: trimmed,
      };

      setMessages((prev) => [...prev, userMessage]);
      setInputValue("");
      setIsLoading(true);
      setCharacterVisible(true);

      try {
        const companionResponse = await generateCompanionResponse(trimmed);
        const companionMessage: ChatMessage = {
          id: `${id}-companion`,
          role: "companion",
          content: companionResponse.message,
          meta: companionResponse,
        };
        setMessages((prev) => [...prev, companionMessage]);
        speak(companionResponse.message);
      } catch (error) {
        console.error(error);
        const fallback: ChatMessage = {
          id: `${id}-fallback`,
          role: "companion",
          content:
            "I'm so sorry, but something went wrong on my side. Let's take a breath together and try again in a moment.",
        };
        setMessages((prev) => [...prev, fallback]);
      } finally {
        setIsLoading(false);
        recognitionBuffer.current = "";
      }
    },
    [inputValue, isLoading, speak],
  );

  const toggleListening = useCallback(() => {
    if (!recognitionRef.current) return;
    if (isListening) {
      recognitionRef.current.stop();
      setIsListening(false);
      return;
    }
    recognitionBuffer.current = "";
    recognitionRef.current.start();
    setIsListening(true);
  }, [isListening]);

  const toggleVoice = useCallback(() => {
    setVoiceEnabled((prev) => {
      if (prev && typeof window !== "undefined" && "speechSynthesis" in window) {
        window.speechSynthesis.cancel();
        setIsSpeaking(false);
      }
      return !prev;
    });
  }, []);

  return (
    <div className="relative min-h-screen overflow-hidden bg-slate-950 text-slate-100">
      <div className="pointer-events-none absolute inset-0">
        <div className="absolute inset-0 bg-[radial-gradient(circle_at_top,_rgba(129,140,248,0.18),_transparent_55%)]" />
        <div className="absolute inset-0 bg-[radial-gradient(circle_at_20%_80%,_rgba(59,130,246,0.16),_transparent_60%)]" />
        <div className="absolute inset-0 bg-[radial-gradient(circle_at_80%_30%,_rgba(236,72,153,0.15),_transparent_55%)]" />
      </div>

      <main className="relative z-10 mx-auto flex min-h-screen max-w-6xl flex-col gap-8 px-4 py-12 sm:px-8">
        <header className="flex flex-col gap-3 rounded-3xl border border-white/5 bg-white/5 p-6 shadow-xl backdrop-blur">
          <div className="flex items-start justify-between gap-4">
            <div>
              <p className="text-sm uppercase tracking-[0.35em] text-violet-200/70">Companion mode</p>
              <h1 className="mt-2 text-3xl font-semibold text-white sm:text-4xl">Aster — Your Gentle Check-In Companion</h1>
            </div>
            <button
              type="button"
              onClick={toggleVoice}
              className="flex h-11 w-11 items-center justify-center rounded-full border border-white/10 bg-white/10 text-violet-100 transition hover:border-violet-300/50 hover:bg-violet-500/20"
            >
              {voiceEnabled ? <SpeakerWaveIcon className="h-5 w-5" /> : <SpeakerXMarkIcon className="h-5 w-5" />}
              <span className="sr-only">{voiceEnabled ? "Disable voice responses" : "Enable voice responses"}</span>
            </button>
          </div>
          <p className="text-sm text-violet-100/80">
            I’m a supportive conversational partner, not a clinician. If you’re in crisis or worried about your safety,
            contact your local emergency services or reach out to your nearest crisis hotline right away.
          </p>
        </header>

        <CharacterScene speaking={isSpeaking} visible={characterVisible || companionMessages.length > 0} />

        <section className="grid flex-1 gap-6 lg:grid-cols-[minmax(0,2.1fr)_minmax(0,1fr)]">
          <div className="flex h-[32rem] flex-col rounded-3xl border border-white/5 bg-slate-900/70 shadow-2xl backdrop-blur">
            <div
              ref={messageListRef}
              className="flex-1 space-y-4 overflow-y-auto px-6 py-6 scroll-smooth"
            >
              {messages.length === 0 ? (
                <div className="flex h-full flex-col items-center justify-center text-center text-sm text-slate-300/80">
                  <p className="font-medium text-slate-200">How are you arriving here today?</p>
                  <p className="mt-2 max-w-sm text-slate-400">
                    Share whatever feels comfortable—thoughts, feelings, or even a single word. When you send a message,
                    Aster will join you on screen and speak with you.
                  </p>
                </div>
              ) : (
                messages.map((message) => (
                  <article
                    key={message.id}
                    className={`flex w-full flex-col gap-2 ${message.role === "user" ? "items-end text-right" : "items-start text-left"}`}
                  >
                    <div
                      className={`max-w-[85%] rounded-2xl px-4 py-3 text-sm leading-relaxed shadow ${
                        message.role === "user"
                          ? "bg-violet-500/80 text-white shadow-violet-900/40"
                          : "bg-slate-800/80 text-slate-50 shadow-slate-950/30"
                      }`}
                    >
                      <p>{message.content}</p>
                    </div>
                    {message.meta && !message.meta.crisis && (
                      <ul className="flex flex-col gap-2 text-xs text-slate-300/80">
                        {message.meta.prompts.map((prompt, index) => (
                          <li
                            key={index}
                            className="rounded-xl border border-white/10 bg-white/5 px-3 py-2"
                          >
                            {prompt}
                          </li>
                        ))}
                      </ul>
                    )}
                    {message.meta?.crisis && (
                      <div className="w-full max-w-[85%] rounded-2xl border border-rose-200/40 bg-rose-500/20 px-4 py-3 text-left text-xs text-rose-100 shadow shadow-rose-900/30">
                        <p>{message.meta.message}</p>
                        <ul className="mt-2 list-disc space-y-1 pl-4">
                          {message.meta.prompts.map((prompt, index) => (
                            <li key={index}>{prompt}</li>
                          ))}
                        </ul>
                      </div>
                    )}
                  </article>
                ))
              )}
              {isLoading && (
                <div className="flex items-center gap-3 text-sm text-slate-300">
                  <span className="h-2 w-2 animate-ping rounded-full bg-violet-300" />
                  <span>Listening deeply…</span>
                </div>
              )}
            </div>

            <form
              onSubmit={handleSubmit}
              className="flex items-end gap-3 border-t border-white/5 bg-slate-900/60 px-6 py-4 backdrop-blur"
            >
              <label htmlFor="message" className="sr-only">
                Share what’s on your mind
              </label>
              <textarea
                id="message"
                value={inputValue}
                onChange={(event) => setInputValue(event.target.value)}
                onKeyDown={(event) => {
                  if (event.key === "Enter" && !event.shiftKey) {
                    event.preventDefault();
                    void handleSubmit();
                  }
                }}
                placeholder="Share what’s on your mind..."
                className="min-h-[3rem] flex-1 resize-y rounded-2xl border border-white/10 bg-slate-950/70 px-4 py-3 text-sm leading-relaxed text-slate-100 placeholder:text-slate-500 focus:border-violet-300/60 focus:outline-none focus:ring-2 focus:ring-violet-500/40"
              />

              {speechSupported && (
                <button
                  type="button"
                  onClick={toggleListening}
                  className={`flex h-12 w-12 items-center justify-center rounded-full border transition ${
                    isListening
                      ? "border-rose-200/60 bg-rose-500/30 text-rose-100 shadow shadow-rose-900/40"
                      : "border-white/10 bg-white/10 text-violet-100 hover:border-violet-200/40 hover:bg-violet-500/20"
                  }`}
                >
                  {isListening ? <StopIcon className="h-5 w-5" /> : <MicrophoneIcon className="h-5 w-5" />}
                  <span className="sr-only">{isListening ? "Stop listening" : "Start voice input"}</span>
                </button>
              )}

              <button
                type="submit"
                disabled={isLoading}
                className="flex h-12 w-12 items-center justify-center rounded-full bg-violet-500 text-white shadow-lg shadow-violet-900/40 transition hover:bg-violet-400 disabled:cursor-not-allowed disabled:bg-violet-800/50"
              >
                <PaperAirplaneIcon className="h-5 w-5" />
                <span className="sr-only">Send message</span>
              </button>
            </form>
          </div>

          <aside className="flex flex-col gap-4 rounded-3xl border border-white/5 bg-slate-900/70 p-6 shadow-2xl backdrop-blur">
            <div className="rounded-2xl border border-white/10 bg-slate-950/60 p-4">
              <h2 className="text-sm font-semibold uppercase tracking-[0.28em] text-violet-200/70">Emotional Weather</h2>
              <p className="mt-3 text-lg text-slate-100">
                {lastCompanion?.meta?.crisis
                  ? "Emergency support recommended"
                  : lastCompanion?.meta
                    ? `Sensing ${lastCompanion.meta.tone}.`
                    : "Waiting to hear from you."}
              </p>
              <p className="mt-2 text-sm text-slate-400">
                {lastCompanion?.meta?.crisis
                  ? "If you're in danger, pause here and contact local emergency services or a trusted person immediately."
                  : lastCompanion?.meta
                    ? "Aster is focusing on steady breathing, gentle grounding, and keeping you company."
                    : "When you share, Aster listens deeply and reflects with care."}
              </p>
            </div>

            <div className="rounded-2xl border border-white/10 bg-slate-950/60 p-4">
              <h3 className="text-sm font-semibold uppercase tracking-[0.28em] text-violet-200/70">Gentle Practices</h3>
              <ul className="mt-4 space-y-3 text-sm text-slate-200">
                <li className="rounded-xl border border-white/10 bg-white/5 p-3">
                  Place both feet on the floor and breathe slowly into a count of four. Notice how the chair supports you.
                </li>
                <li className="rounded-xl border border-white/10 bg-white/5 p-3">
                  Whisper something kind to yourself—even if you’re unsure you believe it yet.
                </li>
                <li className="rounded-xl border border-white/10 bg-white/5 p-3">
                  If it feels helpful, jot down one small thing you’re grateful for or looking forward to.
                </li>
              </ul>
            </div>

            <div className="rounded-2xl border border-violet-200/20 bg-violet-500/10 p-4 text-sm text-violet-100">
              <p className="font-medium text-violet-200">Safety First</p>
              <p className="mt-2">
                For immediate danger or medical emergencies, call your local emergency number. Visit{" "}
                <a
                  href="https://www.opencounseling.com/suicide-hotlines"
                  target="_blank"
                  rel="noreferrer"
                  className="text-violet-200 underline underline-offset-4"
                >
                  international lifelines directory
                </a>{" "}
                for crisis support in your area.
              </p>
            </div>
          </aside>
        </section>
      </main>
    </div>
  );
}
