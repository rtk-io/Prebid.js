const d3 = require('d3-queue');
const utils = require('./utils');
const adaptermanager = require('./adaptermanager');
const bidmanager = require('./bidmanager');

let q = d3.queue();

export const auctionmanager = (function() {
  let _auction;

  function _getAuction() {
    return _auction;
  }

  function _handleBidReceived(bid) {
    _auction.bidsReceived.push(bid);
    console.log('bid received for auction: ', _auction);
  }

  function _holdAuction({ requestId, adUnits, cbTimeout, adUnitCodes }) {
    const proxy = {
      close: new _closeAuction()
    };

    q.defer((done) => {
      console.log('deferred bid request auction id: ', requestId);
      _auction = Object.assign(proxy, arguments[0]);
      adaptermanager.callBids({ adUnits, adUnitCodes, cbTimeout, done });
    });
  }

  function _closeAuction() {
    return () => {
      utils.logMessage('auction closed with id ' + this.requestId);
      return this;
    };
  }

  //function _createAuction() {
  //  const auction = new Auction();
  //  _addAuction(auction);
  //  return auction;
  //}
  //
  //function _getAuction(auctionId) {
  //  _auctions.find(auction => auction.auctionId === auctionId);
  //}
  //
  //function _addAuction(auction) {
  //  _auctions.push(auction);
  //}
  //
  //function _removeAuction(auction) {
  //  _auctions.splice(_auctions.indexOf(auction), 1);
  //}
  //
  //function _findAuctionsByBidderCode(bidderCode) {
  //  var _bidderCode = bidderCode;
  //  return _auctions.filter(_auction => _auction.getBidderRequests()
  //    .filter(bidderRequest => bidderRequest.bidderCode === _bidderCode));
  //}
  //
  //function Auction() {
  //  var _id = utils.getUniqueIdentifierStr();
  //  var _adUnits = [];
  //  var _targeting = [];
  //  var _bidderRequests = [];
  //  var _bidsReceived = [];
  //
  //  this.setAdUnits = (adUnits) => _adUnits = adUnits;
  //  this.setTargeting = (targeting) => _targeting = targeting;
  //  this.setBidderRequests = (bidderRequests) => _bidderRequests = bidderRequests;
  //  this.setBidsReceived = (bidsReceived) =>_bidsReceived = _bidsReceived.concat(bidsReceived);
  //
  //  this.getId = () => _id;
  //  this.getAdUnits = () => _adUnits;
  //  this.getBidderRequests = () => _bidderRequests;
  //  this.getBidsReceived = () => _bidsReceived;
  //  this.getTargeting = () => _targeting;
  //
  //  this.callBids = function callBids() {
  //    adaptermanager.callBids(this);
  //  };
  //}

  return {
    holdAuction() {
      return _holdAuction(...arguments);
    },

    closeAuction() {
      return _closeAuction();
    },

    getAuction() {
      return _getAuction();
    },

    handleBidReceived() {
      _handleBidReceived(...arguments);
    }
  };
}());
