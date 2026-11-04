// src/utils/distance.js

export async function getCoordinates(locationQuery) {
  if (!locationQuery || !locationQuery.trim()) {
    return { lat: null, lon: null };
  }

  try {
    const geoUrl = `https://nominatim.openstreetmap.org/search?format=json&q=${encodeURIComponent(locationQuery)}&limit=1`;
    const res = await fetch(geoUrl, {
      headers: { 'Accept-Language': 'en' }
    });
    const data = await res.json();

    if (data && data.length > 0) {
      return {
        lat: parseFloat(data[0].lat),
        lon: parseFloat(data[0].lon)
      };
    }
  } catch (err) {
    console.error('Geocoding error:', err);
  }

  return { lat: null, lon: null };
}

export function calculateDistance(lat1, lon1, lat2, lon2) {
  if (lat1 === null || lat2 === null || lon1 === null || lon2 === null) return 0;

  const R = 6371; // Earth's radius in kilometers
  const dLat = ((lat2 - lat1) * Math.PI) / 180;
  const dLon = ((lon2 - lon1) * Math.PI) / 180;
  const a =
    Math.sin(dLat / 2) * Math.sin(dLat / 2) +
    Math.cos((lat1 * Math.PI) / 180) *
      Math.cos((lat2 * Math.PI) / 180) *
      Math.sin(dLon / 2) *
      Math.sin(dLon / 2);
  const c = 2 * Math.atan2(Math.sqrt(a), Math.sqrt(1 - a));

  return Math.round(R * c);
}