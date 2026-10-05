import { useMutation, useQuery, useQueryClient } from "react-query";
import MainApi from "api-manage/MainApi";
import { categories_api, subCategories_api } from "api-manage/ApiRoutes";
import {
  onErrorResponse,
  onSingleErrorResponse,
} from "api-manage/api-error-response/ErrorResponses";
import {
  service_custom_requests_api,
  service_requested_services_api,
} from "../../../ApiRoutes";

export const REQUEST_PAGE_LIMIT = 10;

const pageParams = (offset) => ({ offset, limit: REQUEST_PAGE_LIMIT });

// Customer's custom (bidding) requests.
export const useGetCustomServiceRequests = ({ offset = 1, status = "all" }, enabled = true) =>
  useQuery(
    ["service-custom-requests", offset, status],
    async () => {
      const { data } = await MainApi.get(service_custom_requests_api, {
        params: { ...pageParams(offset), status },
      });
      return data;
    },
    { enabled, keepPreviousData: true, onError: onSingleErrorResponse }
  );

const useInvalidatingMutation = (key, fn) => {
  const queryClient = useQueryClient();
  return useMutation(key, fn, {
    onSuccess: () => {
      queryClient.invalidateQueries("service-custom-requests");
      queryClient.invalidateQueries("service-custom-request");
    },
    onError: onErrorResponse,
  });
};

export const useCreateCustomServiceRequest = () =>
  useInvalidatingMutation("service-custom-request-create", async (payload) => {
    const { data } = await MainApi.post(service_custom_requests_api, payload);
    return data;
  });

export const useUpdateCustomServiceRequest = () =>
  useInvalidatingMutation("service-custom-request-update", async ({ id, ...payload }) => {
    const { data } = await MainApi.put(`${service_custom_requests_api}/${id}`, payload);
    return data;
  });

export const useCancelCustomServiceRequest = () =>
  useInvalidatingMutation("service-custom-request-cancel", async (id) => {
    const { data } = await MainApi.post(`${service_custom_requests_api}/${id}/cancel`);
    return data;
  });

export const useDeleteCustomServiceRequest = () =>
  useInvalidatingMutation("service-custom-request-delete", async (id) => {
    const { data } = await MainApi.delete(`${service_custom_requests_api}/${id}`);
    return data;
  });

export const useRejectCustomServiceOffer = () =>
  useInvalidatingMutation("service-custom-offer-reject", async ({ requestId, offerId }) => {
    const { data } = await MainApi.post(
      `${service_custom_requests_api}/${requestId}/offers/${offerId}/reject`
    );
    return data;
  });

// Services a customer suggests to the platform.
export const useGetRequestedServices = ({ offset = 1 }, enabled = true) =>
  useQuery(
    ["service-requested-services", offset],
    async () => {
      const { data } = await MainApi.get(service_requested_services_api, {
        params: pageParams(offset),
      });
      return data;
    },
    { enabled, keepPreviousData: true, onError: onSingleErrorResponse }
  );

export const useCreateRequestedService = () => {
  const queryClient = useQueryClient();
  return useMutation(
    "service-requested-service-create",
    async (payload) => {
      const { data } = await MainApi.post(service_requested_services_api, payload);
      return data;
    },
    {
      onSuccess: () => queryClient.invalidateQueries("service-requested-services"),
      onError: onErrorResponse,
    }
  );
};

// Categories (parentId = null) or the sub categories of a category, module-scoped by the API headers.
export const useServiceCategories = (parentId = null, enabled = true) =>
  useQuery(
    ["service-categories", parentId],
    async () => {
      const url = parentId ? `${subCategories_api}/${parentId}` : categories_api;
      const { data } = await MainApi.get(url);
      return Array.isArray(data) ? data : data?.data ?? [];
    },
    { enabled, staleTime: 1000 * 60 * 5, onError: onSingleErrorResponse }
  );
