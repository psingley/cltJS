// Filename: models/facetItems
define([
    'jquery',
    'underscore',
    'backbone'
], function ($, _, Backbone) {
    var LinkModel = Backbone.Model.extend({
        defaults: {
           anchor: '',
           title: ''
        },
        initialize: function(item){
            this.set("anchor",item.id);
            this.set("title", $(item).data("anchorTitle"));
        }
    });
    // Return the model for the module
    return LinkModel;
});
