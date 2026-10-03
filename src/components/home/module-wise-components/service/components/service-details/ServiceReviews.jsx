import { useState } from "react";
import { alpha, Avatar, Box, LinearProgress, Stack, Typography, useTheme } from "@mui/material";
import moment from "moment";
import { useTranslation } from "react-i18next";
import CustomPagination from "components/custom-pagination";
import CustomEmptyResult from "components/custom-empty-result";
import nodata from "components/loyalty-points/assets/Search.svg";
import useGetServiceReviews, {
  REVIEW_LIMIT,
} from "../../service-api-manage/hooks/react-query/service-reviews/useGetServiceReviews";

const Star = ({ size = 12 }) => (
  <i
    className="fi fi-sr-star"
    style={{ color: "#F5A623", fontSize: `${size}px`, display: "flex", lineHeight: 1 }}
  />
);

const RatingSummary = ({ summary }) => {
  const { t } = useTranslation();
  const theme = useTheme();
  return (
    <Stack
      direction={{ xs: "column", sm: "row" }}
      spacing={{ xs: 2, sm: 4 }}
      alignItems={{ xs: "flex-start", sm: "center" }}
      sx={{
        p: { xs: 2, md: 3 },
        borderRadius: "12px",
        backgroundColor: alpha(theme.palette.neutral[400], 0.08),
      }}
    >
      <Stack alignItems="center" spacing={0.5} sx={{ minWidth: 96 }}>
        <Typography sx={{ fontSize: "36px", fontWeight: 700, lineHeight: 1 }}>
          {Number(summary?.avg_rating ?? 0).toFixed(1)}
        </Typography>
        <Stack direction="row" spacing={0.25}>
          {[1, 2, 3, 4, 5].map((n) => (
            <Star key={n} size={13} />
          ))}
        </Stack>
        <Typography sx={{ fontSize: "12px", color: "text.secondary" }}>
          {summary?.total_reviews ?? 0} {t("Reviews")}
        </Typography>
      </Stack>
      <Stack spacing={0.75} sx={{ flex: 1, width: "100%" }}>
        {(summary?.breakdown ?? []).map((row) => (
          <Stack key={row.star} direction="row" alignItems="center" spacing={1.25}>
            <Typography sx={{ fontSize: "12px", width: 12 }}>{row.star}</Typography>
            <LinearProgress
              variant="determinate"
              value={Number(row.percentage ?? 0)}
              sx={{
                flex: 1,
                height: 6,
                borderRadius: "4px",
                backgroundColor: alpha(theme.palette.neutral[400], 0.2),
                "& .MuiLinearProgress-bar": { backgroundColor: "#F5A623" },
              }}
            />
            <Typography sx={{ fontSize: "12px", width: 28, textAlign: "right", color: "text.secondary" }}>
              {row.count}
            </Typography>
          </Stack>
        ))}
      </Stack>
    </Stack>
  );
};

const ReviewItem = ({ review }) => {
  const { t } = useTranslation();
  return (
    <Stack spacing={1.25}>
      <Stack direction="row" alignItems="flex-start" justifyContent="space-between" spacing={1}>
        <Stack direction="row" spacing={1.25} alignItems="center" minWidth={0}>
          <Avatar
            src={review?.customer?.image_full_url}
            alt={review?.customer_name}
            sx={{ width: 36, height: 36 }}
          />
          <Stack spacing={0.25} minWidth={0}>
            <Typography sx={{ fontWeight: 700, fontSize: { xs: "13px", md: "14px" } }} noWrap>
              {review?.customer_name}
            </Typography>
            <Stack direction="row" alignItems="center" spacing={0.5}>
              <Star />
              <Typography sx={{ fontSize: { xs: "12px", md: "13px" }, fontWeight: 600 }}>
                {Number(review?.rating).toFixed(1)}
              </Typography>
            </Stack>
          </Stack>
        </Stack>
        <Typography sx={{ fontSize: { xs: "11px", md: "12px" }, color: "text.secondary", flexShrink: 0 }}>
          {review?.created_at ? moment(review.created_at).format("DD MMM YYYY") : ""}
        </Typography>
      </Stack>
      {review?.comment && (
        <Typography sx={{ fontSize: { xs: "13px", md: "14px" }, color: "text.primary", wordBreak: "break-word" }}>
          {review.comment}
        </Typography>
      )}
      {Array.isArray(review?.attachment) && review.attachment.length > 0 && (
        <Stack direction="row" spacing={1}>
          {review.attachment.slice(0, 4).map((src, index) => (
            <Box
              key={index}
              component="img"
              src={src}
              alt={`attachment-${index}`}
              sx={{ width: 44, height: 44, borderRadius: "6px", objectFit: "cover" }}
            />
          ))}
        </Stack>
      )}
      {review?.reply && (
        <Box sx={{ ml: { xs: 2, md: 4 }, p: 1.5, borderRadius: "10px", backgroundColor: (theme) => alpha(theme.palette.primary.main, 0.06) }}>
          <Typography sx={{ fontSize: "12px", fontWeight: 700, color: "primary.main", mb: 0.5 }}>
            {t("Provider's reply")}
          </Typography>
          <Typography sx={{ fontSize: "13px" }}>{review.reply}</Typography>
        </Box>
      )}
    </Stack>
  );
};

// Reviews of a service (type="service") or of a provider (type="provider").
const ServiceReviews = ({ type = "service", id }) => {
  const { t } = useTranslation();
  const [offset, setOffset] = useState(1);
  const { data, isLoading } = useGetServiceReviews({ type, id, offset });
  const reviews = data?.reviews ?? [];

  if (isLoading) return null;
  if (!reviews.length) {
    return (
      <CustomEmptyResult image={nodata} label="No Reviews Yet" width="96px" height="96px" />
    );
  }

  return (
    <Stack spacing={2.5}>
      <Typography sx={{ fontSize: { xs: "16px", md: "18px" }, fontWeight: 700 }}>
        {t("Ratings & Reviews")}
      </Typography>
      <RatingSummary summary={data?.rating_summary} />
      <Stack spacing={2.5}>
        {reviews.map((review) => (
          <ReviewItem key={review?.id} review={review} />
        ))}
      </Stack>
      {data?.total_size > REVIEW_LIMIT && (
        <CustomPagination
          total_size={data?.total_size}
          page_limit={REVIEW_LIMIT}
          offset={offset}
          setOffset={setOffset}
        />
      )}
    </Stack>
  );
};

export default ServiceReviews;
