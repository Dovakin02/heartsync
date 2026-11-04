import React, { useState, useEffect } from 'react';
import { Camera, Copy, Check, MapPin, Navigation, Search, Loader2 } from 'lucide-react';
import { themeClasses } from '../theme';

export default function ProfileView({
  user,
  userProfile,
  partnerProfile,
  handleSaveProfile,
  handleAvatarUpload,
  handlePair,
  handleRemovePartner,
  targetPairCode,
  setTargetPairCode,
  darkMode,
  userLocation = '',
  onSaveLocation
}) {
  const [nameInput, setNameInput] = useState(userProfile.displayName || '');
  const [bioInput, setBioInput] = useState(userProfile.bio || '');
  const [copiedCode, setCopiedCode] = useState(false);
  const [myCity, setMyCity] = useState(userLocation);
  const [isDetecting, setIsDetecting] = useState(false);

  // Address search suggestions state
  const [suggestions, setSuggestions] = useState([]);
  const [isSearching, setIsSearching] = useState(false);

  // Debounced search trigger for any address globally
  useEffect(() => {
    const timer = setTimeout(async () => {
      if (!myCity || myCity.trim().length < 3 || myCity === userLocation) {
        setSuggestions([]);
        return;
      }

      setIsSearching(true);
      try {
        const res = await fetch(
          `https://nominatim.openstreetmap.org/search?format=json&q=${encodeURIComponent(myCity)}&addressdetails=1&limit=5`,
          { headers: { 'Accept-Language': 'en' } }
        );
        const data = await res.json();
        setSuggestions(data || []);
      } catch (err) {
        console.error('Error fetching address suggestions:', err);
      } finally {
        setIsSearching(false);
      }
    }, 350);

    return () => clearTimeout(timer);
  }, [myCity, userLocation]);

  const handleSelectSuggestion = (place) => {
    const addr = place.address;
    const mainName = addr.road || addr.suburb || addr.city || addr.town || place.display_name.split(',')[0];
    const city = addr.city || addr.town || addr.state || '';
    const country = addr.country || '';

    const formattedName = [mainName, city, country].filter(Boolean).join(', ');

    setMyCity(formattedName);
    setSuggestions([]);
    if (onSaveLocation) {
      onSaveLocation(formattedName);
    }
  };

  const handleGetGPSLocation = () => {
    if (!navigator.geolocation) {
      alert('Geolocation is not supported by your browser');
      return;
    }

    setIsDetecting(true);
    navigator.geolocation.getCurrentPosition(
      async (position) => {
        const { latitude, longitude } = position.coords;
        try {
          const res = await fetch(
            `https://nominatim.openstreetmap.org/reverse?format=json&lat=${latitude}&lon=${longitude}`
          );
          const data = await res.json();
          const addr = data.address;
          const locationName = `${addr.city || addr.town || addr.village || addr.county}, ${addr.country}`;

          setMyCity(locationName);
          setSuggestions([]);
          if (onSaveLocation) onSaveLocation(locationName);
        } catch (err) {
          alert('Failed to obtain city name from GPS coordinates.');
        } finally {
          setIsDetecting(false);
        }
      },
      () => {
        alert('Location access denied.');
        setIsDetecting(false);
      }
    );
  };

  return (
    <div className="max-w-xl mx-auto space-y-6">
      {/* Profile Settings */}
      <div className={`${themeClasses.card(darkMode)} space-y-6`}>
        <h2 className="text-xl font-bold text-rose-500">Profile Settings</h2>
        <div className="flex items-center gap-5">
          <label className="relative cursor-pointer group">
            <img
              src={userProfile.avatarUrl || 'https://via.placeholder.com/150'}
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
        <form onSubmit={(e) => { e.preventDefault(); handleSaveProfile(nameInput, bioInput); }} className="space-y-4">
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
              placeholder="Status or message..."
            />
          </div>
          <div className="flex justify-end pt-2">
            <button type="submit" className={themeClasses.btnPrimary}>
              Save Profile
            </button>
          </div>
        </form>
      </div>

      {/* Global Address & City Location Search */}
      <div className={`${themeClasses.card(darkMode)} space-y-6 relative`}>
        <div className="flex items-center justify-between">
          <div>
            <h2 className="text-xl font-bold text-rose-500 mb-1 flex items-center gap-2">
              <MapPin className="w-5 h-5" /> Global Location Search
            </h2>
            <p className="text-xs text-slate-500 dark:text-slate-400">
              Type any address, city, or country worldwide to sync distance and timezone.
            </p>
          </div>
          <button
            type="button"
            onClick={handleGetGPSLocation}
            disabled={isDetecting}
            className={`flex items-center space-x-1.5 px-3 py-2 rounded-xl text-xs font-medium transition-colors ${
              darkMode 
                ? 'bg-slate-800 hover:bg-slate-700 text-rose-400 border border-slate-700' 
                : 'bg-rose-50 hover:bg-rose-100 text-rose-600 border border-rose-200'
            }`}
          >
            <Navigation className={`w-3.5 h-3.5 ${isDetecting ? 'animate-spin' : ''}`} />
            <span>{isDetecting ? 'Detecting...' : 'Use GPS'}</span>
          </button>
        </div>

        <form onSubmit={(e) => { e.preventDefault(); if (onSaveLocation) onSaveLocation(myCity); setSuggestions([]); }} className="space-y-4 relative">
          <div>
            <label className="text-xs font-medium text-slate-500 dark:text-slate-400 block mb-1">Search Address / City</label>
            <div className="relative">
              <Search className="absolute left-3.5 top-3 w-4 h-4 text-slate-400" />
              <input
                type="text"
                value={myCity}
                onChange={(e) => setMyCity(e.target.value)}
                className={`pl-10 pr-10 ${themeClasses.input(darkMode)}`}
                placeholder="e.g. 527 Flagstaff Dr, Ottawa or Amman, Jordan..."
                autoComplete="off"
              />
              {isSearching && (
                <Loader2 className="absolute right-3.5 top-3 w-4 h-4 text-rose-500 animate-spin" />
              )}
            </div>

            {/* Suggestions List */}
            {suggestions.length > 0 && (
              <div className={`absolute z-30 left-0 right-0 mt-1 rounded-2xl border shadow-2xl overflow-hidden backdrop-blur-md ${
                darkMode ? 'bg-slate-900/95 border-slate-700 text-slate-200' : 'bg-white/95 border-slate-200 text-slate-800'
              }`}>
                {suggestions.map((place) => (
                  <div
                    key={place.place_id}
                    onClick={() => handleSelectSuggestion(place)}
                    className={`px-4 py-3 text-xs cursor-pointer flex items-center space-x-3 border-b last:border-b-0 ${
                      darkMode ? 'border-slate-800 hover:bg-slate-800' : 'border-slate-100 hover:bg-rose-50'
                    }`}
                  >
                    <MapPin className="w-4 h-4 text-rose-500 shrink-0" />
                    <span className="truncate leading-relaxed">{place.display_name}</span>
                  </div>
                ))}
              </div>
            )}
          </div>

          <div className="flex justify-end pt-2">
            <button type="submit" className={themeClasses.btnPrimary}>
              Save Location
            </button>
          </div>
        </form>
      </div>

      {/* Partner Connection */}
      <div className={`${themeClasses.card(darkMode)} space-y-6`}>
        <div>
          <h2 className="text-xl font-bold text-rose-500 mb-1">Partner Connection</h2>
          <p className="text-xs text-slate-500 dark:text-slate-400">
            Share your pairing code to connect dashboard widgets.
          </p>
        </div>

        {partnerProfile ? (
          <div className={`p-4 rounded-2xl border flex items-center justify-between ${darkMode ? 'bg-emerald-950/30 border-emerald-900/50' : 'bg-emerald-50 border-emerald-200'}`}>
            <div className="flex items-center space-x-3">
              <img
                src={partnerProfile.avatarUrl || 'https://via.placeholder.com/150'}
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
            <button
              onClick={handleRemovePartner}
              className="px-3 py-1.5 bg-rose-500/20 hover:bg-rose-500/30 text-rose-400 text-xs font-medium rounded-xl transition"
            >
              Disconnect
            </button>
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
                  className={`flex items-center space-x-1.5 px-3.5 py-1.5 rounded-xl text-xs font-medium ${
                    darkMode ? 'bg-slate-800 text-slate-200' : 'bg-white text-slate-700 border'
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
                  placeholder="Enter partner code"
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