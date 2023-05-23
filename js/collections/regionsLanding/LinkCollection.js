define([
    'jquery',
    'underscore',
    'backbone',
    'models/regionsLanding/LinkModel'
], function ($, _, Backbone, LinkModel) {
    var LinkCollection = Backbone.Collection.extend({
        defaults: {
            model: LinkModel
        }
    });
    return LinkCollection;
});
