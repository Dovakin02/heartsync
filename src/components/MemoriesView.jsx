import React, { useState } from 'react';
import { Heart, Plus, X, UploadCloud, Loader2 } from 'lucide-react';
import { themeClasses } from '../theme';

export default function MemoriesView({ memories, addMemory, uploadImage, darkMode }) {
  const [showModal, setShowModal] = useState(false);
  const [title, setTitle] = useState('');
  const [date, setDate] = useState('');
  const [location, setLocation] = useState('');
  const [imageFile, setImageFile] = useState(null);
  const [imagePreview, setImagePreview] = useState('');
  const [caption, setCaption] = useState('');
  const [isUploading, setIsUploading] = useState(false);

  const handleImageChange = (e) => {
    const file = e.target.files[0];
    if (file) {
      setImageFile(file);
      setImagePreview(URL.createObjectURL(file));
    }
  };

  const closeModal = () => {
    setShowModal(false);
    setTitle('');
    setDate('');
    setLocation('');
    setImageFile(null);
    setImagePreview('');
    setCaption('');
  };

  const handleAddMemory = async (e) => {
    e.preventDefault();
    if (!title.trim() || !imageFile) return;

    setIsUploading(true);
    const uploadedUrl = await uploadImage(imageFile);

    if (uploadedUrl) {
      addMemory({
        title,
        date: date || new Date().toISOString().split('T')[0],
        location: location || 'Secret Location',
        imageUrl: uploadedUrl,
        caption,
        createdAt: Date.now()
      });
      closeModal();
    } else {
      alert('Failed to upload image. Please check your connection and try again.');
    }
    setIsUploading(false);
  };

  return (
    <div className="space-y-6">
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <h2 className="text-2xl font-bold">Memory Timeline & Photo Wall</h2>
          <p className="text-xs text-slate-500 dark:text-slate-400">
            A digital photo scrapbook documenting your trip highlights.
          </p>
        </div>
        <button onClick={() => setShowModal(true)} className={themeClasses.btnPrimary}>
          <Plus className="w-4 h-4" />
          <span>Add Photo Memory</span>
        </button>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
        {memories.map((mem) => (
          <div key={mem.id} className={`${themeClasses.card(darkMode)} overflow-hidden p-0`}>
            <div className="relative h-64 overflow-hidden">
              <img
                src={mem.imageUrl}
                alt={mem.title}
                className="w-full h-full object-cover transform hover:scale-105 transition-transform duration-500"
              />
              <div className="absolute top-4 right-4 px-3 py-1 rounded-full bg-black/60 backdrop-blur-md text-white text-xs">
                {mem.location}
              </div>
            </div>
            <div className="p-6 space-y-3">
              <div className="flex justify-between items-center text-xs text-rose-500 font-medium">
                <span>{mem.date}</span>
                <span className="flex items-center space-x-1">
                  <Heart className="w-3.5 h-3.5 fill-rose-500 text-rose-500" />
                  <span>Favorite Moment</span>
                </span>
              </div>
              <h3 className="text-xl font-bold">{mem.title}</h3>
              <p className="text-xs text-slate-600 dark:text-slate-300 leading-relaxed italic">
                "{mem.caption}"
              </p>
            </div>
          </div>
        ))}
      </div>

      {showModal && (
        // Changed from z-50 to z-[60] to ensure it covers the bottom navigation bar completely
        <div className="fixed inset-0 z-[60] flex items-center justify-center p-4 bg-black/50 backdrop-blur-sm">
          <div className={themeClasses.modal(darkMode)}>
            <div className="flex justify-between items-center">
              <h3 className="font-bold text-lg">Add Photo Memory</h3>
              <button
                onClick={closeModal}
                disabled={isUploading}
                className="text-slate-400 hover:text-slate-600 dark:hover:text-slate-200"
              >
                <X className="w-5 h-5" />
              </button>
            </div>
            <form onSubmit={handleAddMemory} className="space-y-4">
              <div>
                <label className="text-xs text-slate-500 dark:text-slate-400 block mb-1">Upload Photo</label>
                <div className={`flex items-center justify-center w-full h-40 border-2 border-dashed rounded-xl transition-colors ${darkMode ? 'border-slate-700 bg-slate-950 hover:border-rose-500' : 'border-rose-200 bg-rose-50/40 hover:border-rose-400'}`}>
                  <label className="flex flex-col items-center justify-center w-full h-full cursor-pointer p-2">
                    {imagePreview ? (
                      <img src={imagePreview} alt="Preview" className="h-full w-full object-cover rounded-lg shadow-sm" />
                    ) : (
                      <div className="flex flex-col items-center justify-center pt-5 pb-6">
                        <UploadCloud className={`w-8 h-8 mb-2 ${darkMode ? 'text-slate-500' : 'text-rose-400'}`} />
                        <p className="text-xs font-medium text-slate-500 dark:text-slate-400">Tap to select photo</p>
                        <p className="text-[10px] text-slate-400 dark:text-slate-500 mt-1">JPEG, PNG, HEIC</p>
                      </div>
                    )}
                    <input type="file" accept="image/*" className="hidden" onChange={handleImageChange} required />
                  </label>
                </div>
              </div>

              <div>
                <label className="text-xs text-slate-500 dark:text-slate-400 block mb-1">Memory Title</label>
                <input
                  type="text"
                  placeholder="e.g., Sunset at Kyoto Temple"
                  value={title}
                  onChange={(e) => setTitle(e.target.value)}
                  className={themeClasses.input(darkMode)}
                  required
                />
              </div>

              <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                <div>
                  <label className="text-xs text-slate-500 dark:text-slate-400 block mb-1">Date</label>
                  <input
                    type="date"
                    value={date}
                    onChange={(e) => setDate(e.target.value)}
                    className={themeClasses.input(darkMode)}
                  />
                </div>
                <div>
                  <label className="text-xs text-slate-500 dark:text-slate-400 block mb-1">Location</label>
                  <input
                    type="text"
                    placeholder="e.g., Tokyo, Japan"
                    value={location}
                    onChange={(e) => setLocation(e.target.value)}
                    className={themeClasses.input(darkMode)}
                  />
                </div>
              </div>

              <div>
                <label className="text-xs text-slate-500 dark:text-slate-400 block mb-1">Caption / Story</label>
                <textarea
                  rows={2}
                  placeholder="Write a sweet memory or note..."
                  value={caption}
                  onChange={(e) => setCaption(e.target.value)}
                  className={themeClasses.input(darkMode)}
                />
              </div>

              <div className="flex justify-end space-x-3 pt-4 border-t border-slate-100 dark:border-slate-800">
                <button
                  type="button"
                  onClick={closeModal}
                  disabled={isUploading}
                  className={themeClasses.btnSecondary(darkMode)}
                >
                  Cancel
                </button>
                <button type="submit" disabled={isUploading} className={themeClasses.btnPrimary}>
                  {isUploading ? (
                    <>
                      <Loader2 className="w-4 h-4 animate-spin" />
                      <span>Uploading...</span>
                    </>
                  ) : (
                    <span>Save Memory</span>
                  )}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
}