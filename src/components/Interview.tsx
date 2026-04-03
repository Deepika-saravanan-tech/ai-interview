import { useState, useEffect, useRef } from "react";
import { motion, AnimatePresence } from "motion/react";
import {
  Loader2,
  ChevronRight,
  CheckCircle2,
  ArrowLeft,
  Clock,
  Mic,
  MicOff,
} from "lucide-react";
import { evaluateAnswer, Evaluation } from "../services/geminiService";
import { useLocation, useNavigate } from "react-router-dom";
import { db, doc, updateDoc, serverTimestamp } from "../firebase";

type Question = {
  id: number;
  text: string;
};

type SpeechRecognitionLike = {
  continuous: boolean;
  interimResults: boolean;
  lang: string;
  start: () => void;
  stop: () => void;
  onresult: ((event: any) => void) | null;
  onend: (() => void) | null;
  onerror: ((event: { error: string }) => void) | null;
};

export default function Interview() {
  const location = useLocation();
  const navigate = useNavigate();
  const { sessionId, questions, role } = (location.state || {}) as {
    sessionId?: string;
    questions?: Question[];
    role?: string;
  };

  const [currentIndex, setCurrentIndex] = useState(0);
  const [answer, setAnswer] = useState("");
  const [submitting, setSubmitting] = useState(false);
  const [showError, setShowError] = useState(false);
  const [results, setResults] = useState<
    { question: string; answer: string; evaluation: Evaluation }[]
  >([]);
  const [timeLeft, setTimeLeft] = useState(300);
  const [isRecording, setIsRecording] = useState(false);
  const [speechSupported, setSpeechSupported] = useState(false);
  const [speechError, setSpeechError] = useState<string | null>(null);

  const recognitionRef = useRef<SpeechRecognitionLike | null>(null);
  const answerRef = useRef("");
  const recordingBaseRef = useRef("");

  useEffect(() => {
    answerRef.current = answer;
  }, [answer]);

  useEffect(() => {
    if (!sessionId || !questions) {
      navigate("/home");
    }
  }, [sessionId, questions, navigate]);

  useEffect(() => {
    const timer = setInterval(() => {
      setTimeLeft((prev) => (prev > 0 ? prev - 1 : 0));
    }, 1000);

    return () => clearInterval(timer);
  }, [currentIndex]);

  useEffect(() => {
    const SpeechRecognitionApi =
      (window as any).SpeechRecognition || (window as any).webkitSpeechRecognition;

    if (!SpeechRecognitionApi) {
      setSpeechSupported(false);
      return;
    }

    setSpeechSupported(true);

    const recognition: SpeechRecognitionLike = new SpeechRecognitionApi();
    recognition.continuous = true;
    recognition.interimResults = true;
    recognition.lang = "en-US";

    recognition.onresult = (event: any) => {
      let finalTranscript = "";
      let interimTranscript = "";

      for (let index = event.resultIndex; index < event.results.length; index += 1) {
        const piece = event.results[index][0].transcript.trim();
        if (!piece) continue;

        if (event.results[index].isFinal) {
          finalTranscript += `${piece} `;
        } else {
          interimTranscript += `${piece} `;
        }
      }

      if (finalTranscript) {
        recordingBaseRef.current = `${recordingBaseRef.current} ${finalTranscript}`.trim();
      }

      const nextAnswer = [recordingBaseRef.current, interimTranscript.trim()]
        .filter(Boolean)
        .join(" ")
        .trim();

      if (!nextAnswer) return;

      setAnswer(nextAnswer);
      setSpeechError(null);
      if (showError) setShowError(false);
    };

    recognition.onerror = (event: { error: string }) => {
      if (event.error === "not-allowed") {
        setSpeechError("Microphone permission was denied. Please allow mic access and try again.");
      } else {
        setSpeechError("Voice recognition stopped. Please try recording again.");
      }
      setIsRecording(false);
    };

    recognition.onend = () => {
      setIsRecording(false);
    };

    recognitionRef.current = recognition;

    return () => {
      recognition.stop();
    };
  }, [showError]);

  const formatTime = (seconds: number) => {
    const mins = Math.floor(seconds / 60);
    const secs = seconds % 60;
    return `${mins}:${secs.toString().padStart(2, "0")}`;
  };

  const handleRecordingToggle = () => {
    const recognition = recognitionRef.current;
    if (!recognition) return;

    if (isRecording) {
      recognition.stop();
      setIsRecording(false);
      return;
    }

    setSpeechError(null);
    recordingBaseRef.current = answerRef.current.trim();
    recognition.start();
    setIsRecording(true);
  };

  const handleNext = async () => {
    if (!questions) return;

    if (!answer.trim()) {
      setShowError(true);
      return;
    }

    setShowError(false);
    setSubmitting(true);

    try {
      const evaluation = await evaluateAnswer(questions[currentIndex].text, answer);

      const newResult = {
        question: questions[currentIndex].text,
        answer,
        evaluation,
      };

      const updatedResults = [...results, newResult];
      setResults(updatedResults);

      if (currentIndex < questions.length - 1) {
        const nextIndex = currentIndex + 1;
        setCurrentIndex(nextIndex);
        setAnswer("");
        recordingBaseRef.current = "";
        setTimeLeft(300);
        setSpeechError(null);

        if (recognitionRef.current) {
          recognitionRef.current.stop();
        }

        if (sessionId) {
          await updateDoc(doc(db, "sessions", sessionId), {
            currentIndex: nextIndex,
            results: updatedResults,
            updatedAt: serverTimestamp(),
          });
        }
      } else {
        if (sessionId) {
          await updateDoc(doc(db, "sessions", sessionId), {
            results: updatedResults,
            status: "completed",
            updatedAt: serverTimestamp(),
          });
        }

        navigate("/result", { state: { results: updatedResults } });
      }
    } catch (error) {
      console.error("Error evaluating answer:", error);
    } finally {
      setSubmitting(false);
    }
  };

  if (!questions) return null;

  const currentQuestion = questions[currentIndex];

  return (
    <div className="min-h-screen bg-white py-12 px-6 relative">
      <button
        onClick={() => navigate(-1)}
        className="absolute left-6 top-6 flex items-center gap-2 text-slate-400 hover:text-primary transition-colors font-medium"
      >
        <ArrowLeft size={20} />
        Back
      </button>

      <div className="absolute right-6 top-6 flex items-center gap-2 px-4 py-2 bg-accent rounded-xl border border-blue-100 text-primary font-bold">
        <Clock size={18} />
        <span>{formatTime(timeLeft)}</span>
      </div>

      <div className="max-w-3xl mx-auto mt-12">
        <div className="mb-8">
          <div className="flex justify-between items-end mb-4">
            <div>
              <span className="text-xs font-bold text-primary uppercase tracking-widest block mb-1">
                Assessment
              </span>
              <h2 className="text-xl font-bold text-slate-900">{role} Interview</h2>
            </div>
            <span className="text-sm font-bold text-slate-400 uppercase tracking-widest">
              Question {currentIndex + 1} of {questions.length}
            </span>
          </div>

          <div className="w-full h-2 bg-slate-100 rounded-full overflow-hidden">
            <motion.div
              initial={{ width: 0 }}
              animate={{ width: `${((currentIndex + 1) / questions.length) * 100}%` }}
              className="h-full bg-primary"
            />
          </div>
        </div>

        <motion.div
          initial={{ opacity: 0, x: 20 }}
          animate={{ opacity: 1, x: 0 }}
          className="bg-white p-10 rounded-3xl shadow-xl border border-slate-100"
        >
          <AnimatePresence mode="wait">
            <motion.div
              key={currentIndex}
              initial={{ opacity: 0, y: 10 }}
              animate={{ opacity: 1, y: 0 }}
              exit={{ opacity: 0, y: -10 }}
              className="mb-8"
            >
              <div className="inline-block px-3 py-1 bg-accent text-primary text-[10px] font-bold uppercase tracking-widest rounded-full mb-4">
                Question
              </div>
              <h3 className="text-2xl font-bold text-slate-900 leading-snug">
                {currentQuestion.text}
              </h3>
            </motion.div>
          </AnimatePresence>

          <div className="space-y-6">
            <div className="relative">
              <div className="flex items-center justify-between mb-3">
                <div>
                  <p className="text-sm font-semibold text-slate-700">Your Answer</p>
                  <p className="text-xs text-slate-400">
                    Type your response or use voice input to fill the answer box.
                  </p>
                </div>

                {speechSupported ? (
                  <button
                    type="button"
                    onClick={handleRecordingToggle}
                    disabled={submitting}
                    className={`inline-flex items-center gap-2 px-4 py-2 rounded-xl border text-sm font-semibold transition-colors ${
                      isRecording
                        ? "bg-red-50 border-red-200 text-red-600"
                        : "bg-white border-slate-200 text-slate-700 hover:border-primary hover:text-primary"
                    }`}
                  >
                    {isRecording ? <MicOff size={16} /> : <Mic size={16} />}
                    {isRecording ? "Stop Recording" : "Start Recording"}
                  </button>
                ) : (
                  <span className="text-xs font-medium text-slate-400">
                    Voice input works in supported Chrome and Edge browsers.
                  </span>
                )}
              </div>

              <textarea
                value={answer}
                onChange={(e) => {
                  setAnswer(e.target.value);
                  if (showError && e.target.value.trim()) {
                    setShowError(false);
                  }
                }}
                placeholder="Type your answer here..."
                disabled={submitting}
                className={`w-full h-56 px-6 py-5 rounded-2xl border focus:ring-2 focus:ring-primary/20 focus:border-primary outline-none transition-all resize-none text-slate-900 leading-relaxed bg-slate-50/30 placeholder:text-slate-400 ${
                  showError ? "border-red-300 bg-red-50/30" : "border-slate-200"
                }`}
              />

              {showError && (
                <p className="text-red-500 text-xs font-semibold mt-1 ml-1">
                  Please provide an answer before proceeding.
                </p>
              )}

              {speechError && (
                <p className="text-red-500 text-xs font-semibold mt-1 ml-1">
                  {speechError}
                </p>
              )}

              {isRecording && (
                <p className="text-primary text-xs font-semibold mt-1 ml-1">
                  Listening... speak clearly and your words will appear in the answer box.
                </p>
              )}
            </div>

            <button
              onClick={handleNext}
              disabled={submitting}
              className="w-full bg-primary hover:bg-primary-hover disabled:bg-slate-200 text-white font-bold py-4 rounded-xl flex items-center justify-center gap-2 transition-all shadow-lg shadow-primary/20"
            >
              {submitting ? (
                <>
                  <Loader2 className="animate-spin" size={20} />
                  Evaluating...
                </>
              ) : currentIndex === questions.length - 1 ? (
                <>
                  <CheckCircle2 size={20} />
                  Finish Interview
                </>
              ) : (
                <>
                  Next Question
                  <ChevronRight size={20} />
                </>
              )}
            </button>
          </div>
        </motion.div>
      </div>
    </div>
  );
}
