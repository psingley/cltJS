define([
    'jquery',
    'underscore',
    'backbone',
    'models/booking/tourCustomizations/BookingPackageUpgradeModel',
    'collections/booking/tourCustomizations/BookingPackageUpgradeCollection'
], function ($, _, Backbone, BookingPackageUpgradeModel, BookingPackageUpgradeCollection) {
    var PackageUpgradeGroupModel = Backbone.Model.extend({
            default: {
                packageUpgrades:null
            },

            setUpgrades: function (upgrades) {
                var packageUpgrades = new BookingPackageUpgradeCollection();
                packageUpgrades.set(
                    _(upgrades).map(function (packageUpgrade) {
                        return new BookingPackageUpgradeModel(packageUpgrade);
                    })
                );
	            this.set({ packageUpgrades: packageUpgrades });
            }
    });
    return PackageUpgradeGroupModel;
});