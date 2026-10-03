import { useEffect, useMemo, useState } from "react";
import { Grid, Stack, Typography } from "@mui/material";
import { useFormik } from "formik";
import { useRouter } from "next/router";
import toast from "react-hot-toast";
import { useTranslation } from "react-i18next";
import { useQuery } from "react-query";
import { useDispatch, useSelector } from "react-redux";
import * as Yup from "yup";
import { ProfileApi } from "api-manage/another-formated-api/profileApi";
import {
  onErrorResponse,
  onSingleErrorResponse,
} from "api-manage/api-error-response/ErrorResponses";
import { GoogleApi } from "api-manage/hooks/react-query/googleApi";
import useGetOfflinePaymentOptions from "api-manage/hooks/react-query/offlinePayment/useGetOfflinePaymentOptions";
import MainApi from "api-manage/MainApi";
import CustomContainer from "components/container";
import AddPaymentMethod from "components/checkout/item-checkout/AddPaymentMethod";
import CheckoutStepper from "components/checkout/item-checkout/CheckoutStepper";
import PlaceOrder from "components/checkout/item-checkout/PlaceOrder";
import OfflineForm from "components/checkout/item-checkout/offline-payment/OfflineForm";
import DeliveryAddress from "components/checkout/delivery-address";
import { getCartListModuleWise } from "helper-functions/getCartListModuleWise";
import { getGuestId, getToken } from "helper-functions/getToken";
import { setOfflineMethod } from "redux/slices/offlinePaymentData";
import { setRemoveItemFromCart } from "redux/slices/cart";
import { CustomPaperBigCard, CustomStackFullWidth } from "styled-components/CustomStyles.style";
import { getDigitalMethodFromZone } from "utils/CustomFunctions";
import {
  service_campaign_details_api,
  service_details_api,
} from "../../service-api-manage/ApiRoutes";
import {
  useGetCheckoutProvider,
  usePlaceServiceBooking,
  useServiceBookingTax,
} from "../../service-api-manage/hooks/react-query/checkout/useServiceBookingCheckout";
import useServiceBookingPayment from "../../service-api-manage/hooks/react-query/booking/useServiceBookingPayment";
import useServiceBusinessConfig from "../../service-api-manage/hooks/custom-hooks/useServiceBusinessConfig";
import ServiceBookingOptions, { buildSeriesDates } from "./ServiceBookingOptions";
import ServiceCheckoutSummary from "./ServiceCheckoutSummary";

const unwrap = (variation) => (Array.isArray(variation) ? variation[0] : variation);

const parseVariation = (raw) => {
  if (!raw) return null;
  try {
    const parsed = JSON.parse(raw);
    return Array.isArray(parsed) ? parsed : null;
  } catch {
    return null;
  }
};

