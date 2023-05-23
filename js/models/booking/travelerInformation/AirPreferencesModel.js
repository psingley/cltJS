define([
    'jquery',
    'underscore',
    'backbone'
], function ($, _, Backbone) {
    var AirPreferencesModel = Backbone.Model.extend({
        defaults: {
            wheelChairAssistance: false,
            frequentFlyerNumber: 0,
            airline: null,
            seat: null,
            meal: null
        }
    });
    return AirPreferencesModel;
});