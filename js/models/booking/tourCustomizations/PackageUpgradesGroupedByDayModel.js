define([
    'jquery',
    'underscore',
    'backbone',
    'collections/booking/tourCustomizations/BookingPackageUpgradeCollection'
], function ($, _, Backbone, PackageUpgradeCollection) {
    var PackageUpgradesGroupedByDayModel = Backbone.Model.extend({
        defaults: {
            dayNumber:0,
            packageUpgrades: new PackageUpgradeCollection(),
            description: ''
        }
    });
    return PackageUpgradesGroupedByDayModel;
});