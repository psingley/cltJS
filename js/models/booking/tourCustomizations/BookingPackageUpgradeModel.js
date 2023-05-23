define([
    'jquery',
    'underscore',
    'backbone',
    'event.aggregator',
    'app',
    'util/objectUtil',
    'models/tour/packageUpgrades/PackageUpgradeModel'
], function ($, _, Backbone, EventAggregator, App, ObjectUtil, PackageUpgradeModel) {
    var BookingPackageUpgradeModel = PackageUpgradeModel.extend({
        initialize: function () {
            var outerScope = this;
            this.setIsSelected();

            EventAggregator.on('getRoomTypeComplete', function () {
                outerScope.setPriceUpdateEvent();
            });
        },
        setPriceUpdateEvent: function () {
            var outerScope = this;
            //the price of this package upgrade which will be modified below
            var price = 0;
            var prices = this.get('prices');

            var serviceType = this.get('serviceType');
            var serviceOrder = this.get('serviceOrder');
            var quantityType = serviceType.quantityType;
            var serviceTypeDetail = this.get('serviceTypeDetail');

            //get all of the current room guest configs
            var roomGuestConfigsIds = [];
            App.Booking.rooms.each(function (room) {
                var guestConfig = room.get('guestConfig');
                if (!ObjectUtil.isNullOrEmpty(guestConfig)) {
                    roomGuestConfigsIds.push(guestConfig.id);
                }
            });

            if (quantityType.id == App.taxonomy.getId('quantityTypes', 'Per Room')) {
                _.each(prices, function (priceItem) {
                    if (roomGuestConfigsIds.indexOf(priceItem.guestConfig.id) > -1 && priceItem.serviceTypeDetail.id === serviceTypeDetail.id) {
                        price += outerScope.calculatePriceForPassengers(priceItem);
                    }
                });

                // add additional prices into extension price
                var totalExtensionFees = 0;
                if (serviceType.id === App.taxonomy.getId('serviceTypes', 'Extension') && this.get("childPackageUpgrades").length > 0) {
                    this.get("childPackageUpgrades").forEach(function (upgrade) {

                        // Does we have child and Adult price item in the upgrade Prices. If Yes then we should take adults and child differently.
                        var anyChildContracts = upgrade.prices.filter(function (priceItem) {
                            return priceItem.passengerType.name == 'Child';
                        });

                        var noOfAdults = 0;
                        var noOfChilds = 0;
                        var Adults = App.Booking.travelers.filter(function (traveler) {
                            return traveler.get('passengerType').name == 'Adult';
                        });
                        var Childs = App.Booking.travelers.filter(function (traveler) {
                            return traveler.get('passengerType').name == 'Child';
                        });

                        if (anyChildContracts.length == 0) {
                            // No Child contracts, so price should be taken for Adult.
                            noOfAdults = Adults.length + Childs.length;
                        } else {
                            noOfAdults = Adults.length;
                            noOfChilds = Childs.length;
                        }

                        _.each(upgrade.prices, function (priceItem) {
                            
                        	//do not include inter air since we now show it separately
                        	if (priceItem.serviceTypeDetail.name != 'Internal' &&
								priceItem.serviceTypeDetail.name != 'Interflights') {
								
								if (priceItem.guestConfig.id == App.taxonomy.getId('guestConfigs', 'Single') &&
									priceItem.serviceTypeDetail.name == 'Park Fees') {

									if (anyChildContracts.length == 0) {
										totalExtensionFees += priceItem.contractPrice * noOfAdults;
										price += priceItem.contractPrice * noOfAdults;
									} else {
										if (priceItem.passengerType.name == 'Adult') {
											totalExtensionFees += priceItem.contractPrice * noOfAdults;
											price += priceItem.contractPrice * noOfAdults;
										} else if (priceItem.passengerType.name == 'Child') {
											totalExtensionFees += priceItem.contractPrice * noOfChilds;
											price += priceItem.contractPrice * noOfChilds;
										}
									}
								} else {
									var upgradeFee = outerScope.calculatePriceForPassengers(priceItem);
									totalExtensionFees += upgradeFee;
									price += upgradeFee;
								}
							}
                        });
                    });
                }

                // This will be added in the Summary information.
                if (totalExtensionFees > 0) {
                    var extensionFees = {
                        itemId: outerScope.get("neoId"),
                        price: totalExtensionFees
                    };
                    App.Booking.ExtensionFees.push(extensionFees);
                }
            }

            //if per person just get one contract price
            if (quantityType.id == App.taxonomy.getId('quantityTypes', 'Per Person')) {
                var perPersonPrice = _.find(prices, function (price) {
                    var isAdultPassengerType = price.passengerType.id == App.taxonomy.getId('passengerTypes', 'Adult');
                    /*var isSingleGuestConfig = price.guestConfig.id == App.taxonomy.getId('guestConfigs', 'Single');*/

                    return isAdultPassengerType;
                });

                if (perPersonPrice != undefined) {
                    price = perPersonPrice.contractPrice;
                }

                //if it is a transfer multiply the price by the amount of travelers
                if (serviceType.id === App.taxonomy.getId('serviceTypes', 'Transfer') && serviceOrder.id !== App.taxonomy.getId('serviceOrders', 'Tour')) {
                    price = price * App.Booking.travelers.length;
                }

                //if it is an attraction or miscellaneous multiply the price by the amount of travelers
                if (serviceType.id === App.taxonomy.getId('serviceTypes', 'Attraction')
                    || serviceType.id === App.taxonomy.getId('serviceTypes', 'Miscellaneous')
                    || serviceType.id === App.taxonomy.getId('serviceTypes', 'Fee  Tax')) {
                    price = price * App.Booking.travelers.length;
                }

                price = price.toFixed(2);
            }

            this.set({price: price});
            EventAggregator.trigger('packageUpgrade:' + this.get('id') + ':changed', price);
        },
        calculatePriceForPassengers: function(priceItem){
            var price = 0;
            if (priceItem == null) {
                return price;
            }
            //check which room is associated with current priceItem
            var associatedRooms = App.Booking.rooms.filter(function(room) {
                if (!ObjectUtil.isNullOrEmpty(room.get('guestConfig')))
                    return room.get('guestConfig').id === priceItem.guestConfig.id;
            });

            var travelerCids = [];
            var associatedRoomTravelers = [];

            //Check which travelers are associtaed with each room in the retrieved list
            _.each(associatedRooms, function(room) {
                _.each(room.get('travelerCids'),
                    function(id) {
                        travelerCids.push(id);
                    });
            });

            //Retrieve only the associated rooming travelers
            App.Booking.travelers.each(function (traveler) {
                if (travelerCids.indexOf(traveler.cid) > -1) {
                    associatedRoomTravelers.push(traveler);
                }
            });
            //get all of the travelers with the same passenger type as the price item
            var associatedTravelers = associatedRoomTravelers.filter(function (traveler) {
                return traveler.get('passengerType').id === priceItem.passengerType.id;
            });
            //iterate through the travelers and add the price for as many travelers are present
            _.each(associatedTravelers, function () {
                price += priceItem.contractPrice;
            });
            return price;
        },
        setIsSelected: function () {
            var outerScope = this;
            var cartDetailItem = App.Booking.cartDetailItems.find(function (cartDetailItem) {
                var upgradePackageId = cartDetailItem.get('upgradePackageId');
                if (!ObjectUtil.isNullOrEmpty(upgradePackageId)) {
                    return cartDetailItem.get('upgradePackageId') === outerScope.get('id');
                }
                return;
            });

            if (cartDetailItem !== undefined) {
                this.set({selected: true});
            }
        }
    });
    return BookingPackageUpgradeModel;
});