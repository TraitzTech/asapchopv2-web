// Shapes a provider (a store in the Service module) for the shared store cards,
// which read the same keys as a regular store.
export const normalizeServiceStore = (provider = {}) => ({
  ...provider,
  id: provider?.id,
  name: provider?.name,
  slug: provider?.slug,
  module_type: "service",
  logo_full_url: provider?.logo_full_url,
  cover_photo_full_url: provider?.cover_photo_full_url ?? provider?.logo_full_url,
  address: provider?.address,
  avg_rating: Number(provider?.avg_rating ?? 0),
  rating_count: Number(provider?.rating_count ?? 0),
  verified_seller: provider?.verified_seller ?? provider?.verified_provider ?? 0,
  open: provider?.open ?? 1,
  active: provider?.active ?? true,
  distance: provider?.distance ?? null,
  discount: provider?.discount ?? null,
  free_delivery: 0,
});

// Previously used by the offline search stub; live data comes from the API now.
export const MOCK_SERVICES = { all: [] };
export const MOCK_VERIFIED_PROVIDERS = [];
