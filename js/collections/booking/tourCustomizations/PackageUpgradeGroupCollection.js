define([
    'backbone',
    'models/booking/tourCustomizations/PackageUpgradeGroupModel',
    'collections/booking/tourCustomizations/BookingPackageUpgradeCollection'
], function (Backbone, PackageUpgradeGroupModel, BookingPackageUpgradeCollection) {
    var PackageUpgradeGroupCollection = BookingPackageUpgradeCollection.extend({
        defaults: {
            model: PackageUpgradeGroupModel
        }
    });
    // Return the model for the module
    return PackageUpgradeGroupCollection;
});