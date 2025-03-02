"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
var react_1 = require("react");
var useOutboundClickListener = function (matomoInstance) {
    var handleOutboundClick = function (event) {
        // The target is not guaranteed to be a link, it could be a child element.
        // Look up the element's parent until the anchor element is found.
        var findLinkElement = function (el) {
            if (el instanceof HTMLAnchorElement && el.href) {
                return el;
            }
            if (el instanceof HTMLElement && el.parentElement) {
                return findLinkElement(el.parentElement);
            }
            return null;
        };
        var target = findLinkElement(event.target);
        if (!(target instanceof HTMLAnchorElement)) {
            return;
        }
        var href = target.href;
        // Check if the click target differs from the current hostname, meaning it's external
        if (
        // eslint-disable-next-line @typescript-eslint/prefer-regexp-exec
        !href.match(new RegExp("^(http://www.|https://www.|http://|https://)+(".concat(window.location.hostname, ")")))) {
            matomoInstance.trackLink({ href: href });
        }
    };
    (0, react_1.useEffect)(function () {
        window.document.addEventListener('click', handleOutboundClick, {
            capture: true,
        });
        return function () {
            return window.document.removeEventListener('click', handleOutboundClick, {
                capture: true,
            });
        };
    }, []);
};
exports.default = useOutboundClickListener;
//# sourceMappingURL=useOutboundClickListener.js.map