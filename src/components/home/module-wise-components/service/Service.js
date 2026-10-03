import { Stack } from "@mui/material";
import { useEffect } from "react";
import { useTranslation } from "react-i18next";
import useGetOtherBanners from "api-manage/hooks/react-query/useGetOtherBanners";
import MobileAppBanner from "components/home/MobileAppBanner";
import PaidAds from "components/home/paid-ads";
import ModuleHomeSidebarLayout from "components/home/sidebar-layout/ModuleHomeSidebarLayout";
import isVerifiedStoreEnabled from "helper-functions/isVerifiedStoreEnabled";
import CustomContainer from "../../../container";
import Banners from "../../banners";
import FeaturedCategories from "../../featured-categories";
import PromotionalBanner from "../../PromotionalBanner";
import Stores from "../../stores";
import VerifiedPharmacies from "../pharmacy/VerifiedPharmacies";
import CustomServiceBanner from "./components/home/CustomServiceBanner";
import ServiceSliderSection from "./components/home/ServiceSliderSection";
import ServiceSearchBanner from "./components/global/ServiceSearchBanner";
import { getServiceSections } from "./serviceSectionsConfig";
import useServiceBusinessConfig from "./service-api-manage/hooks/custom-hooks/useServiceBusinessConfig";
import {
  service_campaigns_api,
  service_popular_api,
  service_quick_emergency_api,
  service_recommended_api,
  service_top_rated_api,
} from "./service-api-manage/ApiRoutes";

const S = ({ children }) => children ?? null;

const SLIDER_PADDING = {
  paddingLeft: "16px !important",
  paddingRight: "0 !important",
};

const ServiceModule = ({ configData, routeSection }) => {
  const { t } = useTranslation();
  const { biddingSystemEnabled } = useServiceBusinessConfig(configData, null);
  const { data, refetch } = useGetOtherBanners();

  // The other-banners query is enabled:false — fetch it here so the
  // promotional banner doesn't depend on another page priming the cache.
  useEffect(() => {
    refetch();
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  const overviewContent = (
    <Stack gap={{ xs: "16px", lg: "32px" }}>
      <S>
        <ServiceSearchBanner
          zoneid={
            typeof window !== "undefined"
              ? localStorage.getItem("zoneid")
              : undefined
          }
        />
      </S>

      <S>
        <CustomContainer noMobilePadding>
          <FeaturedCategories configData={configData} />
        </CustomContainer>
      </S>

      <S>
        <CustomContainer>
          <Banners />
        </CustomContainer>
      </S>

      <S>
        <CustomContainer sx={SLIDER_PADDING}>
          <ServiceSliderSection
            kind="providers"
            resultKey="providers"
            url={service_quick_emergency_api}
            title="Quick & Emergency Experts"
            subtitle="Instant booking from providers available right now."
          />
        </CustomContainer>
      </S>

      <S>
        <CustomContainer sx={SLIDER_PADDING}>
          <ServiceSliderSection
            url={service_recommended_api}
            title="Recommended For You"
            subtitle="Hand-picked services from trusted providers."
          />
        </CustomContainer>
      </S>

      <S>
        <CustomContainer>
          <PaidAds />
        </CustomContainer>
      </S>

      <S>
        <CustomContainer sx={SLIDER_PADDING}>
          <ServiceSliderSection
            url={service_popular_api}
            title="Popular Services"
            subtitle="What people near you book the most."
          />
        </CustomContainer>
      </S>

      {isVerifiedStoreEnabled(configData) && (
        <S>
          <CustomContainer sx={SLIDER_PADDING}>
            <VerifiedPharmacies
              title={t("Verified Providers")}
              subtitle={t("Trust & secure booking experience.")}
            />
          </CustomContainer>
        </S>
      )}

      <S>
        <CustomContainer sx={SLIDER_PADDING}>
          <ServiceSliderSection
            url={service_campaigns_api}
            resultKey="campaigns"
            title="Running Campaigns"
            subtitle="Limited-time service offers."
          />
        </CustomContainer>
      </S>

      <S>
        <CustomContainer noMobilePadding>
          <MobileAppBanner />
        </CustomContainer>
      </S>

      <S>
        <CustomContainer sx={SLIDER_PADDING}>
          <ServiceSliderSection
            url={service_top_rated_api}
            title="Top Rated Services"
          />
        </CustomContainer>
      </S>

      {biddingSystemEnabled && (
        <S>
          <CustomContainer>
            <CustomServiceBanner />
          </CustomContainer>
        </S>
      )}

      <S>
        <CustomContainer>
          <PromotionalBanner bannerData={data} />
        </CustomContainer>
      </S>

      <S>
        <CustomContainer>
          <Stores title={t("Explore Providers")} />
        </CustomContainer>
      </S>
    </Stack>
  );

  return (
    <ModuleHomeSidebarLayout
      overviewContent={overviewContent}
      sections={getServiceSections()}
      routeSection={routeSection}
    />
  );
};

export default ServiceModule;
