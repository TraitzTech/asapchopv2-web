import { useEffect, useRef, useState } from "react";
import {
  Accordion,
  AccordionDetails,
  AccordionSummary,
  Box,
  Grid,
  IconButton,
  Stack,
  Typography,
  useTheme,
} from "@mui/material";
import ExpandMoreIcon from "@mui/icons-material/ExpandMore";
import { useRouter } from "next/router";
import toast from "react-hot-toast";
import { useTranslation } from "react-i18next";
import { useDispatch, useSelector } from "react-redux";
import { useAddToWishlist } from "api-manage/hooks/react-query/wish-list/useAddWishList";
import { useWishListDelete } from "api-manage/hooks/react-query/wish-list/useWishListDelete";
import { useWishListGet } from "api-manage/hooks/react-query/wish-list/useWishListGet";
import CustomPageBreadCrumb from "components/common/CustomPageBreadCrumb";
import ProductImageView from "components/product-details/product-details-section/ProductImageView";
import StoreDetails from "components/product-details/StoreDetails";
import {
  addWishListService,
  removeWishListService,
  setWishList,
} from "redux/slices/wishList";
import { CustomStackFullWidth } from "styled-components/CustomStyles.style";
import { not_logged_in_message } from "utils/toasterMessages";
import ServiceInformation from "./ServiceInformation";
import ServiceReviews from "./ServiceReviews";
import ServiceSliderSection from "../home/ServiceSliderSection";
import {
  service_related_api,
  service_related_provider_api,
} from "../../service-api-manage/ApiRoutes";

const SectionCard = ({ title, children }) => {
  const theme = useTheme();
  return (
    <Box
      sx={{
        width: "100%",
        backgroundColor: theme.palette.background.paper,
        borderRadius: "12px",
        p: { xs: 1.5, md: 2 },
      }}
    >
      <Typography
        component="h2"
        sx={{ fontWeight: 700, fontSize: { xs: "15px", md: "17px" }, color: "text.primary", mb: { xs: 1, md: 1.25 } }}
      >
        {title}
      </Typography>
      {children}
    </Box>
  );
};

const stripHtml = (html = "") =>
  typeof html === "string" ? html.replace(/<[^>]*>/g, "") : "";

