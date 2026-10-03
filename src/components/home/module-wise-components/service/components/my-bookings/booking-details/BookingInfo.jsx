import { Grid, Stack, Typography } from "@mui/material";
import { getAmountWithSign } from "helper-functions/CardHelpers";
import { CustomTypographyEllipsis } from "styled-components/CustomTypographies.style";
import CustomDivider from "components/CustomDivider";
import CustomImageContainer from "components/CustomImageContainer";

const getVariationName = (variations) => {
  const list = Array.isArray(variations) ? variations : [];
  const names = list
    .map((variation) => variation?.name ?? variation?.variant_key)
    .filter(Boolean);
  return names.join(", ");
};

const BookingInfo = ({ data, items, t, isSmall }) => {
  return (
    <Grid item xs={12} sm={12} md={12}>
      {data?.description ? (
        <Stack
          sx={{ pl: { xs: "0px", sm: "20px", md: "25px" }, mb: "13px" }}
          spacing={0.5}
        >
          <Typography fontSize="14px" fontWeight="700">
            {t("Service Description")}
          </Typography>
          <Typography variant="body2" sx={{ wordBreak: "break-word" }}>
            {data.description}
          </Typography>
        </Stack>
      ) : null}
      {items?.length > 0 &&
        items.map((service) => {
          const variation = getVariationName(service?.item_details?.variations);
          return (
            <Grid
              container
              alignItems="flex-start"
              md={12}
              xs={12}
              spacing={{ xs: 1 }}
              key={service?.id}
              mb="13px"
              pl={{ xs: "0px", sm: "20px", md: "25px" }}
            >
              <Grid item xs={3} sm={1.2} md={1.2}>
                <CustomImageContainer
                  src={service?.image_full_url}
                  height="63px"
                  maxWidth="63px"
                  width="100%"
                  loading="lazy"
                  smHeight="70px"
                  borderRadius=".7rem"
                />
              </Grid>
              <Grid item md={10.8} xs={9} sm={10.8} align="left">
                <Stack
                  direction={{ xs: "column", md: "row" }}
                  justifyContent="space-between"
                  paddingBottom={{ xs: "5px", md: "0px" }}
                >
                  <Stack>
                    <CustomTypographyEllipsis fontWeight="500" fontSize="13px">
                      {t(service?.item_details?.name)}
                    </CustomTypographyEllipsis>
                    {variation ? (
                      <Typography variant="body2" mt="3px">
                        {t("Variation")}: {variation}
                      </Typography>
                    ) : null}
                    <Typography variant="body2" mt="5px">
                      {t("Unit Price")} :{" "}
                      {getAmountWithSign(service?.item_details?.price)}
                    </Typography>
                  </Stack>
                  <Stack
                    direction={isSmall ? "column-reverse" : "column"}
                    gap="5px"
                  >
                    <Typography fontSize="14px" fontWeight="bold">
                      {getAmountWithSign(
                        Number(service?.price ?? 0) * Number(service?.quantity ?? 1)
                      )}
                    </Typography>
                    <Typography variant="body2" mt="8px">
                      {t("Qty")}: {service?.quantity}
                    </Typography>
                  </Stack>
                </Stack>
              </Grid>
              <CustomDivider border="1px" />
            </Grid>
          );
        })}
    </Grid>
  );
};

export default BookingInfo;
