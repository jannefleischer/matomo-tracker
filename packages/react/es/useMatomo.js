import { useCallback, useContext } from 'react';
import MatomoContext from './MatomoContext';
import useOutboundClickListener from './utils/useOutboundClickListener';
function useMatomo() {
    const instance = useContext(MatomoContext);
    const trackPageView = useCallback((params) => instance === null || instance === void 0 ? void 0 : instance.trackPageView(params), [instance]);
    const trackEvent = useCallback((params) => instance === null || instance === void 0 ? void 0 : instance.trackEvent(params), [instance]);
    const trackEvents = useCallback(() => instance === null || instance === void 0 ? void 0 : instance.trackEvents(), [instance]);
    const trackSiteSearch = useCallback((params) => instance === null || instance === void 0 ? void 0 : instance.trackSiteSearch(params), [instance]);
    const trackLink = useCallback((params) => instance === null || instance === void 0 ? void 0 : instance.trackLink(params), [instance]);
    const enableLinkTracking = useCallback(() => {
        if (instance) {
            useOutboundClickListener(instance);
        }
    }, [instance]);
    const pushInstruction = useCallback((name, ...args) => {
        // eslint-disable-next-line @typescript-eslint/no-unsafe-argument
        instance === null || instance === void 0 ? void 0 : instance.pushInstruction(name, ...args);
    }, [instance]);
    return {
        trackEvent,
        trackEvents,
        trackPageView,
        trackSiteSearch,
        trackLink,
        enableLinkTracking,
        pushInstruction,
    };
}
export default useMatomo;
//# sourceMappingURL=useMatomo.js.map