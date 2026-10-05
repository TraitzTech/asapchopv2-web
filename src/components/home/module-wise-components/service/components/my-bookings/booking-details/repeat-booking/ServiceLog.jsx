import moment from "moment";
import { useRouter } from "next/router";
import { Box, Button, Divider, Stack, Typography } from "@mui/material";
import StatusBadge from "components/common/StatusBadge";

const toBadgeStatus = (status = "") =>
  status === "canceled" ? "cancelled" : status;

const toLabel = (status = "") =>
  status.replaceAll("_", " ").replace(/\b\w/g, (c) => c.toUpperCase());

// Every scheduled occurrence of a repeat booking; each one opens as its own booking.
const ServiceLog = ({ data, parentBookingId, t }) => {
  const router = useRouter();
  const occurrences = data?.repeat ?? [];

  const openOccurrence = (occurrenceId) => {
    router.push({
      pathname: "/profile",
      query: {
        ...router.query,
        page: "my-orders",
        orderId: occurrenceId,
        parentBookingId,
        tab: undefined,
      },
    });
  };

  return (
    <Box sx={{ width: "100%", p: { xs: 0, sm: "0 20px 0 25px" } }}>
      <Typography
        sx={{ fontSize: "16px", fontWeight: 700, mb: 1.5, color: "text.primary" }}
      >
        {t("Booking Schedule")}
      </Typography>
      {occurrences.length === 0 ? (
        <Typography variant="body2" color="text.secondary">
          {t("No bookings found")}
        </Typography>
      ) : (
        <Stack divider={<Divider />} spacing={0}>
          {occurrences.map((occurrence, index) => (
            <Stack
              key={occurrence?.id}
              direction="row"
              alignItems="center"
              justifyContent="space-between"
              gap="12px"
              sx={{ py: "12px" }}
            >
              <Stack spacing="4px" sx={{ minWidth: 0 }}>
                <Typography fontSize="14px" fontWeight="600">
                  {t("Booking")} #{occurrence?.display_id ?? occurrence?.id}
                </Typography>
                <Typography fontSize="12px" color="neutral.500">
                  {occurrence?.schedule_at
                    ? moment(occurrence.schedule_at).format("DD MMM YYYY, hh:mm A")
                    : `${t("Service")} ${index + 1}`}
                </Typography>
              </Stack>
              <Stack direction="row" alignItems="center" gap="10px">
                <StatusBadge
                  status={toBadgeStatus(occurrence?.booking_status)}
                  label={t(toLabel(occurrence?.booking_status))}
                />
                <Button
                  variant="contained"
                  size="small"
                  onClick={() => openOccurrence(occurrence?.id)}
                  sx={{
                    height: "32px",
                    px: "14px",
                    borderRadius: "8px",
                    textTransform: "none",
                    fontSize: "13px",
                    fontWeight: 600,
                    boxShadow: "none",
                    "&:hover": { boxShadow: "none" },
                  }}
                >
                  {t("Details")}
                </Button>
              </Stack>
            </Stack>
          ))}
        </Stack>
      )}
    </Box>
  );
};

export default ServiceLog;
