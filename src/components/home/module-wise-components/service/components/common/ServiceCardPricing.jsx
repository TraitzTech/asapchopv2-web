import { getAmountWithSign } from "helper-functions/CardHelpers";

// Price block shared by the service cards: the discounted price is computed by
// the API (`discounted_price`); fall back to deriving it from discount/discount_type.
export const getServiceCardPricing = (item) => {
  const originalPrice = Number(item?.base_price ?? item?.price ?? 0);
  const discount = Number(item?.discount ?? 0);
  const isPercent = item?.discount_type === "percent";

  const derivedPrice =
    discount > 0
      ? Math.max(
          originalPrice -
            (isPercent ? (originalPrice * discount) / 100 : discount),
          0
        )
      : originalPrice;
  const displayPrice =
    item?.discounted_price != null && discount > 0
      ? Number(item.discounted_price)
      : derivedPrice;

  return {
    displayPrice,
    originalPrice,
    discountText:
      discount > 0
        ? isPercent
          ? `-${discount}%`
          : `-${getAmountWithSign(discount)}`
        : null,
  };
};
