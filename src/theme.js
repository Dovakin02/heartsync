// src/theme.js
export const themeClasses = {
  // Main Page Layout
  wrapper: (darkMode) =>
    `min-h-screen transition-colors duration-300 font-sans ${
      darkMode ? 'bg-slate-950 text-slate-100' : 'bg-rose-50/40 text-slate-800'
    }`,

  // Navigation Header
  header: (darkMode) =>
    `sticky top-0 z-40 backdrop-blur-md border-b transition-colors ${
      darkMode ? 'bg-slate-900/80 border-slate-800' : 'bg-white/80 border-rose-100 shadow-sm'
    }`,

  // Desktop Nav (Hidden on Mobile)
  desktopNavContainer: (darkMode) =>
    `hidden md:flex space-x-1 p-1.5 rounded-2xl border transition-colors ${
      darkMode ? 'bg-slate-800/60 border-slate-700/50' : 'bg-rose-50/60 border-rose-100 shadow-inner'
    }`,

  // Mobile Bottom Nav (Instagram Style Pill)
  mobileNavContainer: (darkMode) =>
    `fixed bottom-6 left-1/2 -translate-x-1/2 z-50 flex items-center justify-between w-[92%] max-w-sm px-6 py-3.5 rounded-full backdrop-blur-xl border shadow-2xl md:hidden transition-all ${
      darkMode ? 'bg-slate-900/95 border-slate-700/50 shadow-black/50' : 'bg-white/95 border-rose-200 shadow-rose-900/10'
    }`,

  mobileNavBtnActive: (darkMode) =>
    `p-2 rounded-full transition-all ${
      darkMode ? 'bg-slate-800 text-rose-400' : 'bg-rose-100 text-rose-600'
    }`,

  mobileNavBtnInactive: (darkMode) =>
    `p-2 rounded-full transition-all ${
      darkMode ? 'text-slate-400 hover:text-slate-200' : 'text-slate-400 hover:text-rose-500'
    }`,

  navButtonActive: (darkMode) =>
    darkMode
      ? 'bg-slate-900 text-rose-400 shadow-sm font-semibold border border-slate-700/50'
      : 'bg-white text-rose-600 shadow-sm font-semibold border border-rose-50',

  navButtonInactive: (darkMode) =>
    darkMode
      ? 'text-slate-400 hover:text-slate-100 hover:bg-slate-800/50'
      : 'text-slate-500 hover:text-rose-600 hover:bg-rose-100/50',

  iconButton: (darkMode) =>
    `p-2.5 rounded-xl border transition-colors shadow-sm ${
      darkMode
        ? 'bg-slate-800 border-slate-700 text-slate-400 hover:text-rose-400'
        : 'bg-white border-rose-100 text-slate-500 hover:text-rose-500 hover:bg-rose-50'
    }`,

  // Cards & Modals
// Cards & Modals
  card: (darkMode) =>
    `p-6 rounded-3xl border transition-all ${
      darkMode
        ? 'bg-slate-900 border-slate-800 shadow-sm'
        : 'bg-white border-rose-100 shadow-sm shadow-rose-100/50'
    }`,

  modal: (darkMode) =>
    // Added max-h-[90vh] and overflow-y-auto so the modal scrolls if it gets too tall
    `rounded-3xl p-6 max-w-lg w-full border shadow-2xl space-y-4 max-h-[90vh] overflow-y-auto ${
      darkMode
        ? 'bg-slate-900 border-slate-800 text-slate-100'
        : 'bg-white border-rose-100 text-slate-800 shadow-rose-200/50'
    }`,

// Input & Select Controls
// Input & Select Controls
  input: (darkMode) =>
    // Changed to text-base to guarantee iOS Safari respects the 16px minimum
    `w-full px-3 py-2.5 rounded-xl text-base transition-colors ${
      darkMode
        ? 'bg-slate-950 border border-slate-800 text-slate-100 focus:border-rose-500 focus:outline-none'
        : 'bg-rose-50/40 border border-rose-200 text-slate-800 focus:border-rose-500 focus:bg-white focus:outline-none'
    }`,

  // Standard Button Classes 
  btnPrimary:
    'px-5 py-2.5 rounded-xl text-xs font-semibold text-white bg-gradient-to-r from-rose-500 to-pink-500 hover:from-rose-600 hover:to-pink-600 shadow-sm shadow-rose-500/25 transition-all flex items-center justify-center space-x-1.5 active:scale-95',

  btnSecondary: (darkMode) =>
    `px-4 py-2.5 rounded-xl text-xs font-medium transition-all ${
      darkMode
        ? 'bg-slate-800 text-slate-300 hover:bg-slate-700'
        : 'bg-slate-100 text-slate-700 hover:bg-slate-200 border border-slate-200/80'
    }`,

  // Notes Accent Badges
  noteColor: (color, darkMode) => {
    switch (color) {
      case 'rose':
        return darkMode ? 'bg-rose-950/40 border-rose-900/60' : 'bg-rose-50/90 border-rose-200/80 text-slate-800';
      case 'indigo':
        return darkMode ? 'bg-indigo-950/40 border-indigo-900/60' : 'bg-indigo-50/90 border-indigo-200/80 text-slate-800';
      case 'amber':
        return darkMode ? 'bg-amber-950/40 border-amber-900/60' : 'bg-amber-50/90 border-amber-200/80 text-slate-800';
      case 'emerald':
        return darkMode ? 'bg-emerald-950/40 border-emerald-900/60' : 'bg-emerald-50/90 border-emerald-200/80 text-slate-800';
      default:
        return darkMode ? 'bg-slate-900 border-slate-800' : 'bg-white border-rose-100';
    }
  }
};