// Filename: models/facetItems
define([
    'jquery',
    'underscore',
    'backbone',
    'util/objectUtil',
    'collections/tourDetailPage/tourDates/TourDateEventCollection',
    'models/tourDetailPage/tourDates/TourDateEventModel'
], function ($, _, Backbone, ObjectUtil, TourDateEventCollection, TourDateEventModel) {
    var TourDateModel = Backbone.Model.extend({
        defaults: {
            id: '',
            discount: null,
            endDate: '',
            hasPrice: false,
            isOnSale: false,
            isSoldOut: false,
            callForDetails: false,
            hideBookNow: false,
            neoId: 0,
            numberOfSeatsRemaining: 0,
            numberOfSeatsOriginal: 0,
            smallGroupTravel: false,
            smallGroupTravelDescription: '',
            smallGroupTravelImageUrl: '',
            packageNeoId: 0,
            price: 0,
            startDate: '',
            templateId: '',
            title: '',
            totalDays: 0,
            events: TourDateEventCollection
        },
        initialize: function() {
            this.fetchCollections();
        },
        fetchCollections: function() {
            var allEvents = this.get('events');
            this.events = new TourDateEventCollection();
            if(!ObjectUtil.isNullOrEmpty(allEvents)) {
                this.events.set(
                    _(allEvents).map(function (event) {
                        return new TourDateEventModel(event);
                    })
                );
            }
        }
    });
    // Return the model for the module
    return TourDateModel;
});
