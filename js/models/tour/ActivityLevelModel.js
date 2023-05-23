// Filename: models/facetItems
define([
    'jquery',
    'underscore',
    'backbone'
], function($,_, Backbone){
    var ActivityLevelModel = Backbone.Model.extend({
        defaults: {
            activityLevelNumber: '',
            description: '',
            travelTipsSummary: '',
            summary:'',
            onImageUrl: '',
            offImageUrl: ''
        }
    });
    // Return the model for the module
    return ActivityLevelModel;
});