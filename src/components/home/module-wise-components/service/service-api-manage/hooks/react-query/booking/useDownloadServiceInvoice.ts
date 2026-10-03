import { useMutation } from "react-query";
import toast from "react-hot-toast";
import MainApi from "api-manage/MainApi";
import { onErrorResponse } from "api-manage/api-error-response/ErrorResponses";
import { getGuestId, getToken } from "helper-functions/getToken";
import { service_booking_invoice_api } from "../../../ApiRoutes";
import { guestParams } from "../../../helpers/bookingAdapter";

const downloadInvoice = async (id: string | number) => {
  const response = await MainApi.get(`${service_booking_invoice_api}/${id}`, {
    params: guestParams(getToken(), getGuestId()),
    responseType: "blob",
  });
  const contentType = String(response.headers?.["content-type"] ?? "application/pdf");
  const isHtml = contentType.includes("text/html");
  const blob = new Blob([response.data], { type: contentType });
  const url = window.URL.createObjectURL(blob);
  if (isHtml) {
    // No PDF renderer on the server: show the printable invoice instead.
    window.open(url, "_blank");
    return;
  }
  const link = document.createElement("a");
  link.href = url;
  link.download = `booking-${id}.pdf`;
  document.body.appendChild(link);
  link.click();
  link.remove();
  window.URL.revokeObjectURL(url);
};

export default function useDownloadServiceInvoice(..._args: any[]) {
  return useMutation("service-booking-invoice", downloadInvoice, {
    onError: (error: any) => {
      if (error?.response?.data instanceof Blob) {
        toast.error("Unable to download the invoice");
        return;
      }
      onErrorResponse(error);
    },
  });
}
