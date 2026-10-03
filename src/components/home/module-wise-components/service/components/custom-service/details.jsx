import { useState } from "react";
import {
  alpha,
  Avatar,
  Box,
  Button,
  Grid,
  Skeleton,
  Stack,
  Typography,
  useTheme,
} from "@mui/material";
import moment from "moment";
import { useRouter } from "next/router";
import toast from "react-hot-toast";
import { useTranslation } from "react-i18next";
import StatusBadge from "components/common/StatusBadge";
import CustomContainer from "components/container";
import CustomEmptyResult from "components/custom-empty-result";
import CustomModal from "components/modal";
import nodata from "components/loyalty-points/assets/Search.svg";
import CustomRatings from "components/search/CustomRatings";
import { getAmountWithSign } from "helper-functions/CardHelpers";
import { CustomPaperBigCard } from "styled-components/CustomStyles.style";
import useServiceBusinessConfig from "../../service-api-manage/hooks/custom-hooks/useServiceBusinessConfig";
import useGetCustomServiceRequestDetails from "../../service-api-manage/hooks/react-query/custom-service/useGetCustomServiceRequestDetails";
import {
  useCancelCustomServiceRequest,
  useDeleteCustomServiceRequest,
  useRejectCustomServiceOffer,
} from "../../service-api-manage/hooks/react-query/custom-service/useCustomServiceRequests";

const toBadgeStatus = (status = "") =>
  status === "canceled" || status === "expired" ? "cancelled" : status;

const toLabel = (status = "") =>
  status.replaceAll("_", " ").replace(/\b\w/g, (c) => c.toUpperCase());

const InfoRow = ({ label, value }) =>
  value ? (
    <Stack spacing={0.25}>
      <Typography sx={{ fontSize: "12px", color: "text.secondary" }}>{label}</Typography>
      <Typography sx={{ fontSize: "14px", fontWeight: 500, wordBreak: "break-word" }}>{value}</Typography>
    </Stack>
  ) : null;

const OfferCard = ({ offer, canAct, onBook, onReject, loading }) => {
  const { t } = useTranslation();
  const theme = useTheme();
  const provider = offer?.provider;
  return (
    <Stack
      direction={{ xs: "column", sm: "row" }}
      alignItems={{ xs: "flex-start", sm: "center" }}
      justifyContent="space-between"
      gap={2}
      sx={{
        p: 2,
        borderRadius: "12px",
        border: `1px solid ${
          offer.is_selected ? alpha(theme.palette.primary.main, 0.5) : alpha(theme.palette.neutral[400], 0.25)
        }`,
        backgroundColor: offer.is_selected ? alpha(theme.palette.primary.main, 0.05) : "background.paper",
      }}
    >
      <Stack direction="row" spacing={1.5} alignItems="center" sx={{ minWidth: 0 }}>
        <Avatar src={provider?.logo_full_url} alt={provider?.name} variant="rounded" sx={{ width: 56, height: 56, borderRadius: "10px" }} />
        <Stack spacing={0.25} sx={{ minWidth: 0 }}>
          <Typography sx={{ fontSize: "15px", fontWeight: 700 }} noWrap>
            {provider?.name}
          </Typography>
          {Number(provider?.avg_rating) > 0 && (
            <Stack direction="row" alignItems="center" spacing={0.75}>
              <CustomRatings readOnly="true" ratingValue={Number(provider.avg_rating)} color={theme.palette.warning.new} />
              <Typography sx={{ fontSize: "12px", color: "text.secondary" }}>
                ({provider.review_count})
              </Typography>
            </Stack>
          )}
          {offer.note && (
            <Typography sx={{ fontSize: "13px", color: "text.secondary", wordBreak: "break-word" }}>
              {offer.note}
            </Typography>
          )}
        </Stack>
      </Stack>

      <Stack alignItems={{ xs: "flex-start", sm: "flex-end" }} spacing={1} sx={{ flexShrink: 0 }}>
        <Typography sx={{ fontSize: "20px", fontWeight: 700, color: "primary.main" }}>
          {getAmountWithSign(offer.offer_price)}
        </Typography>
        {offer.is_selected && <StatusBadge status="accepted" label={t("Selected")} />}
        {offer.is_rejected && <StatusBadge status="cancelled" label={t("Rejected")} />}
        {canAct && !offer.is_rejected && !offer.is_selected && (
          <Stack direction="row" spacing={1}>
            <Button
              size="small"
              disabled={loading}
              onClick={() => onReject(offer)}
              sx={{ textTransform: "none", fontWeight: 600, borderRadius: "8px" }}
            >
              {t("Reject")}
            </Button>
            <Button
              size="small"
              variant="contained"
              disableElevation
              onClick={() => onBook(offer)}
              sx={{ textTransform: "none", fontWeight: 600, borderRadius: "8px", px: 2 }}
            >
              {t("Book Now")}
            </Button>
          </Stack>
        )}
      </Stack>
    </Stack>
  );
};