const ServiceDetails = ({ serviceDetailsData, configData }) => {
  const { t } = useTranslation();
  const theme = useTheme();
  const router = useRouter();
  const reduxDispatch = useDispatch();
  const wishLists = useSelector((state) => state?.wishList?.wishLists);
  const token = typeof window !== "undefined" ? localStorage.getItem("token") : null;
  const { data: wishlistData } = useWishListGet({}, !!token);
  const { mutate: addFavorite } = useAddToWishlist();
  const { mutate: removeFavorite } = useWishListDelete();
  const wishlistPending = useRef(false);
  const [isWishlisted, setIsWishlisted] = useState(false);

  const service = serviceDetailsData;
  const provider = service?.provider;

  useEffect(() => {
    if (wishlistData) reduxDispatch(setWishList(wishlistData));
  }, [wishlistData]);

  useEffect(() => {
    if (service?.id && wishLists?.service) {
      setIsWishlisted(wishLists.service.some((item) => item.id === service.id));
    }
  }, [service?.id, wishLists?.service]);

  const addToWishlist = (e) => {
    e.stopPropagation();
    if (wishlistPending.current) return;
    if (!token) {
      toast.error(t(not_logged_in_message));
      return;
    }
    wishlistPending.current = true;
    addFavorite(service?.id, {
      onSuccess: (response) => {
        if (response) {
          reduxDispatch(addWishListService(service));
          setIsWishlisted(true);
          toast.success(response?.message);
        }
      },
      onError: (error) => toast.error(error?.response?.data?.message),
      onSettled: () => {
        wishlistPending.current = false;
      },
    });
  };

  const removeFromWishlist = (e) => {
    e.stopPropagation();
    if (wishlistPending.current) return;
    wishlistPending.current = true;
    removeFavorite(service?.id, {
      onSuccess: (response) => {
        reduxDispatch(removeWishListService(service?.id));
        setIsWishlisted(false);
        toast.success(response?.message, { id: "wishlist" });
      },
      onError: (error) => toast.error(error?.response?.data?.message),
      onSettled: () => {
        wishlistPending.current = false;
      },
    });
  };

  const moduleParam = typeof router.query.module === "string" ? router.query.module : undefined;
  const providerHref = provider?.id
    ? `/service/provider/${provider.slug || provider.id}${moduleParam ? `?module=${moduleParam}` : ""}`
    : undefined;

  const breadcrumbItems = [
    {
      key: "home",
      label: t("Home"),
      icon: <i className="fi fi-rr-home" style={{ fontSize: 12, display: "flex", lineHeight: 1 }} />,
      onRedirect: moduleParam ? `/home?module=${moduleParam}` : "/home",
    },
    ...(provider?.name
      ? [{ key: "provider", label: provider.name, ...(providerHref ? { onRedirect: providerHref } : {}) }]
      : []),
    { key: "service", label: service?.name },
  ];

  const description = stripHtml(service?.long_description || service?.short_description || "");
  const faqs = service?.faqs ?? [];

  if (!service) return null;

  return (
    <CustomStackFullWidth paddingTop={{ xs: 0, md: "2.5rem" }}>
      {/* Mobile top bar */}
      <Box
        sx={{
          display: { xs: "flex", md: "none" },
          position: "fixed",
          top: 0,
          left: 0,
          right: 0,
          zIndex: 1100,
          alignItems: "center",
          gap: 1,
          height: 52,
          px: 1.5,
          backgroundColor: theme.palette.background.paper,
          borderBottom: `1px solid ${theme.palette.divider}`,
          borderBottomLeftRadius: "15px",
          borderBottomRightRadius: "15px",
          boxShadow: "0 2px 6px rgba(0,0,0,0.04)",
        }}
      >
        <IconButton onClick={() => router.back()} size="small" aria-label={t("Back")} sx={{ color: theme.palette.text.primary }}>
          <i className="fi fi-rr-arrow-small-left" style={{ fontSize: "18px", display: "flex", lineHeight: 1 }} />
        </IconButton>
        <Typography
          sx={{
            fontWeight: 700,
            fontSize: "16px",
            color: theme.palette.text.primary,
            whiteSpace: "nowrap",
            overflow: "hidden",
            textOverflow: "ellipsis",
            flex: 1,
            minWidth: 0,
          }}
        >
          {t("Service Details")}
        </Typography>
      </Box>
      <Box sx={{ display: { xs: "block", md: "none" }, height: 52 }} />

      <CustomStackFullWidth
        sx={{
          px: { xs: 1.5, sm: 3, lg: 0 },
          py: { xs: 1.5, sm: 0, lg: 0 },
          mb: { xs: 1.25, md: 2 },
          overflowX: "auto",
          scrollbarWidth: "none",
          "&::-webkit-scrollbar": { display: "none" },
          "& nav": { flexWrap: "nowrap", minWidth: "max-content" },
          "& nav span": { fontSize: { xs: "13px", md: "16px" } },
        }}
      >
        <CustomPageBreadCrumb items={breadcrumbItems} />
      </CustomStackFullWidth>

      <Grid container spacing={2}>
        <Grid item xs={12} md={8}>
          <CustomStackFullWidth spacing={{ xs: 2, md: 4 }}>
            <Box
              sx={{
                width: "100%",
                backgroundColor: theme.palette.background.paper,
                borderRadius: { xs: "12px", md: "16px" },
                p: { xs: 0.5, sm: 1, md: 1.5 },
              }}
            >
              <Grid container spacing={{ xs: 2, md: 4 }}>
                <Grid item xs={12} sm={5} md={5} textAlign="center">
                  <ProductImageView
                    productImage={service?.thumbnail_full_url}
                    productThumbImage={[
                      service?.thumbnail_full_url,
                      ...(service?.additional_images_full_url ?? []),
                    ].filter(Boolean)}
                    configData={configData}
                    addToWishlistHandler={addToWishlist}
                    removeFromWishlistHandler={removeFromWishlist}
                    isWishlisted={isWishlisted}
                    productDetailsData={{ ...service, image_full_url: service?.thumbnail_full_url }}
                    videoMeta={null}
                    containerRadius="12px"
                  />
                </Grid>
                <Grid item xs={12} sm={7} md={7}>
                  <ServiceInformation service={service} />
                </Grid>
              </Grid>
            </Box>

            {description && (
              <SectionCard title={t("Service Details")}>
                <Typography sx={{ fontSize: { xs: "13px", md: "14px" }, lineHeight: 1.6, color: "text.secondary", whiteSpace: "pre-wrap" }}>
                  {description}
                </Typography>
              </SectionCard>
            )}

            {faqs.length > 0 && (
              <SectionCard title={t("Frequently Asked Questions")}>
                <Stack spacing={1}>
                  {faqs.map((faq) => (
                    <Accordion
                      key={faq?.id}
                      disableGutters
                      elevation={0}
                      sx={{ border: `1px solid ${theme.palette.divider}`, borderRadius: "10px !important", "&:before": { display: "none" } }}
                    >
                      <AccordionSummary expandIcon={<ExpandMoreIcon />}>
                        <Typography sx={{ fontSize: "14px", fontWeight: 600 }}>{faq?.question}</Typography>
                      </AccordionSummary>
                      <AccordionDetails>
                        <Typography sx={{ fontSize: "13px", color: "text.secondary", whiteSpace: "pre-wrap" }}>
                          {faq?.answer}
                        </Typography>
                      </AccordionDetails>
                    </Accordion>
                  ))}
                </Stack>
              </SectionCard>
            )}

            {configData?.service_module?.review_section !== false && (
              <SectionCard title={t("Reviews")}>
                <ServiceReviews type="service" id={service?.id} />
              </SectionCard>
            )}
          </CustomStackFullWidth>
        </Grid>

        <Grid item xs={12} md={4}>
          <CustomStackFullWidth spacing={3}>
            {provider && <StoreDetails storeDetails={provider} />}
          </CustomStackFullWidth>
        </Grid>

        {service?.id && !service?.is_campaign && (
          <Grid item xs={12}>
            <Stack spacing={{ xs: 2, md: 4 }}>
              <ServiceSliderSection
                  url={`${service_related_provider_api}/${service.id}`}
                  resultKey={null}
                  title="More from this provider"
                />
              <ServiceSliderSection
                  url={`${service_related_api}/${service.id}`}
                  resultKey={null}
                  title="You may also like"
                />
            </Stack>
          </Grid>
        )}
      </Grid>
    </CustomStackFullWidth>
  );
};

export default ServiceDetails;
