// Filename: models/project
define([
    'underscore',
    'backbone',
    'models/tour/packageUpgrades/PackageUpgradeModel'
], function(_, Backbone, PackageUpgradeModel){
    var PackageUpgradeCollection = Backbone.Collection.extend({
        defaults: {
            model: PackageUpgradeModel
        }
    });
    // Return the model for the module
    return PackageUpgradeCollection;
});