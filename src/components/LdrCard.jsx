import React, { useState } from 'react';
import { calculateDistance, getCoordinates } from '../utils/distance';

export default function LdrCard() {
  const [myLocationInput, setMyLocationInput] = useState('');
  const [partnerLocationInput, setPartnerLocationInput] = useState('');
  const [distance, setDistance] = useState(5950);
  const [myLocationName, setMyLocationName] = useState('Your Location');
  const [partnerLocationName, setPartnerLocationName] = useState('Remote');

  async function handleUpdateLocations(e) {
    e.preventDefault();
    if (!myLocationInput || !partnerLocationInput) return;
    try {
      const myCoords = await getCoordinates(myLocationInput);
      const partnerCoords = await getCoordinates(partnerLocationInput);
      
      const computedDistance = calculateDistance(
        myCoords.lat, myCoords.lon, 
        partnerCoords.lat, partnerCoords.lon
      );
      
      setDistance(computedDistance);
      setMyLocationName(myLocationInput);
      setPartnerLocationName(partnerLocationInput);
    } catch (error) {
      console.error("Could not resolve one or more locations:", error);
    }
  }

  return (
    <div className="bg-[#12141c] border border-white/10 rounded-2xl p-4 text-white flex flex-col gap-4 w-full shadow-lg">
      {/* Top Banner Row matching your UI */}
      <div className="flex items-center justify-between w-full">
        {/* User Info */}
        <div className="flex items-center gap-3">
          <div className="w-12 h-12 rounded-full bg-gray-700 overflow-hidden relative">
            <img src="/path-to-your-avatar.jpg" alt="MoMo" className="w-full h-full object-cover" />
          </div>
          <div>
            <h3 className="font-bold text-lg">MoMo</h3>
            <p className="text-xs text-pink-500 flex items-center gap-1">📍 {myLocationName}</p>
            <p className="text-xs text-red-400">Local Time: 09:14 PM</p>
          </div>
        </div>

        {/* Distance Sync Center */}
        <div className="text-center">
          <span className="text-xs text-pink-400 tracking-wider font-semibold">✨ LDR DISTANCE SYNC ✨</span>
          <h2 className="text-3xl font-extrabold text-pink-500">{distance.toLocaleString()} miles</h2>
          <p className="text-xs text-gray-400">9 Hours Time Difference ⏰</p>
        </div>

        {/* Partner Info */}
        <div className="flex items-center gap-3 text-right">
          <div>
            <h3 className="font-bold text-lg">Partner</h3>
            <p className="text-xs text-pink-500 flex items-center justify-end gap-1">📍 {partnerLocationName}</p>
            <p className="text-xs text-red-400">Local Time: 06:14 AM</p>
          </div>
          <div className="w-12 h-12 rounded-full bg-gray-700 overflow-hidden relative">
            <div className="w-full h-full bg-gray-600 flex items-center justify-center text-xs">150x150</div>
          </div>
        </div>
      </div>

      {/* Input Form Drawer / Bar */}
      <form onSubmit={handleUpdateLocations} className="flex gap-2 pt-3 border-t border-white/10 items-center justify-center">
        <input 
          type="text" 
          placeholder="Your city (e.g. Ottawa)" 
          value={myLocationInput}
          onChange={(e) => setMyLocationInput(e.target.value)}
          className="bg-black/30 border border-white/20 rounded px-3 py-1 text-xs text-white placeholder-gray-400 focus:outline-none focus:border-pink-500"
        />
        <input 
          type="text" 
          placeholder="Partner city (e.g. Brussels)" 
          value={partnerLocationInput}
          onChange={(e) => setPartnerLocationInput(e.target.value)}
          className="bg-black/30 border border-white/20 rounded px-3 py-1 text-xs text-white placeholder-gray-400 focus:outline-none focus:border-pink-500"
        />
        <button 
          type="submit" 
          className="bg-pink-600 hover:bg-pink-500 text-white text-xs font-semibold px-4 py-1.5 rounded transition"
        >
          Update Distance
        </button>
      </form>
    </div>
  );
}