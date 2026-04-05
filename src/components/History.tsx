import React, { useEffect, useMemo, useState } from "react";
import { motion } from "motion/react";
import {
  ArrowLeft,
  TrendingUp,
  Trophy,
  CalendarDays,
  MessageSquareText,
  ChevronRight,
  Trash2,
  Loader2,
} from "lucide-react";
import { useNavigate } from "react-router-dom";
import { useAuth } from "../context/AuthContext";
import { db, collection, deleteDoc, doc, getDocs, query, where } from "../firebase";

type Evaluation = {
  score: number;
  strengths: string[];
  improvements: string[];
  feedback: string;
};

type SessionResult = {
  question: string;
  answer: string;
  evaluation: Evaluation;
};

type SessionRecord = {
  id: string;
  role?: string;
  type?: string;
  difficulty?: string;
  status?: string;
  results?: SessionResult[];
  updatedAt?: { seconds?: number; nanoseconds?: number; toDate?: () => Date };
};

type CompletedSession = SessionRecord & {
  averageScore: number;
  questionCount: number;
  latestFeedback: string;
  topStrength: string;
  topImprovement: string;
};

function toDate(value?: SessionRecord["updatedAt"]) {
  if (!value) return null;
  if (typeof value.toDate === "function") return value.toDate();
  if (typeof value.seconds === "number") return new Date(value.seconds * 1000);
  return null;
}

function formatSessionDate(session: SessionRecord) {
  const date = toDate(session.updatedAt);
  if (!date) return "Recent session";

  return new Intl.DateTimeFormat("en-IN", {
    day: "numeric",
    month: "short",
    year: "numeric",
    hour: "numeric",
    minute: "2-digit",
  }).format(date);
}

function summarizeSession(session: SessionRecord): CompletedSession {
  const results = session.results ?? [];
  const averageScore =
    results.length > 0
      ? Math.round(
          results.reduce((total, item) => total + item.evaluation.score, 0) / results.length,
        )
      : 0;

  const topStrength =
    results.flatMap((item) => item.evaluation.strengths)[0] ?? "Completed interview session";
  const topImprovement =
    results.flatMap((item) => item.evaluation.improvements)[0] ?? "Keep practicing to improve.";
  const latestFeedback =
    results[results.length - 1]?.evaluation.feedback ?? "Feedback will appear after evaluation.";

  return {
    ...session,
    averageScore,
    questionCount: results.length,
    latestFeedback,
    topStrength,
    topImprovement,
  };
}

function getScoreTone(score: number) {
  if (score >= 80) return "text-green-600 bg-green-50 border-green-100";
  if (score >= 60) return "text-amber-600 bg-amber-50 border-amber-100";
  return "text-red-600 bg-red-50 border-red-100";
}

