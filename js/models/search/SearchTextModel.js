// Filename: models/project
define([
    'underscore',
    'backbone'
], function(_, Backbone){
    var SearchTextModel = Backbone.Model.extend({
        defaults: {
            value: '',
            searchType: 'contains'
        }
    });
    // Return the model for the module
    return SearchTextModel;
});