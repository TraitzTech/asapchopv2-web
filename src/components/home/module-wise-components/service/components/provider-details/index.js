import { useEffect, useRef, useState } from "react";
import {
  alpha,
  Box,
  Chip,
  Grid,
  InputAdornment,
  Skeleton,
  Stack,
  TextField,
  Typography,
  useMediaQuery,
  useTheme,
} from "@mui/material";
import SearchIcon from "@mui/icons-material/Search";
import { useRouter } from "next/router";
import { useTranslation } from "react-i18next";
import NewProductCard from "components/cards/newCard/NewProductCard";
import CustomContainer from "components/container";
import CustomEmptyResult from "components/custom-empty-result";
import CustomPagination from "components/custom-pagination";
import nodata from "components/loyalty-points/assets/Search.svg";
import Top from "components/store-details/Top";
import { CustomStackFullWidth } from "styled-components/CustomStyles.style";
import ServiceReviews from "../service-details/ServiceReviews";
import useGetProviderServices, {
  PROVIDER_SERVICES_LIMIT,
} from "../../service-api-manage/hooks/react-query/provider/useGetProviderServices";

const TABS = [
  { key: "services", label: "Services" },
  { key: "reviews", label: "Reviews" },
];

const ProviderServices = ({ providerId }) => {
  const { t } = useTranslation();
  const theme = useTheme();
  const [categoryId, setCategoryId] = useState(null);
  const [searchText, setSearchText] = useState("");
  const [name, setName] = useState("");
  const [offset, setOffset] = useState(1);
  const categories = useRef([]);

  // Debounce the search box.
  useEffect(() => {
    const timer = setTimeout(() => {
      setName(searchText.trim());
      setOffset(1);
    }, 350);
    return () => clearTimeout(timer);
  }, [searchText]);

  const { data, isLoading, isFetching } = useGetProviderServices({
    providerId,
    offset,
    categoryId,
    name,
  });
  if (data?.categories) categories.current = data.categories;
  const services = data?.services ?? [];

  return (
    <Stack spacing={2}>
      <Stack direction={{ xs: "column", md: "row" }} spacing={2} alignItems={{ md: "center" }} justifyContent="space-between">
        <Stack direction="row" spacing={1} sx={{ overflowX: "auto", pb: 0.5, "&::-webkit-scrollbar": { display: "none" } }}>
          <Chip
            label={t("All")}
            clickable
            onClick={() => {
              setCategoryId(null);
              setOffset(1);
            }}
            color={categoryId ? "default" : "primary"}
            sx={{ fontWeight: 600 }}
          />
          {categories.current.map((category) => (
            <Chip
              key={category.id}
              label={category.name}
              clickable
              onClick={() => {
                setCategoryId(category.id);
                setOffset(1);
              }}
              color={categoryId === category.id ? "primary" : "default"}
              sx={{ fontWeight: 600 }}
            />
          ))}
        </Stack>
        <TextField
          size="small"
          placeholder={t("Search services")}
          value={searchText}
          onChange={(e) => setSearchText(e.target.value)}
          InputProps={{
            startAdornment: (
              <InputAdornment position="start">
                <SearchIcon fontSize="small" />
              </InputAdornment>
            ),
          }}
          sx={{
            minWidth: { md: 280 },
            "& .MuiOutlinedInput-root": {
              borderRadius: "10px",
              backgroundColor: alpha(theme.palette.neutral[400], 0.08),
            },
          }}
        />
      </Stack>

      {isLoading ? (
        <Grid container spacing={2}>
          {[...Array(8)].map((_, i) => (
            <Grid item xs={6} sm={4} md={3} key={i}>
              <Skeleton variant="rounded" height={230} sx={{ borderRadius: "12px" }} />
            </Grid>
          ))}
        </Grid>
      ) : services.length === 0 ? (
        <CustomEmptyResult image={nodata} label="No Services Found" width="128px" height="128px" />
      ) : (
        <Box sx={{ opacity: isFetching ? 0.6 : 1, transition: "opacity .2s" }}>
          <Grid container spacing={2}>
            {services.map((service) => (
              <Grid item xs={6} sm={4} md={3} key={service?.id}>
                <NewProductCard variant="vertical" item={service} cardWidth="100%" />
              </Grid>
            ))}
          </Grid>
        </Box>
      )}

      {data?.total_size > PROVIDER_SERVICES_LIMIT && (
        <CustomPagination
          total_size={data?.total_size}
          page_limit={PROVIDER_SERVICES_LIMIT}
          offset={offset}
          setOffset={setOffset}
        />
      )}
    </Stack>
  );
};

const ProviderDetails = ({ providerDetails, configData }) => {
  const { t } = useTranslation();
  const theme = useTheme();
  const router = useRouter();
  const isSmall = useMediaQuery(theme.breakpoints.down("md"));
  const [tab, setTab] = useState("services");
  const [, setCondensedHeaderVisible] = useState(false);

  const storeShare = {
    moduleId: router.query.module || router.query.module_id || providerDetails?.module_id,
    moduleType: router.query.module_type,
    storeZoneId: providerDetails?.zone_id ? [providerDetails.zone_id] : [],
  };

  return (
    <CustomStackFullWidth spacing={{ xs: 0, md: 1 }}>
      <Top
        bannerCover={providerDetails?.cover_photo_full_url}
        storeDetails={providerDetails}
        configData={configData}
        logo={providerDetails?.logo_full_url}
        isSmall={isSmall}
        storeShare={storeShare}
        bannersData={[]}
        isLoading={false}
        setOpenReviewModal={() => setTab("reviews")}
        onCondensedHeaderChange={setCondensedHeaderVisible}
      />

      <CustomContainer>
        <CustomStackFullWidth spacing={2} sx={{ pt: { xs: 2, md: 3 }, pb: 4 }}>
          <Stack direction="row" spacing={1} sx={{ borderBottom: `1px solid ${theme.palette.divider}` }}>
            {TABS.map((item) => {
              const active = tab === item.key;
              return (
                <Box
                  key={item.key}
                  onClick={() => setTab(item.key)}
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
                      fontSize: { xs: "14px", md: "16px" },
                      fontWeight: active ? 700 : 400,
                      color: active ? "primary.main" : "neutral.500",
                    }}
                  >
                    {t(item.label)}
                  </Typography>
                </Box>
              );
            })}
          </Stack>

          {tab === "services" ? (
            <ProviderServices providerId={providerDetails?.id} />
          ) : (
            <ServiceReviews type="provider" id={providerDetails?.id} />
          )}
        </CustomStackFullWidth>
      </CustomContainer>
    </CustomStackFullWidth>
  );
};

export default ProviderDetails;
