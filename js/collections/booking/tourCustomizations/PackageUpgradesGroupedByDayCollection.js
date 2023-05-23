// Filename: models/project
define([
    'underscore',
    'backbone',
    'models/booking/tourCustomizations/PackageUpgradesGroupedByDayModel'
], function(_, Backbone, PackageUpgradesGroupedByDayModel){
    var PackageUpgradesGroupedByDayCollection = Backbone.Collection.extend({
        defaults: {
            model: PackageUpgradesGroupedByDayModel
        }
    });
    // Return the model for the module
    return PackageUpgradesGroupedByDayCollection;
});