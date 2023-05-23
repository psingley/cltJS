// Filename: models/facetItems
define([
    'jquery',
    'underscore',
    'backbone',
    'collections/tour/accommodations/AccommodationCollection',
    'models/tour/accommodations/AccommodationModel'
], function($,_, Backbone, AccommodationCollection, AccommodationModel){
    var ItineraryItemModel = Backbone.Model.extend({
        defaults: {
            heading: '',
            description: '',
            dayStart: 0,
            dayEnd: 0,
            breakfast: false,
            lunch: false,
            dinner: false,
            accommodations: AccommodationCollection,
            highTemperature: '',
            lowTemperature: '',
            rainFall:''
        },
        initialize: function () {
            this.accommodations = new AccommodationCollection();
            this.fetchCollections();
        },
        fetchCollections: function () {
            //when we call fetch for the model we want to fill its collections
            this.accommodations.set(
                _(this.get("accommodations")).map(function (supplier) {
                    return new AccommodationModel(supplier);
                })
            );
        }
    });
    // Return the model for the module
    return ItineraryItemModel;
});