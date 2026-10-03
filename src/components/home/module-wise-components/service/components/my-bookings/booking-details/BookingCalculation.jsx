import { Typography, useTheme } from "@mui/material";
import { Stack } from "@mui/system";
import { getAmountWithSign } from "helper-functions/CardHelpers";
import { CustomStackFullWidth } from "styled-components/CustomStyles.style";
import { OrderSummaryCalculationCard } from "components/my-orders/order-details/other-order/OrderCalculation";

const Row = ({ label, value, bold = false }) => (
  <CustomStackFullWidth
    direction="row"
    alignItems="center"
    justifyContent="space-between"
    spacing={2}
  >
    <Typography fontSize="14px" fontWeight={bold ? "bold" : undefined} textTransform={bold ? "capitalize" : undefined}>
      {label}
    </Typography>
    <Typography fontSize="14px" fontWeight={bold ? "bold" : undefined}>
      {value}
    </Typography>
  </CustomStackFullWidth>
);

const getServicesPrice = (details) =>
  (details ?? []).reduce(
    (total, line) => Number(line?.price ?? 0) * Number(line?.quantity ?? 1) + total,
    0
  );

const BookingCalculation = ({ data, t, trackOrderData }) => {
  const theme = useTheme();
  const lines = data?.booking_details ?? data?.details ?? [];
  const dueAmount =
    Number(trackOrderData?.order_amount ?? 0) -
    Number(trackOrderData?.partially_paid_amount ?? 0);
  const discount = Number(trackOrderData?.store_discount_amount ?? 0);
  const coupon = Number(trackOrderData?.coupon_discount_amount ?? 0);
  const proDiscount = Number(trackOrderData?.pro_discount ?? 0);
  const referral = Number(trackOrderData?.ref_bonus_amount ?? 0);
  const additional = Number(trackOrderData?.additional_charge ?? 0);
  const taxAmount = Number(trackOrderData?.total_tax_amount ?? 0);
  const isPartial = trackOrderData?.payment_method === "partial_payment";

  return (
    <OrderSummaryCalculationCard spacing={1.5}>
      {Number(trackOrderData?.bring_change_amount) > 0 &&
      trackOrderData?.payment_method === "cash_after_service" ? (
        <CustomStackFullWidth
          direction="row"
          alignItems="center"
          justifyContent="space-between"
          spacing={2}
          backgroundColor="background.default"
          padding="10px 15px"
          borderRadius="8px"
        >
          <Typography fontSize="14px">
            {t("Please keep {{amount}} ready as change for the provider.", {
              amount: getAmountWithSign(trackOrderData?.bring_change_amount),
            })}
          </Typography>
        </CustomStackFullWidth>
      ) : null}

      <Typography
        sx={{ fontSize: "18px", fontWeight: 700, color: theme.palette.text.primary }}
      >
        {t("Billing Summary")}
      </Typography>

      <Row
        label={t("Services Price")}
        value={lines.length > 0 ? getAmountWithSign(getServicesPrice(lines)) : null}
      />
      {discount > 0 && (
        <Row label={t("Discount")} value={`-${getAmountWithSign(discount)}`} />
      )}
      {proDiscount > 0 && (
        <Row label={t("Pro Discount")} value={`-${getAmountWithSign(proDiscount)}`} />
      )}
      {coupon > 0 && (
        <Row label={t("Coupon Discount")} value={`-${getAmountWithSign(coupon)}`} />
      )}
      {referral > 0 && (
        <Row label={t("Referral Discount")} value={`-${getAmountWithSign(referral)}`} />
      )}
      {trackOrderData?.tax_status === "excluded" && taxAmount > 0 && (
        <Row label={t("VAT/TAX")} value={`(+) ${getAmountWithSign(taxAmount)}`} />
      )}
      {additional > 0 && (
        <Row label={t("Additional Charge")} value={getAmountWithSign(additional)} />
      )}

      <Stack
        width="100%"
        sx={{
          mt: "20px",
          borderBottom: (themeValue) => `1px dotted ${themeValue.palette.neutral[400]}`,
        }}
      />
      <CustomStackFullWidth
        direction="row"
        alignItems="center"
        justifyContent="space-between"
        spacing={2}
      >
        <Typography component="span" fontWeight="bold" color={theme.palette.text.primary}>
          {t("Total")}
          {trackOrderData?.tax_status === "included" && (
            <Typography
              component="span"
              ml="3px"
              fontSize="12px"
              fontWeight="normal"
              color="text.secondary"
            >
              {t("(Vat/Tax incl.)")}
            </Typography>
          )}
        </Typography>
        <Typography fontWeight="bold">
          {getAmountWithSign(trackOrderData?.order_amount)}
        </Typography>
      </CustomStackFullWidth>

      {Number(trackOrderData?.partially_paid_amount) > 0 &&
      trackOrderData?.order_status !== "canceled" ? (
        <Row
          label={t("Paid by wallet")}
          value={getAmountWithSign(trackOrderData?.partially_paid_amount)}
        />
      ) : null}

      {isPartial && trackOrderData?.payments?.[1] ? (
        <Row
          bold
          label={`${
            trackOrderData.payments[1].payment_status === "unpaid"
              ? t("Due Payment")
              : t("Paid By")
          } (${t(trackOrderData.payments[1].payment_method).replaceAll("_", " ")})`}
          value={getAmountWithSign(dueAmount)}
        />
      ) : null}
    </OrderSummaryCalculationCard>
  );
};

export default BookingCalculation;
