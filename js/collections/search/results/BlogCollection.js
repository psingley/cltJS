// Filename: collections/projects
define([
    'underscore',
    'backbone',
    // Pull in the Model module from above
    'models/search/results/BlogModel'
], function (_, Backbone, BlogModel) {
    var BlogCollection = Backbone.Collection.extend({
        defaults: {
            model: BlogModel
        }
    });
    // You don't usually return a collection instantiated
    return BlogCollection;
});