const ServiceCheckoutPage = ({ page, slug, reqServiceDetails: reqServiceResponse }) => {
  // The details hook wraps the request as `{ data }`.
  const reqServiceDetails = reqServiceResponse?.data ?? reqServiceResponse;
  const { t } = useTranslation();
  const router = useRouter();
  const dispatch = useDispatch();
  const token = getToken();
  const guestId = getGuestId();
  const { configData } = useSelector((state) => state.configData);
  const { cartList } = useSelector((state) => state.cart);
  const { profileInfo } = useSelector((state) => state.profileInfo);
  const { guestUserInfo } = useSelector((state) => state.guestUserInfo);
  const { scheduleTimeRestrictionEnabled, scheduleTimeRestrictionValue, scheduleTimeRestrictionUnit } =
    useServiceBusinessConfig(configData, null);

  const {
    method,
    booking_id: retryBookingId,
    amount: retryAmount,
    store_id: storeIdQuery,
    service_id: serviceIdQuery,
    is_campaign: isCampaignQuery,
    variation: variationQuery,
    quantity: quantityQuery,
    bid_id: bidIdQuery,
  } = router.query;

  const isCustom = slug === "custom-service";
  const isBuyNow = page === "buy_now";

  // ---- state ---------------------------------------------------------------
  const [address, setAddress] = useState(undefined);
  const [paymentMethod, setPaymentMethod] = useState("");
  const [paymentMethodImage, setPaymentMethodImage] = useState("");
  const [usePartialPayment, setUsePartialPayment] = useState(false);
  const [switchToWallet, setSwitchToWallet] = useState(false);
  const [changeAmount, setChangeAmount] = useState();
  const [check, setCheck] = useState(null);
  const [couponCode, setCouponCode] = useState("");
  const [couponError, setCouponError] = useState("");
  const [options, setOptions] = useState({
    getServiceAt: "user",
    timing: "instant",
    scheduleAt: "",
    multiType: "daily",
    repeatCount: 2,
    dates: [],
  });
  const patchOptions = (patch) => setOptions((prev) => ({ ...prev, ...patch }));

  const formik = useFormik({
    initialValues: { password: "", confirm_password: "" },
    validationSchema: Yup.object({
      password: Yup.string()
        .required(t("Password is required"))
        .min(6, t("Password is too short - should be 6 chars minimum.")),
      confirm_password: Yup.string()
        .required(t("Confirm Password"))
        .oneOf([Yup.ref("password"), null], t("Passwords must match")),
    }),
  });

  // ---- sources: cart / buy now / custom bid ---------------------------------
  const moduleCart = useMemo(() => getCartListModuleWise(cartList), [cartList]);
  const cartStoreId = storeIdQuery ?? moduleCart?.[0]?.store_id ?? moduleCart?.[0]?.store?.id;
  const cartLines = useMemo(
    () =>
      moduleCart.filter(
        (line) => String(line.store_id ?? line.store?.id ?? line.provider_id) === String(cartStoreId)
      ),
    [moduleCart, cartStoreId]
  );

  const { data: buyNowService } = useQuery(
    ["service-buy-now", serviceIdQuery, isCampaignQuery],
    async () => {
      const base = String(isCampaignQuery) === "1" ? service_campaign_details_api : service_details_api;
      const { data } = await MainApi.get(`${base}/${serviceIdQuery}`);
      return data;
    },
    { enabled: isBuyNow && Boolean(serviceIdQuery), onError: onSingleErrorResponse }
  );

  const selectedBid = useMemo(() => {
    if (!isCustom) return null;
    const bids = reqServiceDetails?.bids ?? reqServiceDetails?.offers ?? [];
    return (
      bids.find((bid) => String(bid.id) === String(bidIdQuery)) ??
      reqServiceDetails?.selected_offer ??
      null
    );
  }, [isCustom, reqServiceDetails, bidIdQuery]);

  const buyNowVariation = useMemo(() => parseVariation(variationQuery), [variationQuery]);

  const lines = useMemo(() => {
    if (isCustom) {
      if (!selectedBid) return [];
      return [
        {
          key: `bid-${selectedBid.id}`,
          name: reqServiceDetails?.sub_category_name ?? reqServiceDetails?.category_name ?? t("Custom Service"),
          image: reqServiceDetails?.category_image_full_url,
          variation: selectedBid?.provider?.name,
          quantity: 1,
          total: selectedBid.offer_price,
        },
      ];
    }
    if (isBuyNow) {
      if (!buyNowService) return [];
      const picks = buyNowVariation ?? [{ variant_key: null, quantity: Number(quantityQuery) || 1 }];
      return picks.map((pick) => {
        const variant = (buyNowService.variations ?? []).find((v) => v.variant_key === pick.variant_key);
        const unit = Number(variant?.discounted_price ?? buyNowService.discounted_price ?? buyNowService.base_price ?? 0);
        return {
          key: `${buyNowService.id}-${pick.variant_key ?? "base"}`,
          name: buyNowService.name,
          image: buyNowService.thumbnail_full_url,
          variation: variant?.name,
          quantity: pick.quantity,
          total: unit * pick.quantity,
        };
      });
    }
    return cartLines.map((line) => ({
      key: line.cartItemId ?? `${line.id}-${unwrap(line.selectedOption)?.variant_key ?? "base"}`,
      name: line.name,
      image: line.thumbnail_full_url ?? line.image_full_url,
      variation: unwrap(line.selectedOption)?.name,
      quantity: line.quantity,
      total: line.totalPrice ?? Number(line.price ?? 0) * Number(line.quantity ?? 1),
    }));
  }, [isCustom, isBuyNow, selectedBid, reqServiceDetails, buyNowService, buyNowVariation, quantityQuery, cartLines, t]);

  const providerId = isCustom
    ? selectedBid?.provider?.id
    : isBuyNow
    ? buyNowService?.store_id
    : cartStoreId;
  const { data: provider } = useGetCheckoutProvider(providerId);

  // Booking source fields shared by get-tax and place.
  const sourcePayload = useMemo(() => {
    if (isCustom) return selectedBid ? { selected_bid_id: selectedBid.id } : null;
    if (isBuyNow) {
      if (!serviceIdQuery) return null;
      return {
        buy_now: 1,
        service_id: serviceIdQuery,
        is_campaign: String(isCampaignQuery) === "1" ? 1 : 0,
        ...(buyNowVariation
          ? { variation: buyNowVariation }
          : { quantity: Number(quantityQuery) || 1 }),
      };
    }
    return providerId ? { provider_id: providerId } : null;
  }, [isCustom, isBuyNow, selectedBid, serviceIdQuery, isCampaignQuery, buyNowVariation, quantityQuery, providerId]);

  // ---- defaults once the provider is known ----------------------------------
  const minLeadMinutes = scheduleTimeRestrictionEnabled
    ? Number(scheduleTimeRestrictionValue) *
      ({ days: 1440, day: 1440, minutes: 1, minute: 1, min: 1 }[scheduleTimeRestrictionUnit] ?? 60)
    : 0;

  useEffect(() => {
    if (!provider) return;
    const firstLocation = provider.choose_service_location?.includes("user")
      ? "user"
      : provider.choose_service_location?.[0] ?? "user";
    setOptions((prev) => ({
      ...prev,
      getServiceAt: provider.choose_service_location?.includes(prev.getServiceAt) ? prev.getServiceAt : firstLocation,
      timing:
        prev.timing === "instant" && !provider.instant_booking
          ? provider.schedule_booking
            ? "schedule"
            : prev.timing
          : prev.timing,
    }));
  }, [provider?.id]);

  // ---- address / zone / customer ---------------------------------------------
  useEffect(() => {
    if (typeof window === "undefined") return;
    const currentLatLng = JSON.parse(localStorage.getItem("currentLatLng") || "null");
    const location = localStorage.getItem("location");
    setAddress({
      ...currentLatLng,
      latitude: currentLatLng?.lat,
      longitude: currentLatLng?.lng,
      address: location,
      address_type: "Selected Address",
    });
  }, []);

  const currentLatLng = useMemo(() => {
    if (typeof window === "undefined") return null;
    try {
      return JSON.parse(window.localStorage.getItem("currentLatLng") || "null");
    } catch {
      return null;
    }
  }, []);
  const { data: zoneData } = useQuery(
    ["zoneId", currentLatLng],
    async () => GoogleApi.getZoneId(currentLatLng),
    { retry: 1, enabled: Boolean(currentLatLng?.lat && currentLatLng?.lng) }
  );
  const { data: customerData } = useQuery(["profile-info"], ProfileApi.profileInfo, {
    onError: onSingleErrorResponse,
  });
  const {
    data: offlinePaymentOptions,
    refetch: refetchOfflinePaymentOptions,
  } = useGetOfflinePaymentOptions();
  useEffect(() => {
    refetchOfflinePaymentOptions();
  }, []);

  const isZoneDigital = useMemo(
    () => ({
      ...getDigitalMethodFromZone(provider?.zone_id, zoneData?.data ?? zoneData),
      offline_payment: Boolean(configData?.offline_payment_status === 1),
    }),
    [provider?.zone_id, zoneData, configData?.offline_payment_status]
  );

  useEffect(() => {
    if (isZoneDigital?.cash_on_delivery && configData?.cash_on_delivery) {
      setPaymentMethod("cash_on_delivery");
    }
  }, [isZoneDigital?.cash_on_delivery, configData?.cash_on_delivery]);

  // ---- pricing -----------------------------------------------------------------
  const seriesDates = useMemo(
    () =>
      options.timing === "repeat"
        ? (options.multiType === "custom"
            ? options.dates
            : buildSeriesDates(options.scheduleAt, options.multiType, options.repeatCount)
          ).filter(Boolean)
        : [],
    [options]
  );
  const repeatCount = options.timing === "repeat" ? Math.max(seriesDates.length, 1) : 1;

  const timingPayload = () => ({
    booking_type: options.timing === "repeat" ? "repeat" : "regular",
    ...(options.timing === "repeat"
      ? { multi_booking_type: options.multiType, dates: seriesDates.map((date) => ({ date })) }
      : {}),
    scheduled: options.timing === "schedule" ? 1 : 0,
    ...(options.timing === "schedule" ? { schedule_at: options.scheduleAt } : {}),
  });

  const { mutate: previewMutate, data: pricing, isLoading: isPricingLoading } = useServiceBookingTax();

  useEffect(() => {
    if (!sourcePayload || method === "offline") return;
    const timer = setTimeout(() => {
      previewMutate(
        {
          ...sourcePayload,
          ...(!token && guestId ? { guest_id: guestId } : {}),
          ...(couponCode ? { coupon_code: couponCode } : {}),
          booking_type: options.timing === "repeat" ? "repeat" : "regular",
          ...(options.timing === "repeat" ? { dates: seriesDates.map((date) => ({ date })) } : {}),
        },
        {
          onSuccess: () => setCouponError(""),
          onError: (error) => {
            const message = error?.response?.data?.errors?.[0]?.message;
            if (couponCode && error?.response?.data?.errors?.[0]?.code === "coupon") {
              setCouponError(message);
              setCouponCode("");
            } else {
              onErrorResponse(error);
            }
          },
        }
      );
    }, 300);
    return () => clearTimeout(timer);
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [sourcePayload, couponCode, options.timing, seriesDates.length, method]);

  const payableAmount = Number(pricing?.series_total ?? pricing?.total ?? 0);

  // ---- wallet / partial payment (same behaviour as the order checkout) ---------
  const walletBalance = customerData?.data?.wallet_balance;
  const handlePartialPayment = () => {
    if (payableAmount > walletBalance && configData?.partial_payment_status === 1) {
      setUsePartialPayment(true);
      setPaymentMethod("");
    } else if (walletBalance > payableAmount) {
      setPaymentMethod("wallet");
      setSwitchToWallet(true);
    } else {
      toast.error(t("Your wallet balance is insufficient for payment."));
    }
    dispatch(setOfflineMethod(""));
  };
  const removePartialPayment = () => {
    setPaymentMethod("");
    if (payableAmount > walletBalance) setUsePartialPayment(false);
    else setSwitchToWallet(false);
    dispatch(setOfflineMethod(""));
  };

  // ---- place --------------------------------------------------------------------
  const { mutate: placeMutate, isLoading: isPlacing } = usePlaceServiceBooking();
  const { mutate: payMutate, isLoading: isPaying } = useServiceBookingPayment();

  const contactPayload = () => {
    const profileName = [profileInfo?.f_name, profileInfo?.l_name].filter(Boolean).join(" ").trim() || profileInfo?.name;
    return {
      contact_person_name: address?.contact_person_name || (token ? profileName : guestUserInfo?.contact_person_name),
      contact_person_number:
        address?.contact_person_number ||
        (token ? profileInfo?.phone : guestUserInfo?.contact_person_number && `+${String(guestUserInfo.contact_person_number).replace(/^\+/, "")}`),
      contact_person_email: token ? profileInfo?.email : guestUserInfo?.contact_person_email,
    };
  };

  const buildPaymentPayload = (offlineData) => {
    const callback = token
      ? `${window.location.origin}/profile?page=my-orders`
      : `${window.location.origin}/home`;
    const isDigital =
      paymentMethod &&
      !["cash_on_delivery", "wallet", "offline_payment"].includes(paymentMethod);
    const digital = { payment_gateway: paymentMethod, payment_platform: "web", callback };

    if (usePartialPayment) {
      return paymentMethod === "cash_on_delivery"
        ? { payment_method: "partial_payment", partial_payment_method: "cash_after_service" }
        : { payment_method: "partial_payment", partial_payment_method: "digital_payment", ...digital };
    }
    if (paymentMethod === "cash_on_delivery") {
      return {
        payment_method: "cash_after_service",
        ...(changeAmount ? { bring_change_amount: Number(changeAmount) } : {}),
      };
    }
    if (paymentMethod === "wallet") return { payment_method: "wallet" };
    if (paymentMethod === "offline_payment") {
      return { payment_method: "offline_payment", ...(offlineData ?? {}) };
    }
    return isDigital ? { payment_method: "digital_payment", ...digital } : {};
  };

  const clearPlacedCart = () => {
    if (!isBuyNow && !isCustom) cartLines.forEach((line) => dispatch(setRemoveItemFromCart(line)));
  };

  const goToBooking = (bookingId) => {
    if (token) {
      router.push({ pathname: "/profile", query: { page: "my-orders", orderId: bookingId } });
    } else {
      router.push("/home");
    }
  };

  const validate = () => {
    if (!sourcePayload || lines.length === 0) {
      toast.error(t("Your booking is empty"));
      return false;
    }
    if (options.getServiceAt === "user" && !(address?.latitude ?? address?.lat)) {
      toast.error(t("Please select the service address"));
      return false;
    }
    const contact = contactPayload();
    if (!contact.contact_person_name || !contact.contact_person_number) {
      toast.error(t("Please add your contact information"));
      return false;
    }
    if (options.timing === "schedule" && !options.scheduleAt) {
      toast.error(t("Please choose the service date and time"));
      return false;
    }
    if (options.timing === "repeat") {
      if (seriesDates.length < 2) {
        toast.error(t("Choose at least two dates for a repeat booking"));
        return false;
      }
      if (new Set(seriesDates).size !== seriesDates.length) {
        toast.error(t("Booking dates must be different"));
        return false;
      }
    }
    if (!paymentMethod && !usePartialPayment) {
      toast.error(t("Please select a payment method"));
      return false;
    }
    if (check && formik.values.password !== formik.values.confirm_password) {
      toast.error(t("Passwords must match"));
      return false;
    }
    return true;
  };

  const placeBooking = (offlineData) => {
    const contact = contactPayload();
    const isUserLocation = options.getServiceAt === "user";
    const payload = {
      ...sourcePayload,
      ...(!token && guestId ? { guest_id: guestId } : {}),
      service_location: {
        get_service_at: options.getServiceAt,
        ...(isUserLocation
          ? {
              lat: address?.latitude ?? address?.lat,
              lng: address?.longitude ?? address?.lng,
              address: address?.address,
              address_type: address?.address_type,
              house: address?.house,
              floor: address?.floor,
              road: address?.road,
            }
          : {}),
      },
      ...timingPayload(),
      ...(couponCode ? { coupon_code: couponCode } : {}),
      ...contact,
      ...(!token && check
        ? { create_new_user: 1, password: formik.values.password }
        : {}),
      ...buildPaymentPayload(offlineData),
    };

    placeMutate(payload, {
      onSuccess: (response) => {
        clearPlacedCart();
        if (response?.token) localStorage.setItem("token", response.token);
        if (response?.redirect_link) {
          window.location.href = response.redirect_link;
          return;
        }
        toast.success(response?.message ?? t("Booking placed successfully"));
        if (!token && !response?.token) {
          toast(`${t("Your booking ID is")} #${response?.booking_id}`, { duration: 8000 });
        }
        goToBooking(response?.booking_id);
      },
      onError: (error) => {
        error?.response?.data?.errors?.forEach((item) =>
          toast.error(item.message, { position: "bottom-right" })
        );
      },
    });
  };

  const handlePlaceBooking = () => {
    if (!validate()) return;
    if (paymentMethod === "offline_payment") {
      router.push({ pathname: router.pathname, query: { ...router.query, method: "offline" } }, undefined, {
        shallow: true,
      });
      return;
    }
    placeBooking();
  };

  const handleOfflineSubmit = (offlineData) => {
    if (retryBookingId) {
      payMutate(
        {
          booking_id: retryBookingId,
          payment_method: "offline_payment",
          ...offlineData,
          ...(!token && guestId ? { guest_id: guestId } : {}),
        },
        {
          onSuccess: (response) => {
            toast.success(response?.message ?? t("Payment details submitted"));
            goToBooking(retryBookingId);
          },
          onError: onErrorResponse,
        }
      );
      return;
    }
    placeBooking(offlineData);
  };

  const onBeforeProceed = () => {
    if (options.timing === "repeat" && (usePartialPayment || paymentMethod === "offline_payment")) {
      toast.error(t("This payment method is not available for repeat bookings"));
      return false;
    }
    return true;
  };

  // ---- render ---------------------------------------------------------------------
  if (method === "offline") {
    return (
      <CustomContainer>
        <Grid container mb="2rem" paddingTop={{ xs: "1.5rem", md: "2.5rem" }}>
          <Grid item xs={12}>
            <Typography variant="h5" fontWeight="600">
              {t("Offline Payment Information")}
            </Typography>
            <CustomStackFullWidth marginTop={{ xs: "1.5rem", md: "2.5rem" }} alignItems="center">
              <CustomPaperBigCard sx={{ width: { xs: "100%", sm: "90%", md: "80%" }, padding: { xs: "1rem", md: "1.8rem" } }}>
                <OfflineForm
                  offlinePaymentOptions={offlinePaymentOptions}
                  total_order_amount={retryBookingId ? Number(retryAmount) : payableAmount}
                  placeOrder={handlePlaceBooking}
                  offlinePaymentLoading={isPlacing || isPaying}
                  usePartialPayment={false}
                  handleOffineOrder={handleOfflineSubmit}
                  setOfflineCheck={() => {}}
                />
              </CustomPaperBigCard>
            </CustomStackFullWidth>
          </Grid>
        </Grid>
      </CustomContainer>
    );
  }

  return (
    <CustomContainer>
      <Grid container spacing={3} mb="2rem" paddingTop={{ xs: "1.5rem", md: "1rem" }}>
        <Grid item xs={12} md={7}>
          <Stack spacing={{ xs: 2, md: 3 }} pb={{ xs: "5rem", md: "4rem" }}>
            <CheckoutStepper storeData={provider} />

            {provider && (
              <ServiceBookingOptions
                provider={provider}
                value={options}
                onChange={patchOptions}
                minLeadMinutes={minLeadMinutes}
                allowRepeat={!isCustom}
              />
            )}

            <DeliveryAddress
              setAddress={setAddress}
              address={address}
              configData={configData}
              storeZoneId={provider?.zone_id}
              orderType="delivery"
              formik={formik}
              passwordHandler={(value) => formik.setFieldValue("password", value)}
              confirmPasswordHandler={(value) => formik.setFieldValue("confirm_password", value)}
              check={check}
              setCheck={setCheck}
            />

            {zoneData && (
              <AddPaymentMethod
                setPaymentMethod={setPaymentMethod}
                paymentMethod={paymentMethod}
                zoneData={zoneData}
                configData={configData}
                orderType="delivery"
                usePartialPayment={usePartialPayment}
                offlinePaymentOptions={offlinePaymentOptions}
                setSwitchToWallet={setSwitchToWallet}
                isZoneDigital={isZoneDigital}
                setPaymentMethodImage={setPaymentMethodImage}
                paymentMethodImage={paymentMethodImage}
                remainingBalance={walletBalance - payableAmount}
                handlePartialPayment={handlePartialPayment}
                walletBalance={walletBalance}
                removePartialPayment={removePartialPayment}
                switchToWallet={switchToWallet}
                customerData={customerData}
                payableAmount={payableAmount}
                changeAmount={changeAmount}
                setChangeAmount={setChangeAmount}
                onBeforeProceed={onBeforeProceed}
                repeatCount={repeatCount}
                isAmountReady={Boolean(pricing)}
              />
            )}
          </Stack>
        </Grid>

        <Grid
          item
          xs={12}
          md={5}
          sx={{ position: { md: "sticky" }, top: { md: "50px" }, alignSelf: { md: "flex-start" } }}
        >
          <CustomStackFullWidth>
            <ServiceCheckoutSummary
              lines={lines}
              pricing={pricing}
              isPricingLoading={isPricingLoading}
              couponCode={couponCode}
              couponError={couponError}
              showCoupon={Boolean(token) && !isCustom}
              onApplyCoupon={(code) => {
                setCouponError("");
                setCouponCode(code);
              }}
              onRemoveCoupon={() => setCouponCode("")}
              repeatCount={repeatCount}
            />
            <PlaceOrder
              placeOrder={handlePlaceBooking}
              orderLoading={isPlacing}
              totalAmount={payableAmount}
              originalAmount={null}
            />
          </CustomStackFullWidth>
        </Grid>
      </Grid>
    </CustomContainer>
  );
};

export default ServiceCheckoutPage;
