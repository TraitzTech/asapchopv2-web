import {
  Box,
  Button,
  Divider,
  Grid,
  Skeleton,
  Stack,
  Typography,
  useMediaQuery,
  useTheme,
} from "@mui/material";
import moment from "moment";
import { useRouter } from "next/router";
import { useTranslation } from "react-i18next";
import CustomEmptyResult from "components/custom-empty-result";
import CustomPagination from "components/custom-pagination";
import nodata from "components/loyalty-points/assets/Search.svg";
import NextImage from "components/NextImage";
import StatusBadge from "components/common/StatusBadge";
import { CustomPaper } from "components/my-orders/order";
import { getAmountWithSign } from "helper-functions/CardHelpers";
import {
  CustomBoxFullWidth,
  CustomStackFullWidth,
} from "styled-components/CustomStyles.style";

const TAB_ALL = "all";
const TAB_RUNNING = "running";
const TAB_HISTORY = "history";
const BOOKING_PAGE_LIMIT = 10;

const toBadgeStatus = (status = "") =>
  status === "canceled" ? "cancelled" : status;

const toLabel = (status = "") =>
  status.replaceAll("_", " ").replace(/\b\w/g, (c) => c.toUpperCase());

const Shimmer = () => {
  const theme = useTheme();
  const isSmall = useMediaQuery(theme.breakpoints.down("md"));
  return (
    <CustomBoxFullWidth>
      <Grid container spacing={3}>
        {[...Array(4)].map((_, i) => (
          <Grid item xs={12} key={i}>
            <CustomPaper>
              <Stack direction={{ xs: "column", md: "row" }} justifyContent="space-between">
                <Stack direction="row" spacing={1.5} alignItems="center" width="100%">
                  <Skeleton variant="rectangular" width={isSmall ? 100 : 90} height={isSmall ? 100 : 72} />
                  <Stack width="100%" spacing={0.5}>
                    <Skeleton variant="text" width="200px" height={20} />
                    <Skeleton variant="text" width="130px" height={20} />
                    <Skeleton variant="text" width="130px" height={20} />
                  </Stack>
                </Stack>
                {!isSmall && (
                  <Stack direction="row" spacing={1} alignItems="center">
                    <Skeleton variant="text" width="130px" height={40} />
                    <Skeleton variant="text" width="130px" height={60} />
                  </Stack>
                )}
              </Stack>
            </CustomPaper>
          </Grid>
        ))}
      </Grid>
    </CustomBoxFullWidth>
  );
};

const ServiceThumbnails = ({ services = [], size = 36 }) => {
  const theme = useTheme();
  const visible = services.slice(0, 2);
  const overflow = services.length - visible.length;
  return (
    <Stack direction="row" alignItems="center" sx={{ flexShrink: 0 }}>
      {visible.map((service, i) => (
        <Box
          key={service?.id ?? i}
          sx={{
            width: size,
            height: size,
            borderRadius: "50%",
            border: `2px solid ${theme.palette.background.paper}`,
            overflow: "hidden",
            ml: i === 0 ? 0 : `-${size * 0.22}px`,
            flexShrink: 0,
            backgroundColor: "background.secondary",
          }}
        >
          {service?.image_full_url && (
            <NextImage
              src={service.image_full_url}
              alt={service?.name ?? ""}
              width={String(size)}
              height={String(size)}
              objectFit="cover"
            />
          )}
        </Box>
      ))}
      {overflow > 0 && (
        <Box
          sx={{
            width: size,
            height: size,
            borderRadius: "50%",
            backgroundColor: "background.secondary",
            display: "flex",
            alignItems: "center",
            justifyContent: "center",
            ml: `-${size * 0.22}px`,
            flexShrink: 0,
          }}
        >
          <Typography sx={{ fontSize: "13px", fontWeight: 600, color: "neutral.500" }}>
            +{overflow}
          </Typography>
        </Box>
      )}
    </Stack>
  );
};

