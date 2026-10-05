/**
 * Delivery location handed over by the Asapchop landing page.
 *
 * The landing page (asapchop.com) resolves the customer's address and delivery
 * zone, then opens /home?module=<module>&lat=..&lng=..&address=..&zoneid=[..].
 * These helpers store that location exactly like the in-app location picker
 * does (HeroLocationForm), so the customer lands straight on the ordering home.
 */

const LOCATION_PARAMS = ["lat", "lng", "address", "zoneid"];

export const readLocationFromUrl = () => {
  if (typeof window === "undefined") return null;
  const params = new URLSearchParams(window.location.search);
  const lat = parseFloat(params.get("lat"));
  const lng = parseFloat(params.get("lng"));
  const zoneid = params.get("zoneid");
  if (!Number.isFinite(lat) || !Number.isFinite(lng) || !zoneid) return null;
  try {
    const ids = JSON.parse(zoneid);
    if (!Array.isArray(ids) || !ids.length || !ids.every(Number.isInteger)) {
      return null;
    }
  } catch {
    return null;
  }
  return {
    lat,
    lng,
    zoneid,
    address: params.get("address") || `${lat}, ${lng}`,
  };
};

export const storeLocation = (location) => {
  if (!location || typeof window === "undefined") return;
  try {
    localStorage.setItem("zoneid", location.zoneid);
    localStorage.setItem("location", location.address);
    localStorage.setItem(
      "currentLatLng",
      JSON.stringify({ lat: location.lat, lng: location.lng })
    );
  } catch {
    // Storage unavailable (private mode): the app falls back to asking for a location.
  }
};

/** The current URL without the location params (module and others are kept). */
export const urlWithoutLocationParams = () => {
  const url = new URL(window.location.href);
  LOCATION_PARAMS.forEach((key) => url.searchParams.delete(key));
  return url.pathname + url.search + url.hash;
};
