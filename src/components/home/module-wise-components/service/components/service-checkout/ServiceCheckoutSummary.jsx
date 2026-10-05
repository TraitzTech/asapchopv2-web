import { useState } from "react";
import {
  alpha,
  Box,
  Button,
  Skeleton,
  Stack,
  TextField,
  Typography,
  useTheme,
} from "@mui/material";
import { useTranslation } from "react-i18next";
import CustomImageContainer from "components/CustomImageContainer";
import { getAmountWithSign } from "helper-functions/CardHelpers";

const Row = ({ label, value, bold = false, muted = false }) => (
  <Stack direction="row" alignItems="center" justifyContent="space-between" spacing={2}>
    <Typography sx={{ fontSize: "14px", fontWeight: bold ? 700 : 400, color: muted ? "text.secondary" : "text.primary" }}>
      {label}
    </Typography>
    <Typography sx={{ fontSize: "14px", fontWeight: bold ? 700 : 400 }}>{value}</Typography>
  </Stack>
);

const CouponBox = ({ couponCode, couponError, loading, onApply, onRemove }) => {
  const { t } = useTranslation();
  const theme = useTheme();
  const [code, setCode] = useState("");

  if (couponCode) {
    return (
      <Stack
        direction="row"
        alignItems="center"
        justifyContent="space-between"
        sx={{
          px: 1.5,
          py: 1,
          borderRadius: "10px",
          backgroundColor: alpha(theme.palette.success.main, 0.1),
        }}
      >
        <Typography sx={{ fontSize: "13px", fontWeight: 600, color: "success.main" }}>
          {t("Coupon applied")}: {couponCode}
        </Typography>
        <Button size="small" onClick={onRemove} sx={{ textTransform: "none", fontWeight: 600 }}>
          {t("Remove")}
        </Button>
      </Stack>
    );
  }

  return (
    <Stack spacing={0.75}>
      <Stack direction="row" spacing={1}>
        <TextField
          size="small"
          fullWidth
          placeholder={t("Have a coupon?")}
          value={code}
          onChange={(e) => setCode(e.target.value)}
          sx={{ "& .MuiOutlinedInput-root": { borderRadius: "8px" } }}
        />
        <Button
          variant="contained"
          disableElevation
          disabled={!code.trim() || loading}
          onClick={() => onApply(code.trim())}
          sx={{ px: 2.5, borderRadius: "8px", textTransform: "none", fontWeight: 600 }}
        >
          {t("Apply")}
        </Button>
      </Stack>
      {couponError && (
        <Typography sx={{ fontSize: "12px", color: "error.main" }}>{couponError}</Typography>
      )}
    </Stack>
  );
};

const ServiceCheckoutSummary = ({
  lines = [],
  pricing,
  isPricingLoading,
  couponCode,
  couponError,
  showCoupon = true,
  onApplyCoupon,
  onRemoveCoupon,
  repeatCount = 1,
}) => {
  const { t } = useTranslation();
  const theme = useTheme();
  const isSeries = repeatCount > 1;
  const taxExcluded = pricing?.tax_status === "excluded";

  return (
    <Box
      sx={{
        width: "100%",
        backgroundColor: theme.palette.background.paper,
        borderRadius: { xs: "10px", md: "14px" },
        boxShadow: `0 1px 4px ${alpha("#000", 0.06)}`,
        p: { xs: 2, md: 3 },
      }}
    >
      <Stack spacing={2}>
        <Typography sx={{ fontWeight: 700, fontSize: { xs: "16px", md: "18px" } }}>
          {t("Booking Summary")}
        </Typography>

        <Stack spacing={1.5}>
          {lines.map((line) => (
            <Stack key={line.key} direction="row" spacing={1.5} alignItems="flex-start">
              <CustomImageContainer
                src={line.image}
                height="52px"
                maxWidth="52px"
                width="100%"
                smHeight="52px"
                borderRadius=".6rem"
                loading="lazy"
              />
              <Stack sx={{ flex: 1, minWidth: 0 }}>
                <Typography sx={{ fontSize: "13px", fontWeight: 600 }} noWrap>
                  {line.name}
                </Typography>
                {line.variation && (
                  <Typography sx={{ fontSize: "12px", color: "text.secondary" }}>{line.variation}</Typography>
                )}
                <Typography sx={{ fontSize: "12px", color: "text.secondary" }}>
                  {t("Qty")}: {line.quantity}
                </Typography>
              </Stack>
              <Typography sx={{ fontSize: "13px", fontWeight: 700 }}>
                {getAmountWithSign(line.total)}
              </Typography>
            </Stack>
          ))}
        </Stack>

        {showCoupon && (
          <CouponBox
            couponCode={couponCode}
            couponError={couponError}
            loading={isPricingLoading}
            onApply={onApplyCoupon}
            onRemove={onRemoveCoupon}
          />
        )}

        <Stack
          spacing={1.25}
          sx={{ p: 2, borderRadius: "10px", backgroundColor: theme.palette.background.custom6 }}
        >
          {isPricingLoading && !pricing ? (
            <>
              <Skeleton variant="text" height={22} />
              <Skeleton variant="text" height={22} />
              <Skeleton variant="text" height={26} />
            </>
          ) : (
            <>
              <Row label={t("Subtotal")} value={getAmountWithSign(pricing?.subtotal)} />
              {Number(pricing?.discount) > 0 && (
                <Row label={t("Discount")} value={`-${getAmountWithSign(pricing.discount)}`} />
              )}
              {Number(pricing?.pro_discount) > 0 && (
                <Row label={t("Pro Discount")} value={`-${getAmountWithSign(pricing.pro_discount)}`} />
              )}
              {Number(pricing?.coupon_discount_amount) > 0 && (
                <Row label={t("Coupon Discount")} value={`-${getAmountWithSign(pricing.coupon_discount_amount)}`} />
              )}
              {Number(pricing?.ref_bonus_amount) > 0 && (
                <Row label={t("Referral Discount")} value={`-${getAmountWithSign(pricing.ref_bonus_amount)}`} />
              )}
              {taxExcluded && Number(pricing?.tax_amount) > 0 && (
                <Row label={t("VAT/TAX")} value={`(+) ${getAmountWithSign(pricing.tax_amount)}`} />
              )}
              <Box sx={{ borderBottom: `1px dotted ${theme.palette.neutral[400]}`, mt: 1 }} />
              <Row
                bold
                label={`${isSeries ? t("Per booking") : t("Total")}${
                  pricing?.tax_status === "included" ? ` ${t("(Vat/Tax incl.)")}` : ""
                }`}
                value={getAmountWithSign(pricing?.total)}
              />
              {isSeries && (
                <Row
                  bold
                  label={`${t("Total for")} ${repeatCount} ${t("bookings")}`}
                  value={getAmountWithSign(pricing?.series_total)}
                />
              )}
            </>
          )}
        </Stack>
      </Stack>
    </Box>
  );
};

export default ServiceCheckoutSummary;
