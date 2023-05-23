define([
    'underscore',
    'backbone',
    'models/dsmLocator/DistrictSaleManagerModel'
], function(_, Backbone, DistrictSaleManagerModel){
    var DistrictSaleManagerCollection = Backbone.Collection.extend({
        defaults: {
            model: DistrictSaleManagerModel
        }
    });
    // Return the model for the module
    return DistrictSaleManagerCollection;
});