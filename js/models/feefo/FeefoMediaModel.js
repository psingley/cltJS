define([
    'jquery',
    'underscore',
    'backbone'
], function ($, _, Backbone) {
    var FeefoMediaModel = Backbone.Model.extend({
        defaults: {
            type: '',
            url: '',
            media_thumbnail: ''
        }
    });
    // Return the model for the module
    return FeefoMediaModel;
});