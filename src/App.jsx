import React, { useState, useEffect } from 'react';
import { initializeApp } from 'firebase/app';
import {
  getAuth,
  createUserWithEmailAndPassword,
  signInWithEmailAndPassword,
  GoogleAuthProvider,
  signInWithPopup,
  signOut,
  onAuthStateChanged,
  updateProfile
} from 'firebase/auth';
import {
  getDatabase,
  ref,
  onValue,
  push,
  set,
  remove,
  get
} from 'firebase/database';
import {
  getStorage,
  ref as storageRef,
  uploadBytes,
  getDownloadURL
} from 'firebase/storage';
import {
  Heart,
  Calendar,
  CheckSquare,
  Edit3,
  Image,
  Sun,
  Moon,
  LogOut,
  User
} from 'lucide-react';

import DashboardView from './components/DashboardView';
import NotesView from './components/NotesView';
import ScribbleView from './components/ScribbleView';
import CalendarView from './components/CalendarView';
import MemoriesView from './components/MemoriesView';
import ProfileView from './components/ProfileView';
import { themeClasses } from './theme';
import { calculateDistance, getCoordinates } from './utils/distance';

const firebaseConfig = {
  apiKey: "AIzaSyDRR9ZnLv-Rn2N5pglFReS5CpXNZ2KKB78",
  authDomain: "heartsync-add6c.firebaseapp.com",
  databaseURL: "https://heartsync-add6c-default-rtdb.firebaseio.com",
  projectId: "heartsync-add6c",
  storageBucket: "heartsync-add6c.firebasestorage.app",
  messagingSenderId: "883772141487",
  appId: "1:883772141487:web:ae6785a7147e25fc99095a",
  measurementId: "G-8CJ6KDVR81"
};

const app = initializeApp(firebaseConfig);
const auth = getAuth(app);
const db = getDatabase(app);
const storage = getStorage(app);
const googleProvider = new GoogleAuthProvider();

