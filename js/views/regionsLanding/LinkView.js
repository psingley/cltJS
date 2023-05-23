define([
    'jquery',
    'underscore',
    'backbone',
    'marionette',
    'text!templates/regionsLanding/linkTemplate.html',
    'models/regionsLanding/LinkModel'
], function ($, _, Backbone, Marionette, LinkTemplate, LinkModel) {
    var LinkView = Backbone.Marionette.ItemView.extend({
        tagName: "li",
        template: Backbone.Marionette.TemplateCache.get(LinkTemplate),
        model: LinkModel
    });
    // Our module now returns our view
    return LinkView;
});
