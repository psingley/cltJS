define([
    'jquery',
    'underscore',
    'backbone',
    'marionette',
    'app',
    'text!templates/booking/flights/inTourFlightTemplate.html',
    'models/booking/flights/InTourFlightModel'
], function ($, _, Backbone, Marionette, App, inTourFlightTemplate, InTourFlightModel) {
    var InTourFlightView = Backbone.Marionette.ItemView.extend({
        model: InTourFlightModel,
        template: Backbone.Marionette.TemplateCache.get(inTourFlightTemplate)
    });
    return InTourFlightView;
});