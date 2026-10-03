// Reads the Service settings exposed by the public /config endpoint
// (`service_module`) and maps them to the flags the web screens use.
export default function useServiceBusinessConfig(
  configData: any,
  overrides?: Record<string, any> | null
): Record<string, any> {
  const service = configData?.service_module ?? {};
  const flag = (key: string) => Boolean(service?.[key]);

  return {
    instantBookingEnabled: flag("instant_booking"),
    scheduleBookingEnabled: flag("schedule_booking"),
    repeatBookingEnabled: flag("repeat_booking"),
    rebookingEnabled: flag("rebooking_option"),
    biddingSystemEnabled: flag("bidding_system"),
    seeOtherProvidersOffers: flag("see_other_providers_offers"),
    otpForCompleteServiceEnabled: flag("otp_for_complete_service"),
    atProviderPlaceEnabled: flag("at_provider_place"),
    reviewSectionEnabled:
      service?.review_section === undefined ? true : flag("review_section"),
    verifiedBadgeEnabled: flag("provider_verified_badge"),
    scheduleTimeRestrictionEnabled: flag("schedule_time_restriction_status"),
    scheduleTimeRestrictionValue: Number(service?.schedule_time_restriction_value ?? 0),
    scheduleTimeRestrictionUnit: service?.schedule_time_restriction_unit ?? "hours",
    postValidationDays: Number(service?.post_validation_days ?? 0),
    ...(overrides ?? {}),
  };
}
