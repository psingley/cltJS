// Filename: models/project
define([
    'underscore',
    'backbone',
    'models/booking/tourCustomizations/BookingPackageUpgradeModel',
    'collections/tour/packageUpgrades/PackageUpgradeCollection'
], function(_, Backbone, BookingPackageUpgradeModel, PackageUpgradeCollection){
    var BookingPackageUpgradeCollection = PackageUpgradeCollection.extend({
        defaults: {
            model: BookingPackageUpgradeModel
        }
    });
    // Return the model for the module
    return BookingPackageUpgradeCollection;
});