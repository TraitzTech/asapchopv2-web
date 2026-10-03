import { useEffect, useMemo, useState } from "react";
import { alpha, Box, IconButton, Stack, Typography, useTheme } from "@mui/material";
import LoadingButton from "@mui/lab/LoadingButton";
import AddIcon from "@mui/icons-material/Add";
import RemoveIcon from "@mui/icons-material/Remove";
import { useTranslation } from "react-i18next";
import CustomModal from "components/modal";
import { getAmountWithSign } from "helper-functions/CardHelpers";

// The cart may return a variation as a single object or as a one-item list.
const unwrap = (variation) => (Array.isArray(variation) ? variation[0] : variation);

const keyOf = (variation) => unwrap(variation)?.variant_key ?? unwrap(variation)?.name;

const unitPrice = (variation) =>
  Number(variation?.discounted_price ?? variation?.price ?? 0);

const QuantityStepper = ({ quantity, onIncrement, onDecrement }) => {
  const theme = useTheme();
  const buttonSx = {
    width: 28,
    height: 28,
    borderRadius: "8px",
    backgroundColor: alpha(theme.palette.primary.main, 0.1),
    color: "primary.main",
    "&:hover": { backgroundColor: alpha(theme.palette.primary.main, 0.2) },
  };
  return (
    <Stack direction="row" alignItems="center" spacing={1.25}>
      <IconButton size="small" sx={buttonSx} onClick={onDecrement} disabled={quantity <= 0}>
        <RemoveIcon sx={{ fontSize: "16px" }} />
      </IconButton>
      <Typography sx={{ minWidth: 18, textAlign: "center", fontWeight: 600, fontSize: "14px" }}>
        {quantity}
      </Typography>
      <IconButton size="small" sx={buttonSx} onClick={onIncrement}>
        <AddIcon sx={{ fontSize: "16px" }} />
      </IconButton>
    </Stack>
  );
};

/**
 * Pick one or more variations of a service with a quantity each.
 * onSelectVariation receives [{ variation, quantity }].
 */
const VariationModal = ({
  open,
  onClose,
  items = [],
  selectedVariation,
  onSelectVariation,
  isUpdateFromCard = false,
  isLoading = false,
}) => {
  const { t } = useTranslation();
  const theme = useTheme();
  const [quantities, setQuantities] = useState({});

  useEffect(() => {
    if (!open) return;
    const initial = {};
    (selectedVariation ?? []).forEach(({ variation, quantity }) => {
      initial[keyOf(variation)] = quantity ?? 1;
    });
    setQuantities(initial);
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [open]);

  const total = useMemo(
    () =>
      items.reduce(
        (sum, variation) => sum + unitPrice(variation) * (quantities[keyOf(variation)] ?? 0),
        0
      ),
    [items, quantities]
  );
  const hasSelection = Object.values(quantities).some((quantity) => quantity > 0);

  const change = (variation, delta) =>
    setQuantities((prev) => {
      const next = Math.max((prev[keyOf(variation)] ?? 0) + delta, 0);
      return { ...prev, [keyOf(variation)]: next };
    });

  const handleConfirm = () => {
    const selected = items
      .filter((variation) => (quantities[keyOf(variation)] ?? 0) > 0)
      .map((variation) => ({ variation, quantity: quantities[keyOf(variation)] }));
    onSelectVariation?.(selected);
  };

  return (
    <CustomModal openModal={Boolean(open)} handleClose={onClose} closeButton>
      <Stack spacing={2} sx={{ p: { xs: "16px", md: "24px" }, minWidth: { md: "420px" } }}>
        <Stack spacing={0.5}>
          <Typography sx={{ fontSize: "18px", fontWeight: 700, color: "text.primary" }}>
            {t("Select Variation")}
          </Typography>
          <Typography sx={{ fontSize: "13px", color: "text.secondary" }}>
            {t("Choose the option and quantity you need.")}
          </Typography>
        </Stack>

        <Stack spacing={1.25} sx={{ maxHeight: "50vh", overflowY: "auto" }}>
          {items.map((variation) => {
            const quantity = quantities[keyOf(variation)] ?? 0;
            const hasDiscount =
              Number(variation?.discounted_price ?? variation?.price) < Number(variation?.price);
            return (
              <Stack
                key={keyOf(variation)}
                direction="row"
                alignItems="center"
                justifyContent="space-between"
                gap={1.5}
                sx={{
                  p: "12px 14px",
                  borderRadius: "10px",
                  border: `1px solid ${
                    quantity > 0
                      ? alpha(theme.palette.primary.main, 0.4)
                      : alpha(theme.palette.neutral[400], 0.25)
                  }`,
                  backgroundColor:
                    quantity > 0 ? alpha(theme.palette.primary.main, 0.06) : "background.paper",
                }}
              >
                <Box sx={{ minWidth: 0 }}>
                  <Typography sx={{ fontSize: "14px", fontWeight: 600 }} noWrap>
                    {variation?.name}
                  </Typography>
                  <Stack direction="row" alignItems="baseline" spacing={1}>
                    <Typography sx={{ fontSize: "14px", fontWeight: 700, color: "primary.main" }}>
                      {getAmountWithSign(unitPrice(variation))}
                    </Typography>
                    {hasDiscount && (
                      <Typography
                        sx={{ fontSize: "12px", color: "text.secondary", textDecoration: "line-through" }}
                      >
                        {getAmountWithSign(variation?.price)}
                      </Typography>
                    )}
                  </Stack>
                </Box>
                <QuantityStepper
                  quantity={quantity}
                  onIncrement={() => change(variation, 1)}
                  onDecrement={() => change(variation, -1)}
                />
              </Stack>
            );
          })}
        </Stack>

        <Stack direction="row" alignItems="center" justifyContent="space-between" gap={2}>
          <Stack>
            <Typography sx={{ fontSize: "12px", color: "text.secondary" }}>{t("Total")}</Typography>
            <Typography sx={{ fontSize: "18px", fontWeight: 700 }}>{getAmountWithSign(total)}</Typography>
          </Stack>
          <LoadingButton
            variant="contained"
            disableElevation
            loading={isLoading}
            disabled={!hasSelection && !isUpdateFromCard}
            onClick={handleConfirm}
            sx={{ px: 3.5, py: 1.1, borderRadius: "10px", textTransform: "none", fontWeight: 600 }}
          >
            {isUpdateFromCard ? t("Update Cart") : t("Add to Cart")}
          </LoadingButton>
        </Stack>
      </Stack>
    </CustomModal>
  );
};

export default VariationModal;
