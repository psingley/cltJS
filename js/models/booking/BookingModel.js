define([
    'jquery',
    'underscore',
    'backbone',
    'collections/booking/tourCustomizations/BookingPackageUpgradeCollection',
    'models/booking/tourCustomizations/BookingPackageUpgradeModel',
    'models/booking/tourCustomizations/PackageUpgradeGroupModel',
    'collections/booking/tourCustomizations/PackageUpgradeGroupCollection',
    'collections/booking/travelerInformation/TravelerCollection',
    'models/booking/travelerInformation/TravelerModel',
    'collections/booking/rooms/RoomCollection',
    'models/booking/rooms/RoomModel',
    'models/booking/travelerInformation/AdditionalInfoModel',
    'models/booking/travelerInformation/ContactInfoModel',
    'models/booking/travelerInformation/PassportInfoModel',
    'collections/booking/tourCustomizations/CartDetailItemCollection',
    'models/booking/tourCustomizations/CartDetailItemModel',
    'app'
], function ($, _, Backbone, PackageUpgradeCollection, PackageUpgradeModel, PackageUpgradeGroupModel, PackageUpgradeGroupCollection, TravelerCollection, TravelerModel, RoomCollection, RoomModel, AdditionalInfoModel, ContactInfoModel, PassportInfoModel, CartDetailItemCollection, CartDetailItemModel, App) {
    var BookingModel = Backbone.Model.extend({
        defaults: {
            cartId: 0,
            numberOfItineraryDays: 0,
        	totalNumberOfItineraryDays: 0,
        },
        initialize: function () {
            //different types of pacakge upgrades
            this.inTourTransfers = new PackageUpgradeCollection();
            this.preUpgrades = new PackageUpgradeCollection();
            this.postUpgrades = new PackageUpgradeCollection();
            this.preExtensions = new PackageUpgradeCollection();
            this.postExtensions = new PackageUpgradeCollection();
            this.tourOptions = new PackageUpgradeCollection();
            this.cruiseUpgrades = new PackageUpgradeCollection();
            this.cruiseUpgradesGroup = new PackageUpgradeGroupCollection();
            this.roomUpgrades = new PackageUpgradeCollection();
            this.roomUpgradesGroup = new PackageUpgradeGroupCollection();
            this.duringTourChoices = new PackageUpgradeCollection();
            this.insurance = new PackageUpgradeCollection();
            this.tourAdditionalFees = new PackageUpgradeCollection();

            //fetch calls an on change event.
            this.on("change", this.fetchCollections);
        },
        url: function () {
            var siteName = App.siteSettings.siteName;
            return '/Services/Booking/BookingService.asmx/GetBooking?site=' + siteName;
        },
        parse: function (response) {
            var data = JSON.parse(response.d);
            return data;
        },
        fetchCollections: function () {
            var packageUpgradeSections = this.get('packageUpgradeSections');

            //set the cart detail items before any of the packge upgrades
            App.Booking.cartDetailItems.setCartDetailItems(this.get('cartDetailItems'));

            //when we call fetch for the model we want to fill its collections
            this.tourAdditionalFees.set(
                _(packageUpgradeSections.tourAdditionalFees).map(function (packageUpgrade) {
                    return new PackageUpgradeModel(packageUpgrade);
                })
            );

            //when we call fetch for the model we want to fill its collections
            this.duringTourChoices.set(
                _(packageUpgradeSections.duringTourChoices).map(function (packageUpgrade) {
                    return new PackageUpgradeModel(packageUpgrade);
                })
            );

            //when we call fetch for the model we want to fill its collections
            this.insurance.set(
                _(packageUpgradeSections.insurance).map(function (packageUpgrade) {
                    return new PackageUpgradeModel(packageUpgrade);
                })
            );

            //when we call fetch for the model we want to fill its collections
            this.inTourTransfers.set(
                _(packageUpgradeSections.inTourTransfers).map(function (packageUpgrade) {
                    return new PackageUpgradeModel(packageUpgrade);
                })
            );

            //when we call fetch for the model we want to fill its collections
            this.preUpgrades.set(
                _(packageUpgradeSections.preUpgrades).map(function (packageUpgrade) {
                    return new PackageUpgradeModel(packageUpgrade);
                })
            );

            //when we call fetch for the model we want to fill its collections
            this.postUpgrades.set(
                _(packageUpgradeSections.postUpgrades).map(function (packageUpgrade) {
                    return new PackageUpgradeModel(packageUpgrade);
                })
            );

            //when we call fetch for the model we want to fill its collections
            this.preExtensions.set(
                _(packageUpgradeSections.preExtensions).map(function (packageUpgrade) {
                    return new PackageUpgradeModel(packageUpgrade);
                })
            );

            //when we call fetch for the model we want to fill its collections
            this.postExtensions.set(
                _(packageUpgradeSections.postExtensions).map(function (packageUpgrade) {
                    return new PackageUpgradeModel(packageUpgrade);
                })
            );

            //when we call fetch for the model we want to fill its collections
            this.cruiseUpgradesGroup.set(
                _(packageUpgradeSections.cruiseUpgradesGroup).map(function (packageUpgrades) {
                	var model = new PackageUpgradeGroupModel();
                	model.setUpgrades(packageUpgrades);
	                return model;
                })
            );

            //when we call fetch for the model we want to fill its collections
            this.roomUpgradesGroup.set(
                _(packageUpgradeSections.roomUpgradesGroup).map(function (packageUpgrades) {
                	var model = new PackageUpgradeGroupModel();
                	model.setUpgrades(packageUpgrades);
                	return model;
                })
            );

            //when we call fetch for the model we want to fill its collections
            this.tourOptions.set(
                _(packageUpgradeSections.tourOptions).map(function (packageUpgrade) {
                    return new PackageUpgradeModel(packageUpgrade);
                })
            );
	        
          if (!(App.Booking.rooms.length > 0)) {
              App.Booking.rooms.setRooms(this.get('rooms'));
          }
        }
    });

    return BookingModel;
});