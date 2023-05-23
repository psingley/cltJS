// Filename: collections/projects
define([
    'underscore',
    'backbone',
    // Pull in the Model module from above
    'models/search/results/ResultModel'
], function(_, Backbone, ResultModel){
    var ResultCollection = Backbone.Collection.extend({
        defaults: {
            model: ResultModel
        }
    });
    // You don't usually return a collection instantiated;
    return ResultCollection;
});