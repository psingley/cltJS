// Filename: collections/projects
define([
    'underscore',
    'backbone',
    // Pull in the Model module from above
    'models/search/tourDetails/TourDeparturesModel',
], function (_, Backbone, TourDeparturesModel) {
    var TourDeparturesByYearCollection = Backbone.Collection.extend({
        defaults: {
            model: TourDeparturesModel
        },
        initFromArray: function (array) {
            this.set(
                _(array.map(function (date) {
                    return new TourDeparturesModel(date);
                }))._wrapped);
            //var self = this;
            //for (var i = 0; i < array.length; i++)
            //{
            //	self.add(new TourDeparturesModel(array[i]));
            //}
            //this.set(
            //    _(array.map(function (gel) {
            //    	return new TourDeparturesModel(gel);
            //    }))
            //);
        }
    });
    // You don't usually return a collection instantiated
    return TourDeparturesByYearCollection;
});