export default function App() {
  const [user, setUser] = useState(null);
  const [loading, setLoading] = useState(true);
  const [darkMode, setDarkMode] = useState(true);
  const [activeTab, setActiveTab] = useState('dashboard');

  // Auth & Profile state
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [isSignUp, setIsSignUp] = useState(false);
  const [authError, setAuthError] = useState('');
  const [userProfile, setUserProfile] = useState({
    displayName: '',
    bio: '',
    avatarUrl: '',
    partnerId: '',
    pairCode: '',
    location: ''
  });
  const [partnerProfile, setPartnerProfile] = useState(null);

  // Distance & Coordinates State
  const [distance, setDistance] = useState(null);
  const [userCoords, setUserCoords] = useState({ lat: null, lon: null });
  const [partnerCoords, setPartnerCoords] = useState({ lat: null, lon: null });

  // App Sync Data
  const [notes, setNotes] = useState([]);
  const [events, setEvents] = useState([]);
  const [memories, setMemories] = useState([]);
  const [activities, setActivities] = useState([]);
  const [countdown, setCountdown] = useState({
    title: 'Next Reunion!',
    targetDate: new Date(Date.now() + 14 * 24 * 60 * 60 * 1000).toISOString().split('T')[0],
    location: 'Airport Terminal',
    note: 'Counting down the days!'
  });

  const [targetPairCode, setTargetPairCode] = useState('');

  // Monitor Auth State
  useEffect(() => {
    const unsubscribe = onAuthStateChanged(auth, async (currentUser) => {
      setUser(currentUser);
      if (currentUser) {
        const userRef = ref(db, `users/${currentUser.uid}`);
        const snapshot = await get(userRef);
        if (!snapshot.exists()) {
          const generatedCode = Math.random().toString(36).substring(2, 8).toUpperCase();
          await set(userRef, {
            email: currentUser.email,
            displayName: currentUser.displayName || currentUser.email.split('@')[0],
            avatarUrl: currentUser.photoURL || '',
            bio: 'HeartSync user',
            pairCode: generatedCode,
            partnerId: '',
            location: ''
          });
        }
      }
      setLoading(false);
    });

    return () => unsubscribe();
  }, []);

  // Monitor Profile and Partner Data, and compute distance and coordinates safely
  useEffect(() => {
    if (!user) return;
    const userRef = ref(db, `users/${user.uid}`);
    const unsubUser = onValue(userRef, async (snapshot) => {
      const data = snapshot.val();
      if (data) {
        setUserProfile(data);

        // Get user coords
        let uCoords = { lat: null, lon: null };
        if (data.location) {
          uCoords = await getCoordinates(data.location);
          setUserCoords(uCoords);
        }

        if (data.partnerId) {
          const pSnap = await get(ref(db, `users/${data.partnerId}`));
          if (pSnap.exists()) {
            const pData = pSnap.val();
            setPartnerProfile(pData);

            let pCoords = { lat: null, lon: null };
            if (pData.location) {
              pCoords = await getCoordinates(pData.location);
              setPartnerCoords(pCoords);
            }

            // Compute distance if both have coordinates
            if (uCoords.lat !== null && pCoords.lat !== null) {
              const dist = calculateDistance(uCoords.lat, uCoords.lon, pCoords.lat, pCoords.lon);
              setDistance(dist);
            }
          } else {
            setPartnerProfile(null);
            setPartnerCoords({ lat: null, lon: null });
            setDistance(null);
          }
        } else {
          setPartnerProfile(null);
          setPartnerCoords({ lat: null, lon: null });
          setDistance(null);
        }
      }
    });

    return () => unsubUser();
  }, [user?.uid, userProfile.partnerId, userProfile.location]);

  // Shared Key generation
  const sharedKey = userProfile.partnerId
    ? [user.uid, userProfile.partnerId].sort().join('_')
    : user?.uid;

  // Realtime Data Sync
  useEffect(() => {
    if (!user || !sharedKey) return;

    const notesRef = ref(db, `shared/${sharedKey}/notes`);
    const eventsRef = ref(db, `shared/${sharedKey}/events`);
    const memoriesRef = ref(db, `shared/${sharedKey}/memories`);
    const countdownRef = ref(db, `shared/${sharedKey}/countdown`);

    const unsubNotes = onValue(notesRef, (snap) => {
      const d = snap.val();
      setNotes(d ? Object.entries(d).map(([id, val]) => ({ id, ...val })) : []);
    });

    const unsubEvents = onValue(eventsRef, (snap) => {
      const d = snap.val();
      setEvents(d ? Object.entries(d).map(([id, val]) => ({ id, ...val })) : []);
    });

    const unsubMemories = onValue(memoriesRef, (snap) => {
      const d = snap.val();
      setMemories(d ? Object.entries(d).map(([id, val]) => ({ id, ...val })) : []);
    });

    const unsubCountdown = onValue(countdownRef, (snap) => {
      const d = snap.val();
      if (d) setCountdown(d);
    });

    return () => {
      unsubNotes();
      unsubEvents();
      unsubMemories();
      unsubCountdown();
    };
  }, [user, sharedKey]);

  // Auth Handlers
  const handleAuth = async (e) => {
    e.preventDefault();
    setAuthError('');
    try {
      if (isSignUp) {
        await createUserWithEmailAndPassword(auth, email, password);
      } else {
        await signInWithEmailAndPassword(auth, email, password);
      }
    } catch (err) {
      setAuthError(err.message.replace('Firebase: ', ''));
    }
  };

  const handleGoogleSignIn = async () => {
    setAuthError('');
    try {
      await signInWithPopup(auth, googleProvider);
    } catch (err) {
      setAuthError(err.message.replace('Firebase: ', ''));
    }
  };

  const handleSaveLocation = async (location) => {
    if (!user) return;
    await set(ref(db, `users/${user.uid}/location`), location);
    alert('Location saved successfully!');
  };

  const handlePair = async (e) => {
    e.preventDefault();
    if (!targetPairCode.trim()) return;

    const snap = await get(ref(db, 'users'));
    if (snap.exists()) {
      const allUsers = snap.val();
      const matchedUid = Object.keys(allUsers).find(
        (uid) => allUsers[uid].pairCode === targetPairCode.trim().toUpperCase()
      );

      if (matchedUid && matchedUid !== user.uid) {
        await set(ref(db, `users/${user.uid}/partnerId`), matchedUid);
        await set(ref(db, `users/${matchedUid}/partnerId`), user.uid);
        setTargetPairCode('');
      } else {
        alert('Invalid or self-pairing code!');
      }
    }
  };

  const handleRemovePartner = async () => {
    if (window.confirm("Are you sure you want to disconnect from your partner?")) {
      const partnerId = userProfile.partnerId;
      if (partnerId) {
        await set(ref(db, `users/${partnerId}/partnerId`), '');
      }
      await set(ref(db, `users/${user.uid}/partnerId`), '');
      setPartnerProfile(null);
      setDistance(null);
    }
  };

  const handleAvatarUpload = async (e) => {
    const file = e.target.files[0];
    if (!file) return;
    try {
      const imgRef = storageRef(storage, `avatars/${user.uid}_${Date.now()}`);
      await uploadBytes(imgRef, file);
      const url = await getDownloadURL(imgRef);
      await set(ref(db, `users/${user.uid}/avatarUrl`), url);
      await updateProfile(auth.currentUser, { photoURL: url });
    } catch (err) {
      console.error(err);
    }
  };

  const addActivity = (text, icon = '✨') => {
    setActivities((prev) => [
      { id: Date.now(), text, time: 'Just now', icon },
      ...prev.slice(0, 9)
    ]);
  };

  const handleSetCountdown = (newCountdown) => {
    setCountdown(newCountdown);
    set(ref(db, `shared/${sharedKey}/countdown`), newCountdown);
  };

  const handleAddNote = (newNote) => {
    push(ref(db, `shared/${sharedKey}/notes`), {
      ...newNote,
      author: userProfile.displayName || user.email
    });
  };

  const handleDeleteNote = (id) => {
    remove(ref(db, `shared/${sharedKey}/notes/${id}`));
  };

  const handleAddMemory = (newMemory) => {
    push(ref(db, `shared/${sharedKey}/memories`), {
      ...newMemory,
      uploadedBy: userProfile.displayName || user.email
    });
  };

  useEffect(() => {
    document.body.style.backgroundColor = darkMode ? '#020617' : '#fff1f2';
    document.body.classList.add('overscroll-none');
  }, [darkMode]);

  if (!user) {
    return (
      <div className="min-h-screen bg-slate-950 text-white flex items-center justify-center p-4">
        <div className="w-full max-w-md bg-slate-900 border border-slate-800 rounded-2xl p-6 shadow-2xl">
          <div className="flex flex-col items-center mb-6">
            <Heart className="w-12 h-12 text-rose-500 fill-rose-500 mb-2 animate-bounce" />
            <h1 className="text-2xl font-bold">HeartSync</h1>
            <p className="text-slate-400 text-xs mt-1">Shared space for couples & best friends</p>
          </div>

          {authError && (
            <div className="mb-4 p-3 bg-rose-500/10 border border-rose-500/30 text-rose-400 text-xs rounded-lg">
              {authError}
            </div>
          )}

          <button
            onClick={handleGoogleSignIn}
            className="w-full mb-4 bg-slate-800 hover:bg-slate-700 text-white border border-slate-700 py-2.5 rounded-lg text-sm transition-colors"
          >
            Continue with Google
          </button>

          <form onSubmit={handleAuth} className="space-y-3">
            <input
              type="email"
              required
              value={email}
              onChange={(e) => setEmail(e.target.value)}
              className="w-full bg-slate-950 border border-slate-800 rounded-lg px-3 py-2 text-sm text-slate-100"
              placeholder="Email"
            />
            <input
              type="password"
              required
              value={password}
              onChange={(e) => setPassword(e.target.value)}
              className="w-full bg-slate-950 border border-slate-800 rounded-lg px-3 py-2 text-sm text-slate-100"
              placeholder="Password"
            />
            <button
              type="submit"
              className="w-full bg-rose-600 hover:bg-rose-500 text-white py-2 rounded-lg text-sm font-medium transition-colors"
            >
              {isSignUp ? 'Create Account' : 'Sign In'}
            </button>
          </form>

          <button
            onClick={() => setIsSignUp(!isSignUp)}
            className="mt-4 text-xs text-slate-400 hover:text-rose-400 w-full text-center"
          >
            {isSignUp ? 'Already have an account? Sign In' : "Don't have an account? Sign Up"}
          </button>
        </div>
      </div>
    );
  }

  const partnerData = {
    user: {
      name: userProfile.displayName || 'You',
      location: userProfile.location || 'Your Location',
      flag: '📍',
      avatar: userProfile.avatarUrl || 'https://via.placeholder.com/150'
    },
    partner: {
      name: partnerProfile?.displayName || 'Partner',
      location: partnerProfile?.location || 'Remote',
      flag: '✈️',
      avatar: partnerProfile?.avatarUrl || 'https://via.placeholder.com/150'
    },
    distance: distance,
    userLon: userCoords.lon,
    partnerLon: partnerCoords.lon
  };

  const navTabs = [
    { id: 'dashboard', label: 'Dashboard', icon: Heart },
    { id: 'notes', label: 'Shared Notes', icon: CheckSquare },
    { id: 'scribble', label: 'Scribble Pad', icon: Edit3 },
    { id: 'calendar', label: 'Date Planner', icon: Calendar },
    { id: 'memories', label: 'Memory Wall', icon: Image },
    { id: 'profile', label: 'Sync & Profile', icon: User }
  ];

  return (
    <div className={themeClasses.wrapper(darkMode)}>
      <header className={themeClasses.header(darkMode)}>
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="flex items-center justify-between h-16 gap-3">
            <div
              className="flex items-center space-x-2.5 cursor-pointer shrink-0"
              onClick={() => setActiveTab('dashboard')}
            >
              <div className="w-9 h-9 rounded-2xl bg-gradient-to-tr from-rose-500 to-pink-500 flex items-center justify-center shadow-sm shadow-rose-500/20">
                <Heart className="w-5 h-5 fill-white text-white" />
              </div>
              <span className="text-lg font-bold bg-gradient-to-r from-rose-500 to-pink-600 bg-clip-text text-transparent">
                HeartSync
              </span>
            </div>

            <nav className={themeClasses.desktopNavContainer(darkMode)}>
              {navTabs.map((tab) => {
                const Icon = tab.icon;
                const isActive = activeTab === tab.id;
                return (
                  <button
                    key={tab.id}
                    onClick={() => setActiveTab(tab.id)}
                    className={`flex items-center space-x-1.5 px-3 py-1.5 rounded-xl text-xs whitespace-nowrap transition-all ${
                      isActive
                        ? themeClasses.navButtonActive(darkMode)
                        : themeClasses.navButtonInactive(darkMode)
                    }`}
                  >
                    <Icon className={`w-3.5 h-3.5 ${isActive ? 'text-rose-500' : ''}`} />
                    <span>{tab.label}</span>
                  </button>
                );
              })}
            </nav>

            <div className="flex items-center space-x-2 shrink-0">
              <button
                onClick={() => setDarkMode(!darkMode)}
                className={themeClasses.iconButton(darkMode)}
              >
                {darkMode ? <Sun className="w-4 h-4" /> : <Moon className="w-4 h-4" />}
              </button>
              <button
                onClick={() => signOut(auth)}
                className={themeClasses.iconButton(darkMode)}
                title="Log Out"
              >
                <LogOut className="w-4 h-4" />
              </button>
            </div>
          </div>
        </div>
      </header>

      <main className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8 pb-32 md:pb-8">
        {activeTab === 'dashboard' && (
          <DashboardView
            countdown={countdown}
            setCountdown={handleSetCountdown}
            partners={partnerData}
            notes={notes}
            events={events}
            activities={activities}
            addActivity={addActivity}
            setActiveTab={setActiveTab}
            darkMode={darkMode}
          />
        )}

        {activeTab === 'notes' && (
          <NotesView
            notes={notes}
            addNote={handleAddNote}
            deleteNote={handleDeleteNote}
            darkMode={darkMode}
          />
        )}

        {activeTab === 'scribble' && (
          <ScribbleView addActivity={addActivity} darkMode={darkMode} />
        )}

        {activeTab === 'calendar' && (
          <CalendarView
            events={events}
            setEvents={setEvents}
            addActivity={addActivity}
            darkMode={darkMode}
          />
        )}

        {activeTab === 'memories' && (
          <MemoriesView
            memories={memories}
            addMemory={handleAddMemory}
            darkMode={darkMode}
          />
        )}

        {activeTab === 'profile' && (
          <ProfileView
            user={user}
            userProfile={userProfile}
            partnerProfile={partnerProfile}
            userLocation={userProfile.location}
            onSaveLocation={handleSaveLocation}
            handleRemovePartner={handleRemovePartner}
            handleSaveProfile={async (name, bio) => {
              await set(ref(db, `users/${user.uid}/displayName`), name);
              await set(ref(db, `users/${user.uid}/bio`), bio);
              await updateProfile(auth.currentUser, { displayName: name });
              alert('Profile updated!');
            }}
            handleAvatarUpload={handleAvatarUpload}
            handlePair={handlePair}
            targetPairCode={targetPairCode}
            setTargetPairCode={setTargetPairCode}
            darkMode={darkMode}
          />
        )}
      </main>

      <nav className={themeClasses.mobileNavContainer(darkMode)}>
        {navTabs.map((tab) => {
          const Icon = tab.icon;
          const isActive = activeTab === tab.id;
          return (
            <button
              key={tab.id}
              onClick={() => setActiveTab(tab.id)}
              className={isActive ? themeClasses.mobileNavBtnActive(darkMode) : themeClasses.mobileNavBtnInactive(darkMode)}
            >
              <Icon className={`w-[22px] h-[22px] ${isActive ? (darkMode ? 'text-rose-400' : 'text-rose-600') : ''}`} />
            </button>
          );
        })}
      </nav>
    </div>
  );
}