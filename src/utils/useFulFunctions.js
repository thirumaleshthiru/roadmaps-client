import { useLocation } from "react-router-dom";

export const useCurrentLocation = () => {
  const location = useLocation();
  const currentUrl = `${window.location.origin}${location.pathname}`;
  return [location, currentUrl];
};
