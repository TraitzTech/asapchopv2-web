import { useState } from "react";
import { Box, Button, Divider, MenuItem, Skeleton, Stack, TextField, Typography } from "@mui/material";
import LoadingButton from "@mui/lab/LoadingButton";
import { useFormik } from "formik";
import moment from "moment";
import toast from "react-hot-toast";
import { useTranslation } from "react-i18next";
import * as Yup from "yup";
import StatusBadge from "components/common/StatusBadge";
import CustomEmptyResult from "components/custom-empty-result";
import CustomModal from "components/modal";
import CustomPagination from "components/custom-pagination";
import nodata from "components/loyalty-points/assets/Search.svg";
import {
  REQUEST_PAGE_LIMIT,
  useCreateRequestedService,
  useGetRequestedServices,
  useServiceCategories,
} from "../../service-api-manage/hooks/react-query/custom-service/useCustomServiceRequests";

const toBadgeStatus = (status = "") =>
  ["denied", "rejected", "canceled"].includes(status) ? "cancelled" : status;

const toLabel = (status = "") =>
  status.replaceAll("_", " ").replace(/\b\w/g, (c) => c.toUpperCase());

const RequestServiceForm = ({ onDone }) => {
  const { t } = useTranslation();
  const { data: categories = [] } = useServiceCategories(null);
  const { mutate, isLoading } = useCreateRequestedService();

  const formik = useFormik({
    initialValues: { name: "", category_id: "", description: "" },
    validationSchema: Yup.object({
      name: Yup.string().trim().required(t("Please enter the service name")),
    }),
    onSubmit: (values) =>
      mutate(
        {
          name: values.name.trim(),
          ...(values.category_id ? { category_id: values.category_id } : {}),
          ...(values.description.trim() ? { description: values.description.trim() } : {}),
        },
        {
          onSuccess: (response) => {
            toast.success(response?.message ?? t("Request submitted successfully"));
            onDone();
          },
        }
      ),
  });

  const fieldSx = { "& .MuiOutlinedInput-root": { borderRadius: "8px" } };

  return (
    <form onSubmit={formik.handleSubmit} noValidate>
      <Stack spacing={2} sx={{ p: { xs: "16px", md: "24px" }, minWidth: { md: "420px" } }}>
        <Stack spacing={0.5}>
          <Typography sx={{ fontSize: "18px", fontWeight: 700 }}>{t("Request a Service")}</Typography>
          <Typography sx={{ fontSize: "13px", color: "text.secondary" }}>
            {t("Can't find a service? Tell us and we will review it.")}
          </Typography>
        </Stack>
        <TextField
          required
          label={t("Service name")}
          value={formik.values.name}
          onChange={(e) => formik.setFieldValue("name", e.target.value)}
          error={Boolean(formik.touched.name && formik.errors.name)}
          helperText={formik.touched.name && formik.errors.name}
          sx={fieldSx}
        />
        <TextField
          select
          label={t("Category")}
          value={formik.values.category_id}
          onChange={(e) => formik.setFieldValue("category_id", e.target.value)}
          sx={fieldSx}
        >
          {categories.map((category) => (
            <MenuItem key={category.id} value={String(category.id)}>
              {category.name}
            </MenuItem>
          ))}
        </TextField>
        <TextField
          multiline
          rows={3}
          label={t("Description")}
          value={formik.values.description}
          onChange={(e) => formik.setFieldValue("description", e.target.value)}
          sx={fieldSx}
        />
        <LoadingButton
          type="submit"
          variant="contained"
          disableElevation
          loading={isLoading}
          sx={{ py: 1.1, borderRadius: "10px", textTransform: "none", fontWeight: 600 }}
        >
          {t("Submit")}
        </LoadingButton>
      </Stack>
    </form>
  );
};

const ServiceRequest = () => {
  const { t } = useTranslation();
  const [offset, setOffset] = useState(1);
  const [open, setOpen] = useState(false);
  const { data, isLoading } = useGetRequestedServices({ offset });
  const requests = data?.data ?? [];

  return (
    <Box sx={{ p: { xs: "16px", md: "24px" }, backgroundColor: { xs: "background.default", md: "background.paper" } }}>
      <Stack direction="row" alignItems="center" justifyContent="space-between" gap={2}>
        <Typography sx={{ fontSize: { xs: "14px", md: "18px" }, fontWeight: 700, color: "neutral.1050", letterSpacing: "-0.54px" }}>
          {t("Requested Services")} ({data?.total_size ?? 0})
        </Typography>
        <Button
          variant="contained"
          disableElevation
          onClick={() => setOpen(true)}
          sx={{ flexShrink: 0, px: 2.5, borderRadius: "10px", textTransform: "none", fontWeight: 600 }}
        >
          {t("Request a Service")}
        </Button>
      </Stack>

      <Stack spacing={3} sx={{ pt: "16px" }}>
        {isLoading ? (
          <Stack spacing={2}>
            {[...Array(4)].map((_, i) => (
              <Skeleton key={i} variant="rounded" height={64} sx={{ borderRadius: "10px" }} />
            ))}
          </Stack>
        ) : requests.length === 0 ? (
          <CustomEmptyResult image={nodata} label="No Requests Found" width="128px" height="128px" />
        ) : (
          <Stack divider={<Divider sx={{ borderColor: { xs: "neutral.200", md: "background.secondary" } }} />} spacing={0}>
            {requests.map((request) => (
              <Stack
                key={request.id}
                direction={{ xs: "column", sm: "row" }}
                alignItems={{ xs: "flex-start", sm: "center" }}
                justifyContent="space-between"
                gap={1.5}
                sx={{ py: { xs: "10px", md: "16px" } }}
              >
                <Stack spacing="6px" sx={{ minWidth: 0 }}>
                  <Typography sx={{ fontSize: { xs: "16px", md: "18px" }, fontWeight: 700, color: "neutral.1050", lineHeight: 1.1 }} noWrap>
                    {request.name}
                  </Typography>
                  <Typography sx={{ fontSize: "13px", color: "neutral.500" }}>
                    {[request.category_name, moment(request.created_at).format("DD MMM YYYY")].filter(Boolean).join(" · ")}
                  </Typography>
                  {request.description && (
                    <Typography sx={{ fontSize: "13px", color: "neutral.500", wordBreak: "break-word" }}>
                      {request.description}
                    </Typography>
                  )}
                  {request.admin_note && (
                    <Typography sx={{ fontSize: "12px", color: "text.secondary" }}>
                      {t("Note")}: {request.admin_note}
                    </Typography>
                  )}
                </Stack>
                <StatusBadge status={toBadgeStatus(request.status)} label={t(toLabel(request.status))} />
              </Stack>
            ))}
          </Stack>
        )}

        {data?.total_size > REQUEST_PAGE_LIMIT && (
          <CustomPagination
            total_size={data.total_size}
            page_limit={REQUEST_PAGE_LIMIT}
            offset={offset}
            setOffset={setOffset}
          />
        )}
      </Stack>

      <CustomModal openModal={open} handleClose={() => setOpen(false)} closeButton>
        <RequestServiceForm onDone={() => setOpen(false)} />
      </CustomModal>
    </Box>
  );
};

export default ServiceRequest;
