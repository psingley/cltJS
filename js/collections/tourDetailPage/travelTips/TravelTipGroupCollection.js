// Filename: models/project
define([
    'underscore',
    'backbone',
    'models/tourDetailPage/travelTips/TravelTipGroupModel'
], function(_, Backbone, TravelTipGroupModel){
    var TravelTipGroupCollection = Backbone.Collection.extend({
        defaults: {
            model: TravelTipGroupModel
        }
    });
    // Return the model for the module
    return TravelTipGroupCollection;
});