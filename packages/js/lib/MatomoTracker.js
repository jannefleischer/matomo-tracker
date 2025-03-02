"use strict";
var __assign = (this && this.__assign) || function () {
    __assign = Object.assign || function(t) {
        for (var s, i = 1, n = arguments.length; i < n; i++) {
            s = arguments[i];
            for (var p in s) if (Object.prototype.hasOwnProperty.call(s, p))
                t[p] = s[p];
        }
        return t;
    };
    return __assign.apply(this, arguments);
};
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
var __spreadArray = (this && this.__spreadArray) || function (to, from, pack) {
    if (pack || arguments.length === 2) for (var i = 0, l = from.length, ar; i < l; i++) {
        if (ar || !(i in from)) {
            if (!ar) ar = Array.prototype.slice.call(from, 0, i);
            ar[i] = from[i];
        }
    }
    return to.concat(ar || Array.prototype.slice.call(from));
};
Object.defineProperty(exports, "__esModule", { value: true });
var constants_1 = require("./constants");
var MatomoTracker = /** @class */ (function () {
    function MatomoTracker(userOptions) {
        if (!userOptions.urlBase) {
            throw new Error('Matomo urlBase is required.');
        }
        if (!userOptions.siteId) {
            throw new Error('Matomo siteId is required.');
        }
        this.initialize(userOptions);
    }
    MatomoTracker.prototype.initialize = function (_a) {
        var _this = this;
        var _b;
        var urlBase = _a.urlBase, siteId = _a.siteId, userId = _a.userId, trackerUrl = _a.trackerUrl, srcUrl = _a.srcUrl, disabled = _a.disabled, heartBeat = _a.heartBeat, _c = _a.linkTracking, linkTracking = _c === void 0 ? true : _c, _d = _a.configurations, configurations = _d === void 0 ? {} : _d;
        var normalizedUrlBase = urlBase[urlBase.length - 1] !== '/' ? "".concat(urlBase, "/") : urlBase;
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
        this.pushInstruction('setTrackerUrl', trackerUrl !== null && trackerUrl !== void 0 ? trackerUrl : "".concat(normalizedUrlBase, "matomo.php"));
        this.pushInstruction('setSiteId', siteId);
        if (userId) {
            this.pushInstruction('setUserId', userId);
        }
        Object.entries(configurations).forEach(function (_a) {
            var name = _a[0], instructions = _a[1];
            if (instructions instanceof Array) {
                // eslint-disable-next-line @typescript-eslint/no-unsafe-argument
                _this.pushInstruction.apply(_this, __spreadArray([name], instructions, false));
            }
            else {
                _this.pushInstruction(name, instructions);
            }
        });
        // accurately measure the time spent on the last pageview of a visit
        if (!heartBeat || (heartBeat && heartBeat.active)) {
            this.enableHeartBeatTimer((_b = (heartBeat && heartBeat.seconds)) !== null && _b !== void 0 ? _b : 15);
        }
        // // measure outbound links and downloads
        // // might not work accurately on SPAs because new links (dom elements) are created dynamically without a server-side page reload.
        this.enableLinkTracking(linkTracking);
        var doc = document;
        var scriptElement = doc.createElement('script');
        var scripts = doc.getElementsByTagName('script')[0];
        scriptElement.type = 'text/javascript';
        scriptElement.async = true;
        scriptElement.defer = true;
        scriptElement.src = srcUrl || "".concat(normalizedUrlBase, "matomo.js");
        if (scripts && scripts.parentNode) {
            scripts.parentNode.insertBefore(scriptElement, scripts);
        }
    };
    MatomoTracker.prototype.enableHeartBeatTimer = function (seconds) {
        this.pushInstruction('enableHeartBeatTimer', seconds);
    };
    MatomoTracker.prototype.enableLinkTracking = function (active) {
        this.pushInstruction('enableLinkTracking', active);
    };
    MatomoTracker.prototype.trackEventsForElements = function (elements) {
        var _this = this;
        if (elements.length) {
            elements.forEach(function (element) {
                element.addEventListener('click', function () {
                    var _a = element.dataset, matomoCategory = _a.matomoCategory, matomoAction = _a.matomoAction, matomoName = _a.matomoName, matomoValue = _a.matomoValue;
                    if (matomoCategory && matomoAction) {
                        _this.trackEvent({
                            category: matomoCategory,
                            action: matomoAction,
                            name: matomoName,
                            value: Number(matomoValue),
                        });
                    }
                    else {
                        throw new Error("Error: data-matomo-category and data-matomo-action are required.");
                    }
                });
            });
        }
    };
    // Tracks events based on data attributes
    MatomoTracker.prototype.trackEvents = function () {
        var _this = this;
        var matchString = '[data-matomo-event="click"]';
        var firstTime = false;
        if (!this.mutationObserver) {
            firstTime = true;
            this.mutationObserver = new MutationObserver(function (mutations) {
                mutations.forEach(function (mutation) {
                    mutation.addedNodes.forEach(function (node) {
                        // only track HTML elements
                        if (!(node instanceof HTMLElement))
                            return;
                        // check the inserted element for being a code snippet
                        if (node.matches(matchString)) {
                            _this.trackEventsForElements([node]);
                        }
                        var elements = Array.from(node.querySelectorAll(matchString));
                        _this.trackEventsForElements(elements);
                    });
                });
            });
        }
        this.mutationObserver.observe(document, { childList: true, subtree: true });
        // Now track all already existing elements
        if (firstTime) {
            var elements = Array.from(document.querySelectorAll(matchString));
            this.trackEventsForElements(elements);
        }
    };
    MatomoTracker.prototype.stopObserving = function () {
        if (this.mutationObserver) {
            this.mutationObserver.disconnect();
        }
    };
    // Tracks events
    // https://matomo.org/docs/event-tracking/#tracking-events
    MatomoTracker.prototype.trackEvent = function (_a) {
        var category = _a.category, action = _a.action, name = _a.name, value = _a.value, otherParams = __rest(_a, ["category", "action", "name", "value"]);
        if (category && action) {
            this.track(__assign({ data: [constants_1.TRACK_TYPES.TRACK_EVENT, category, action, name, value] }, otherParams));
        }
        else {
            throw new Error("Error: category and action are required.");
        }
    };
    // Tracks site search
    // https://developer.matomo.org/guides/tracking-javascript-guide#internal-search-tracking
    MatomoTracker.prototype.trackSiteSearch = function (_a) {
        var keyword = _a.keyword, category = _a.category, count = _a.count, otherParams = __rest(_a, ["keyword", "category", "count"]);
        if (keyword) {
            this.track(__assign({ data: [constants_1.TRACK_TYPES.TRACK_SEARCH, keyword, category, count] }, otherParams));
        }
        else {
            throw new Error("Error: keyword is required.");
        }
    };
    // Tracks outgoing links to other sites and downloads
    // https://developer.matomo.org/guides/tracking-javascript-guide#enabling-download-outlink-tracking
    MatomoTracker.prototype.trackLink = function (_a) {
        var href = _a.href, _b = _a.linkType, linkType = _b === void 0 ? 'link' : _b;
        this.pushInstruction(constants_1.TRACK_TYPES.TRACK_LINK, href, linkType);
    };
    // Tracks page views
    // https://developer.matomo.org/guides/spa-tracking#tracking-a-new-page-view
    MatomoTracker.prototype.trackPageView = function (params) {
        this.track(__assign({ data: [constants_1.TRACK_TYPES.TRACK_VIEW] }, params));
    };
    // Adds a product to an Ecommerce order to be tracked via trackEcommerceOrder.
    // https://matomo.org/docs/ecommerce-analytics
    // https://matomo.org/docs/ecommerce-analytics/#1-addecommerceitemproductsku-productname-productcategory-price-quantity
    MatomoTracker.prototype.addEcommerceItem = function (_a) {
        var sku = _a.sku, productName = _a.productName, productCategory = _a.productCategory, _b = _a.productPrice, productPrice = _b === void 0 ? 0.0 : _b, _c = _a.productQuantity, productQuantity = _c === void 0 ? 1 : _c;
        this.pushInstruction('addEcommerceItem', sku, productName, productCategory, productPrice, productQuantity);
    };
    // Removes a product from an Ecommerce order to be tracked via trackEcommerceOrder.
    // https://matomo.org/docs/ecommerce-analytics
    MatomoTracker.prototype.removeEcommerceItem = function (_a) {
        var sku = _a.sku;
        this.pushInstruction('removeEcommerceItem', sku);
    };
    // Removes all products from an Ecommerce order to be tracked via trackEcommerceOrder.
    // https://matomo.org/docs/ecommerce-analytics
    MatomoTracker.prototype.clearEcommerceCart = function () {
        this.pushInstruction('clearEcommerceCart');
    };
    // Tracks an Ecommerce order containing items added via addEcommerceItem.
    // https://matomo.org/docs/ecommerce-analytics/#2-trackecommerceorderorderid-revenue-subtotal-tax-shipping-discount
    MatomoTracker.prototype.trackEcommerceOrder = function (_a) {
        var orderId = _a.orderId, orderRevenue = _a.orderRevenue, orderSubTotal = _a.orderSubTotal, taxAmount = _a.taxAmount, shippingAmount = _a.shippingAmount, _b = _a.discountOffered, discountOffered = _b === void 0 ? false : _b;
        this.track({
            data: [
                constants_1.TRACK_TYPES.TRACK_ECOMMERCE_ORDER,
                orderId,
                orderRevenue,
                orderSubTotal,
                taxAmount,
                shippingAmount,
                discountOffered,
            ],
        });
    };
    // Tracks updates to an Ecommerce Cart before an actual purchase.
    // This will replace currently tracked information of the cart. Always include all items of the updated cart!
    // https://matomo.org/docs/ecommerce-analytics/#example-tracking-an-ecommerce-cart-update-containing-two-products
    MatomoTracker.prototype.trackEcommerceCartUpdate = function (amount) {
        this.pushInstruction(constants_1.TRACK_TYPES.TRACK_ECOMMERCE_CART_UPDATE, amount);
    };
    // Marks the next page view as an Ecommerce product page.
    // https://matomo.org/docs/ecommerce-analytics/#example-tracking-a-product-page-view
    MatomoTracker.prototype.setEcommerceView = function (_a) {
        var sku = _a.sku, productName = _a.productName, productCategory = _a.productCategory, productPrice = _a.productPrice;
        this.pushInstruction('setEcommerceView', sku, productName, productCategory, productPrice);
    };
    // Marks the next tracked page view as an Ecommerce category page.
    // https://matomo.org/docs/ecommerce-analytics/#example-tracking-a-category-page-view
    MatomoTracker.prototype.setEcommerceCategoryView = function (productCategory) {
        this.setEcommerceView({ productCategory: productCategory, productName: false, sku: false });
    };
    // Sends the tracked page/view/search to Matomo
    MatomoTracker.prototype.track = function (_a) {
        var _this = this;
        var _b = _a.data, data = _b === void 0 ? [] : _b, _c = _a.documentTitle, documentTitle = _c === void 0 ? window.document.title : _c, href = _a.href, _d = _a.customDimensions, customDimensions = _d === void 0 ? false : _d;
        if (data.length) {
            if (customDimensions &&
                Array.isArray(customDimensions) &&
                customDimensions.length) {
                customDimensions.map(function (customDimension) {
                    return _this.pushInstruction('setCustomDimension', customDimension.id, customDimension.value);
                });
            }
            this.pushInstruction('setCustomUrl', href !== null && href !== void 0 ? href : window.location.href);
            this.pushInstruction('setDocumentTitle', documentTitle);
            this.pushInstruction.apply(this, data);
        }
    };
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
    MatomoTracker.prototype.pushInstruction = function (name) {
        var args = [];
        for (var _i = 1; _i < arguments.length; _i++) {
            args[_i - 1] = arguments[_i];
        }
        if (typeof window !== 'undefined') {
            // eslint-disable-next-line
            window._paq.push(__spreadArray([name], args, true));
        }
        return this;
    };
    return MatomoTracker;
}());
exports.default = MatomoTracker;
//# sourceMappingURL=MatomoTracker.js.map