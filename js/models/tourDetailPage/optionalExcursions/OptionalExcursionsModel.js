// Filename: models/facetItems
define([
    'jquery',
    'underscore',
    'backbone'
], function($,_, Backbone){
    var OptionalExcursionsModel = Backbone.Model.extend({
        defaults: {
            title: '',
            shortVerbiage: '',
            verbiage: '',
            price: 0,
            city: '',
            duration: '',
            notes: '',
            comments: '',
			transportationIncluded: false
        }
    });
    // Return the model for the module
    return OptionalExcursionsModel;
});
