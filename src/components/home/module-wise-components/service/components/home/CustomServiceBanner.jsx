import { Box, Button, Stack, Typography, useTheme } from "@mui/material";
import { alpha } from "@mui/material/styles";
import { useRouter } from "next/router";
import { useTranslation } from "react-i18next";
import { getToken } from "helper-functions/getToken";
import toast from "react-hot-toast";
import { not_logged_in_message } from "utils/toasterMessages";

// "Can't find what you need?" call to action for the custom (bidding) request flow.
const CustomServiceBanner = () => {
  const { t } = useTranslation();
  const theme = useTheme();
  const router = useRouter();

  const handleClick = () => {
    if (!getToken()) {
      toast.error(t(not_logged_in_message));
      return;
    }
    router.push("/service/custom-service/create");
  };

  return (
    <Box
      sx={{
        width: "100%",
        borderRadius: "16px",
        backgroundColor: alpha(theme.palette.primary.main, 0.08),
        px: { xs: 2, md: 4 },
        py: { xs: 2, md: 3 },
      }}
    >
      <Stack
        direction={{ xs: "column", sm: "row" }}
        alignItems={{ xs: "flex-start", sm: "center" }}
        justifyContent="space-between"
        gap={2}
      >
        <Stack spacing={0.5}>
          <Typography
            sx={{
              fontSize: { xs: "16px", md: "20px" },
              fontWeight: 700,
              color: "neutral.1050",
              letterSpacing: "-0.4px",
            }}
          >
            {t("Can't find the service you need?")}
          </Typography>
          <Typography sx={{ fontSize: { xs: "13px", md: "14px" }, color: "neutral.500" }}>
            {t("Post a custom request and let providers send you their offers.")}
          </Typography>
        </Stack>
        <Button
          variant="contained"
          disableElevation
          onClick={handleClick}
          sx={{
            flexShrink: 0,
            px: 3,
            py: 1.1,
            borderRadius: "10px",
            textTransform: "none",
            fontWeight: 600,
          }}
        >
          {t("Post Custom Request")}
        </Button>
      </Stack>
    </Box>
  );
};

export default CustomServiceBanner;
