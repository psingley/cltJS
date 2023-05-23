define([
    'jquery',
    'underscore',
    'backbone',
    'app',
    'moment',
    'util/TourDetailUtil',
    'util/DateUtil'
], function ($, _, Backbone, App, moment, TourDetailUtil, DateUtil) {
    var offersUtil = {
        types: {
            ebb: '{E5E4A4D6-E14C-4B9F-9948-0F9FEF1A709E}',
            aaa: '{CB56D845-933E-45A4-B2B4-533C0909C2CD}',
            hotDeal: '{6225BAB3-6328-4F41-9028-22BCC844D1D4}',
            seasonal: '{135BA961-96D0-495F-8A75-2C87959E69DC}',
            percent: '{A5612DD0-3391-4324-8BE0-F18098EE6DC3}'
        },
        isHotDeal: function(offer){
            if (offer.offerWebsiteType == null) {
                return false;
            }
            return offer.offerWebsiteType.id == this.types.hotDeal;
        },
        isPercentOff: function(offer){
            if (offer.offerWebsiteType == null) {
                return false;
            }
            return offer.offerWebsiteType.id == this.types.percent;
        },
        isSeasonal: function(offer){
            if (offer.offerWebsiteType == null) {
                return false;
            }
            return offer.offerWebsiteType.id == this.types.seasonal;
        },
        isEBB: function (offer) {
        	if (offer.offerWebsiteType == null) {
        		return false;
        	}
        	return offer.offerWebsiteType.id == this.types.ebb;
        },
		maxOfferPrice: function(offers){
			if (offers != null && offers.length > 0) {
				offers.sort(function (a, b) { return b.rate - a.rate });
				var maxOffer = offers[0];
				if (maxOffer.percentOff > 0) {
					return maxOffer.percentOff * 100 + '%';
				} else if (maxOffer.rate != null) {
					return maxOffer.rate.toString().formatPrice();
				}
			}
		},
        findEbb: function (datesCollection) {
            var outerScope = this;
            var discount;
            datesCollection.forEach(function(item){
                var itemDiscount = item.get("discount");
                //check if this is ebb
                if (itemDiscount != undefined && itemDiscount.rate > 0
                    && outerScope.isEBB(itemDiscount))
                {
                    if (discount == undefined || discount.rate < itemDiscount.rate){
                        discount = itemDiscount;
                    }
                }
            });
            return discount;
        },
        isOfferValid: function(offer){
            return _.find(offer.offerDateRanges, function(item){
                return DateUtil.validToday(item.startDate, item.endDate);
                    }) != null
                && (
                    !offer.offerWebsiteType.vanityCodeRequired
                    ||  _.find(offer.vanityCodes, function(item){
                return DateUtil.validToday(item.startDate, item.endDate);
                        }) != null
                );
        },
        getOfferExpirationDate: function(offer){
        	var vanity = this.getCurrentVanityCodeObject(offer);
			if (vanity == null) {
				return null;
			}
            var endDate = moment(vanity.endDate);
            if (endDate == null){
                return null;
            }
            return endDate.format(App.siteSettings.dateFormat);
        },
        getOfferDisclaimer: function (offerWebsiteTypeId) {
        	if (!App.Tour || !App.Tour.settings || !App.Tour.settings.offerTypes)
        	{
        		return null;//todo check this logic
        	}

            var offer = _.findWhere(App.Tour.settings.offerTypes, { id: offerWebsiteTypeId });
            if (offer == null) {
                return "";
            }
            return offer.disclaimer;
        },
        getCurrentOffers: function(offersList){
          return offersList.filter(function(item){
              return _.any(item.offerDateRanges, function(dates){
                        return DateUtil.validToday(dates.startDate, dates.endDate);
                    })
                    && (!item.offerWebsiteType.vanityCodeRequired
                        || _.any(item.vanityCodes, function(vanityCode){
                                return DateUtil.validToday(vanityCode.startDate, vanityCode.endDate);
                        }));
          });
        },
        getCurrentVanityCodeObject: function(discount) {
            if (discount == undefined || discount.vanityCodes.length == 0) {
                return null;
            }

            var currentVanityCodes = discount.vanityCodes.filter(function (item) {
                return DateUtil.validToday(item.startDate, item.endDate);
            });

            if (currentVanityCodes.length == 0) {
                return null;
            }
            return currentVanityCodes[0];
        },
        getCurrentVanity: function(discount) {
            return this.getCurrentVanityCodeObject(discount).vanityCode;
        },
        filterForBadges: function(offersList, filterValue) {
            var outerScope = this;
            var result = [];

            // make sure we work only with offers that should be shown today
            offersList = outerScope.getCurrentOffers(offersList);

            // if particular offer type is chosen
            if (filterValue != null) {
                // we need to take that particular offer
                var offer;
                offersList.forEach(function (item) {
                    //check if this is ebb
                    if (item != undefined && item.rate > 0
                        && item.offerWebsiteType.name == filterValue) {
                        if (offer == undefined || offer.rate < item.rate) {
                            offer = item;
                        }
                    }
                });
                if (offer != undefined){
                    result.push(offer);
                }
            }

            // if current selection is not for hotDeal and we have it, add additional badge
            var hotDealInResults = _.find(result, function(item){
                return outerScope.isHotDeal(item);
            });

            var hotDealInOffers = _.find(offersList, function(item){
                return outerScope.isHotDeal(item);
            });

            if (hotDealInResults == undefined && hotDealInOffers != undefined){
                result.push(hotDealInOffers);
            }
            else {
                // add seasonal saving badge only if there is no hot deal and no EBB in result
                var seasonalInResults = _.find(result, function(item){
                    return outerScope.isSeasonal(item);
                });
                var ebbInResults = _.find(result, function(item){
                    return outerScope.isEBB(item);
                });

                var seasonal = _.find(offersList, function(item){
                    return outerScope.isSeasonal(item);
                });

                if (seasonalInResults == undefined && ebbInResults == undefined && seasonal != undefined) {
                    result.push(seasonal);
                }
            }
            return result;
        },
        getBadges: function(offersList, filterValue){
            var outerScope = this;
            var offersToShow = this.filterForBadges(offersList, filterValue);
            return offersToShow.map(function (item){
                var title;
                if (item.offerWebsiteType.name == filterValue){
                    title = App.dictionary.get("tourRelated.FreeFormText.SaveUpTo") + ' ' + outerScope.getPriceText(item.rate);
                }
                else {
                    title = item.offerWebsiteType.name;
                }

                return {
                    title: title,
                    cssClass: item.offerWebsiteType.badgeCssClass,
                    iconClass: item.offerWebsiteType.badgeIconCssClass
                }
            });
        },
        getPriceText: function(price){
            return App.siteSettings.currencySymbol + TourDetailUtil.formatNumberWithCommas(price) + App.dictionary.get("tourRelated.FreeFormText.PP");
        }
    };

    return offersUtil;
});