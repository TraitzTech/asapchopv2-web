# Service Module — React (web) addon

Real implementation of the 33 placeholder files in
`src/components/home/module-wise-components/service/` of the 6amMart React app.
Copy the `src/` folder over the React app (same paths, it replaces the stubs). Nothing else in the
React app is modified.

## What is in here

| Area | Files |
| --- | --- |
| API | `service-api-manage/ApiRoutes.js`, `helpers/bookingAdapter.js`, all hooks under `hooks/` |
| Home | `Service.js`, `serviceSectionsConfig.js`, `components/home/*`, `components/global/ServiceSearchBanner.jsx` |
| Service page | `components/service-details/*`, `components/global/VariationModal.jsx`, `components/common/ServiceCardPricing.jsx` |
| Provider page | `components/provider-details/index.js` |
| Checkout | `components/service-checkout/*` (booking options, summary, page) |
| Bookings | `components/my-bookings/*` (list, details parts, repeat-booking log, serviceman) |
| Custom service / requested services | `components/custom-service/*`, `components/service-request/index.js` |
| Languages | `src/language/service_keys_en.js.txt`, `src/language/service_keys_fr.js.txt` |

Every screen reuses the existing React building blocks (`ModuleHomeSidebarLayout`, `NewProductCard`,
`NewStoreCard`, `Top` of the store page, `DeliveryAddress`, `AddPaymentMethod`, `OfflineForm`,
`OtherOrder`, `StatusBadge`, `CustomModal` ...), so the look matches the other modules.

## Languages (English + French)

* **English** — paste `service_keys_en.js.txt` at the end of the `english` object in `src/language/en.js`
  (add a comma after the previous last entry).
* **French** — the React app has no `fr` file yet. Create `src/language/fr.js`:

  ```js
  export const french = {
    // paste service_keys_fr.js.txt here
  };
  ```

  and register it in `src/language/i18n.js` (`import { french } from "./fr";` and
  `fr: { translation: french }` inside `resources`). Keys that are not translated fall back to English.

## Backend notes (already done in `Service Module - Addon/Service`)

* `POST /api/v1/service/customer/booking/re-booking` is the URL the shared "re-order" hook calls; it is an
  alias of `booking/rebook`.
* `GET service/booking/list` returns `all_count`, `running_count`, `history_count` for the tab badges.
* `GET service/search` accepts `list_type=store` (providers), `quick_action`
  (`top_rated`, `verified_seller`, `discounted`), `rating_count`, `store_id`, and every service/provider
  card now carries `module_type: "service"` (the shared cards switch on it).
* `POST service/reviews/submit` accepts `serviceman_id` to rate a single serviceman.
* Booking JSON is flat; `helpers/bookingAdapter.js` maps it to the grouped shape the shared order screens
  read (`amount.*`, `status_history.<status>`, `booking_details`).

## Integration points in the existing React app (not changed here)

1. **Cart → checkout.** The cart drawer (`added-cart-view/CartActions.js`) always pushes `/checkout`.
   For the service module it must push `/service/checkout?page=cart&store_id=<provider id>` instead.
   `ServiceInformation` already uses that URL for the "Proceed To Checkout" button
   (`useServiceCheckoutGate`: signed-in → checkout, guest checkout allowed → guest modal, otherwise sign-in).
2. **Cart API.** Service lines use the shared cart endpoints (`customer/cart/add|update|remove-item`) with
   `model: "Service"` (or `"ItemCampaign"` for campaign services), `service_id`, and `variants:
   [{variant_key, quantity}]`. The add response must be a list of cart rows
   `{ id, service: {...}, quantity, price, variation: {variant_key, name, price} | null }`
   (a one-item list is accepted too).
3. **Digital payment** is started with `payment_platform: "web"` and a `callback`; the booking API returns
   `redirect_link` and the page navigates to it. The gateway result is handled by the module's
   `/service-booking-payment` route.
4. **Guest bookings** are tracked from `/track-order` (booking id + phone) — the existing track page already
   switches to `useGetServiceBookingTrack` for the service module.
