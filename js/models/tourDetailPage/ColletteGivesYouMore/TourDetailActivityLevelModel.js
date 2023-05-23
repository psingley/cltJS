// Filename: models/facetItems
define([
    'jquery',
    'underscore',
    'backbone'
], function ($, _, Backbone) {
    var TourDetailActivityLevelModel = Backbone.Model.extend({
        defaults: {
            activityLevelNumber: '',
            summary: '',
            description: ''
        }
    });
    // Return the model for the module
    return TourDetailActivityLevelModel;
});