define([
    'jquery',
    'underscore',
    'backbone',
    'marionette',
    'collections/booking/tourCustomizations/BookingPackageUpgradeCollection',
    'views/booking/tourCustomizations/TourUpgradeListView',
    'text!templates/booking/tourCustomizations/upgradeLayoutTemplate.html',
    'app',
    'util/objectUtil'
], function ($, _, Backbone, Marionette, BookingPackageUpgradeCollection, TourUpgradeListView, upgradeLayoutTemplate, App, ObjectUtil) {
    var UpgradeLayoutView = Backbone.Marionette.Layout.extend({
        template: Backbone.Marionette.TemplateCache.get(upgradeLayoutTemplate),
        tagName: 'div',
        regions: {
            'upgradesRegion': '.upgrades'
        },
        initialize: function () {
            this.getFirstUpgrade();
            this.getSecondUpgrade();
        },
        templateHelpers: function () {
            var outerScope = this;
            return {
                descriptionText: function () {
                    if (outerScope.firstUpgrade) {
                        return outerScope.firstUpgrade.get('description');
                    }
                    return '';
                },
                upgradeTypeText: function () { // As per Web-834.
                    var upgradeServiceType = ObjectUtil.isNullOrEmpty(outerScope.firstUpgrade) ? outerScope.secondUpgrade : outerScope.firstUpgrade ;
                    if (upgradeServiceType) {
                        if (upgradeServiceType.get('serviceType').name == "Cruise")
                            return "Cabin";
                        else if (upgradeServiceType.get('serviceType').name == "Hotel")
                            return "Room";
                        else
                            return upgradeServiceType.get('serviceType').name;
                    }
                },
                upgradeText: App.dictionary.get('tourRelated.Booking.TourCustomizations.UpgradeYourTravelJourney'),
                description: App.dictionary.get('tourRelated.Booking.Description'),
                roomsText: App.dictionary.get('tourRelated.Booking.TourCustomizations.Rooms'),
                priceText: App.dictionary.get('tourRelated.Booking.Price'),
                nightsText: App.dictionary.get('tourRelated.Booking.TourCustomizations.Nights')
            }
        },
        getFirstUpgrade: function () {
            if (ObjectUtil.isNullOrEmpty(this.firstUpgrade)) {
                var upgrade = _.find(this.model.get("packageUpgrades").models, function (tourUpgrade) {                    
                    return !ObjectUtil.isNullOrEmpty(tourUpgrade.get('description'));
                });
                this.firstUpgrade = upgrade;
            }

			if (!ObjectUtil.isNullOrEmpty(this.firstUpgrade)) {
				var parentTourLayoutId = this.firstUpgrade.get('parentTourLayoutId');
				if (!ObjectUtil.isNullOrEmpty(parentTourLayoutId)) {
					this.$el.attr('data-id', parentTourLayoutId);
				}
			}
			return this.firstUpgrade;
        },
        getSecondUpgrade: function () {
            if (ObjectUtil.isNullOrEmpty(this.firstUpgrade)) {
                var upgrade = _.find(this.model.get("packageUpgrades").models, function (tourUpgrade) {                    
                    return ObjectUtil.isNullOrEmpty(tourUpgrade.get('description'));
                });
                this.secondUpgrade = upgrade;
            }            
            return this.secondUpgrade;
        },
        onRender: function () {
        	this.upgradesRegion.show(new TourUpgradeListView({ collection: this.model.get("packageUpgrades") }));
        }
    });
    return UpgradeLayoutView;
});