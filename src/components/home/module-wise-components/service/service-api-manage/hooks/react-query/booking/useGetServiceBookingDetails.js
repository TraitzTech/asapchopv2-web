import { useQuery } from "react-query";
import MainApi from "api-manage/MainApi";
import { onSingleErrorResponse } from "api-manage/api-error-response/ErrorResponses";
import { getGuestId, getToken } from "helper-functions/getToken";
import { service_booking_details_api } from "../../../ApiRoutes";
import { guestParams, normalizeBooking } from "../../../helpers/bookingAdapter";

const getData = async (id) => {
  const { data } = await MainApi.get(`${service_booking_details_api}/${id}`, {
    params: guestParams(getToken(), getGuestId()),
  });
  return normalizeBooking(data);
};

export default function useGetServiceBookingDetails(id, enabled = true) {
  return useQuery(["service-booking-details", id], () => getData(id), {
    enabled: Boolean(id) && Boolean(enabled),
    onError: onSingleErrorResponse,
  });
}
