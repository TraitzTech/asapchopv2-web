import { useMutation, useQueryClient } from "react-query";
import MainApi from "api-manage/MainApi";
import { onErrorResponse } from "api-manage/api-error-response/ErrorResponses";
import { getToken } from "helper-functions/getToken";
import { service_booking_cancel_api } from "../../../ApiRoutes";

const postData = async ({ booking_id, guest_id, reason }) => {
  const { data } = await MainApi.post(service_booking_cancel_api, {
    booking_id,
    reason,
    ...(!getToken() && guest_id ? { guest_id } : {}),
  });
  return data;
};

export default function useCancelServiceBooking() {
  const queryClient = useQueryClient();
  return useMutation("service-booking-cancel", postData, {
    onSuccess: () => {
      queryClient.invalidateQueries("service-booking-list");
      queryClient.invalidateQueries("service-booking-log");
      queryClient.invalidateQueries("service-booking-details");
    },
    onError: onErrorResponse,
  });
}
