var __rest = (this && this.__rest) || function (s, e) {
    var t = {};
    for (var p in s) if (Object.prototype.hasOwnProperty.call(s, p) && e.indexOf(p) < 0)
        t[p] = s[p];
    if (s != null && typeof Object.getOwnPropertySymbols === "function")
        for (var i = 0, p = Object.getOwnPropertySymbols(s); i < p.length; i++) {
            if (e.indexOf(p[i]) < 0 && Object.prototype.propertyIsEnumerable.call(s, p[i]))
                t[p[i]] = s[p[i]];
        }
    return t;
};
import { TRACK_TYPES } from './constants';
class MatomoTracker {
    constructor(userOptions) {
        if (!userOptions.urlBase) {
            throw new Error('Matomo urlBase is required.');
        }
        if (!userOptions.siteId) {
            throw new Error('Matomo siteId is required.');
        }
        this.initialize(userOptions);
    }
    initialize({ urlBase, siteId, userId, trackerUrl, srcUrl, disabled, heartBeat, linkTracking = true, configurations = {}, }) {
        var _a;
        const normalizedUrlBase = urlBase[urlBase.length - 1] !== '/' ? `${urlBase}/` : urlBase;
        if (typeof window === 'undefined') {
            return;
        }
        window._paq = window._paq || [];
        if (window._paq.length !== 0) {
            return;
        }
        if (disabled) {
            return;
        }
        this.pushInstruction('setTrackerUrl', trackerUrl !== null && trackerUrl !== void 0 ? trackerUrl : `${normalizedUrlBase}matomo.php`);
        this.pushInstruction('setSiteId', siteId);
        if (userId) {
            this.pushInstruction('setUserId', userId);
        }
        Object.entries(configurations).forEach(([name, instructions]) => {
            if (instructions instanceof Array) {
                // eslint-disable-next-line @typescript-eslint/no-unsafe-argument
                this.pushInstruction(name, ...instructions);
            }
            else {
                this.pushInstruction(name, instructions);
            }
        });
        // accurately measure the time spent on the last pageview of a visit
        if (!heartBeat || (heartBeat && heartBeat.active)) {
            this.enableHeartBeatTimer((_a = (heartBeat && heartBeat.seconds)) !== null && _a !== void 0 ? _a : 15);
        }
        // // measure outbound links and downloads
        // // might not work accurately on SPAs because new links (dom elements) are created dynamically without a server-side page reload.
        this.enableLinkTracking(linkTracking);
        const doc = document;
        const scriptElement = doc.createElement('script');
        const scripts = doc.getElementsByTagName('script')[0];
        scriptElement.type = 'text/javascript';
        scriptElement.async = true;
        scriptElement.defer = true;
        scriptElement.src = srcUrl || `${normalizedUrlBase}matomo.js`;
        if (scripts && scripts.parentNode) {
            scripts.parentNode.insertBefore(scriptElement, scripts);
        }
    }
    enableHeartBeatTimer(seconds) {
        this.pushInstruction('enableHeartBeatTimer', seconds);
    }
    enableLinkTracking(active) {
        this.pushInstruction('enableLinkTracking', active);
    }
    trackEventsForElements(elements) {
        if (elements.length) {
            elements.forEach((element) => {
                element.addEventListener('click', () => {
                    const { matomoCategory, matomoAction, matomoName, matomoValue } = element.dataset;
                    if (matomoCategory && matomoAction) {
                        this.trackEvent({
                            category: matomoCategory,
                            action: matomoAction,
                            name: matomoName,
                            value: Number(matomoValue),
                        });
                    }
                    else {
                        throw new Error(`Error: data-matomo-category and data-matomo-action are required.`);
                    }
                });
            });
        }
    }
    // Tracks events based on data attributes
    trackEvents() {
        const matchString = '[data-matomo-event="click"]';
        let firstTime = false;
        if (!this.mutationObserver) {
            firstTime = true;
            this.mutationObserver = new MutationObserver((mutations) => {
                mutations.forEach((mutation) => {
                    mutation.addedNodes.forEach((node) => {
                        // only track HTML elements
                        if (!(node instanceof HTMLElement))
                            return;
                        // check the inserted element for being a code snippet
                        if (node.matches(matchString)) {
                            this.trackEventsForElements([node]);
                        }
                        const elements = Array.from(node.querySelectorAll(matchString));
                        this.trackEventsForElements(elements);
                    });
                });
            });
        }
        this.mutationObserver.observe(document, { childList: true, subtree: true });
        // Now track all already existing elements
        if (firstTime) {
            const elements = Array.from(document.querySelectorAll(matchString));
            this.trackEventsForElements(elements);
        }
    }
    stopObserving() {
        if (this.mutationObserver) {
            this.mutationObserver.disconnect();
        }
    }
    // Tracks events
    // https://matomo.org/docs/event-tracking/#tracking-events
    trackEvent(_a) {
        var { category, action, name, value } = _a, otherParams = __rest(_a, ["category", "action", "name", "value"]);
        if (category && action) {
            this.track(Object.assign({ data: [TRACK_TYPES.TRACK_EVENT, category, action, name, value] }, otherParams));
        }
        else {
            throw new Error(`Error: category and action are required.`);
        }
    }
    // Tracks site search
    // https://developer.matomo.org/guides/tracking-javascript-guide#internal-search-tracking
    trackSiteSearch(_a) {
        var { keyword, category, count } = _a, otherParams = __rest(_a, ["keyword", "category", "count"]);
        if (keyword) {
            this.track(Object.assign({ data: [TRACK_TYPES.TRACK_SEARCH, keyword, category, count] }, otherParams));
        }
        else {
            throw new Error(`Error: keyword is required.`);
        }
    }
    // Tracks outgoing links to other sites and downloads
    // https://developer.matomo.org/guides/tracking-javascript-guide#enabling-download-outlink-tracking
    trackLink({ href, linkType = 'link' }) {
        this.pushInstruction(TRACK_TYPES.TRACK_LINK, href, linkType);
    }
    // Tracks page views
    // https://developer.matomo.org/guides/spa-tracking#tracking-a-new-page-view
    trackPageView(params) {
        this.track(Object.assign({ data: [TRACK_TYPES.TRACK_VIEW] }, params));
    }
    // Adds a product to an Ecommerce order to be tracked via trackEcommerceOrder.
    // https://matomo.org/docs/ecommerce-analytics
    // https://matomo.org/docs/ecommerce-analytics/#1-addecommerceitemproductsku-productname-productcategory-price-quantity
    addEcommerceItem({ sku, productName, productCategory, productPrice = 0.0, productQuantity = 1, }) {
        this.pushInstruction('addEcommerceItem', sku, productName, productCategory, productPrice, productQuantity);
    }
    // Removes a product from an Ecommerce order to be tracked via trackEcommerceOrder.
    // https://matomo.org/docs/ecommerce-analytics
    removeEcommerceItem({ sku }) {
        this.pushInstruction('removeEcommerceItem', sku);
    }
    // Removes all products from an Ecommerce order to be tracked via trackEcommerceOrder.
    // https://matomo.org/docs/ecommerce-analytics
    clearEcommerceCart() {
        this.pushInstruction('clearEcommerceCart');
    }
    // Tracks an Ecommerce order containing items added via addEcommerceItem.
    // https://matomo.org/docs/ecommerce-analytics/#2-trackecommerceorderorderid-revenue-subtotal-tax-shipping-discount
    trackEcommerceOrder({ orderId, orderRevenue, orderSubTotal, taxAmount, shippingAmount, discountOffered = false, }) {
        this.track({
            data: [
                TRACK_TYPES.TRACK_ECOMMERCE_ORDER,
                orderId,
                orderRevenue,
                orderSubTotal,
                taxAmount,
                shippingAmount,
                discountOffered,
            ],
        });
    }
    // Tracks updates to an Ecommerce Cart before an actual purchase.
    // This will replace currently tracked information of the cart. Always include all items of the updated cart!
    // https://matomo.org/docs/ecommerce-analytics/#example-tracking-an-ecommerce-cart-update-containing-two-products
    trackEcommerceCartUpdate(amount) {
        this.pushInstruction(TRACK_TYPES.TRACK_ECOMMERCE_CART_UPDATE, amount);
    }
    // Marks the next page view as an Ecommerce product page.
    // https://matomo.org/docs/ecommerce-analytics/#example-tracking-a-product-page-view
    setEcommerceView({ sku, productName, productCategory, productPrice, }) {
        this.pushInstruction('setEcommerceView', sku, productName, productCategory, productPrice);
    }
    // Marks the next tracked page view as an Ecommerce category page.
    // https://matomo.org/docs/ecommerce-analytics/#example-tracking-a-category-page-view
    setEcommerceCategoryView(productCategory) {
        this.setEcommerceView({ productCategory, productName: false, sku: false });
    }
    // Sends the tracked page/view/search to Matomo
    track({ data = [], documentTitle = window.document.title, href, customDimensions = false, }) {
        if (data.length) {
            if (customDimensions &&
                Array.isArray(customDimensions) &&
                customDimensions.length) {
                customDimensions.map((customDimension) => this.pushInstruction('setCustomDimension', customDimension.id, customDimension.value));
            }
            this.pushInstruction('setCustomUrl', href !== null && href !== void 0 ? href : window.location.href);
            this.pushInstruction('setDocumentTitle', documentTitle);
            this.pushInstruction(...data);
        }
    }
    /**
     * Pushes an instruction to Matomo for execution, this is equivalent to pushing entries into the `_paq` array.
     *
     * For example:
     *
     * ```ts
     * pushInstruction('setDocumentTitle', document.title)
     * ```
     * Is the equivalent of:
     *
     * ```ts
     * _paq.push(['setDocumentTitle', document.title]);
     * ```
     *
     * @param name The name of the instruction to be executed.
     * @param args The arguments to pass along with the instruction.
     */
    pushInstruction(name, ...args) {
        if (typeof window !== 'undefined') {
            // eslint-disable-next-line
            window._paq.push([name, ...args]);
        }
        return this;
    }
}
export default MatomoTracker;
//# sourceMappingURL=MatomoTracker.js.map