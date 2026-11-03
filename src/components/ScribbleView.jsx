import React, { useState, useEffect, useRef } from 'react';
import { Edit3, Eraser, Undo, Trash2, Send } from 'lucide-react';
import { themeClasses } from '../theme';

export default function ScribbleView({ addActivity, darkMode }) {
  const canvasRef = useRef(null);
  const [isDrawing, setIsDrawing] = useState(false);
  const [color, setColor] = useState('#f43f5e');
  const [brushSize, setBrushSize] = useState(4);
  const [tool, setTool] = useState('pen');
  const [drawHistory, setDrawHistory] = useState([]);

  useEffect(() => {
    const canvas = canvasRef.current;
    if (!canvas) return;
    const ctx = canvas.getContext('2d');
    const rect = canvas.parentElement.getBoundingClientRect();
    canvas.width = rect.width;
    canvas.height = 420;

    ctx.fillStyle = darkMode ? '#0f172a' : '#ffffff';
    ctx.fillRect(0, 0, canvas.width, canvas.height);
    setDrawHistory([ctx.getImageData(0, 0, canvas.width, canvas.height)]);
  }, [darkMode]);

  const startDrawing = (e) => {
    const canvas = canvasRef.current;
    const ctx = canvas.getContext('2d');
    const rect = canvas.getBoundingClientRect();
    const clientX = e.touches ? e.touches[0].clientX : e.clientX;
    const clientY = e.touches ? e.touches[0].clientY : e.clientY;

    ctx.beginPath();
    ctx.moveTo(clientX - rect.left, clientY - rect.top);
    setIsDrawing(true);
  };

  const draw = (e) => {
    if (!isDrawing) return;
    const canvas = canvasRef.current;
    const ctx = canvas.getContext('2d');
    const rect = canvas.getBoundingClientRect();
    const clientX = e.touches ? e.touches[0].clientX : e.clientX;
    const clientY = e.touches ? e.touches[0].clientY : e.clientY;

    ctx.lineTo(clientX - rect.left, clientY - rect.top);
    ctx.strokeStyle = tool === 'eraser' ? (darkMode ? '#0f172a' : '#ffffff') : color;
    ctx.lineWidth = tool === 'eraser' ? brushSize * 4 : brushSize;
    ctx.lineCap = 'round';
    ctx.lineJoin = 'round';
    ctx.stroke();
  };

  const stopDrawing = () => {
    if (!isDrawing) return;
    setIsDrawing(false);
    const canvas = canvasRef.current;
    const ctx = canvas.getContext('2d');
    setDrawHistory(prev => [...prev, ctx.getImageData(0, 0, canvas.width, canvas.height)]);
  };

  const clearCanvas = () => {
    const canvas = canvasRef.current;
    const ctx = canvas.getContext('2d');
    ctx.fillStyle = darkMode ? '#0f172a' : '#ffffff';
    ctx.fillRect(0, 0, canvas.width, canvas.height);
    setDrawHistory([ctx.getImageData(0, 0, canvas.width, canvas.height)]);
  };

  const handleUndo = () => {
    if (drawHistory.length <= 1) return;
    const canvas = canvasRef.current;
    const ctx = canvas.getContext('2d');
    const newHistory = drawHistory.slice(0, -1);
    ctx.putImageData(newHistory[newHistory.length - 1], 0, 0);
    setDrawHistory(newHistory);
  };

  const handleShareScribble = () => {
    addActivity('Shared a handmade love doodle on the Scribble Pad 💕', '🎨');
    alert('Scribble note synced with your partner!');
  };

  return (
    <div className="space-y-6">
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <h2 className="text-2xl font-bold">Interactive Scribble & Love Notes</h2>
          <p className="text-xs text-slate-500 dark:text-slate-400">Doodle notes on each other's screen.</p>
        </div>
        <button onClick={handleShareScribble} className="flex items-center space-x-2 px-4 py-2.5 rounded-xl bg-gradient-to-r from-rose-500 to-pink-500 text-white font-medium text-sm shadow-md">
          <Send className="w-4 h-4" />
          <span>Send Scribble to Partner</span>
        </button>
      </div>

      <div className={themeClasses.card(darkMode) + ' space-y-4'}>
        <div className="flex flex-wrap items-center justify-between gap-4 pb-4 border-b border-slate-200 dark:border-slate-800">
          <div className="flex items-center space-x-2">
            <button onClick={() => setTool('pen')} className={`p-2 rounded-xl text-xs font-medium transition-all ${tool === 'pen' ? 'bg-rose-500 text-white shadow-sm' : 'bg-slate-100 dark:bg-slate-800 text-slate-600 dark:text-slate-400'}`}>
              <Edit3 className="w-4 h-4" />
            </button>
            <button onClick={() => setTool('eraser')} className={`p-2 rounded-xl text-xs font-medium transition-all ${tool === 'eraser' ? 'bg-rose-500 text-white shadow-sm' : 'bg-slate-100 dark:bg-slate-800 text-slate-600 dark:text-slate-400'}`}>
              <Eraser className="w-4 h-4" />
            </button>
          </div>
          <div className="flex items-center space-x-2">
            {['#f43f5e', '#ec4899', '#8b5cf6', '#3b82f6', '#10b981', '#f59e0b', '#000000'].map((c) => (
              <button key={c} onClick={() => { setColor(c); setTool('pen'); }} className={`w-6 h-6 rounded-full ring-2 transition-transform ${color === c && tool === 'pen' ? 'scale-125 ring-slate-800 dark:ring-white' : 'ring-transparent'}`} style={{ backgroundColor: c }} />
            ))}
          </div>
          <div className="flex items-center space-x-2">
            <span className="text-xs text-slate-400">Size:</span>
            <input type="range" min="1" max="12" value={brushSize} onChange={(e) => setBrushSize(Number(e.target.value))} className="w-24 accent-rose-500" />
          </div>
          <div className="flex items-center space-x-2">
            <button onClick={handleUndo} disabled={drawHistory.length <= 1} className="p-2 rounded-xl bg-slate-100 dark:bg-slate-800 text-slate-600 dark:text-slate-300 disabled:opacity-40">
              <Undo className="w-4 h-4" />
            </button>
            <button onClick={clearCanvas} className="p-2 rounded-xl bg-slate-100 dark:bg-slate-800 text-rose-500 hover:bg-rose-50 dark:hover:bg-slate-700">
              <Trash2 className="w-4 h-4" />
            </button>
          </div>
        </div>

        <div className="relative overflow-hidden rounded-2xl border border-slate-200 dark:border-slate-800 shadow-inner cursor-crosshair">
          <canvas ref={canvasRef} onMouseDown={startDrawing} onMouseMove={draw} onMouseUp={stopDrawing} onMouseLeave={stopDrawing} onTouchStart={startDrawing} onTouchMove={draw} onTouchEnd={stopDrawing} className="w-full touch-none block" />
        </div>
      </div>
    </div>
  );
}