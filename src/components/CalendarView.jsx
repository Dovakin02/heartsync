import React, { useState } from 'react';
import { Calendar, Clock, Plus, Trash2, X } from 'lucide-react';
import { themeClasses } from '../theme';

export default function CalendarView({ events, setEvents, addActivity, darkMode }) {
  const [showModal, setShowModal] = useState(false);
  const [eventTitle, setEventTitle] = useState('');
  const [eventDate, setEventDate] = useState('');
  const [eventTime, setEventTime] = useState('');
  const [eventTag, setEventTag] = useState('Virtual Date');
  const [eventIcon, setEventIcon] = useState('🍷');

  const handleAddEvent = (e) => {
    e.preventDefault();
    if (!eventTitle.trim() || !eventDate) return;
    const newEvt = {
      id: `evt_${Date.now()}`,
      title: eventTitle,
      date: eventDate,
      time: eventTime || 'All Day',
      tag: eventTag,
      icon: eventIcon
    };
    setEvents([...events, newEvt]);
    addActivity(`Scheduled date: "${eventTitle}" for ${eventDate}`, '📅');
    setEventTitle('');
    setEventDate('');
    setEventTime('');
    setShowModal(false);
  };

  const deleteEvent = (id) => {
    setEvents(events.filter((e) => e.id !== id));
  };

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <h2 className="text-2xl font-bold">Shared Calendar & Virtual Date Planner</h2>
          <p className="text-xs text-slate-500 dark:text-slate-400">
            Never miss movie night, anniversaries, or reunion flights.
          </p>
        </div>
        <button onClick={() => setShowModal(true)} className={themeClasses.btnPrimary}>
          <Plus className="w-4 h-4" />
          <span>Plan Virtual Date</span>
        </button>
      </div>

      {/* Events Grid */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
        {events.map((evt) => (
          <div key={evt.id} className={`${themeClasses.card(darkMode)} flex flex-col justify-between`}>
            <div>
              <div className="flex justify-between items-start mb-4">
                <span className={`text-3xl p-3 rounded-2xl border ${darkMode ? 'bg-rose-950/30 border-rose-900/50' : 'bg-rose-50 border-rose-100'}`}>
                  {evt.icon}
                </span>
                <span className="text-[10px] font-bold px-2.5 py-1 rounded-full bg-rose-100 dark:bg-rose-950 text-rose-600 dark:text-rose-400">
                  {evt.tag}
                </span>
              </div>
              <h3 className="font-bold text-lg mb-2">{evt.title}</h3>
              <p className="text-xs text-slate-500 dark:text-slate-400 flex items-center space-x-1 my-1">
                <Calendar className="w-3.5 h-3.5 text-rose-500" />
                <span>{evt.date}</span>
              </p>
              <p className="text-xs text-slate-500 dark:text-slate-400 flex items-center space-x-1">
                <Clock className="w-3.5 h-3.5 text-rose-500" />
                <span>{evt.time}</span>
              </p>
            </div>
            <div className="pt-4 border-t border-slate-200/50 dark:border-slate-800 flex justify-end mt-4">
              <button
                onClick={() => deleteEvent(evt.id)}
                className="text-xs text-slate-400 hover:text-rose-500 flex items-center space-x-1 transition-colors"
              >
                <Trash2 className="w-3.5 h-3.5" />
                <span>Remove</span>
              </button>
            </div>
          </div>
        ))}
      </div>

      {/* Modal */}
      {showModal && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/50 backdrop-blur-sm">
          <div className={themeClasses.modal(darkMode)}>
            <div className="flex justify-between items-center">
              <h3 className="font-bold text-lg">Schedule Couple Event / Date</h3>
              <button
                onClick={() => setShowModal(false)}
                className="text-slate-400 hover:text-slate-600 dark:hover:text-slate-200"
              >
                <X className="w-5 h-5" />
              </button>
            </div>
            <form onSubmit={handleAddEvent} className="space-y-4">
              <div>
                <label className="text-xs text-slate-500 dark:text-slate-400 block mb-1">Title</label>
                <input
                  type="text"
                  placeholder="e.g., Virtual Pizza Night 🍕"
                  value={eventTitle}
                  onChange={(e) => setEventTitle(e.target.value)}
                  className={themeClasses.input(darkMode)}
                  required
                />
              </div>
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                <div>
                  <label className="text-xs text-slate-500 dark:text-slate-400 block mb-1">Date</label>
                  <input
                    type="date"
                    value={eventDate}
                    onChange={(e) => setEventDate(e.target.value)}
                    className={themeClasses.input(darkMode)}
                    required
                  />
                </div>
                <div>
                  <label className="text-xs text-slate-500 dark:text-slate-400 block mb-1">Time Sync Note</label>
                  <input
                    type="text"
                    placeholder="20:00 JST / 11:00 GMT"
                    value={eventTime}
                    onChange={(e) => setEventTime(e.target.value)}
                    className={themeClasses.input(darkMode)}
                  />
                </div>
              </div>
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                <div>
                  <label className="text-xs text-slate-500 dark:text-slate-400 block mb-1">Tag Category</label>
                  <select
                    value={eventTag}
                    onChange={(e) => setEventTag(e.target.value)}
                    className={themeClasses.input(darkMode)}
                  >
                    <option value="Virtual Date">Virtual Date</option>
                    <option value="Planning">Planning</option>
                    <option value="Special">Special Anniversary</option>
                    <option value="Flight/Travel">Flight/Travel</option>
                  </select>
                </div>
                <div>
                  <label className="text-xs text-slate-500 dark:text-slate-400 block mb-1">Emoji Icon</label>
                  <select
                    value={eventIcon}
                    onChange={(e) => setEventIcon(e.target.value)}
                    className={themeClasses.input(darkMode)}
                  >
                    <option value="🍷">🍷 Wine Date</option>
                    <option value="🍳">🍳 Cooking Date</option>
                    <option value="🎬">🎬 Movie Night</option>
                    <option value="✈️">✈️ Flight Travel</option>
                    <option value="🎂">🎂 Special Celebration</option>
                  </select>
                </div>
              </div>
              <div className="flex justify-end space-x-3 pt-4 border-t border-slate-100 dark:border-slate-800">
                <button
                  type="button"
                  onClick={() => setShowModal(false)}
                  className={themeClasses.btnSecondary(darkMode)}
                >
                  Cancel
                </button>
                <button type="submit" className={themeClasses.btnPrimary}>
                  Schedule Event
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
}