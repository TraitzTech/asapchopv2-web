import PushNotificationLayout from "components/PushNotificationLayout";
import OtherOrder from "components/my-orders/order-details/other-order";
import useGetServiceBookingDetails from "../../../service-api-manage/hooks/react-query/booking/useGetServiceBookingDetails";

// Booking details reuse the shared order-details shell (summary, provider,
// serviceman and tracking tabs) in booking mode.
const BookingDetails = ({ configData, id, page }) => {
  const {
    data,
    refetch,
    isLoading: dataIsLoading,
  } = useGetServiceBookingDetails(id);

  return (
    <div>
      <PushNotificationLayout refetchTrackOrder={refetch} pathName="profile">
        <OtherOrder
          isBooking
          configData={configData}
          data={data}
          refetch={refetch}
          id={id}
          dataIsLoading={dataIsLoading}
          page={page}
        />
      </PushNotificationLayout>
    </div>
  );
};

export default BookingDetails;
