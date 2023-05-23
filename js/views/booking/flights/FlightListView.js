define([
    'jquery',
    'underscore',
    'backbone',
    'marionette',
    'app',
    'views/booking/flights/FlightView',
    'collections/booking/flights/FlightCollection'
], function($, _, Backbone, Marionette, App, FlightView, FlightCollection){
    var FlightListView = Backbone.Marionette.CollectionView.extend({
        collection: FlightCollection,
        itemView: FlightView
    });
    return FlightListView;
});