import React, { useState, useEffect } from 'react';
import { 
  Heart, Calendar, CheckSquare, Edit3, MapPin, Sparkles, 
  Flame, Zap 
} from 'lucide-react';
import { themeClasses } from '../theme';

export default function DashboardView({ countdown, setCountdown, partners, notes, events, activities, addActivity, setActiveTab, darkMode }) {
  const [editingCountdown, setEditingCountdown] = useState(false);
  const [titleInput, setTitleInput] = useState(countdown.title);
  const [dateInput, setDateInput] = useState(countdown.targetDate);
  const [locationInput, setLocationInput] = useState(countdown.location);
  const [noteInput, setNoteInput] = useState(countdown.note);

  const [userTime, setUserTime] = useState('--:--');
  const [partnerTime, setPartnerTime] = useState('--:--');
  const [hourDiffText, setHourDiffText] = useState('0 Hours');

  const calculateTimeLeft = () => {
    const diff = new Date(countdown.targetDate) - new Date();
    if (diff <= 0) return { days: 0, hours: 0, minutes: 0, seconds: 0, passed: true };
    return {
      days: Math.floor(diff / (1000 * 60 * 60 * 24)),
      hours: Math.floor((diff / (1000 * 60 * 60)) % 24),
      minutes: Math.floor((diff / 1000 / 60) % 60),
      seconds: Math.floor((diff / 1000) % 60),
      passed: false
    };
  };

  const [timeLeft, setTimeLeft] = useState(calculateTimeLeft());

  useEffect(() => {
    const timer = setInterval(() => {
      setTimeLeft(calculateTimeLeft());
    }, 1000);
    return () => clearInterval(timer);
  }, [countdown.targetDate]);

  // Dynamically calculate clock from longitude coordinate (15 degrees = 1 hour)
  const getTimeFromLongitude = (now, lon) => {
    if (lon === undefined || lon === null) return now.toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' });
    
    const utcMs = now.getTime() + (now.getTimezoneOffset() * 60000);
    const targetOffsetMs = (lon / 15) * 3600000;
    const localTargetDate = new Date(utcMs + targetOffsetMs);

    return localTargetDate.toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' });
  };

  useEffect(() => {
    const updateClocks = () => {
      const now = new Date();

      const uStr = getTimeFromLongitude(now, partners.userLon);
      const pStr = getTimeFromLongitude(now, partners.partnerLon);

      setUserTime(uStr);
      setPartnerTime(pStr);

      // Compute exact hour offset based on longitudes
      if (partners.userLon !== undefined && partners.partnerLon !== undefined && partners.userLon !== null && partners.partnerLon !== null) {
        const diffHours = Math.round(Math.abs(partners.userLon - partners.partnerLon) / 15);
        setHourDiffText(`${diffHours} Hours`);
      }
    };

    updateClocks();
    const interval = setInterval(updateClocks, 1000);
    return () => clearInterval(interval);
  }, [partners.userLon, partners.partnerLon]);

  const handleSaveCountdown = (e) => {
    e.preventDefault();
    setCountdown({
      title: titleInput,
      targetDate: dateInput,
      location: locationInput,
      note: noteInput
    });
    setEditingCountdown(false);
    addActivity(`Updated reunion countdown: "${titleInput}"`);
  };

  const distanceKm = partners.distance ? Math.round(partners.distance) : null;
  const pinnedNotes = notes.filter(n => n.pinned).slice(0, 3);
  const upcomingEvents = [...events].sort((a,b) => new Date(a.date) - new Date(b.date)).slice(0, 3);

  return (
    <div className="space-y-8">
      {/* Timezone & Partner Status Banner */}
      <div className={themeClasses.card(darkMode)}>
        <div className="grid grid-cols-1 md:grid-cols-3 gap-6 items-center">
          {/* User Card */}
          <div className="flex items-center space-x-4">
            <div className="relative">
              <img src={partners.user.avatar} alt={partners.user.name} className="w-16 h-16 rounded-2xl object-cover ring-4 ring-rose-400/25" />
              <span className="absolute -bottom-1 -right-1 text-base">{partners.user.flag}</span>
            </div>
            <div>
              <h3 className="font-bold text-lg">{partners.user.name}</h3>
              <p className="text-xs text-slate-500 dark:text-slate-400 flex items-center space-x-1">
                <MapPin className="w-3 h-3 text-rose-500" />
                <span>{partners.user.location || 'Your Location'}</span>
              </p>
              <p className="text-xs font-semibold text-rose-500 mt-1">
                Local Time: {userTime}
              </p>
            </div>
          </div>

          {/* Dynamic Sync Center Card */}
          <div className="flex flex-col items-center justify-center py-2 md:py-0 border-y md:border-y-0 md:border-x border-slate-200/60 dark:border-slate-800">
            <div className="flex items-center space-x-2 text-rose-500 animate-pulse">
              <Sparkles className="w-4 h-4" />
              <span className="text-xs font-semibold uppercase tracking-wider">LDR Distance Sync</span>
              <Sparkles className="w-4 h-4" />
            </div>
            <div className="text-2xl font-black bg-gradient-to-r from-rose-500 to-pink-600 bg-clip-text text-transparent my-1">
              {distanceKm ? `${distanceKm.toLocaleString()} km` : 'Set locations'}
            </div>
            <span className="text-xs text-slate-500 dark:text-slate-400">
              {hourDiffText} Time Difference ⏰
            </span>
          </div>

          {/* Partner Card */}
          <div className="flex items-center space-x-4 md:justify-end">
            <div className="text-left md:text-right">
              <h3 className="font-bold text-lg">{partners.partner.name}</h3>
              <p className="text-xs text-slate-500 dark:text-slate-400 flex items-center space-x-1 md:justify-end">
                <MapPin className="w-3 h-3 text-rose-500" />
                <span>{partners.partner.location || 'Remote'}</span>
              </p>
              <p className="text-xs font-semibold text-pink-500 mt-1">
                Local Time: {partnerTime}
              </p>
            </div>
            <div className="relative">
              <img src={partners.partner.avatar} alt={partners.partner.name} className="w-16 h-16 rounded-2xl object-cover ring-4 ring-pink-400/25" />
              <span className="absolute -bottom-1 -right-1 text-base">{partners.partner.flag}</span>
            </div>
          </div>
        </div>
      </div>

      {/* Hero Reunion Countdown Widget */}
      <div className={`relative overflow-hidden rounded-3xl p-8 border shadow-lg transition-all ${
        darkMode 
          ? 'bg-gradient-to-br from-slate-900 via-rose-950/40 to-slate-900 border-rose-900/40 text-white' 
          : 'bg-gradient-to-br from-rose-500 via-pink-500 to-purple-600 text-white border-transparent shadow-rose-500/20'
      }`}>
        <div className="absolute top-0 right-0 -mr-16 -mt-16 w-64 h-64 rounded-full bg-white/10 blur-2xl pointer-events-none" />
        <div className="absolute bottom-0 left-0 -ml-16 -mb-16 w-64 h-64 rounded-full bg-black/10 blur-2xl pointer-events-none" />

        <div className="relative z-10">
          <div className="flex justify-between items-start mb-6">
            <div>
              <div className="inline-flex items-center space-x-2 px-3 py-1 rounded-full text-xs font-semibold bg-white/20 backdrop-blur-md text-white mb-3">
                <Flame className="w-4 h-4 text-amber-300" />
                <span>Next Trip Countdown</span>
              </div>
              <h2 className="text-2xl sm:text-4xl font-extrabold text-white">
                {countdown.title}
              </h2>
              <p className="text-sm mt-1 flex items-center space-x-2 text-rose-100">
                <MapPin className="w-4 h-4" />
                <span>{countdown.location}</span>
              </p>
            </div>

            <button
              onClick={() => setEditingCountdown(!editingCountdown)}
              className="p-2 rounded-xl bg-white/25 hover:bg-white/35 backdrop-blur-md text-white transition-colors"
              title="Edit Countdown"
            >
              <Edit3 className="w-5 h-5" />
            </button>
          </div>

          {editingCountdown ? (
            <form onSubmit={handleSaveCountdown} className="mt-4 p-5 rounded-2xl bg-slate-900/95 text-slate-100 border border-slate-700 space-y-4 backdrop-blur-md">
              <h4 className="font-semibold text-rose-400">Edit Reunion Target</h4>
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                <div>
                  <label className="text-xs text-slate-400 block mb-1">Event Title</label>
                  <input type="text" value={titleInput} onChange={(e) => setTitleInput(e.target.value)} className={themeClasses.input(true)} required />
                </div>
                <div>
                  <label className="text-xs text-slate-400 block mb-1">Target Date</label>
                  <input type="date" value={dateInput} onChange={(e) => setDateInput(e.target.value)} className={themeClasses.input(true)} required />
                </div>
                <div>
                  <label className="text-xs text-slate-400 block mb-1">Location</label>
                  <input type="text" value={locationInput} onChange={(e) => setLocationInput(e.target.value)} className={themeClasses.input(true)} />
                </div>
                <div>
                  <label className="text-xs text-slate-400 block mb-1">Personal Note</label>
                  <input type="text" value={noteInput} onChange={(e) => setNoteInput(e.target.value)} className={themeClasses.input(true)} />
                </div>
              </div>
              <div className="flex justify-end space-x-3 pt-2">
                <button type="button" onClick={() => setEditingCountdown(false)} className="px-4 py-2 text-xs rounded-lg bg-slate-800 text-slate-300">Cancel</button>
                <button type="submit" className="px-4 py-2 text-xs rounded-lg bg-rose-500 hover:bg-rose-600 text-white font-medium">Save Countdown</button>
              </div>
            </form>
          ) : (
            <div className="grid grid-cols-4 gap-3 sm:gap-6 my-6 text-center">
              {[
                { label: 'DAYS', value: timeLeft.days },
                { label: 'HOURS', value: timeLeft.hours },
                { label: 'MINS', value: timeLeft.minutes },
                { label: 'SECS', value: timeLeft.seconds }
              ].map((item, idx) => (
                <div key={idx} className="p-3 sm:p-5 rounded-2xl bg-white/15 dark:bg-slate-900/50 backdrop-blur-md border border-white/20 dark:border-slate-800">
                  <span className="block text-2xl sm:text-5xl font-black text-white tracking-tight">{String(item.value).padStart(2, '0')}</span>
                  <span className="text-[10px] sm:text-xs font-bold text-rose-100 tracking-widest mt-1 block">{item.label}</span>
                </div>
              ))}
            </div>
          )}

          {countdown.note && !editingCountdown && (
            <p className="text-xs sm:text-sm italic p-3 rounded-xl bg-white/15 backdrop-blur-sm border border-white/15 text-white">
              "{countdown.note}"
            </p>
          )}
        </div>
      </div>

      {/* Widgets Grid */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
        <div className={themeClasses.card(darkMode)}>
          <div className="flex justify-between items-center mb-4">
            <h3 className="font-bold text-lg flex items-center space-x-2">
              <CheckSquare className="w-5 h-5 text-rose-500" />
              <span>Pinned Notes</span>
            </h3>
            <button onClick={() => setActiveTab('notes')} className="text-xs text-rose-500 hover:underline font-semibold">
              View All ({notes.length})
            </button>
          </div>

          <div className="space-y-3">
            {pinnedNotes.length === 0 ? (
              <p className="text-xs text-slate-400 py-4 text-center">No pinned notes yet.</p>
            ) : (
              pinnedNotes.map((note) => (
                <div key={note.id} className={`p-4 rounded-2xl border ${darkMode ? 'bg-slate-800/50 border-slate-700/50' : 'bg-rose-50/40 border-rose-100'}`}>
                  <h4 className="font-semibold text-sm truncate">{note.title}</h4>
                  <p className="text-xs text-slate-500 dark:text-slate-400 line-clamp-2 mt-1">{note.content}</p>
                </div>
              ))
            )}
          </div>
        </div>

        <div className={themeClasses.card(darkMode)}>
          <div className="flex justify-between items-center mb-4">
            <h3 className="font-bold text-lg flex items-center space-x-2">
              <Calendar className="w-5 h-5 text-purple-500" />
              <span>Upcoming Dates</span>
            </h3>
            <button onClick={() => setActiveTab('calendar')} className="text-xs text-purple-500 hover:underline font-semibold">
              Calendar
            </button>
          </div>

          <div className="space-y-3">
            {upcomingEvents.map((evt) => (
              <div key={evt.id} className={`p-4 rounded-2xl border flex items-center space-x-3 ${darkMode ? 'bg-purple-950/20 border-purple-900/30' : 'bg-purple-50/60 border-purple-100'}`}>
                <div className="text-2xl p-2 rounded-xl bg-white dark:bg-slate-800 shadow-sm">{evt.icon}</div>
                <div className="flex-1 min-w-0">
                  <h4 className="font-semibold text-sm truncate">{evt.title}</h4>
                  <p className="text-xs text-purple-600 dark:text-purple-300 mt-0.5">{evt.date} {evt.time}</p>
                </div>
              </div>
            ))}
          </div>
        </div>

        <div className={themeClasses.card(darkMode)}>
          <div className="flex justify-between items-center mb-4">
            <h3 className="font-bold text-lg flex items-center space-x-2">
              <Zap className="w-5 h-5 text-amber-500" />
              <span>Live Couple Activity</span>
            </h3>
            <span className="flex h-2 w-2 relative">
              <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-emerald-400 opacity-75"></span>
              <span className="relative inline-flex rounded-full h-2 w-2 bg-emerald-500"></span>
            </span>
          </div>

          <div className="space-y-3 max-h-64 overflow-y-auto pr-1">
            {activities.map((act) => (
              <div key={act.id} className={`flex items-start space-x-3 text-xs p-2.5 rounded-xl transition-colors ${darkMode ? 'hover:bg-slate-800/60' : 'hover:bg-rose-50/50'}`}>
                <span className="text-base leading-none">{act.icon}</span>
                <div className="flex-1">
                  <p className="font-medium">{act.text}</p>
                  <span className="text-[10px] text-slate-400">{act.time}</span>
                </div>
              </div>
            ))}
          </div>
        </div>
      </div>
    </div>
  );
}