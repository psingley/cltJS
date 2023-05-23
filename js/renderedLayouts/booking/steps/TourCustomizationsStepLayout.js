/**
 * The step layout for Tour Customizations on the booking page
 *
 * @class TourCustomizationsStepLayout
 * @extends BaseSteLayout
 */
define([
    'jquery',
    'underscore',
    'backbone',
    'marionette',
    'app',
    'renderedLayouts/booking/steps/BaseStepLayout',
    'services/bookingService',
    'util/booking/bookingUtil',
    'views/validation/ErrorView',
    'collections/booking/tourCustomizations/CartDetailItemCollection',
    'event.aggregator',
    'views/booking/tourCustomizations/OnTourChoiceDayListView',
    'views/booking/tourCustomizations/TourOptionLayoutView',
    'views/booking/tourCustomizations/TourUpgradeLayoutView',
    'views/booking/tourCustomizations/PrePostLayoutView',
    'util/ObjectUtil',
    'models/booking/tourCustomizations/PrePostLayoutModel',
    'collections/booking/tourCustomizations/BookingPackageUpgradeCollection',
    'collections/booking/tourCustomizations/PackageUpgradesGroupedByDayCollection',
    'models/booking/tourCustomizations/PackageUpgradesGroupedByDayModel',
    'goalsUtil',
    'util/dataLayerUtil',
    'util/travelerUtil'
], function ($, _, Backbone, Marionette, App, BaseStepLayout, BookingService, BookingUtil, ErrorView, CartDetailItemCollection, EventAggregator, OnTourChoiceDayListView, TourOptionLayoutView, TourUpgradesLayoutView, PrePostLayoutView, ObjectUtil, PrePostLayoutModel,
             PackageUpgradeCollection, PackageUpgradesGroupedCollection,PackageUpgradesGroupedByDayModel, goalsUtil, DataLayerUtil, TravelerUtil) {
	var TourCustomizationsStepLayout = BaseStepLayout.extend({
		el: '#TourCustomizations',
		events: {
			'click .button_next': 'submitStep'
		},
		regions: function () {
			var baseStepRegions = TourCustomizationsStepLayout.__super__.regions;

			var customizationsRegions = {
				prePostRegion: '#prePostRegion',
				onTourChoicesRegion: '#onTourChoices',
				tourOptionRegion: '#optionionalExcursions',
				tourUpgradesRegion: '#tourUpgrades'
			};

			return _.extend(baseStepRegions, customizationsRegions);
		},
		initialize: function () {
			this.constructor.__super__.initialize.apply(this);

			var outerScope = this;
			EventAggregator.on('getBookingComplete', function (booking) {
                App.Booking.preExtensions = booking.preExtensions;
                App.Booking.postExtensions = booking.postExtensions;
                App.Booking.preUpgrades = booking.preUpgrades;
                App.Booking.postUpgrades = booking.postUpgrades;
                App.Booking.duringTourChoices = booking.duringTourChoices;
                App.Booking.insurance = booking.insurance;
                App.Booking.tourOptions = booking.tourOptions;
			    App.Booking.cruiseUpgradesGroup = booking.cruiseUpgradesGroup; 
			    App.Booking.roomUpgradesGroup = booking.roomUpgradesGroup;
			    App.Booking.isAAAVacationsTour = booking.get('isaaaVacationsTour');

			    //get all of the pres and posts together
                App.Booking.presAndPosts =
                    booking.preExtensions.toJSON()
                        .concat(booking.postExtensions.toJSON())
                        .concat(booking.preUpgrades.toJSON())
                        .concat(booking.postUpgrades.toJSON());

                outerScope.initViews();
                if (!ObjectUtil.isNullOrEmpty(App.Booking.Steps['upgradesStep'])) {
                    App.Booking.Steps['upgradesStep'].stepPrice = BookingUtil.adjustStepPrice(outerScope.getStepDiv(), 0);
                }

                BookingUtil.adjustGrandTotal();
			});

			EventAggregator.on('roomingAndTravelersStepComplete', function () {
				outerScope.onRoomingAndTravelersStepComplete();
            });
         
		},
        initOnTourChoices: function(){
            if (App.Booking.duringTourChoices.length == 0) {
                $(this.onTourChoicesRegion.el).closest(".section").hide();
            } else {
                var collection = new PackageUpgradesGroupedCollection();

                for (var i = 1; i <= App.Booking.totalNumberOfItineraryDays; i++) {
                    var onTourChoices = new PackageUpgradeCollection();
                    onTourChoices.set(
                        _(App.Booking.duringTourChoices.filter(function (packageUpgrade) {

                        	var isOnTourServiceOrder = (packageUpgrade.get('serviceDay') == i) && 
													   (packageUpgrade.get("parentTourLayoutId") == '') && (packageUpgrade.get("packagePrompt").neoId != 0);

                            return isOnTourServiceOrder;
                        })).map(function (onTourChoice) {
                            return onTourChoice;
                        })
                    );
                    if (onTourChoices.length > 0){
                        collection.add(new PackageUpgradesGroupedByDayModel({
                            dayNumber: i,
                            packageUpgrades:onTourChoices,
                            description:onTourChoices.models[0].get("description")
                        }))
                    }
                }
                this.onTourChoicesRegion.show(new OnTourChoiceDayListView({ collection: collection }));
            }
        },
        initViews:function(){
            this.initOnTourChoices();

            var prePostLayoutModel = new PrePostLayoutModel(App.Booking.sections.tourCustomizationsSection);
            this.prePostRegion.show(new PrePostLayoutView({
                model: prePostLayoutModel,
                preUpgrades: App.Booking.preUpgrades,
                postUpgrades: App.Booking.postUpgrades,
                preExtensions: App.Booking.preExtensions,
                postExtensions: App.Booking.postExtensions
            }));

            this.tourOptionRegion.show(new TourOptionLayoutView({
                collection: App.Booking.tourOptions
            }));

            this.tourUpgradesRegion.show(new TourUpgradesLayoutView({
                cruiseUpgradesGroup: App.Booking.cruiseUpgradesGroup,
                roomUpgradesGroup: App.Booking.roomUpgradesGroup
            }));
        },
		submitStep: function (e) {
			if (this.validateStep()) {
                this.submitTourCustomizations(e, true);
                TravelerUtil.FillPartialTraveler();

			}
		},
		onRoomingAndTravelersStepComplete: function () {
			this.updateSubmissionStatus();
		},
		submitTourCustomizations: function (e, stepSwitch) {
			var outerScope = this;
            e.preventDefault();

            if (stepSwitch) {
                EventAggregator.on('tourCustomizationsPrepared', function (callId) {
                    if (callId > outerScope.lastCallId)
                    {
                        outerScope.lastCallId++;
                        outerScope.saveChanges(e);
                    }
                });
                EventAggregator.trigger('submitTourCustomizationsClick');
            }
            else {
                 BookingService.tourCustomizationsForm_Complete()
                    .done(function (response) {
                            outerScope.updateBookingInfo(response);

                            EventAggregator.trigger('submitTourCustomizationsComplete');
                            outerScope.calculateStepPrice();
                    })
                    .fail(function () {
                        outerScope.messagesRegion.show(new ErrorView(['There was an issue setting the tour customizations']));
                    });
            }

		},
        lastCallId: 0,
        saveChanges: function(e){
            var outerScope = this;
            BookingService.tourCustomizationsForm_Complete()
                .done(function (response) {
                    outerScope.updateBookingInfo(response);

                    BookingUtil.getAirDefaults();

                    EventAggregator.trigger('submitTourCustomizationsComplete');
                    outerScope.calculateStepPrice();

                    //submit goal for compeleting Booking engine tour customization step
                    goalsUtil.bookingEngineAddCustomizations();

                    BookingUtil.goToNextStep(e);

                    DataLayerUtil.PaymentDataLayer();
                   
                })
                .fail(function () {
                    outerScope.messagesRegion.show(new ErrorView(['There was an issue setting the tour customizations']));
                });
        },
		calculateStepPrice: function () {
			var prices = [];
			var travelers = App.Booking.travelers;

			App.Booking.assignedPackageUpgrades.each(function (upgrade) {
				var serviceType = upgrade.get('serviceType');
				var serviceOrder = upgrade.get('serviceOrder');

				//criteria to not add the price
				var isTransfer = serviceType.id === App.taxonomy.getId('serviceTypes', 'Transfer');
				var isOnTour = serviceOrder.id === App.taxonomy.getId('serviceOrders', 'Tour');
				var isAttraction = serviceType.id === App.taxonomy.getId('serviceTypes', 'Attraction') && ObjectUtil.isNullOrEmpty(upgrade.get('parentTourLayoutId'));
                var isMisc = serviceType.id === App.taxonomy.getId('serviceTypes', 'Miscellaneous') && ObjectUtil.isNullOrEmpty(upgrade.get('parentTourLayoutId'));
                var isFeeTax = serviceType.id === App.taxonomy.getId('serviceTypes', 'Fee  Tax') && ObjectUtil.isNullOrEmpty(upgrade.get('parentTourLayoutId'));

                if (isTransfer && isOnTour || (isAttraction || isMisc || isFeeTax)) {
					return;
				}

				if (serviceType.id === App.taxonomy.getId('serviceTypes', 'Transfer') && serviceOrder.id !== App.taxonomy.getId('serviceOrders', 'Tour')) {
					prices.push(upgrade.get('price'));
				}
				else {
                    prices.push(upgrade.get('price') * upgrade.get('quantity'));
				}
				var childUpgrades = upgrade.get('childPackageUpgrades');
				if (childUpgrades != null && childUpgrades.length > 0) {
					_.each(childUpgrades,
						function(child) {
							if (child.serviceTypeDetail.name != 'Park Fees') {
								prices.push(child.prices[0].contractPrice * App.Booking.travelers.length);
							}
						});
				}
			});

			this.stepPrice = BookingUtil.adjustStepPrice(this.getStepDiv(), prices);
			BookingUtil.adjustGrandTotal();
		}
	});
	return TourCustomizationsStepLayout;
});