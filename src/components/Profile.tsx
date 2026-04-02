import React, { useState, useEffect } from "react";
import { motion } from "motion/react";
import { Save, ArrowLeft, Loader2, User as UserIcon } from "lucide-react";
import { useAuth } from "../context/AuthContext";
import { db, doc, getDoc, updateDoc, serverTimestamp } from "../firebase";

interface ProfileProps {
  onBack: () => void;
}

export default function Profile({ onBack }: ProfileProps) {
  const { user } = useAuth();
  const [role, setRole] = useState("Java Developer");
  const [type, setType] = useState("Technical");
  const [difficulty, setDifficulty] = useState("Medium");
  const [isSaving, setIsSaving] = useState(false);
  const [message, setMessage] = useState<{ type: "success" | "error"; text: string } | null>(null);

  useEffect(() => {
    const fetchProfile = async () => {
      if (!user) return;
      try {
        const userDoc = await getDoc(doc(db, "users", user.uid));
        if (userDoc.exists()) {
          const data = userDoc.data();
          if (data.preferredRole) setRole(data.preferredRole);
          if (data.preferredType) setType(data.preferredType);
          if (data.preferredDifficulty) setDifficulty(data.preferredDifficulty);
        }
      } catch (error) {
        console.error("Error fetching profile:", error);
      }
    };

    fetchProfile();
  }, [user]);

  const handleSave = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!user || isSaving) return;

    setIsSaving(true);
    setMessage(null);

    try {
      await updateDoc(doc(db, "users", user.uid), {
        preferredRole: role,
        preferredType: type,
        preferredDifficulty: difficulty,
        updatedAt: serverTimestamp(),
      });
      setMessage({ type: "success", text: "Profile updated successfully!" });
    } catch (error) {
      console.error("Error updating profile:", error);
      setMessage({ type: "error", text: "Failed to update profile. Please try again." });
    } finally {
      setIsSaving(false);
    }
  };

  return (
    <motion.div
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      className="max-w-2xl mx-auto bg-white p-10 rounded-3xl shadow-sm border border-slate-200"
    >
      <div className="flex items-center gap-4 mb-10">
        <button
          onClick={onBack}
          className="p-2.5 hover:bg-slate-50 rounded-xl text-slate-400 hover:text-slate-900 transition-all border border-transparent hover:border-slate-100"
        >
          <ArrowLeft size={20} />
        </button>
        <h1 className="text-2xl font-bold text-slate-900 tracking-tight">Account Settings</h1>
      </div>

      <div className="flex items-center gap-6 mb-12 p-8 bg-slate-50 rounded-3xl border border-slate-100">
        {user?.photoURL ? (
          <img
            src={user.photoURL}
            alt={user.displayName || ""}
            className="w-20 h-20 rounded-2xl border-4 border-white shadow-sm"
            referrerPolicy="no-referrer"
          />
        ) : (
          <div className="w-20 h-20 rounded-2xl bg-indigo-600 flex items-center justify-center text-white border-4 border-white shadow-sm">
            <UserIcon size={40} />
          </div>
        )}
        <div>
          <h2 className="text-xl font-bold text-slate-900">{user?.displayName}</h2>
          <p className="text-slate-500 font-medium">{user?.email}</p>
        </div>
      </div>

      <form onSubmit={handleSave} className="space-y-8">
        <div className="space-y-2">
          <label className="block text-sm font-semibold text-slate-700 ml-1">
            Target Role
          </label>
          <input
            type="text"
            value={role}
            onChange={(e) => setRole(e.target.value)}
            className="w-full px-4 py-3 rounded-xl border border-slate-200 bg-slate-50/50 focus:bg-white focus:ring-2 focus:ring-indigo-500 focus:border-transparent outline-none transition-all text-slate-900"
            placeholder="e.g. Senior Software Engineer"
            required
          />
        </div>

        <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
          <div className="space-y-2">
            <label className="block text-sm font-semibold text-slate-700 ml-1">
              Interview Type
            </label>
            <div className="relative">
              <select
                value={type}
                onChange={(e) => setType(e.target.value)}
                className="w-full px-4 py-3 rounded-xl border border-slate-200 bg-slate-50/50 focus:bg-white focus:ring-2 focus:ring-indigo-500 focus:border-transparent outline-none transition-all appearance-none text-slate-900"
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
            <label className="block text-sm font-semibold text-slate-700 ml-1">
              Difficulty
            </label>
            <div className="relative">
              <select
                value={difficulty}
                onChange={(e) => setDifficulty(e.target.value)}
                className="w-full px-4 py-3 rounded-xl border border-slate-200 bg-slate-50/50 focus:bg-white focus:ring-2 focus:ring-indigo-500 focus:border-transparent outline-none transition-all appearance-none text-slate-900"
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

        {message && (
          <motion.div
            initial={{ opacity: 0, y: -10 }}
            animate={{ opacity: 1, y: 0 }}
            className={`p-4 rounded-xl text-sm font-medium ${
              message.type === "success" ? "bg-green-50 text-green-700 border border-green-100" : "bg-red-50 text-red-700 border border-red-100"
            }`}
          >
            {message.text}
          </motion.div>
        )}

        <button
          type="submit"
          disabled={isSaving}
          className="w-full bg-blue-600 hover:bg-blue-700 disabled:bg-blue-400 text-white font-bold py-4 rounded-xl flex items-center justify-center gap-2 transition-all shadow-lg shadow-blue-200 mt-8"
        >
          {isSaving ? (
            <>
              <Loader2 size={20} className="animate-spin" />
              Saving Changes...
            </>
          ) : (
            <>
              <Save size={20} />
              Save Preferences
            </>
          )}
        </button>
      </form>
    </motion.div>
  );
}
