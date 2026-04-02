import { motion } from "motion/react";
import { RefreshCw, History, ArrowLeft, CheckCircle2, AlertCircle } from "lucide-react";
import { useLocation, useNavigate } from "react-router-dom";

export default function Result() {
  const location = useLocation();
  const navigate = useNavigate();
  const { results } = location.state || { results: [] };

  const totalScore = results.length > 0 
    ? Math.round(results.reduce((acc: number, curr: any) => acc + curr.evaluation.score, 0) / results.length)
    : 0;

  const getScoreColor = (score: number) => {
    if (score >= 80) return "text-green-600";
    if (score >= 50) return "text-amber-600";
    return "text-red-600";
  };

  return (
    <div className="min-h-screen bg-white py-12 px-6 relative">
      {/* Back Button */}
      <button
        onClick={() => navigate("/home")}
        className="absolute left-6 top-6 flex items-center gap-2 text-slate-400 hover:text-primary transition-colors font-medium"
      >
        <ArrowLeft size={20} />
        Back to Dashboard
      </button>

      <div className="max-w-4xl mx-auto">
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          className="bg-white p-12 rounded-3xl shadow-xl border border-slate-100 text-center mb-12 relative overflow-hidden"
        >
          <div className="absolute top-0 left-0 w-full h-2 bg-primary" />
          
          <h1 className="text-4xl font-bold text-slate-900 tracking-tight mb-4">
            Interview Report
          </h1>
          <p className="text-slate-500 mb-8">Performance analysis and expert feedback</p>
          
          <div className="inline-flex flex-col items-center justify-center p-10 bg-accent rounded-full border-4 border-white shadow-inner mb-8">
            <span className={`text-7xl font-black ${getScoreColor(totalScore)}`}>
              {totalScore}
            </span>
            <span className="text-slate-400 font-bold uppercase tracking-widest text-xs mt-2">Overall Score</span>
          </div>

          <div className="flex flex-wrap justify-center gap-4">
            <button
              onClick={() => navigate("/home")}
              className="px-8 py-4 bg-primary hover:bg-primary-hover text-white font-bold rounded-xl flex items-center gap-2 transition-all shadow-lg shadow-primary/20"
            >
              <RefreshCw size={20} />
              Restart Interview
            </button>
            <button
              className="px-8 py-4 bg-white border border-slate-200 hover:bg-slate-50 text-slate-700 font-bold rounded-xl flex items-center gap-2 transition-all"
            >
              <History size={20} />
              View History
            </button>
          </div>
        </motion.div>

        <div className="space-y-8">
          <h2 className="text-2xl font-bold text-slate-900 px-2">Detailed Feedback</h2>
          {results.map((res: any, idx: number) => (
            <motion.div
              key={idx}
              initial={{ opacity: 0, x: -20 }}
              animate={{ opacity: 1, x: 0 }}
              transition={{ delay: idx * 0.1 }}
              className="bg-white p-8 rounded-3xl shadow-sm border border-slate-100"
            >
              <div className="flex justify-between items-start gap-4 mb-6">
                <div className="flex-1">
                  <span className="text-[10px] font-bold text-primary uppercase tracking-widest block mb-2">Question {idx + 1}</span>
                  <h3 className="text-xl font-bold text-slate-900 leading-snug">{res.question}</h3>
                </div>
                <div className={`px-4 py-2 rounded-xl font-black text-xl bg-slate-50 border border-slate-100 ${getScoreColor(res.evaluation.score)}`}>
                  {res.evaluation.score}
                </div>
              </div>

              <div className="space-y-6">
                <div className="p-5 bg-slate-50 rounded-2xl border border-slate-100">
                  <span className="text-[10px] font-bold text-slate-400 uppercase tracking-widest block mb-2">Your Response</span>
                  <p className="text-slate-700 leading-relaxed italic">"{res.answer}"</p>
                </div>

                <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                  <div className="space-y-3">
                    <div className="flex items-center gap-2 text-green-600 font-bold text-sm uppercase tracking-wider">
                      <CheckCircle2 size={16} />
                      Strengths
                    </div>
                    <ul className="space-y-2">
                      {res.evaluation.strengths.map((s: string, i: number) => (
                        <li key={i} className="text-sm text-slate-600 flex gap-2">
                          <span className="text-green-500 mt-1">•</span>
                          {s}
                        </li>
                      ))}
                    </ul>
                  </div>
                  <div className="space-y-3">
                    <div className="flex items-center gap-2 text-amber-600 font-bold text-sm uppercase tracking-wider">
                      <AlertCircle size={16} />
                      Improvements
                    </div>
                    <ul className="space-y-2">
                      {res.evaluation.improvements.map((imp: string, i: number) => (
                        <li key={i} className="text-sm text-slate-600 flex gap-2">
                          <span className="text-amber-500 mt-1">•</span>
                          {imp}
                        </li>
                      ))}
                    </ul>
                  </div>
                </div>
              </div>
            </motion.div>
          ))}
        </div>
      </div>
    </div>
  );
}
