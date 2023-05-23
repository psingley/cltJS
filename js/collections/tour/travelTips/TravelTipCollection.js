// Filename: models/project
define([
    'underscore',
    'backbone',
    'models/tour/travelTips/TravelTipModel'
], function(_, Backbone, TravelTipModel){
    var TravelTipCollection = Backbone.Collection.extend({
        defaults: {
            model: TravelTipModel
        }
    });
    // Return the model for the module
    return TravelTipCollection;
});