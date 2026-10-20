// Universal Google Maps links open the app when available, otherwise the browser.
export function shopLocation(settings) {
  const location = settings?.mapLocation;
  const hasCoordinates =
    Number.isFinite(location?.latitude) && Number.isFinite(location?.longitude);
  const query = hasCoordinates
    ? `${location.latitude},${location.longitude}`
    : settings?.address?.trim();
  return {
    embedUrl: query
      ? `https://www.google.com/maps?q=${encodeURIComponent(query)}&z=16&output=embed`
      : '',
    openUrl: query
      ? `https://www.google.com/maps/search/?api=1&query=${encodeURIComponent(query)}`
      : settings?.mapsUrl || '',
    directionsUrl: query
      ? `https://www.google.com/maps/dir/?api=1&destination=${encodeURIComponent(query)}`
      : settings?.mapsUrl || '',
  };
}
