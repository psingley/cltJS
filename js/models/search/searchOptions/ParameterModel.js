// Filename: models/project
define([
    'underscore',
    'backbone'
], function (_, Backbone) {
    var ParameterModel = Backbone.Model.extend({
        defaults: {
            id: "continentnames",
            values: []
        }
    });
    // Return the model for the module
    return ParameterModel;
});