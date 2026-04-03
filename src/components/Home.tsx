import React, { useState, useEffect } from "react";
import { motion } from "motion/react";
import { Loader2, ArrowLeft, User as UserIcon, LogOut, History, TrendingUp, Trophy } from "lucide-react";
import { useAuth } from "../context/AuthContext";
import { db, doc, setDoc, getDoc, collection, serverTimestamp, query, where, getDocs } from "../firebase";
import { useNavigate } from "react-router-dom";
import { generateQuestions } from "../services/geminiService";

type SessionRecord = {
  status?: string;
  results?: { evaluation: { score: number } }[];
};

export default function Home() {
  const { user, logout } = useAuth();
  const navigate = useNavigate();
  const [name, setName] = useState("");
  const [role, setRole] = useState("Java Developer");
  const [type, setType] = useState("Technical");
  const [difficulty, setDifficulty] = useState("Medium");
  const [isGenerating, setIsGenerating] = useState(false);
  const [historyStats, setHistoryStats] = useState({
    completedSessions: 0,
    latestScore: 0,
    bestScore: 0,
  });

  useEffect(() => {
    const fetchPreferences = async () => {
      if (user) {
        setName(user.displayName || "");
        try {
          const userDoc = await getDoc(doc(db, "users", user.uid));
          if (userDoc.exists()) {
            const data = userDoc.data();
            if (data.preferredRole) setRole(data.preferredRole);
            if (data.preferredType) setType(data.preferredType);
            if (data.preferredDifficulty) setDifficulty(data.preferredDifficulty);
          }
        } catch (error) {
          console.error("Error fetching preferences:", error);
        }
      }
    };
    fetchPreferences();
  }, [user]);

  useEffect(() => {
    const fetchHistoryStats = async () => {
      if (!user) return;

      try {
        const sessionsQuery = query(collection(db, "sessions"), where("uid", "==", user.uid));
        const snapshot = await getDocs(sessionsQuery);
        const completedSessions = snapshot.docs
          .map((docSnapshot) => docSnapshot.data() as SessionRecord)
          .filter((session) => session.status === "completed" && (session.results?.length ?? 0) > 0);

        const scores = completedSessions.map((session) =>
          Math.round(
            (session.results ?? []).reduce((total, item) => total + item.evaluation.score, 0) /
              Math.max((session.results ?? []).length, 1),
          ),
        );

        setHistoryStats({
          completedSessions: completedSessions.length,
          latestScore: scores[scores.length - 1] ?? 0,
          bestScore: scores.length > 0 ? Math.max(...scores) : 0,
        });
      } catch (error) {
        console.error("Error fetching history stats:", error);
      }
    };

    fetchHistoryStats();
  }, [user]);

  const handleStart = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!user || isGenerating) return;
    
    setIsGenerating(true);
    try {
      const generatedQuestions = await generateQuestions(role, type, difficulty);
      
      const sessionRef = doc(collection(db, "sessions"));
      await setDoc(sessionRef, {
        uid: user.uid,
        role,
        type,
        difficulty,
        questions: generatedQuestions,
        results: [],
        currentIndex: 0,
        status: "active",
        updatedAt: serverTimestamp(),
      });

      navigate("/interview", { state: { sessionId: sessionRef.id, questions: generatedQuestions, role, type, difficulty } });
    } catch (error) {
      console.error("Failed to generate questions:", error);
      const message =
        error instanceof Error
          ? error.message
          : "Failed to generate interview questions. Please try again.";
      alert(message);
    } finally {
      setIsGenerating(false);
    }
  };

  return (
    <div className="min-h-screen bg-white">
      {/* Navbar */}
      <nav className="bg-white border-b border-slate-100 px-6 py-4 flex justify-between items-center sticky top-0 z-10">
        <div className="flex items-center gap-2">
          <div className="w-8 h-8 bg-primary rounded-lg flex items-center justify-center text-white font-bold">I</div>
          <span className="text-xl font-bold text-slate-900">InterviewAI</span>
        </div>
        <div className="flex items-center gap-4">
          <div className="flex items-center gap-2 px-3 py-1.5 bg-accent rounded-full border border-blue-100">
            <UserIcon size={16} className="text-primary" />
            <span className="text-sm font-semibold text-slate-700">{user?.displayName}</span>
          </div>
          <button 
            onClick={() => logout()} 
            className="p-2 text-slate-400 hover:text-red-500 transition-colors"
            title="Logout"
          >
            <LogOut size={20} />
          </button>
        </div>
      </nav>

      <div className="max-w-4xl mx-auto px-6 py-12 relative">
        {/* Back Button */}
        <button
          onClick={() => navigate(-1)}
          className="absolute left-6 top-4 flex items-center gap-2 text-slate-400 hover:text-primary transition-colors font-medium"
        >
          <ArrowLeft size={20} />
          Back
        </button>

        <div className="grid grid-cols-1 lg:grid-cols-[minmax(0,1fr)_22rem] gap-8 items-start mt-8">
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            className="max-w-md w-full mx-auto lg:mx-0 bg-white p-10 rounded-3xl shadow-xl border border-slate-100"
          >
          <div className="text-center mb-10">
            <h1 className="text-3xl font-bold text-slate-900 tracking-tight mb-3">Start Practice</h1>
            <p className="text-slate-500 leading-relaxed">AI-powered interview practice platform</p>
          </div>

          <form onSubmit={handleStart} className="space-y-6">
            <div className="space-y-2">
              <label className="block text-sm font-semibold text-slate-700 ml-1">Target Role</label>
              <div className="relative">
                <select
                  value={role}
                  onChange={(e) => setRole(e.target.value)}
                  className="w-full px-4 py-3 rounded-xl border border-slate-200 bg-slate-50/50 focus:bg-white focus:ring-2 focus:ring-primary/20 focus:border-primary outline-none transition-all appearance-none text-slate-900"
                >
                  <option value="Java Developer">Java Developer</option>
                  <option value="Data Analyst">Data Analyst</option>
                  <option value="Frontend Developer">Frontend Developer</option>
                  <option value="Backend Developer">Backend Developer</option>
                  <option value="Fullstack Developer">Fullstack Developer</option>
                  <option value="Product Manager">Product Manager</option>
                </select>
                <div className="absolute right-4 top-1/2 -translate-y-1/2 pointer-events-none text-slate-400">
                  <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M19 9l-7 7-7-7" /></svg>
                </div>
              </div>
            </div>

            <div className="grid grid-cols-2 gap-4">
              <div className="space-y-2">
                <label className="block text-sm font-semibold text-slate-700 ml-1">Type</label>
                <div className="relative">
                  <select
                    value={type}
                    onChange={(e) => setType(e.target.value)}
                    className="w-full px-4 py-3 rounded-xl border border-slate-200 bg-slate-50/50 focus:bg-white focus:ring-2 focus:ring-primary/20 focus:border-primary outline-none transition-all appearance-none text-slate-900"
                  >
                    <option value="Technical">Technical</option>
                    <option value="HR">HR / Behavioral</option>
                    <option value="System Design">System Design</option>
                  </select>
                  <div className="absolute right-4 top-1/2 -translate-y-1/2 pointer-events-none text-slate-400">
                    <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M19 9l-7 7-7-7" /></svg>
                  </div>
                </div>
              </div>

              <div className="space-y-2">
                <label className="block text-sm font-semibold text-slate-700 ml-1">Difficulty</label>
                <div className="relative">
                  <select
                    value={difficulty}
                    onChange={(e) => setDifficulty(e.target.value)}
                    className="w-full px-4 py-3 rounded-xl border border-slate-200 bg-slate-50/50 focus:bg-white focus:ring-2 focus:ring-primary/20 focus:border-primary outline-none transition-all appearance-none text-slate-900"
                  >
                    <option value="Easy">Easy</option>
                    <option value="Medium">Medium</option>
                    <option value="Hard">Hard</option>
                  </select>
                  <div className="absolute right-4 top-1/2 -translate-y-1/2 pointer-events-none text-slate-400">
                    <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M19 9l-7 7-7-7" /></svg>
                  </div>
                </div>
              </div>
            </div>

            <button
              type="submit"
              disabled={isGenerating}
              className="w-full bg-primary hover:bg-primary-hover disabled:bg-primary/50 text-white font-bold py-4 rounded-xl flex items-center justify-center gap-2 transition-all shadow-lg shadow-primary/20 mt-4"
            >
              {isGenerating ? (
                <>
                  <Loader2 size={20} className="animate-spin" />
                  Preparing Session...
                </>
              ) : (
                "Start Interview"
              )}
            </button>
          </form>
          </motion.div>

          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.05 }}
            className="bg-white p-8 rounded-3xl shadow-sm border border-slate-100"
          >
            <div className="flex items-center gap-2 mb-6">
              <History size={18} className="text-primary" />
              <h2 className="text-xl font-bold text-slate-900">Your Progress</h2>
            </div>

            <div className="space-y-4 mb-6">
              <div className="rounded-2xl bg-slate-50 border border-slate-100 p-4">
                <div className="flex items-center gap-2 text-primary mb-2">
                  <History size={16} />
                  <span className="text-xs font-bold uppercase tracking-widest">Completed Interviews</span>
                </div>
                <p className="text-3xl font-black text-slate-900">{historyStats.completedSessions}</p>
              </div>

              <div className="grid grid-cols-2 gap-4">
                <div className="rounded-2xl bg-slate-50 border border-slate-100 p-4">
                  <div className="flex items-center gap-2 text-green-600 mb-2">
                    <TrendingUp size={16} />
                    <span className="text-xs font-bold uppercase tracking-widest">Latest</span>
                  </div>
                  <p className="text-2xl font-black text-slate-900">{historyStats.latestScore}</p>
                </div>

                <div className="rounded-2xl bg-slate-50 border border-slate-100 p-4">
                  <div className="flex items-center gap-2 text-amber-600 mb-2">
                    <Trophy size={16} />
                    <span className="text-xs font-bold uppercase tracking-widest">Best</span>
                  </div>
                  <p className="text-2xl font-black text-slate-900">{historyStats.bestScore}</p>
                </div>
              </div>
            </div>

            <p className="text-sm text-slate-500 leading-relaxed mb-6">
              Review your earlier interview reports, compare scores, and track how your answers are improving over time.
            </p>

            <button
              type="button"
              onClick={() => navigate("/history")}
              className="w-full bg-white border border-slate-200 hover:bg-slate-50 text-slate-700 font-bold py-4 rounded-xl flex items-center justify-center gap-2 transition-all"
            >
              <History size={18} />
              View History
            </button>
          </motion.div>
        </div>
      </div>
    </div>
  );
}
