import { useRef, useState } from "react";
import { Box, Skeleton, Stack, styled, Typography } from "@mui/material";
import Slider from "react-slick";
import "slick-carousel/slick/slick.css";
import { useTranslation } from "react-i18next";
import NewProductCard from "components/cards/newCard/NewProductCard";
import NewStoreCard from "components/cards/newCard/NewStoreCard";
import ProductCardSimmer from "components/Shimmer/ProductCardSimmer";
import NewStoreCardSkeleton from "components/Shimmer/NewStoreCardSkeleton";
import SliderSectionHeader from "components/common/SliderSectionHeader";
import { HomeComponentsWrapper } from "components/home/HomePageComponents";
import { CustomBoxFullWidth } from "styled-components/CustomStyles.style";
import useGetServiceList from "../../service-api-manage/hooks/react-query/service/useGetServiceList";

const SliderWrapper = styled(CustomBoxFullWidth)(({ theme }) => ({
  "& .slick-list": { overflowX: "hidden", overflowY: "visible", padding: "8px 0" },
  "& .slick-track": { marginLeft: 0, marginRight: "auto" },
  "& .slick-slide": { paddingRight: "24px" },
  "& .slick-slide:first-child": { paddingLeft: 0 },
  [theme.breakpoints.down("sm")]: { "& .slick-slide": { paddingRight: "12px" } },
}));

const serviceSettings = {
  dots: false,
  infinite: false,
  speed: 500,
  slidesToShow: 5.4,
  slidesToScroll: 1,
  swipeToSlide: true,
  arrows: false,
  responsive: [
    { breakpoint: 1025, settings: { slidesToShow: 5, slidesToScroll: 1, infinite: false, swipeToSlide: true } },
    { breakpoint: 760, settings: { slidesToShow: 3, slidesToScroll: 2, infinite: false, swipeToSlide: true } },
    { breakpoint: 600, settings: { slidesToShow: 2.8, slidesToScroll: 1, infinite: false, swipeToSlide: true } },
    { breakpoint: 480, settings: { slidesToShow: 2.4, slidesToScroll: 1, swipeToSlide: true } },
    { breakpoint: 400, settings: { slidesToShow: 2.1, slidesToScroll: 1, swipeToSlide: true } },
    { breakpoint: 340, settings: { slidesToShow: 1.7, slidesToScroll: 1, swipeToSlide: true } },
  ],
};

const providerSettings = {
  dots: false,
  infinite: false,
  speed: 500,
  slidesToShow: 4,
  slidesToScroll: 1,
  swipeToSlide: true,
  arrows: false,
  responsive: [
    { breakpoint: 1450, settings: { slidesToShow: 4, slidesToScroll: 1, swipeToSlide: true } },
    { breakpoint: 1024, settings: { slidesToShow: 3, slidesToScroll: 1, swipeToSlide: true } },
    { breakpoint: 760, settings: { slidesToShow: 2, slidesToScroll: 1, swipeToSlide: true } },
    { breakpoint: 480, settings: { slidesToShow: 1.4, slidesToScroll: 1, swipeToSlide: true } },
    { breakpoint: 340, settings: { slidesToShow: 1.2, slidesToScroll: 1, swipeToSlide: true } },
  ],
};

/**
 * Slider block of the service home. `kind` picks the card:
 *  - "services": service cards (NewProductCard)
 *  - "providers": provider cards (NewStoreCard)
 * `resultKey` is the array key of the API response.
 */
const ServiceSliderSection = ({
  title,
  subtitle,
  url,
  resultKey = "services",
  kind = "services",
  params = {},
}) => {
  const { t } = useTranslation();
  const slider = useRef(null);
  const [currentSlide, setCurrentSlide] = useState(0);
  const isProviders = kind === "providers";
  const slidesToShow = isProviders ? 4 : 5;

  const { data, isLoading } = useGetServiceList({
    url,
    params: { limit: 12, offset: 1, ...params },
  });
  const list = Array.isArray(data) ? data : data?.[resultKey] ?? [];

  if (!isLoading && !list.length) return null;

  return (
    <HomeComponentsWrapper sx={{ gap: "1rem" }}>
      <SliderSectionHeader
        sliderRef={slider}
        currentSlide={currentSlide}
        totalSlides={list.length}
        slidesToShow={slidesToShow}
        sx={{ mb: "1rem" }}
        heading={
          isLoading ? (
            <Skeleton variant="text" width="160px" height="32px" />
          ) : (
            <Box>
              <Typography
                sx={{
                  fontSize: { xs: "20px", sm: "24px" },
                  fontWeight: 700,
                  color: "neutral.1050",
                  lineHeight: 1.1,
                  letterSpacing: "-1.2px",
                }}
              >
                {t(title)}
              </Typography>
              {subtitle && (
                <Typography
                  sx={{ fontSize: "14px", color: "neutral.500", lineHeight: 1.3, mt: "4px" }}
                >
                  {t(subtitle)}
                </Typography>
              )}
            </Box>
          )
        }
      />

      <SliderWrapper>
        {isLoading ? (
          <Slider {...(isProviders ? providerSettings : serviceSettings)}>
            {[...Array(slidesToShow)].map((_, i) =>
              isProviders ? <NewStoreCardSkeleton key={i} /> : <ProductCardSimmer key={i} />
            )}
          </Slider>
        ) : (
          <Slider
            {...(isProviders ? providerSettings : serviceSettings)}
            ref={slider}
            afterChange={(idx) => setCurrentSlide(idx)}
          >
            {list.map((item) =>
              isProviders ? (
                <Stack key={item?.id} sx={{ "& > *": { width: "100% !important" } }}>
                  <NewStoreCard variant="normal" item={item} imageUrl={item?.cover_photo_full_url} />
                </Stack>
              ) : (
                <div key={item?.id}>
                  <NewProductCard
                    variant="vertical"
                    item={item}
                    cardWidth={{ xs: "150px", md: "170px" }}
                  />
                </div>
              )
            )}
          </Slider>
        )}
      </SliderWrapper>
    </HomeComponentsWrapper>
  );
};

export default ServiceSliderSection;
