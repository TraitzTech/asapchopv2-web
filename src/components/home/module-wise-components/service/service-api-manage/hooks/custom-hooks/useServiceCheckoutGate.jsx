import { useRef, useState } from "react";
import dynamic from "next/dynamic";
import { useRouter } from "next/router";
import { useSelector } from "react-redux";
import GuestCheckoutModal from "components/cards/GuestCheckoutModal";
import { getToken } from "helper-functions/getToken";

const AuthModal = dynamic(() => import("components/auth/AuthModal"));

/**
 * Sends the visitor to the service checkout, asking them to sign in (or continue
 * as a guest when the platform allows it) first — same gate the cart drawer uses.
 *
 * const { goToCheckout, gateNode } = useServiceCheckoutGate();
 * goToCheckout({ page: "cart", store_id: 3 });
 */
export default function useServiceCheckoutGate() {
  const router = useRouter();
  const { configData } = useSelector((state) => state.configData);
  const [guestOpen, setGuestOpen] = useState(false);
  const [authOpen, setAuthOpen] = useState(false);
  const [modalFor, setModalFor] = useState("sign-in");
  const pendingQuery = useRef(null);

  const push = (query = pendingQuery.current) => {
    const moduleParam = router.query?.module;
    router
      .push(
        {
          pathname: "/service/checkout",
          query: { ...query, ...(moduleParam && { module: moduleParam }) },
        },
        undefined,
        { shallow: true }
      )
      .then(() => window.scrollTo({ top: 0, behavior: "smooth" }));
  };

  const goToCheckout = (query) => {
    pendingQuery.current = query;
    if (getToken()) {
      push(query);
    } else if (configData?.guest_checkout_status === 1) {
      setGuestOpen(true);
    } else {
      setModalFor("sign-in");
      setAuthOpen(true);
    }
  };

  const gateNode = (
    <>
      {guestOpen && (
        <GuestCheckoutModal
          open={guestOpen}
          setOpen={setGuestOpen}
          setSideDrawerOpen={() => {}}
          handleRoute={() => push()}
          setModalFor={setModalFor}
          setOpenAuth={setAuthOpen}
        />
      )}
      <AuthModal
        modalFor={modalFor}
        setModalFor={setModalFor}
        open={authOpen}
        handleClose={() => setAuthOpen(false)}
      />
    </>
  );

  return { goToCheckout, gateNode };
}
