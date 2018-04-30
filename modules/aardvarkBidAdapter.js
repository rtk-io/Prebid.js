import * as utils from 'src/utils';
import {registerBidder} from 'src/adapters/bidderFactory';

const BIDDER_CODE = 'aardvark';
const DEFAULT_HOST = 'thor.rtk.io';
const AARDVARK_TTL = 300;
const AARDVARK_CURRENCY = 'USD';

export const spec = {
    code: BIDDER_CODE,

    isBidRequestValid: function(bid) {
        return ((typeof bid.rtkid !== 'undefined') && bid.hasOwnProperty('devices') &&
            (typeof bid.adtgid === 'string') && !!bid.adtgid.length &&
            !!bid.sizes.length &&
            (typeof bid.params.ai === 'string') && !!bid.params.ai.length &&
            (typeof bid.params.sc === 'string') && !!bid.params.sc.length)
    },

    buildRequests: function(validBidRequests) {
        var payload = {
                rtkreferer: utils.getTopWindowUrl(),
                categories: window.rtkcategories || [],
                version: 1,
                jsonp: false
            },
            host = false,
            auctionId = false,
            shortCodes = [];

        utils._each(validBidRequests, function(b) {
            // AuctionId, if not already set, one per request. Take first.
            if (!auctionId)
                auctionId = b.params.ai;

            shortCodes.push(b.params.sc);

            // CNAME support for destination host. Take first.
            if (!host && (typeof b.params.host === 'string' && b.params.host.length))
                host = b.params.host;

            // For each bid request we pass a bid request id so we can map back results
            payload[b.params.sc] = b.bidId;
        });

        // Without auction id or short (ad unit) codes there is nothing to do
        if (!auctionId.length || !shortCodes.length)
            return utils.logError("Bad parameters passed to adapter, Aardvark will not bid.");

        if (!host.length)
            host = DEFAULT_HOST;

        return {
            method: 'GET',
            url: `//${host}/${auctionId}/${shortCodes.join('_')}/aardvark`,
            data: payload,
        };
    },

    interpretResponse: function(serverResponse, bidRequest) {
        const bidResponses = [];
        utils._each(serverResponse.body, function(rawBid) {
            var bidResponse = {
                requestId: rawBid.bidId,
                cpm: rawBid.cpm,
                width: rawBid.width,
                height: rawBid.height,
                currency: rawBid.currency ? rawBid.currency : AARDVARK_CURRENCY,
                creativeId: rawBid.creativeId ? (+rawBid.creativeId) : 0,
                netRevenue: rawBid.netRevenue ? rawBid.netRevenue : true,
                ttl: rawBid.ttl ? rawBid.ttl : AARDVARK_TTL,
                exchange: rawBid.ex
            };

            if (rawBid.hasOwnProperty('dealId'))
                bidResponse.dealId = rawBid.dealId

            switch (rawBid.media) {
                case "banner":
                    bidResponse.ad = rawBid.ad + utils.createTrackPixelHtml(decodeURIComponent(rawBid.nurl));
                    break;

                default:
                    return utils.logError("bad Aardvark response (media)", rawBid);
            }

            bidResponses.push(bidResponse);
        });

        return bidResponses;
    },

    getUserSyncs: function(syncOptions, serverResponses) {
        const syncs = []
        if (syncOptions.iframeEnabled) {
            syncs.push({
                type: 'iframe',
                url: '//thor.rtk.io/cs'
            });
        } else {
            utils.logWarn('Aardvark: Please enable iframe based user sync.');
        }
        return syncs;
    }
}
registerBidder(spec);

