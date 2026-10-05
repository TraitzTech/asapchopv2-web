import { Box } from "@mui/system";
import OffersSectionPage from "components/home/section-page/OffersSectionPage";
import TabbedSectionPage from "components/home/section-page/TabbedSectionPage";

export const SECTION_GAP = 3;

const SectionIcon = ({ color, icon }) => (
  <Box sx={{ color, display: "flex" }}>
    <i
      className={icon}
      style={{ fontSize: "16px", lineHeight: 1, display: "flex" }}
    />
  </Box>
);

export const getServiceSections = () => [
  {
    id: "offers",
    label: "Offers",
    icon: <SectionIcon color="warning.dark" icon="fi fi-rr-badge-percent" />,
    content: <OffersSectionPage />,
    mobileContent: <OffersSectionPage />,
  },
  {
    id: "top-rated",
    label: "Top Rated",
    icon: <SectionIcon color="warning.dark" icon="fi fi-rr-star" />,
    content: <TabbedSectionPage sectionType="top-rated" />,
    mobileContent: <TabbedSectionPage sectionType="top-rated" />,
  },
  {
    id: "nearby",
    label: "Nearby",
    icon: <SectionIcon color="primary.dark" icon="fi fi-rs-marker" />,
    content: <TabbedSectionPage sectionType="nearby" />,
    mobileContent: <TabbedSectionPage sectionType="nearby" />,
  },
  {
    id: "verified-seller",
    label: "Verified Only",
    icon: <SectionIcon color="info.main" icon="fi fi-rr-shield-check" />,
    content: <TabbedSectionPage sectionType="verified-seller" />,
    mobileContent: <TabbedSectionPage sectionType="verified-seller" />,
  },
];
