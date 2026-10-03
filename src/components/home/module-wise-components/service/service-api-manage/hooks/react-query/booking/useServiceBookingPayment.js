import { useMutation, useQueryClient } from "react-query";
import MainApi from "api-manage/MainApi";
import { service_booking_payment_api } from "../../../ApiRoutes";

const postData = async (payload) => {
  const { data } = await MainApi.post(service_booking_payment_api, payload);
  return data;
};

export default function useServiceBookingPayment() {
  const queryClient = useQueryClient();
  return useMutation("service-booking-payment", postData, {
    onSuccess: () => {
      queryClient.invalidateQueries("service-booking-list");
      queryClient.invalidateQueries("service-booking-log");
      queryClient.invalidateQueries("service-booking-details");
    },
  });
}
