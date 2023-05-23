// Filename: models/project
define([
    'underscore',
    'backbone',
    'models/tour/guidedTravelPerks/GuidedTravelPerkModel'
], function(_, Backbone, GuidedTravelPerkModel){
    var GuidedTravelPerkCollection = Backbone.Collection.extend({
        defaults: {
            model: GuidedTravelPerkModel
        }
    });
    // Return the model for the module
    return GuidedTravelPerkCollection;
});