// One booking row — same grid and typography as the order card.
const BookingCard = ({ booking }) => {
  const { t } = useTranslation();
  const theme = useTheme();
  const router = useRouter();
  const isMobile = useMediaQuery(theme.breakpoints.down("md"));

  // A repeat series shows the occurrence that is currently running.
  const status = booking?.active_booking_status ?? booking?.booking_status ?? "";
  const providerName = booking?.provider?.name ?? "";
  const names = (booking?.services ?? [])
    .slice(0, 3)
    .map((service) => service?.name)
    .filter(Boolean)
    .join(", ");
  const orderTabModule = router.query.orderTabModule;
  const keepOrderTabModule = orderTabModule ? { orderTabModule } : {};

  const goToDetails = () => {
    router.push({
      pathname: "/profile",
      query: { page: "my-orders", orderId: booking?.id, ...keepOrderTabModule },
    });
  };

  const goToTrack = (e) => {
    e?.stopPropagation?.();
    router.push({
      pathname: "/profile",
      query: {
        page: "my-orders",
        orderId: booking?.id,
        tab: "service-log",
        ...keepOrderTabModule,
      },
    });
  };

  const isRunning = ["accepted", "confirmed", "ongoing"].includes(status);

  return (
    <Box
      onClick={goToDetails}
      sx={{
        cursor: "pointer",
        display: "grid",
        gridTemplateColumns: { xs: "1fr 1fr", md: "2fr 2fr 1fr 1fr" },
        gridTemplateAreas: {
          xs: `"col1 col1" "col2 col2" "col3 col4"`,
          md: `"col1 col2 col3 col4"`,
        },
        gap: { xs: "10px", md: "16px" },
        alignItems: "center",
        width: "100%",
      }}
    >
      <Stack spacing={isMobile ? "4px" : "6px"} sx={{ minWidth: 0, gridArea: "col1" }}>
        <Typography
          sx={{
            fontSize: { xs: "16px", md: "18px" },
            fontWeight: 700,
            color: "neutral.1050",
            lineHeight: 1.1,
            letterSpacing: "-0.54px",
            overflow: "hidden",
            textOverflow: "ellipsis",
            whiteSpace: "nowrap",
          }}
        >
          {providerName}
        </Typography>
        <Stack direction="row" alignItems="center" gap="8px" flexWrap="wrap">
          <Typography sx={{ fontSize: "14px", color: "neutral.500", lineHeight: 1.3, whiteSpace: "nowrap" }}>
            {t("Booking")} #{booking?.display_id ?? booking?.id}
          </Typography>
          <StatusBadge status={toBadgeStatus(status)} label={t(toLabel(status))} />
        </Stack>
      </Stack>

      <Stack direction="row" alignItems="center" gap="16px" sx={{ minWidth: 0, gridArea: "col2" }}>
        <ServiceThumbnails services={booking?.services ?? []} size={isMobile ? 28 : 36} />
        <Stack sx={{ minWidth: 0 }} spacing="2px">
          {names && (
            <Typography
              sx={{
                fontSize: { xs: "12px", md: "14px" },
                color: "neutral.500",
                lineHeight: 1.3,
                width: "162px",
                flexShrink: 0,
                display: "-webkit-box",
                WebkitLineClamp: 2,
                WebkitBoxOrient: "vertical",
                overflow: "hidden",
              }}
            >
              {names}
            </Typography>
          )}
          {(booking?.active_schedule_at ?? booking?.schedule_at) && (
            <Typography sx={{ fontSize: "12px", color: "neutral.500" }}>
              {moment(booking?.active_schedule_at ?? booking?.schedule_at).format("DD MMM YYYY, hh:mm A")}
            </Typography>
          )}
        </Stack>
      </Stack>

      <Box
        sx={{
          minWidth: 0,
          gridArea: "col3",
          display: "flex",
          alignItems: "center",
          justifyContent: { xs: "flex-start", md: "flex-end" },
        }}
      >
        <Typography
          sx={{
            fontSize: { xs: "18px", md: "20px" },
            fontWeight: 700,
            color: "neutral.1050",
            lineHeight: 1.1,
            letterSpacing: "-0.6px",
            fontVariantNumeric: "tabular-nums",
          }}
        >
          {getAmountWithSign(booking?.amount?.booking_amount ?? booking?.booking_amount)}
        </Typography>
      </Box>

      <Box sx={{ gridArea: "col4", display: "flex", alignItems: "center", justifyContent: "flex-end" }}>
        <Button
          variant="contained"
          size="small"
          onClick={isRunning ? goToTrack : (e) => { e?.stopPropagation?.(); goToDetails(); }}
          sx={{
            height: "36px",
            px: "16px",
            borderRadius: "8px",
            textTransform: "none",
            fontSize: "14px",
            fontWeight: 600,
            letterSpacing: "-0.42px",
            flexShrink: 0,
            boxShadow: "none",
            "&:hover": { boxShadow: "none" },
          }}
        >
          {isRunning ? t("Track Booking") : t("Details")}
        </Button>
      </Box>
    </Box>
  );
};

