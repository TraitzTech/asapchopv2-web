import { useEffect, useMemo, useState } from "react";
import {
  alpha,
  Box,
  Button,
  IconButton,
  Stack,
  Typography,
  useTheme,
} from "@mui/material";
import LoadingButton from "@mui/lab/LoadingButton";
import AddIcon from "@mui/icons-material/Add";
import RemoveIcon from "@mui/icons-material/Remove";
import moment from "moment";
import toast from "react-hot-toast";
import { useRouter } from "next/router";
import { useTranslation } from "react-i18next";
import CustomRatings from "components/search/CustomRatings";
import VerifiedStoreBadge from "components/cards/VerifiedStoreBadge";
import { getAmountWithSign } from "helper-functions/CardHelpers";
import { getStoreRedirectURL } from "helper-functions/handleStoreRedirect";
import { getServiceCardPricing } from "../common/ServiceCardPricing";
import useServiceCart from "../../service-api-manage/hooks/custom-hooks/useServiceCart";
import useServiceCheckoutGate from "../../service-api-manage/hooks/custom-hooks/useServiceCheckoutGate";

const unwrap = (variation) => (Array.isArray(variation) ? variation[0] : variation);
const keyOf = (variation) => variation?.variant_key ?? variation?.name;

const Stepper = ({ quantity, onIncrement, onDecrement }) => {
  const theme = useTheme();
  const buttonSx = {
    width: 30,
    height: 30,
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

const ServiceInformation = ({ service }) => {
  const { t } = useTranslation();
  const theme = useTheme();
  const router = useRouter();
  const { goToCheckout, gateNode } = useServiceCheckoutGate();
  const cart = useServiceCart(service);

  const variations = service?.variations ?? [];
  const hasVariations = variations.length > 0;
  const [quantities, setQuantities] = useState({});

  // Start from what is already in the cart; otherwise nothing is picked.
  useEffect(() => {
    const initial = {};
    cart.selected.forEach(({ variation, quantity }) => {
      initial[keyOf(unwrap(variation))] = quantity;
    });
    setQuantities(initial);
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [service?.id, cart.count]);

  const [quantity, setQuantity] = useState(1);
  const { displayPrice, originalPrice, discountText } = getServiceCardPricing(service);

  const picked = useMemo(
    () =>
      variations
        .filter((variation) => (quantities[keyOf(variation)] ?? 0) > 0)
        .map((variation) => ({ variation, quantity: quantities[keyOf(variation)] })),
    [variations, quantities]
  );
  const pickedTotal = picked.reduce(
    (sum, { variation, quantity: q }) =>
      sum + Number(variation?.discounted_price ?? variation?.price ?? 0) * q,
    0
  );

  const change = (variation, delta) =>
    setQuantities((prev) => ({
      ...prev,
      [keyOf(variation)]: Math.max((prev[keyOf(variation)] ?? 0) + delta, 0),
    }));

  const provider = service?.provider;
  const providerHref = provider ? getStoreRedirectURL(provider, null, router.query) : null;
  const campaignWindow =
    service?.available_date_starts && service?.available_date_ends
      ? `${moment(service.available_date_starts).format("DD MMM")} - ${moment(
          service.available_date_ends
        ).format("DD MMM YYYY")}`
      : null;

  const handleAddToCart = () => {
    if (hasVariations) {
      cart.sync(picked);
    } else {
      cart.sync([{ variation: null, quantity }]);
    }
  };

  const handleBookNow = () => {
    if (hasVariations && !picked.length) {
      toast.error(t("Please select a variation"));
      return;
    }
    goToCheckout({
      page: "buy_now",
      service_id: service?.id,
      is_campaign: service?.is_campaign ? 1 : 0,
      store_id: service?.store_id,
      ...(hasVariations
        ? {
            variation: JSON.stringify(
              picked.map(({ variation, quantity: q }) => ({
                variant_key: variation?.variant_key,
                quantity: q,
              }))
            ),
          }
        : { quantity }),
    });
  };

  const handleGoToCart = () =>
    goToCheckout({ page: "cart", store_id: service?.store_id });

  const canBook = !hasVariations || picked.length > 0;
  const inCart = cart.isInCart;

  return (
    <Stack spacing={{ xs: 1.5, md: 2 }}>
      <Stack spacing={0.75}>
        <Typography
          component="h1"
          data-product-name
          sx={{ fontSize: { xs: "20px", md: "26px" }, fontWeight: 700, lineHeight: 1.2, color: "text.primary" }}
        >
          {service?.name}
        </Typography>

        <Stack direction="row" alignItems="center" spacing={1.25} flexWrap="wrap" useFlexGap>
          {Number(service?.avg_rating) > 0 && (
            <Stack direction="row" alignItems="center" spacing={0.75}>
              <CustomRatings readOnly="true" ratingValue={Number(service.avg_rating)} color={theme.palette.warning.new} />
              <Typography sx={{ fontSize: "13px", fontWeight: 700 }}>
                ({Number(service.avg_rating).toFixed(1)})
              </Typography>
              <Typography sx={{ fontSize: "13px", color: "text.secondary" }}>
                {service?.rating_count} {t("Reviews")}
              </Typography>
            </Stack>
          )}
          {provider && (
            <Stack
              direction="row"
              alignItems="center"
              spacing={0.5}
              onClick={() => router.push(providerHref)}
              sx={{ cursor: "pointer" }}
            >
              <Typography sx={{ fontSize: "13px", color: "text.secondary" }}>{t("by")}</Typography>
              <Typography sx={{ fontSize: "13px", fontWeight: 600, color: "primary.main" }}>
                {provider.name}
              </Typography>
              <VerifiedStoreBadge verified={provider.verified_seller} />
            </Stack>
          )}
        </Stack>

        {service?.category?.name && (
          <Typography sx={{ fontSize: "12px", color: "text.secondary" }}>
            {service.category.name}
            {service?.sub_category?.name ? ` › ${service.sub_category.name}` : ""}
          </Typography>
        )}
      </Stack>

      {service?.short_description && (
        <Typography sx={{ fontSize: { xs: "13px", md: "14px" }, color: "text.secondary", lineHeight: 1.55 }}>
          {service.short_description}
        </Typography>
      )}

      {campaignWindow && (
        <Box
          sx={{
            alignSelf: "flex-start",
            px: 1.5,
            py: 0.5,
            borderRadius: "999px",
            fontSize: "12px",
            fontWeight: 600,
            color: "warning.dark",
            backgroundColor: alpha(theme.palette.warning.main, 0.12),
          }}
        >
          {t("Available")}: {campaignWindow}
        </Box>
      )}

      <Stack direction="row" alignItems="baseline" spacing={1.25}>
        <Typography sx={{ fontSize: { xs: "22px", md: "28px" }, fontWeight: 700, color: "primary.main" }}>
          {hasVariations && picked.length
            ? getAmountWithSign(pickedTotal)
            : `${hasVariations ? `${t("Starts from")} ` : ""}${getAmountWithSign(displayPrice)}`}
        </Typography>
        {discountText && !picked.length && (
          <>
            <Typography sx={{ fontSize: "15px", color: "text.secondary", textDecoration: "line-through" }}>
              {getAmountWithSign(originalPrice)}
            </Typography>
            <Typography
              sx={{
                fontSize: "12px",
                fontWeight: 700,
                px: 1,
                py: 0.25,
                borderRadius: "999px",
                color: "common.white",
                backgroundColor: "error.main",
              }}
            >
              {discountText}
            </Typography>
          </>
        )}
      </Stack>

      {hasVariations ? (
        <Stack spacing={1}>
          <Typography sx={{ fontSize: "15px", fontWeight: 700 }}>{t("Select Variation")}</Typography>
          {variations.map((variation) => {
            const q = quantities[keyOf(variation)] ?? 0;
            const hasDiscount = Number(variation?.discounted_price ?? variation?.price) < Number(variation?.price);
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
                    q > 0 ? alpha(theme.palette.primary.main, 0.4) : alpha(theme.palette.neutral[400], 0.25)
                  }`,
                  backgroundColor: q > 0 ? alpha(theme.palette.primary.main, 0.06) : "background.paper",
                }}
              >
                <Box sx={{ minWidth: 0 }}>
                  <Typography sx={{ fontSize: "14px", fontWeight: 600 }} noWrap>
                    {variation?.name}
                  </Typography>
                  <Stack direction="row" alignItems="baseline" spacing={1}>
                    <Typography sx={{ fontSize: "14px", fontWeight: 700, color: "primary.main" }}>
                      {getAmountWithSign(variation?.discounted_price ?? variation?.price)}
                    </Typography>
                    {hasDiscount && (
                      <Typography sx={{ fontSize: "12px", color: "text.secondary", textDecoration: "line-through" }}>
                        {getAmountWithSign(variation?.price)}
                      </Typography>
                    )}
                  </Stack>
                </Box>
                <Stepper quantity={q} onIncrement={() => change(variation, 1)} onDecrement={() => change(variation, -1)} />
              </Stack>
            );
          })}
        </Stack>
      ) : (
        !inCart && (
          <Stack direction="row" alignItems="center" spacing={2}>
            <Typography sx={{ fontSize: "15px", fontWeight: 700 }}>{t("Quantity")}</Typography>
            <Stepper
              quantity={quantity}
              onIncrement={() => setQuantity((prev) => prev + 1)}
              onDecrement={() => setQuantity((prev) => Math.max(prev - 1, 1))}
            />
          </Stack>
        )
      )}

      <Stack direction={{ xs: "column", sm: "row" }} spacing={1.5} sx={{ pt: 0.5 }}>
        {(hasVariations || !inCart) && (
          <LoadingButton
            variant="outlined"
            loading={cart.isSyncing}
            disabled={hasVariations && !picked.length && !inCart}
            onClick={handleAddToCart}
            sx={{ flex: 1, py: 1.2, borderRadius: "10px", textTransform: "none", fontWeight: 600 }}
          >
            {inCart && hasVariations ? t("Update Cart") : t("Add to Cart")}
          </LoadingButton>
        )}
        {inCart ? (
          <Button
            variant="contained"
            disableElevation
            onClick={handleGoToCart}
            sx={{ flex: 1, py: 1.2, borderRadius: "10px", textTransform: "none", fontWeight: 600 }}
          >
            {t("Proceed To Checkout")}
          </Button>
        ) : (
          <Button
            variant="contained"
            disableElevation
            disabled={!canBook}
            onClick={handleBookNow}
            sx={{ flex: 1, py: 1.2, borderRadius: "10px", textTransform: "none", fontWeight: 600 }}
          >
            {t("Book Now")}
          </Button>
        )}
      </Stack>
      {gateNode}
    </Stack>
  );
};

export default ServiceInformation;
