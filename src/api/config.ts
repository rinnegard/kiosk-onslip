import { API, webRequestHandler } from "@onslip/onslip-360-web-api";

export const initializeApi = () => {
    const hawk = import.meta.env.VITE_HAWK_ID;
    const key = import.meta.env.VITE_KEY;
    const realm = import.meta.env.VITE_REALM;

    API.initialize(webRequestHandler({}));
    return new API("https://test.onslip360.com/v1/", realm, hawk, key);
};