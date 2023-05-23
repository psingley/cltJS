define([
    'jquery',
    'underscore',
    'backbone',
    'models/booking/tourCustomizations/CartDetailItemModel',
    'app',
    'text!templates/booking/paymentSummary/summaryDetailTemplate.html',
    'event.aggregator',
    'services/bookingService',
    'util/objectUtil',
    'util/dataLayerUtil'
], function ($, _, Backbone, CartDetailItemModel, App, summaryDetailTemplate, EventAggregator, BookingService, ObjectUtil,DataLayerUtil) {
    var SummaryView = Backbone.Marionette.ItemView.extend({
        model: CartDetailItemModel,
        tagName: 'div',
        className: function () {
            if (ObjectUtil.isEven(this.options.rowIndex)) {
                return 'itemRow';
            }
            return 'itemRow altRow';
        },
        template: Backbone.Marionette.TemplateCache.get(summaryDetailTemplate),
        events: {
            'click .icon_delete': 'removeService',
             
        },
        initialize: function () {
            if (ObjectUtil.isEven(this.options.rowIndex)) {
                //this.className += ' altRow';
            }
        },
        templateHelpers: function () {
            var outerScope = this;
            //var offerPrice = this.getTotalOfferPrice();
            return {
                descText: App.dictionary.get('common.Misc.Desc'),
                includedText: App.dictionary.get('tourRelated.Booking.RoomingTravelerInfo.Included'),
                getCommission: function () {
                    var commission = outerScope.model.get('commission');
                    if (commission <= 0) {
                        return '-';
                    }

                    var percentage = parseFloat(commission) * 100;
                    percentage = percentage.toFixed(2);
                    return percentage + '%';
                },
                getPrice: function () {
                    if (this.isRoomingService()) {
                        var roomPrice = outerScope.model.get('price');
                        if (!ObjectUtil.isNullOrEmpty(App.Booking.flightsPrice) && outerScope.model.get('serviceType').id === App.taxonomy.getId('serviceTypes', 'Package')) {
                            roomPrice += App.Booking.flightsPrice;
                        }


                        // 188080 - Extra fees are not including in the Package and Extension.
                        if (outerScope.model.get('serviceType').id === App.taxonomy.getId('serviceTypes', 'Package') && !ObjectUtil.isNullOrEmpty(App.Booking.tourAdditionalFeesPrice)) {
                            roomPrice += App.Booking.tourAdditionalFeesPrice / App.Booking.travelers.length;
                        }
                        if (outerScope.model.get('serviceType').id === App.taxonomy.getId('serviceTypes', 'Extension') && App.Booking.ExtensionFees.length > 0) {

                            var objFee = App.Booking.ExtensionFees;

                            var distinctFee = [];

                            distinctFee = _.uniq(objFee, false, function (fee) { return fee.itemId });

                            for (var i = 0; i < distinctFee.length; i++) {
                                if (outerScope.model.get("packageItemId") == distinctFee[i].itemId) {
                                    roomPrice += distinctFee[i].price / outerScope.model.get('quantity');
                                }
                            }
                        }

                        if (roomPrice > 0 && outerScope.model.get('serviceType').id === App.taxonomy.getId('serviceTypes', 'Package')) {
                            if (!ObjectUtil.isNullOrEmpty(App.Booking.discount) && App.Booking.discount.rate > 0) {
                                if (App.Booking.discount.doublePercentRate > 0) {
                                    roomPrice = Math.round(roomPrice - (roomPrice * App.Booking.discount.percentOff));
                                } else {
                                    roomPrice -= App.Booking.discount.rate;
                                }
                            }
                        }
                        return this.formatPriceToDigits(roomPrice);
                    }
                    if (outerScope.model.get('price') > 0) {
                        return this.formatPriceToDigits(outerScope.model.get('price'));
                    }

                    //if it is a credit
                    if (outerScope.model.get('price') < 0) {
                        return this.formatPriceToDigits(outerScope.model.get('price'));
                    }

                    var serviceType = outerScope.model.get('serviceType');
                    var feeTaxId = App.taxonomy.getId('serviceTypes', 'Fee  Tax');
                    var airId = App.taxonomy.getId('serviceTypes', 'Air');
                    if (outerScope.model.get('price') === 0 &&
                        (serviceType.id === feeTaxId || serviceType.id === airId)) {
                        return App.dictionary.get('tourRelated.Booking.TourCustomizations.TBD');
                    }

                    return '-';
                },
                getSummaryPrice: function () {

                    var serviceType = outerScope.model.get('serviceType');
                    if (ObjectUtil.isNullOrEmpty(serviceType)) {
                        console.log('serviceType is undefined');
                        return '-';
                    }

                    return this.getPrice();
                },
                getTotal: function () {
                    if (this.isRoomingService()) {
                        var roomPrice = outerScope.model.get('total');
                        if (!ObjectUtil.isNullOrEmpty(App.Booking.flightsPrice) && outerScope.model.get('serviceType').id === App.taxonomy.getId('serviceTypes', 'Package')) {
                            roomPrice += outerScope.model.get('quantity') * App.Booking.flightsPrice;
                        }

                        // 188080 - Extra fees are not including in the Package and Extension.
                        if (outerScope.model.get('serviceType').id === App.taxonomy.getId('serviceTypes', 'Package') && !ObjectUtil.isNullOrEmpty(App.Booking.tourAdditionalFeesPrice)) {
                            roomPrice += (App.Booking.tourAdditionalFeesPrice * outerScope.model.get('quantity')) / App.Booking.travelers.length;
                        }
                        if (outerScope.model.get('serviceType').id === App.taxonomy.getId('serviceTypes', 'Extension') && App.Booking.ExtensionFees.length > 0) {

                            var objFee = App.Booking.ExtensionFees;

                            var distinctFee = [];
                            distinctFee = _.uniq(objFee, false, function (fee) { return fee.itemId });

                            for (var i = 0; i < distinctFee.length; i++) {
                                if (outerScope.model.get("packageItemId") == distinctFee[i].itemId) {
                                    roomPrice += distinctFee[i].price;
                                }
                            }
                        }

                        if (roomPrice > 0 && outerScope.model.get('serviceType').id === App.taxonomy.getId('serviceTypes', 'Package')) {

                            if (!ObjectUtil.isNullOrEmpty(App.Booking.discount) && App.Booking.discount.rate > 0) {
                                if (App.Booking.discount.doublePercentRate > 0) {
                                    roomPrice = Math.round(roomPrice - (roomPrice * App.Booking.discount.percentOff));
                                } else {
                                    roomPrice -= outerScope.model.get('quantity') * App.Booking.discount.rate;
                                }
                            }

                        }
                        return this.formatPriceToDigits(roomPrice);
                    }

                    if (outerScope.model.get('total') > 0) {
                        return this.formatPriceToDigits(outerScope.model.get('total'));
                    }

                    //if it is a credit it will be negative
                    if (outerScope.model.get('total') < 0) {
                        return this.formatPriceToDigits(outerScope.model.get('total'));
                    }

                    var serviceType = outerScope.model.get('serviceType');
                    var feeTaxId = App.taxonomy.getId('serviceTypes', 'Fee  Tax');
                    var airId = App.taxonomy.getId('serviceTypes', 'Air');
                    if (outerScope.model.get('total') === 0 &&
                        (serviceType.id === feeTaxId || serviceType.id === airId)) {
                        return App.dictionary.get('tourRelated.Booking.TourCustomizations.TBD');
                    }

                    return '-';
                },
                getSummaryTotal: function () {
                    var serviceType = outerScope.model.get('serviceType');
                    if (ObjectUtil.isNullOrEmpty(serviceType)) {
                        console.log('serviceType is undefined');
                        return '-';
                    }

                    return this.getTotal();
                },
                isDeletable: function () {
                    var serviceType = outerScope.model.get('serviceType');

                    if (ObjectUtil.isNullOrEmpty(serviceType)) {
                        return false;
                    }

                    //get all types that can be deleted
                    var deletableTypes = [];
                    deletableTypes.push(App.taxonomy.getId('serviceTypes', 'Transfer'));
                    deletableTypes.push(App.taxonomy.getId('serviceTypes', 'Presold Option'));
                    deletableTypes.push(App.taxonomy.getId('serviceTypes', 'Insurance'));
                    deletableTypes.push(App.taxonomy.getId('serviceTypes', 'Optional'));

                    var isDeletable = $.inArray(serviceType.id, deletableTypes) > -1;

                    if (isDeletable) {
                        return true;
                    }

                    return false;
                },
                isAirService: function () {

                    //ignore tour customization tranfers
                    var serviceOrder = outerScope.model.get('serviceOrder');
                    if (!ObjectUtil.isNullOrEmpty(serviceOrder) && serviceOrder.name == "Pre") {
                        return false;
                    }
                    var serviceType = outerScope.model.get('serviceType');
                    var serviceTypeDetail = outerScope.model.get('serviceTypeDetail');

                    if (ObjectUtil.isNullOrEmpty(serviceType)) {
                        return false;
                    }
                    var airServiceTypes = [];
                    airServiceTypes.push(App.taxonomy.getId('serviceTypes', 'Air'));
                    airServiceTypes.push(App.taxonomy.getId('serviceTypes', 'Fee  Tax'));
                    var isAirServiceType = $.inArray(serviceType.id, airServiceTypes) > -1;

                    var isinternalAirServiceType = false;

                    if (serviceTypeDetail != null) {
                        var internalAirSeviceType = [];
                        internalAirSeviceType.push(App.taxonomy.getId('serviceTypeDetails', 'Internal'));
                        internalAirSeviceType.push(App.taxonomy.getId('serviceTypeDetails', 'Interflights'));
                        isinternalAirServiceType = $.inArray(serviceTypeDetail.id, internalAirSeviceType) > -1;
                    }

                    if ((isAirServiceType || isinternalAirServiceType) && outerScope.model.get('total') > 0) {
                        return true;
                    }
                    return false;

                },
                isInternalAir: function () {
                    var serviceType = outerScope.model.get('serviceType');
                    var serviceTypeDetail = outerScope.model.get('serviceTypeDetail');
                    var title = outerScope.model.get('title');

                    if (ObjectUtil.isNullOrEmpty(serviceTypeDetail) || ObjectUtil.isNullOrEmpty(title)) {
                        return false;
                    }

                    if (serviceTypeDetail.id == App.taxonomy.getId('serviceTypeDetails', 'Internal') ||
                        serviceTypeDetail.id == App.taxonomy.getId('serviceTypeDetails', 'Interflights')) {
                        return true;
                    }
                    return false;
                },
                isRoomingService: function () {

                    var serviceType = outerScope.model.get('serviceType');
                    if (ObjectUtil.isNullOrEmpty(serviceType)) {
                        return false;
                    }

                    // 188080 - Need to include the Extension as a Room service because all extensions would be assigned room(s).
                    return serviceType.id == App.taxonomy.getId('serviceTypes', 'Package') || serviceType.id == App.taxonomy.getId('serviceTypes', 'Extension');
                },
                isRoomingIncludedService: function () {

                    var serviceType = outerScope.model.get('serviceType');
                    if (ObjectUtil.isNullOrEmpty(serviceType)) {
                        return false;
                    }

                    var roomingServiceTypes = [];
                    roomingServiceTypes.push(App.taxonomy.getId('serviceTypes', 'Attraction'));
                    roomingServiceTypes.push(App.taxonomy.getId('serviceTypes', 'Miscellaneous'));

                    var isRoomingServiceType = $.inArray(serviceType.id, roomingServiceTypes) > -1;
                    return isRoomingServiceType;

                },

                isOfferPresent: function () {
                    var offerId = this.getOfferNeoId();
                    if (offerId == 0) {
                        return false;
                    }

                    var availableOffers = [
                        App.Booking.discount, App.Booking.aaaDiscount
                    ];
                    var matchedOffer = _.filter(availableOffers,
                        function (offer) {
                            return !ObjectUtil.isNullOrEmpty(offer) && offer.neoId === offerId;
                        });

                    return !ObjectUtil.isNullOrEmpty(matchedOffer) && matchedOffer.length > 0;
                },
                displayAsIncludedPrice: function () {
                    var x = this.isAirService();
                    var y = this.isInternalAir();
                    return (x && !y) || (this.isRoomingIncludedService() && !y) || this.isOfferPresent();

                },
                formatPriceToDigits: function (value) {
                    var price = value;
                    price = price.toFixed(2);
                    price = price.toString().formatPrice();
                    return price;
                },
                getOfferNeoId: function () {
                    return ObjectUtil.isNullOrEmpty(outerScope.model.get('offerId'))
                        ? 0
                        : parseInt(outerScope.model.get('offerId'));
                }
            }
        },
        getTotalOfferPrice: function () {
            var offerPrice = 0;

            if (!ObjectUtil.isNullOrEmpty(App.Booking.discount) && App.Booking.discount.rate > 0) {
                if (App.Booking.discount.doublePercentRate > 0) {
                    offerPrice = Math.round(offerPrice + (offerPrice * App.Booking.discount.percentOff));
                } else {
                    offerPrice += App.Booking.discount.rate;
                }
            }
            /*
                        if (!ObjectUtil.isNullOrEmpty(App.Booking.discount) && App.Booking.discount.rate > 0) {
                            offerPrice = offerPrice + App.Booking.hotDeal.rate;
                        }
                        if (!ObjectUtil.isNullOrEmpty(App.Booking.seasonalOffer) && App.Booking.seasonalOffer.rate > 0) {
                            offerPrice = offerPrice + App.Booking.seasonalOffer.rate;
                        }
                        if (!ObjectUtil.isNullOrEmpty(App.Booking.earlyBookingBonus) && App.Booking.earlyBookingBonus.rate > 0) {
                            offerPrice = offerPrice + App.Booking.earlyBookingBonus.rate;
                        }*/
            if (!ObjectUtil.isNullOrEmpty(App.Booking.aaaDiscount) && App.Booking.aaaDiscount.rate > 0) {
                offerPrice = offerPrice + App.Booking.aaaDiscount.rate;
            }
            //we cannot count percent offer here, because it does not have fixed amount 
            /*if (!ObjectUtil.isNullOrEmpty(App.Booking.percentageOffer) && App.Booking.percentageOffer.rate > 0){
                offerPrice = offerPrice + App.Booking.percentageOffer.rate;
            }*/
            return offerPrice;
        },
        removeService: function (e) {
            e.preventDefault();
            var outerScope = this;
            var cartDetailId = this.model.get('id');

            if (!ObjectUtil.isNullOrEmpty(cartDetailId)) {
                BookingService.summaryAndPayment_RemoveCartDetail(cartDetailId)
                    .done(function (response) {
                        console.log('cart detail successfully deleted');
                        App.Booking.cartDetailItems.remove(outerScope.model);
                        if (outerScope.model.get("serviceType").neoId == 17 /*insurance*/) {
                            App.Booking.Steps['flightStep'].travelProtection.removeInsurance();
                            App.Booking.Steps['summaryStep'].updateBookingInfo(response);
                            App.Booking.Steps['summaryStep'].paymentForm.updateAmountDue();
                            DataLayerUtil.PaymentDataLayer('Removed Insurance');
                        }
                        else {
                            var packageItemModel = App.Booking.assignedPackageUpgrades.find(function (upgrade) {
                                return upgrade.get('neoId') == outerScope.model.get('packageItemId');
                            });
                            if (!ObjectUtil.isNullOrEmpty(packageItemModel)) {
                                App.Booking.assignedPackageUpgrades.remove(packageItemModel);
                                App.Booking.Steps['summaryStep'].updateBookingInfo(response);
                                App.Booking.Steps['summaryStep'].paymentForm.updateAmountDue();
                                App.Booking.Steps['upgradesStep'].calculateStepPrice();
                                App.Booking.Steps['flightStep'].calculateStepPrice();
                                DataLayerUtil.PaymentDataLayer('Removed Item');
                            }
                        }
                    })
                    .fail(function (response) {
                        console.log('cart detail could not be deleleted ', response.responseText);
                    });
            }
        } 
       
    })
   

    return SummaryView;
});