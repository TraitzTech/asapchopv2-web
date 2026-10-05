// Customer-facing endpoints of the Service module (api/v1/service/*).
export const service_prefix = "/api/v1/service";

export const service_details_api = `${service_prefix}/details`;
export const service_campaign_details_api = `${service_prefix}/campaigns/details`;
export const service_campaigns_api = `${service_prefix}/campaigns`;
export const provider_details_api = `${service_prefix}/providers/details`;
export const provider_services_api = `${service_prefix}/providers/services`;
export const provider_reviews_api = `${service_prefix}/providers/reviews`;
export const provider_list_api = `${service_prefix}/providers/get-providers`;

export const get_service_search_page_data = `${service_prefix}/search`;
export const service_search_suggestion_api = `${service_prefix}/search-suggestion`;
export const service_offers_items_api = `${service_prefix}/offers/items`;

export const service_latest_api = `${service_prefix}/latest`;
export const service_popular_api = `${service_prefix}/popular`;
export const service_top_rated_api = `${service_prefix}/top-rated`;
export const service_recommended_api = `${service_prefix}/recommended`;
export const service_explore_api = `${service_prefix}/explore`;
export const service_quick_emergency_api = `${service_prefix}/quick-emergency-experts`;
export const service_related_api = `${service_prefix}/related`;
export const service_related_provider_api = `${service_prefix}/related-provider-services`;
export const service_reviews_api = `${service_prefix}/reviews`;
export const service_category_services_api = "/api/v1/categories/services";

export const service_booking_tax_api = `${service_prefix}/booking/get-tax`;
export const service_booking_place_api = `${service_prefix}/booking/place`;
export const service_booking_payment_api = `${service_prefix}/booking/payment`;
export const service_booking_list_api = `${service_prefix}/booking/list`;
export const service_booking_details_api = `${service_prefix}/booking/details`;
export const service_booking_track_api = `${service_prefix}/booking/track`;
export const service_booking_invoice_api = `${service_prefix}/booking/invoice`;
export const service_booking_cancel_api = `${service_prefix}/booking/cancel`;
export const service_booking_rebook_api = `${service_prefix}/booking/rebook`;

export const service_review_submit_api = `${service_prefix}/reviews/submit`;

export const service_custom_requests_api = `${service_prefix}/custom-requests`;
export const service_requested_services_api = `${service_prefix}/requested-services`;

// Digital payment callback handled by the Service module.
export const service_booking_payment_callback = "/service-booking-payment";