const MyBookings = ({
  ordersData,
  isLoadingOrder,
  onFilterTabChange,
  activeFilterTab,
  offset,
  setOffset,
}) => {
  const { t } = useTranslation();
  const bookings = ordersData?.bookings ?? [];

  const groupByDay = (list) => {
    const groups = [];
    const map = new Map();
    list.forEach((booking) => {
      const day = booking?.created_at ? new Date(booking.created_at).toDateString() : "Unknown";
      if (!map.has(day)) {
        map.set(day, []);
        groups.push({ day, bookings: map.get(day) });
      }
      map.get(day).push(booking);
    });
    return groups;
  };

  const formatDayLabel = (dayString) => {
    if (!dayString || dayString === "Unknown") return dayString;
    const date = new Date(dayString);
    const today = new Date();
    const yesterday = new Date();
    yesterday.setDate(today.getDate() - 1);
    if (date.toDateString() === today.toDateString()) return t("Today");
    if (date.toDateString() === yesterday.toDateString()) return t("Yesterday");
    return date.toLocaleDateString(undefined, { day: "numeric", month: "long", year: "numeric" });
  };

  const tabs = [
    { key: TAB_ALL, text: t("All"), count: ordersData?.all_count ?? ordersData?.total_size ?? 0 },
    { key: TAB_RUNNING, text: t("Running"), count: ordersData?.running_count ?? 0 },
    { key: TAB_HISTORY, text: t("History"), count: ordersData?.history_count ?? 0 },
  ].map((tab) => ({ ...tab, label: `${tab.text} (${tab.count})` }));
  const countsLoading = isLoadingOrder && !ordersData;

  return (
    <Box
      sx={{
        p: {
          xs: "16px",
          md: "24px",
          backgroundColor: { xs: "background.default", md: "background.paper" },
        },
      }}
    >
      <Box
        sx={{
          position: "sticky",
          top: 0,
          backgroundColor: { xs: "background.default", md: "background.paper" },
          zIndex: 1,
        }}
      >
        <Stack direction="row" alignItems="center" gap="8px">
          {tabs.map((tab) => {
            const isActive = activeFilterTab === tab.key;
            return (
              <Box
                key={tab.key}
                onClick={() => onFilterTabChange(tab)}
                sx={{
                  px: "16px",
                  height: "40px",
                  display: "flex",
                  alignItems: "center",
                  justifyContent: "center",
                  cursor: "pointer",
                  userSelect: "none",
                  borderBottom: isActive ? "2px solid" : "2px solid transparent",
                  borderColor: isActive ? "primary.main" : "transparent",
                  transition: "border-color 0.15s ease",
                }}
              >
                <Typography
                  component="span"
                  sx={{
                    fontSize: { xs: "14px", md: "18px" },
                    fontWeight: isActive ? 700 : 400,
                    color: isActive ? "primary.main" : "neutral.500",
                    lineHeight: 1.2,
                    letterSpacing: "-0.54px",
                    whiteSpace: "nowrap",
                    fontVariantNumeric: "tabular-nums",
                    display: "inline-flex",
                    alignItems: "center",
                    gap: "4px",
                  }}
                >
                  {tab.text}{" "}
                  {countsLoading ? (
                    <Skeleton variant="text" width={26} sx={{ display: "inline-block" }} />
                  ) : (
                    `(${tab.count})`
                  )}
                </Typography>
              </Box>
            );
          })}
        </Stack>
      </Box>

      <CustomStackFullWidth spacing={3} sx={{ pt: "16px" }}>
        {isLoadingOrder ? (
          <Shimmer />
        ) : bookings.length === 0 ? (
          <CustomEmptyResult image={nodata} label="No Bookings Found" width="128px" height="128px" />
        ) : (
          <Stack spacing={{ xs: "16px", md: "32px" }}>
            {groupByDay(bookings).map(({ day, bookings: dayBookings }) => (
              <Stack key={day} spacing={2}>
                <Stack direction="row" alignItems="center" gap="16px">
                  <Box
                    sx={{
                      flex: 1,
                      height: { xs: "2px", md: "1px" },
                      backgroundColor: { xs: "background.paper", md: "divider" },
                    }}
                  />
                  <Typography
                    sx={{
                      fontSize: { xs: "14px", md: "18px" },
                      fontWeight: 700,
                      color: "neutral.500",
                      lineHeight: 1.1,
                      letterSpacing: "-0.54px",
                      whiteSpace: "nowrap",
                    }}
                  >
                    {formatDayLabel(day)}
                  </Typography>
                  <Box
                    sx={{
                      flex: 1,
                      height: { xs: "2px", md: "1px" },
                      backgroundColor: { xs: "background.paper", md: "divider" },
                    }}
                  />
                </Stack>
                <Stack
                  divider={
                    <Divider sx={{ borderColor: { xs: "neutral.200", md: "background.secondary" } }} />
                  }
                  spacing={0}
                >
                  {dayBookings.map((booking) => (
                    <Box
                      key={booking?.id}
                      sx={{
                        py: { xs: "10px", md: "16px" },
                        px: { xs: "12px", md: 0 },
                        backgroundColor: { xs: "background.default", md: "background.paper" },
                        borderRadius: { xs: "12px", md: 0 },
                      }}
                    >
                      <BookingCard booking={booking} />
                    </Box>
                  ))}
                </Stack>
              </Stack>
            ))}
          </Stack>
        )}

        {ordersData?.total_size > BOOKING_PAGE_LIMIT && (
          <CustomPagination
            total_size={ordersData?.total_size}
            page_limit={ordersData?.limit ?? BOOKING_PAGE_LIMIT}
            offset={offset}
            setOffset={setOffset}
          />
        )}
      </CustomStackFullWidth>
    </Box>
  );
};

export default MyBookings;
