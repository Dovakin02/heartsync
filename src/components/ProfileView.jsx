import React, { useState } from 'react';
import { Camera, Copy, Check } from 'lucide-react';
import { themeClasses } from '../theme';

export default function ProfileView({
  user,
  userProfile,
  partnerProfile,
  handleSaveProfile,
  handleAvatarUpload,
  handlePair,
  targetPairCode,
  setTargetPairCode,
  darkMode
}) {
  const [nameInput, setNameInput] = useState(userProfile.displayName || '');
  const [bioInput, setBioInput] = useState(userProfile.bio || '');
  const [copiedCode, setCopiedCode] = useState(false);

  const onSubmitProfile = (e) => {
    e.preventDefault();
    handleSaveProfile(nameInput, bioInput);
  };

  return (
    <div className="max-w-xl mx-auto space-y-6">
      {/* Profile Settings Card */}
      <div className={`${themeClasses.card(darkMode)} space-y-6`}>
        <h2 className="text-xl font-bold text-rose-500">Profile Settings</h2>
        <div className="flex items-center gap-5">
          <label className="relative cursor-pointer group">
            <img
              src={userProfile.avatarUrl || 'https://images.unsplash.com/photo-1534528741775-53994a69daeb?auto=format&fit=crop&w=200&q=80'}
              className="w-20 h-20 rounded-2xl object-cover ring-4 ring-rose-500/20 group-hover:opacity-90 transition-opacity"
              alt="Avatar"
            />
            <div className="absolute inset-0 flex items-center justify-center bg-black/40 rounded-2xl opacity-0 group-hover:opacity-100 transition-opacity">
              <Camera className="w-5 h-5 text-white" />
            </div>
            <input type="file" accept="image/*" onChange={handleAvatarUpload} className="hidden" />
          </label>
          <div>
            <h3 className="font-bold text-base">{userProfile.displayName || 'Set your name'}</h3>
            <p className="text-xs text-slate-400 mt-0.5">{user.email}</p>
          </div>
        </div>
        <form onSubmit={onSubmitProfile} className="space-y-4">
          <div>
            <label className="text-xs font-medium text-slate-500 dark:text-slate-400 block mb-1">Display Name</label>
            <input
              type="text"
              value={nameInput}
              onChange={(e) => setNameInput(e.target.value)}
              className={themeClasses.input(darkMode)}
              placeholder="Your Name"
            />
          </div>
          <div>
            <label className="text-xs font-medium text-slate-500 dark:text-slate-400 block mb-1">Bio / Status</label>
            <textarea
              rows={2}
              value={bioInput}
              onChange={(e) => setBioInput(e.target.value)}
              className={themeClasses.input(darkMode)}
              placeholder="Tell your partner something nice..."
            />
          </div>
          <div className="flex justify-end pt-2">
            <button type="submit" className={themeClasses.btnPrimary}>
              Save Profile
            </button>
          </div>
        </form>
      </div>

      {/* Partner Pairing Card */}
      <div className={`${themeClasses.card(darkMode)} space-y-6`}>
        <div>
          <h2 className="text-xl font-bold text-rose-500 mb-1">Partner Connection</h2>
          <p className="text-xs text-slate-500 dark:text-slate-400">
            Share your code with your partner or enter theirs to sync notes, countdowns, and memories.
          </p>
        </div>

        {partnerProfile ? (
          <div className={`p-4 rounded-2xl border flex items-center space-x-3 ${darkMode ? 'bg-emerald-950/30 border-emerald-900/50' : 'bg-emerald-50 border-emerald-200'}`}>
            <img
              src={partnerProfile.avatarUrl || 'https://images.unsplash.com/photo-1517841905240-472988babdf9?auto=format&fit=crop&w=200&q=80'}
              className="w-12 h-12 rounded-full object-cover"
              alt="Partner"
            />
            <div>
              <p className="text-xs font-semibold text-emerald-600 dark:text-emerald-400">
                Connected with {partnerProfile.displayName || 'Partner'}
              </p>
              <p className="text-[10px] text-slate-400">{partnerProfile.bio || 'Active Sync'}</p>
            </div>
          </div>
        ) : (
          <div className="space-y-4">
            <div>
              <label className="text-xs font-medium text-slate-500 dark:text-slate-400 block mb-1">Your Pairing Code</label>
              <div className={`flex items-center justify-between p-3.5 rounded-2xl border ${darkMode ? 'bg-slate-950 border-slate-800' : 'bg-rose-50/50 border-rose-200'}`}>
                <span className="font-mono text-lg font-bold tracking-widest text-rose-500">
                  {userProfile.pairCode || '------'}
                </span>
                <button
                  onClick={() => {
                    navigator.clipboard.writeText(userProfile.pairCode);
                    setCopiedCode(true);
                    setTimeout(() => setCopiedCode(false), 2000);
                  }}
                  className={`flex items-center space-x-1.5 px-3.5 py-1.5 rounded-xl text-xs font-medium transition-colors ${
                    darkMode
                      ? 'bg-slate-800 hover:bg-slate-700 text-slate-200'
                      : 'bg-white hover:bg-rose-100/70 text-slate-700 border border-rose-200/80 shadow-sm'
                  }`}
                >
                  {copiedCode ? <Check className="w-3.5 h-3.5 text-emerald-500" /> : <Copy className="w-3.5 h-3.5 text-slate-400" />}
                  <span>{copiedCode ? 'Copied!' : 'Copy Code'}</span>
                </button>
              </div>
            </div>
            <form onSubmit={handlePair} className="space-y-2">
              <label className="text-xs font-medium text-slate-500 dark:text-slate-400 block mb-1">Connect with Partner</label>
              <div className="flex gap-2">
                <input
                  type="text"
                  placeholder="Enter partner's 6-char code"
                  value={targetPairCode}
                  onChange={(e) => setTargetPairCode(e.target.value)}
                  className={`flex-1 font-mono uppercase tracking-wider ${themeClasses.input(darkMode)}`}
                />
                <button type="submit" className={themeClasses.btnPrimary}>
                  Connect
                </button>
              </div>
            </form>
          </div>
        )}
      </div>
    </div>
  );
}