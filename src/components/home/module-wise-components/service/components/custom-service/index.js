import { useState } from "react";
import { Box, Button, Divider, Skeleton, Stack, Typography } from "@mui/material";
import moment from "moment";
import { useRouter } from "next/router";
import { useTranslation } from "react-i18next";
import StatusBadge from "components/common/StatusBadge";
import CustomEmptyResult from "components/custom-empty-result";
import CustomPagination from "components/custom-pagination";
import nodata from "components/loyalty-points/assets/Search.svg";
import { getAmountWithSign } from "helper-functions/CardHelpers";
import {
  REQUEST_PAGE_LIMIT,
  useGetCustomServiceRequests,
} from "../../service-api-manage/hooks/react-query/custom-service/useCustomServiceRequests";

const TABS = [
  { key: "all", label: "All" },
  { key: "pending", label: "Pending" },
  { key: "accepted", label: "Accepted" },
  { key: "canceled", label: "Canceled" },
];

const toBadgeStatus = (status = "") =>
  status === "canceled" || status === "expired" ? "cancelled" : status;

const toLabel = (status = "") =>
  status.replaceAll("_", " ").replace(/\b\w/g, (c) => c.toUpperCase());

export const RequestCard = ({ request }) => {
  const { t } = useTranslation();
  const router = useRouter();
  const open = () =>
    router.push({ pathname: `/service/custom-service/details/${request.id}` });

  return (
    <Box
      onClick={open}
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
      <Stack spacing={{ xs: "4px", md: "6px" }} sx={{ minWidth: 0, gridArea: "col1" }}>
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
          {request.sub_category_name || request.category_name || t("Custom Service")}
        </Typography>
        <Stack direction="row" alignItems="center" gap="8px" flexWrap="wrap">
          <Typography sx={{ fontSize: "14px", color: "neutral.500", whiteSpace: "nowrap" }}>
            {t("Request")} #{request.id}
          </Typography>
          <StatusBadge status={toBadgeStatus(request.status)} label={t(toLabel(request.status))} />
        </Stack>
      </Stack>

      <Stack spacing="2px" sx={{ minWidth: 0, gridArea: "col2" }}>
        <Typography
          sx={{
            fontSize: { xs: "12px", md: "14px" },
            color: "neutral.500",
            lineHeight: 1.3,
            display: "-webkit-box",
            WebkitLineClamp: 2,
            WebkitBoxOrient: "vertical",
            overflow: "hidden",
          }}
        >
          {request.description}
        </Typography>
        {request.booking_date && (
          <Typography sx={{ fontSize: "12px", color: "neutral.500" }}>
            {moment(request.booking_date).format("DD MMM YYYY")}
          </Typography>
        )}
      </Stack>

      <Box sx={{ gridArea: "col3", display: "flex", justifyContent: { xs: "flex-start", md: "flex-end" } }}>
        <Stack alignItems={{ xs: "flex-start", md: "flex-end" }}>
          <Typography sx={{ fontSize: { xs: "18px", md: "20px" }, fontWeight: 700, color: "neutral.1050" }}>
            {request.bid_count ?? 0}
          </Typography>
          <Typography sx={{ fontSize: "12px", color: "neutral.500" }}>{t("Offers")}</Typography>
          {Number(request.price) > 0 && (
            <Typography sx={{ fontSize: "12px", color: "neutral.500" }}>
              {t("Budget")}: {getAmountWithSign(request.price)}
            </Typography>
          )}
        </Stack>
      </Box>

      <Box sx={{ gridArea: "col4", display: "flex", alignItems: "center", justifyContent: "flex-end" }}>
        <Button
          variant="contained"
          size="small"
          onClick={(e) => {
            e.stopPropagation();
            open();
          }}
          sx={{
            height: "36px",
            px: "16px",
            borderRadius: "8px",
            textTransform: "none",
            fontSize: "14px",
            fontWeight: 600,
            letterSpacing: "-0.42px",
            boxShadow: "none",
            "&:hover": { boxShadow: "none" },
          }}
        >
          {t("Details")}
        </Button>
      </Box>
    </Box>
  );
};

const CustomService = () => {
  const { t } = useTranslation();
  const router = useRouter();
  const [tab, setTab] = useState("all");
  const [offset, setOffset] = useState(1);
  const { data, isLoading } = useGetCustomServiceRequests({ offset, status: tab });
  const requests = data?.data ?? [];

  return (
    <Box sx={{ p: { xs: "16px", md: "24px" }, backgroundColor: { xs: "background.default", md: "background.paper" } }}>
      <Stack direction="row" alignItems="center" justifyContent="space-between" gap={2}>
        <Stack direction="row" alignItems="center" gap="8px" sx={{ overflowX: "auto" }}>
          {TABS.map((item) => {
            const active = tab === item.key;
            return (
              <Box
                key={item.key}
                onClick={() => {
                  setTab(item.key);
                  setOffset(1);
                }}
                sx={{
                  px: "16px",
                  height: "40px",
                  display: "flex",
                  alignItems: "center",
                  cursor: "pointer",
                  userSelect: "none",
                  borderBottom: "2px solid",
                  borderColor: active ? "primary.main" : "transparent",
                }}
              >
                <Typography
                  sx={{
                    fontSize: { xs: "14px", md: "18px" },
                    fontWeight: active ? 700 : 400,
                    color: active ? "primary.main" : "neutral.500",
                    letterSpacing: "-0.54px",
                    whiteSpace: "nowrap",
                  }}
                >
                  {t(item.label)}
                </Typography>
              </Box>
            );
          })}
        </Stack>
        <Button
          variant="contained"
          disableElevation
          onClick={() => router.push("/service/custom-service/create")}
          sx={{ flexShrink: 0, px: 2.5, borderRadius: "10px", textTransform: "none", fontWeight: 600 }}
        >
          {t("New Request")}
        </Button>
      </Stack>

      <Stack spacing={3} sx={{ pt: "16px" }}>
        {isLoading ? (
          <Stack spacing={2}>
            {[...Array(4)].map((_, i) => (
              <Skeleton key={i} variant="rounded" height={72} sx={{ borderRadius: "10px" }} />
            ))}
          </Stack>
        ) : requests.length === 0 ? (
          <CustomEmptyResult image={nodata} label="No Requests Found" width="128px" height="128px" />
        ) : (
          <Stack divider={<Divider sx={{ borderColor: { xs: "neutral.200", md: "background.secondary" } }} />} spacing={0}>
            {requests.map((request) => (
              <Box key={request.id} sx={{ py: { xs: "10px", md: "16px" } }}>
                <RequestCard request={request} />
              </Box>
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
    </Box>
  );
};

export default CustomService;
