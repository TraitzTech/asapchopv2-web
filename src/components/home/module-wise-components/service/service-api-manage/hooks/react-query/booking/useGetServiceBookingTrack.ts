import { useQuery } from "react-query";
import MainApi from "api-manage/MainApi";
import { onSingleErrorResponse } from "api-manage/api-error-response/ErrorResponses";
import { getGuestId, getToken } from "helper-functions/getToken";
import { service_booking_track_api } from "../../../ApiRoutes";
import { guestParams, normalizeBooking } from "../../../helpers/bookingAdapter";

interface TrackParams {
  bookingId?: string | number;
  contactNumber?: string;
}

const getData = async ({ bookingId, contactNumber }: TrackParams) => {
  const { data } = await MainApi.get(service_booking_track_api, {
    params: {
      booking_id: bookingId,
      ...(contactNumber ? { contact_number: contactNumber } : {}),
      ...guestParams(getToken(), getGuestId()),
    },
  });
  return normalizeBooking(data);
};

export default function useGetServiceBookingTrack(
  params: TrackParams,
  enabled: boolean = false
) {
  return useQuery(
    ["service-booking-track", params?.bookingId, params?.contactNumber],
    () => getData(params),
    { enabled: Boolean(enabled), retry: false, onError: onSingleErrorResponse }
  );
}