const CustomServiceDetails = ({ configData, serviceId }) => {
  const { t } = useTranslation();
  const router = useRouter();
  const { biddingSystemEnabled } = useServiceBusinessConfig(configData, null);
  const { data: response, isLoading } = useGetCustomServiceRequestDetails({ id: serviceId });
  const request = response?.data;
  const [confirm, setConfirm] = useState(null);

  const { mutate: cancelMutate, isLoading: isCanceling } = useCancelCustomServiceRequest();
  const { mutate: deleteMutate, isLoading: isDeleting } = useDeleteCustomServiceRequest();
  const { mutate: rejectMutate, isLoading: isRejecting } = useRejectCustomServiceOffer();

  const isPending = request?.status === "pending";
  const offers = request?.bids ?? [];

  const bookOffer = (offer) =>
    router.push({
      pathname: "/service/checkout/custom-service",
      query: { reqServiceId: request.id, bid_id: offer.id },
    });

  const runConfirm = () => {
    const done = (message) => (response) => {
      toast.success(response?.message ?? message);
      setConfirm(null);
      if (confirm?.type === "delete") router.push({ pathname: "/profile", query: { page: "custom-service" } });
    };
    if (confirm?.type === "cancel") cancelMutate(request.id, { onSuccess: done(t("Request canceled")) });
    if (confirm?.type === "delete") deleteMutate(request.id, { onSuccess: done(t("Request deleted")) });
    if (confirm?.type === "reject") {
      rejectMutate({ requestId: request.id, offerId: confirm.offer.id }, { onSuccess: done(t("Offer rejected")) });
    }
  };

  const confirmTitle = {
    cancel: t("Cancel this request?"),
    delete: t("Delete this request?"),
    reject: t("Reject this offer?"),
  }[confirm?.type];

  return (
    <CustomContainer>
      <Box sx={{ pt: { xs: "1.5rem", md: "2.5rem" }, pb: "3rem" }}>
        <Stack direction="row" alignItems="center" justifyContent="space-between" gap={2} sx={{ mb: 2 }}>
          <Typography variant="h5" fontWeight="600">
            {t("Custom Request Details")}
          </Typography>
          <Button
            onClick={() => router.push({ pathname: "/profile", query: { page: "custom-service" } })}
            sx={{ textTransform: "none", fontWeight: 600 }}
          >
            {t("Back to requests")}
          </Button>
        </Stack>

        {isLoading ? (
          <Stack spacing={2}>
            <Skeleton variant="rounded" height={180} sx={{ borderRadius: "12px" }} />
            <Skeleton variant="rounded" height={120} sx={{ borderRadius: "12px" }} />
          </Stack>
        ) : !request ? (
          <CustomEmptyResult image={nodata} label="Request not found" width="128px" height="128px" />
        ) : (
          <Grid container spacing={3}>
            <Grid item xs={12} md={5}>
              <CustomPaperBigCard sx={{ padding: { xs: "1rem", md: "1.5rem" } }}>
                <Stack spacing={2}>
                  <Stack direction="row" alignItems="center" justifyContent="space-between" gap={1}>
                    <Typography sx={{ fontSize: "18px", fontWeight: 700 }}>
                      {request.sub_category_name || request.category_name || t("Custom Service")}
                    </Typography>
                    <StatusBadge status={toBadgeStatus(request.status)} label={t(toLabel(request.status))} />
                  </Stack>
                  <InfoRow label={t("Request ID")} value={`#${request.id}`} />
                  <InfoRow label={t("Category")} value={request.category_name} />
                  <InfoRow label={t("Description")} value={request.description} />
                  <InfoRow
                    label={t("Service date & time")}
                    value={
                      request.booking_date
                        ? `${moment(request.booking_date).format("DD MMM YYYY")}${
                            request.booking_time ? `, ${moment(request.booking_time, "HH:mm").format("hh:mm A")}` : ""
                          }`
                        : null
                    }
                  />
                  <InfoRow label={t("Address")} value={request.customer_information?.address} />
                  {Number(request.price) > 0 && (
                    <InfoRow label={t("Your budget")} value={getAmountWithSign(request.price)} />
                  )}
                  {request.expires_at && isPending && (
                    <InfoRow label={t("Offers accepted until")} value={moment(request.expires_at).format("DD MMM YYYY")} />
                  )}

                  <Stack direction="row" spacing={1} flexWrap="wrap" useFlexGap>
                    {isPending && (
                      <>
                        <Button
                          variant="outlined"
                          onClick={() => router.push(`/service/custom-service/edit/${request.id}`)}
                          sx={{ textTransform: "none", fontWeight: 600, borderRadius: "8px" }}
                        >
                          {t("Edit")}
                        </Button>
                        <Button
                          color="error"
                          variant="outlined"
                          onClick={() => setConfirm({ type: "cancel" })}
                          sx={{ textTransform: "none", fontWeight: 600, borderRadius: "8px" }}
                        >
                          {t("Cancel Request")}
                        </Button>
                      </>
                    )}
                    {request.booking_id ? (
                      <Button
                        variant="contained"
                        disableElevation
                        onClick={() =>
                          router.push({ pathname: "/profile", query: { page: "my-orders", orderId: request.booking_id } })
                        }
                        sx={{ textTransform: "none", fontWeight: 600, borderRadius: "8px" }}
                      >
                        {t("View Booking")}
                      </Button>
                    ) : (
                      !isPending && (
                        <Button
                          color="error"
                          onClick={() => setConfirm({ type: "delete" })}
                          sx={{ textTransform: "none", fontWeight: 600 }}
                        >
                          {t("Delete")}
                        </Button>
                      )
                    )}
                  </Stack>
                </Stack>
              </CustomPaperBigCard>
            </Grid>

            <Grid item xs={12} md={7}>
              <Stack spacing={1.5}>
                <Typography sx={{ fontSize: "18px", fontWeight: 700 }}>
                  {t("Offers")} ({offers.length})
                </Typography>
                {offers.length === 0 ? (
                  <CustomPaperBigCard sx={{ padding: "1.5rem" }}>
                    <Typography sx={{ fontSize: "14px", color: "text.secondary", textAlign: "center" }}>
                      {isPending
                        ? t("No offers yet. Providers will send their offers soon.")
                        : t("There are no offers for this request.")}
                    </Typography>
                  </CustomPaperBigCard>
                ) : (
                  offers.map((offer) => (
                    <OfferCard
                      key={offer.id}
                      offer={offer}
                      canAct={isPending && biddingSystemEnabled !== false}
                      loading={isRejecting}
                      onBook={bookOffer}
                      onReject={(item) => setConfirm({ type: "reject", offer: item })}
                    />
                  ))
                )}
              </Stack>
            </Grid>
          </Grid>
        )}
      </Box>

      <CustomModal openModal={Boolean(confirm)} handleClose={() => setConfirm(null)} closeButton>
        <Stack spacing={2} sx={{ p: { xs: "16px", md: "24px" }, minWidth: { md: "380px" } }}>
          <Typography sx={{ fontSize: "18px", fontWeight: 700 }}>{confirmTitle}</Typography>
          <Stack direction="row" spacing={1.5} justifyContent="flex-end">
            <Button onClick={() => setConfirm(null)} sx={{ textTransform: "none", fontWeight: 600 }}>
              {t("No")}
            </Button>
            <Button
              variant="contained"
              disableElevation
              color="error"
              disabled={isCanceling || isDeleting || isRejecting}
              onClick={runConfirm}
              sx={{ textTransform: "none", fontWeight: 600, borderRadius: "8px", px: 3 }}
            >
              {t("Yes")}
            </Button>
          </Stack>
        </Stack>
      </CustomModal>
    </CustomContainer>
  );
};

export default CustomServiceDetails;
