import MatomoTracker, { types } from '@datapunt/matomo-tracker-js';
export interface MatomoInstance {
    trackEvent: MatomoTracker['trackEvent'];
    trackEvents: MatomoTracker['trackEvents'];
    trackPageView: MatomoTracker['trackPageView'];
    trackSiteSearch: MatomoTracker['trackSiteSearch'];
    trackLink: MatomoTracker['trackLink'];
    pushInstruction: MatomoTracker['pushInstruction'];
}
export declare type InstanceParams = types.UserOptions;
export declare type TrackPageViewParams = types.TrackPageViewParams;
export declare type TrackEventParams = types.TrackEventParams;
export declare type TrackSiteSearchParams = types.TrackSiteSearchParams;
export declare type TrackLinkParams = types.TrackLinkParams;
//# sourceMappingURL=types.d.ts.map