export default function History() {
  const navigate = useNavigate();
  const { user } = useAuth();
  const [sessions, setSessions] = useState<CompletedSession[]>([]);
  const [loading, setLoading] = useState(true);
  const [historyError, setHistoryError] = useState<string | null>(null);
  const [deletingId, setDeletingId] = useState<string | null>(null);
  const [deletingAll, setDeletingAll] = useState(false);

  useEffect(() => {
    const fetchSessions = async () => {
      if (!user) return;

      setLoading(true);
      setHistoryError(null);
      try {
        const sessionsQuery = query(collection(db, "sessions"), where("uid", "==", user.uid));
        const snapshot = await getDocs(sessionsQuery);
        const completedSessions = snapshot.docs
          .map((docSnapshot) => ({
            id: docSnapshot.id,
            ...(docSnapshot.data() as SessionRecord),
          }))
          .filter((session) => session.status === "completed" && (session.results?.length ?? 0) > 0)
          .sort((left, right) => {
            const leftTime = toDate(left.updatedAt)?.getTime() ?? 0;
            const rightTime = toDate(right.updatedAt)?.getTime() ?? 0;
            return rightTime - leftTime;
          })
          .map(summarizeSession);

        setSessions(completedSessions);
      } catch (error) {
        console.error("Error loading interview history:", error);
        setHistoryError("Unable to load interview history right now.");
      } finally {
        setLoading(false);
      }
    };

    fetchSessions();
  }, [user]);

  const stats = useMemo(() => {
    if (sessions.length === 0) {
      return {
        totalInterviews: 0,
        bestScore: 0,
        latestScore: 0,
        progressDelta: 0,
      };
    }

    const chronological = [...sessions].reverse();
    const firstScore = chronological[0]?.averageScore ?? 0;
    const latestScore = sessions[0]?.averageScore ?? 0;

    return {
      totalInterviews: sessions.length,
      bestScore: Math.max(...sessions.map((session) => session.averageScore)),
      latestScore,
      progressDelta: latestScore - firstScore,
    };
  }, [sessions]);

  // Deletes one completed session and updates local UI after Firestore succeeds.
  const handleDeleteSession = async (sessionId: string) => {
    const confirmed = window.confirm("Are you sure you want to delete this history item?");
    if (!confirmed) return;

    setDeletingId(sessionId);
    setHistoryError(null);

    try {
      await deleteDoc(doc(db, "sessions", sessionId));
      setSessions((prev) => prev.filter((session) => session.id !== sessionId));
    } catch (error) {
      console.error("Error deleting history item:", error);
      setHistoryError("Unable to delete that history item. Please try again.");
    } finally {
      setDeletingId(null);
    }
  };

  const handleDeleteAllHistory = async () => {
    const confirmed = window.confirm("Are you sure you want to delete all history?");
    if (!confirmed || sessions.length === 0) return;

    setDeletingAll(true);
    setHistoryError(null);

    try {
      await Promise.all(sessions.map((session) => deleteDoc(doc(db, "sessions", session.id))));
      setSessions([]);
    } catch (error) {
      console.error("Error deleting all history:", error);
      setHistoryError("Unable to delete all history right now. Please try again.");
    } finally {
      setDeletingAll(false);
    }
  };

  return (
    <div className="min-h-screen bg-white py-12 px-6">
      <div className="max-w-5xl mx-auto">
        <button
          onClick={() => navigate("/home")}
          className="mb-8 flex items-center gap-2 text-slate-400 hover:text-primary transition-colors font-medium"
        >
          <ArrowLeft size={20} />
          Back to Dashboard
        </button>

        <div className="mb-10">
          <h1 className="text-4xl font-bold text-slate-900 tracking-tight mb-3">Interview History</h1>
          <p className="text-slate-500">
            Review your previous interview sessions, track score changes, and focus on your next improvement areas.
          </p>
        </div>

        <div className="flex flex-wrap justify-end gap-3 mb-6">
          <button
            type="button"
            onClick={handleDeleteAllHistory}
            disabled={deletingAll || sessions.length === 0}
            title="Delete all history"
            className="inline-flex items-center gap-2 px-4 py-2 rounded-xl border border-red-200 text-red-600 bg-red-50 hover:bg-red-100 disabled:opacity-50 disabled:cursor-not-allowed transition-colors text-sm font-semibold"
          >
            {deletingAll ? <Loader2 size={16} className="animate-spin" /> : <Trash2 size={16} />}
            Delete All History
          </button>
        </div>

        {historyError && (
          <div className="mb-6 rounded-2xl border border-red-100 bg-red-50 px-4 py-3 text-sm font-medium text-red-600">
            {historyError}
          </div>
        )}

        <div className="grid grid-cols-1 md:grid-cols-3 gap-6 mb-10">
          <div className="rounded-3xl border border-slate-100 bg-white p-6 shadow-sm">
            <div className="flex items-center gap-3 text-primary mb-4">
              <CalendarDays size={20} />
              <span className="text-sm font-bold uppercase tracking-widest">Sessions</span>
            </div>
            <p className="text-4xl font-black text-slate-900">{stats.totalInterviews}</p>
            <p className="text-sm text-slate-500 mt-2">Completed interviews saved in your history.</p>
          </div>

          <div className="rounded-3xl border border-slate-100 bg-white p-6 shadow-sm">
            <div className="flex items-center gap-3 text-amber-600 mb-4">
              <Trophy size={20} />
              <span className="text-sm font-bold uppercase tracking-widest">Best Score</span>
            </div>
            <p className="text-4xl font-black text-slate-900">{stats.bestScore}</p>
            <p className="text-sm text-slate-500 mt-2">Highest average score across all sessions.</p>
          </div>

          <div className="rounded-3xl border border-slate-100 bg-white p-6 shadow-sm">
            <div className="flex items-center gap-3 text-green-600 mb-4">
              <TrendingUp size={20} />
              <span className="text-sm font-bold uppercase tracking-widest">Progress</span>
            </div>
            <p className="text-4xl font-black text-slate-900">
              {stats.progressDelta >= 0 ? "+" : ""}
              {stats.progressDelta}
            </p>
            <p className="text-sm text-slate-500 mt-2">
              Change from your first saved interview to your latest one.
            </p>
          </div>
        </div>

        {loading ? (
          <div className="rounded-3xl border border-slate-100 bg-white p-12 text-center text-slate-500 shadow-sm">
            Loading your interview history...
          </div>
        ) : sessions.length === 0 ? (
          <div className="rounded-3xl border border-slate-100 bg-white p-12 text-center shadow-sm">
            <MessageSquareText size={32} className="mx-auto text-slate-300 mb-4" />
            <h2 className="text-2xl font-bold text-slate-900 mb-2">No history yet</h2>
            <p className="text-slate-500 mb-6">
              Complete your first interview to start tracking progress and feedback over time.
            </p>
            <button
              onClick={() => navigate("/home")}
              className="px-6 py-3 bg-primary text-white font-bold rounded-xl hover:bg-primary-hover transition-colors"
            >
              Start Interview
            </button>
          </div>
        ) : (
          <div className="space-y-6">
            {sessions.map((session, index) => (
              <motion.div
                key={session.id}
                initial={{ opacity: 0, y: 12 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ delay: index * 0.05 }}
                className="rounded-3xl border border-slate-100 bg-white p-8 shadow-md shadow-slate-100/70"
              >
                <div className="flex flex-col lg:flex-row lg:items-start lg:justify-between gap-6 mb-6">
                  <div>
                    <p className="text-[10px] font-bold uppercase tracking-widest text-primary mb-2">
                      {formatSessionDate(session)}
                    </p>
                    <h2 className="text-2xl font-bold text-slate-900">
                      {session.role ?? "Interview Practice"}
                    </h2>
                    <p className="text-slate-500 mt-1">
                      {session.type ?? "General"} interview • {session.difficulty ?? "Medium"} difficulty •{" "}
                      {session.questionCount} questions
                    </p>
                  </div>

                  <div className="flex items-start gap-3">
                    <div
                      className={`inline-flex items-center justify-center px-5 py-3 rounded-2xl border text-2xl font-black ${getScoreTone(
                        session.averageScore,
                      )}`}
                    >
                      {session.averageScore}
                    </div>

                    <button
                      type="button"
                      onClick={() => handleDeleteSession(session.id)}
                      disabled={deletingAll || deletingId === session.id}
                      title="Delete"
                      className="inline-flex items-center justify-center h-11 w-11 rounded-2xl border border-slate-200 bg-white text-slate-500 hover:text-red-600 hover:border-red-200 hover:bg-red-50 disabled:opacity-50 disabled:cursor-not-allowed transition-colors"
                    >
                      {deletingId === session.id ? (
                        <Loader2 size={18} className="animate-spin" />
                      ) : (
                        <Trash2 size={18} />
                      )}
                    </button>
                  </div>
                </div>

                <div className="grid grid-cols-1 md:grid-cols-2 gap-6 mb-6">
                  <div className="rounded-2xl bg-slate-50 border border-slate-100 p-5">
                    <p className="text-[10px] font-bold uppercase tracking-widest text-green-600 mb-2">
                      What Improved
                    </p>
                    <p className="text-slate-700 leading-relaxed">{session.topStrength}</p>
                  </div>

                  <div className="rounded-2xl bg-slate-50 border border-slate-100 p-5">
                    <p className="text-[10px] font-bold uppercase tracking-widest text-amber-600 mb-2">
                      Focus Next
                    </p>
                    <p className="text-slate-700 leading-relaxed">{session.topImprovement}</p>
                  </div>
                </div>

                <div className="rounded-2xl bg-accent border border-blue-100 p-5 mb-6">
                  <p className="text-[10px] font-bold uppercase tracking-widest text-primary mb-2">
                    Latest Feedback
                  </p>
                  <p className="text-slate-700 leading-relaxed">{session.latestFeedback}</p>
                </div>

                <button
                  onClick={() => navigate("/result", { state: { results: session.results ?? [] } })}
                  className="inline-flex items-center gap-2 text-primary font-bold hover:text-primary-hover transition-colors"
                >
                  View Full Report
                  <ChevronRight size={18} />
                </button>
              </motion.div>
            ))}
          </div>
        )}
      </div>
    </div>
  );
}
