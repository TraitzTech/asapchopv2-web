import { useQuery } from "react-query";
import MainApi from "api-manage/MainApi";
import { onSingleErrorResponse } from "api-manage/api-error-response/ErrorResponses";
import { service_recommended_api } from "../../../ApiRoutes";

const getData = async ({ offset = 1, limit = 10 }) => {
  const { data } = await MainApi.get(service_recommended_api, {
    params: { offset, limit },
  });
  return data;
};

export const useGetRecommendedServices = (params = {}, enabled = true) =>
  useQuery(
    ["service-recommended", params?.offset, params?.limit],
    () => getData(params),
    { enabled: Boolean(enabled), onError: onSingleErrorResponse }
  );
