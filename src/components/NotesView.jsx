import React, { useState } from 'react';
import { Plus, Trash2, X } from 'lucide-react';
import { themeClasses } from '../theme';

export default function NotesView({ notes, addNote, deleteNote, darkMode }) {
  const [selectedCategory, setSelectedCategory] = useState('All');
  const [searchQuery, setSearchQuery] = useState('');
  const [showNewModal, setShowNewModal] = useState(false);
  const [newTitle, setNewTitle] = useState('');
  const [newCategory, setNewCategory] = useState('General');
  const [newColor, setNewColor] = useState('rose');
  const [textContent, setTextContent] = useState('');

  const categories = ['All', 'Travel', 'Daily', 'Entertainment', 'Ideas', 'General'];

  const handleCreateNote = (e) => {
    e.preventDefault();
    if (!newTitle.trim() || !textContent.trim()) return;
    addNote({
      title: newTitle,
      category: newCategory,
      color: newColor,
      content: textContent,
      pinned: false,
      createdAt: Date.now()
    });
    setNewTitle('');
    setTextContent('');
    setShowNewModal(false);
  };

  const filteredNotes = notes.filter((note) => {
    const matchesCategory = selectedCategory === 'All' || note.category === selectedCategory;
    const matchesSearch =
      note.title.toLowerCase().includes(searchQuery.toLowerCase()) ||
      (note.content && note.content.toLowerCase().includes(searchQuery.toLowerCase()));
    return matchesCategory && matchesSearch;
  });

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <h2 className="text-2xl font-bold">Shared Notes & Checklists</h2>
          <p className="text-xs text-slate-500 dark:text-slate-400">
            Real-time synced notes with your partner.
          </p>
        </div>
        <button onClick={() => setShowNewModal(true)} className={themeClasses.btnPrimary}>
          <Plus className="w-4 h-4" />
          <span>Create Note</span>
        </button>
      </div>

      {/* Filter and Search Bar */}
      <div className="flex flex-col sm:flex-row items-stretch sm:items-center justify-between gap-3">
        <div className="flex items-center space-x-1.5 overflow-x-auto pb-1 no-scrollbar">
          {categories.map((cat) => (
            <button
              key={cat}
              onClick={() => setSelectedCategory(cat)}
              className={`px-3 py-1.5 rounded-xl text-xs font-medium whitespace-nowrap transition-all ${
                selectedCategory === cat
                  ? 'bg-rose-500 text-white shadow-sm'
                  : darkMode
                  ? 'bg-slate-800 text-slate-400 hover:bg-slate-700'
                  : 'bg-rose-100/60 text-slate-600 hover:bg-rose-100'
              }`}
            >
              {cat}
            </button>
          ))}
        </div>
        <div className="w-full sm:w-64">
          <input
            type="text"
            placeholder="Search notes..."
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
            className={themeClasses.input(darkMode)}
          />
        </div>
      </div>

      {/* Notes Grid */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
        {filteredNotes.map((note) => (
          <div
            key={note.id}
            className={`p-5 rounded-3xl border transition-all flex flex-col justify-between shadow-sm ${themeClasses.noteColor(
              note.color,
              darkMode
            )}`}
          >
            <div>
              <div className="flex items-start justify-between mb-3">
                <div className="pr-2">
                  <span className="text-[10px] font-bold uppercase tracking-wider px-2 py-0.5 rounded-full bg-white/70 dark:bg-black/30 border border-black/5">
                    {note.category}
                  </span>
                  <h3 className="font-bold text-lg mt-1">{note.title}</h3>
                </div>
                <button
                  onClick={() => deleteNote(note.id)}
                  className="p-1.5 rounded-lg text-slate-400 hover:text-rose-500 transition-colors"
                >
                  <Trash2 className="w-4 h-4" />
                </button>
              </div>
              <div className="my-3 text-xs opacity-90 whitespace-pre-wrap leading-relaxed">
                {note.content}
              </div>
            </div>
            <div className="pt-4 border-t border-slate-200/40 dark:border-slate-800/40 flex justify-between items-center text-[10px] text-slate-500 dark:text-slate-400">
              <span>By {note.author || 'Partner'}</span>
              <span>{new Date(note.createdAt).toLocaleDateString()}</span>
            </div>
          </div>
        ))}
      </div>

      {/* Modal */}
      {showNewModal && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/50 backdrop-blur-sm">
          <div className={themeClasses.modal(darkMode)}>
            <div className="flex justify-between items-center">
              <h3 className="font-bold text-lg">Create Shared Note</h3>
              <button
                onClick={() => setShowNewModal(false)}
                className="text-slate-400 hover:text-slate-600 dark:hover:text-slate-200"
              >
                <X className="w-5 h-5" />
              </button>
            </div>
            <form onSubmit={handleCreateNote} className="space-y-4">
              <div>
                <label className="text-xs text-slate-500 dark:text-slate-400 block mb-1">Title</label>
                <input
                  type="text"
                  placeholder="Title..."
                  value={newTitle}
                  onChange={(e) => setNewTitle(e.target.value)}
                  className={themeClasses.input(darkMode)}
                  required
                />
              </div>
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                <div>
                  <label className="text-xs text-slate-500 dark:text-slate-400 block mb-1">Category</label>
                  <select
                    value={newCategory}
                    onChange={(e) => setNewCategory(e.target.value)}
                    className={themeClasses.input(darkMode)}
                  >
                    <option value="Travel">Travel</option>
                    <option value="Daily">Daily</option>
                    <option value="Entertainment">Entertainment</option>
                    <option value="Ideas">Ideas</option>
                    <option value="General">General</option>
                  </select>
                </div>
                <div>
                  <label className="text-xs text-slate-500 dark:text-slate-400 block mb-1">Color Accent</label>
                  <select
                    value={newColor}
                    onChange={(e) => setNewColor(e.target.value)}
                    className={themeClasses.input(darkMode)}
                  >
                    <option value="rose">Rose</option>
                    <option value="indigo">Indigo</option>
                    <option value="amber">Amber</option>
                    <option value="emerald">Emerald</option>
                  </select>
                </div>
              </div>
              <div>
                <label className="text-xs text-slate-500 dark:text-slate-400 block mb-1">Content</label>
                <textarea
                  rows={4}
                  placeholder="Write your note..."
                  value={textContent}
                  onChange={(e) => setTextContent(e.target.value)}
                  className={themeClasses.input(darkMode)}
                  required
                />
              </div>
              <div className="flex justify-end space-x-3 pt-4 border-t border-slate-100 dark:border-slate-800">
                <button
                  type="button"
                  onClick={() => setShowNewModal(false)}
                  className={themeClasses.btnSecondary(darkMode)}
                >
                  Cancel
                </button>
                <button type="submit" className={themeClasses.btnPrimary}>
                  Create Note
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
}