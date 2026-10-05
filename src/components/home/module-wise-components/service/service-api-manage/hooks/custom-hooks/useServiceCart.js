import { useState } from "react";
import toast from "react-hot-toast";
import { useTranslation } from "react-i18next";
import { useDispatch, useSelector } from "react-redux";
import { onErrorResponse } from "api-manage/api-error-response/ErrorResponses";
import useAddCartItem from "api-manage/hooks/react-query/add-cart/useAddCartItem";
import useDeleteCartItem from "api-manage/hooks/react-query/add-cart/useDeleteCartItem";
import { getCartListModuleWise } from "helper-functions/getCartListModuleWise";
import { getGuestId } from "helper-functions/getToken";
import { setCart, setCartList, setRemoveItemFromCart } from "redux/slices/cart";

const unwrap = (variation) => (Array.isArray(variation) ? variation[0] : variation);

const variantKey = (variation) =>
  unwrap(variation)?.variant_key ?? unwrap(variation)?.name;

const toCartItem = (row) => ({
  ...(row?.item ?? row?.service ?? {}),
  cartItemId: row?.id,
  quantity: row?.quantity,
  totalPrice: row?.price,
  selectedOption: row?.variation ?? null,
});

/**
 * Cart actions of one service for the details page: the same add / update flow the
 * service card uses (core cart endpoints with model "Service").
 */
export default function useServiceCart(service) {
  const { t } = useTranslation();
  const reduxDispatch = useDispatch();
  const { cartList: rawCartList } = useSelector((state) => state.cart);
  const [isSyncing, setIsSyncing] = useState(false);

  const { mutateAsync: addAsync } = useAddCartItem();
  const { mutateAsync: removeAsync } = useDeleteCartItem();

  const lines = getCartListModuleWise(rawCartList).filter(
    (item) => item.id === service?.id
  );
  const count = lines.reduce((sum, line) => sum + (line.quantity ?? 0), 0);
  const selected = lines
    .filter((line) => line.selectedOption != null)
    .map((line) => ({
      variation: unwrap(line.selectedOption),
      quantity: line.quantity ?? 1,
    }));

  const model = service?.available_date_starts ? "ItemCampaign" : "Service";

  const buildPayload = (picked) => {
    const hasVariants = picked.some(({ variation }) => variation);
    const unit = Number(service?.discounted_price ?? service?.base_price ?? 0);
    if (!hasVariants) {
      return {
        guest_id: getGuestId(),
        model,
        service_id: service?.id,
        price: unit * (picked[0]?.quantity ?? 1),
        quantity: picked[0]?.quantity ?? 1,
        variation: [],
      };
    }
    const variants = picked.map(({ variation, quantity }) => ({
      variant_key: variation?.variant_key,
      quantity,
    }));
    const price = picked.reduce(
      (sum, { variation, quantity }) =>
        sum + Number(variation?.discounted_price ?? variation?.price ?? 0) * (quantity ?? 1),
      0
    );
    return {
      guest_id: getGuestId(),
      model,
      service_id: service?.id,
      price,
      quantity: 1,
      variants,
    };
  };

  // Replace this service's lines in the cart with `picked` (add when nothing is there yet).
  const sync = async (picked) => {
    setIsSyncing(true);
    try {
      const keep = new Map(picked.map(({ variation, quantity }) => [variantKey(variation), quantity]));
      const previous = new Map(selected.map(({ variation, quantity }) => [variantKey(variation), quantity]));
      const unchanged =
        keep.size === previous.size &&
        [...keep.entries()].every(([key, quantity]) => previous.get(key) === quantity);
      if (unchanged && lines.length > 0) {
        toast(t("No changes to update"), { icon: "⚠️" });
        return false;
      }

      const toRemove = lines.filter(
        (line) => line.selectedOption != null && !keep.has(variantKey(line.selectedOption))
      );
      const removals = await Promise.allSettled(
        toRemove.map((line) =>
          removeAsync({
            cart_id: line.cartItemId,
            store_id: line.store_id ?? line.store?.id,
            guestId: getGuestId(),
          }).then(() => reduxDispatch(setRemoveItemFromCart(line)))
        )
      );
      removals
        .filter((result) => result.status === "rejected")
        .forEach((result) => onErrorResponse(result.reason));

      if (picked.length > 0) {
        const response = await addAsync({
          postData: buildPayload(picked),
          store_id: service?.store_id,
        });
        if (response) {
          if (lines.length > 0) {
            reduxDispatch(setCartList(response.map(toCartItem)));
            toast.success(t("Cart updated"));
          } else {
            let product = {};
            response.forEach((row) => {
              product = toCartItem(row);
            });
            reduxDispatch(setCart(product));
            toast.success(t("Item added to cart"));
          }
        }
      }
      return true;
    } catch (error) {
      onErrorResponse(error);
      return false;
    } finally {
      setIsSyncing(false);
    }
  };

  return { lines, count, selected, isInCart: lines.length > 0, isSyncing, sync };
}
