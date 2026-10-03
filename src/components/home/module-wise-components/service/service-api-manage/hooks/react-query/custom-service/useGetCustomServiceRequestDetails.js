import { useQuery } from "react-query";
import MainApi from "api-manage/MainApi";
import { onSingleErrorResponse } from "api-manage/api-error-response/ErrorResponses";
import { service_custom_requests_api } from "../../../ApiRoutes";

const getData = async (id) => {
  const { data } = await MainApi.get(`${service_custom_requests_api}/${id}`);
  // The pages read the request from `.data`.
  return { data };
};

// Accepts `{ id, enabled }` and/or an `enabled` second argument.
export default function useGetCustomServiceRequestDetails(params, enabledArg = true) {
  const id = typeof params === "object" ? params?.id : params;
  const enabled = (typeof params === "object" ? params?.enabled ?? true : true) && enabledArg;
  return useQuery(["service-custom-request", id], () => getData(id), {
    enabled: Boolean(id) && Boolean(enabled),
    onError: onSingleErrorResponse,
  });
}
