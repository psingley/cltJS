// Filename: models/project
define([
    'underscore',
    'backbone',
    'util/objectUtil',
    'models/tour/tourDates/TourDateEventModel'
], function(_, Backbone, ObjectUtil, TourDateEventModel){
    var TourDateEventCollection = Backbone.Collection.extend({
        defaults: {
            model: TourDateEventModel
        },
        setEvents: function(events) {
            if(!ObjectUtil.isNullOrEmpty(events)) {
                this.set(
                    _(events.map(function (event) {
                        return new TourDateEventModel(event);
                    }))._wrapped);
            }

        }
    });
    // Return the model for the module
    return TourDateEventCollection;
});