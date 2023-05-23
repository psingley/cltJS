// Filename: models/project
define([
    'underscore',
    'backbone'
], function (_, Backbone) {
    var SortOptionModel = Backbone.Model.extend({
        defaults: {
            name: "By Name",
            id: 0,
            isDefault: true,
            sortDirection: 'asc'
        }
    });
    // Return the model for the module
    return SortOptionModel;
});