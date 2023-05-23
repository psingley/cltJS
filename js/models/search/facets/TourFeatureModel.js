define([
    'jquery',
    'underscore',
    'backbone',
    'marionette',
    'app'
], function($, _, Backbone, Marionette, App){
    var TourFeatureModel = Backbone.Model.extend({
        defaults: {
            id: ''
        }
    });
    return TourFeatureModel;
});