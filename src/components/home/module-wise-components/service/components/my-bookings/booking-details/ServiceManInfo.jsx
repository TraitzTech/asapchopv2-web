import React from "react";
import { Stack } from "@mui/material";
import CustomDivider from "components/CustomDivider";
import DeliveryManInfo from "components/my-orders/order-details/other-order/DeliveryManInfo";

// One card per serviceman assigned to the booking (same card as the delivery man).
const ServiceManInfo = ({ servicemenData = [], configData, storeData }) => {
  return (
    <Stack spacing={1} sx={{ width: "100%" }}>
      {servicemenData.map((serviceman, index) => (
        <React.Fragment key={serviceman?.id ?? index}>
          <DeliveryManInfo
            isBooking
            isServiceman
            deliveryManData={serviceman}
            configData={configData}
            storeData={storeData}
          />
          {index !== servicemenData.length - 1 && <CustomDivider border="1px" />}
        </React.Fragment>
      ))}
    </Stack>
  );
};

export default ServiceManInfo;
