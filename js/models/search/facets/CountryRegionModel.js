define([
    'underscore',
    'backbone'
], function(_, Backbone){
    var CountryRegionModel = Backbone.Model.extend({
        defaults: {
           dataField: '',
           id: ''
        }
    });
    // Return the model for the module
    return CountryRegionModel;
});
