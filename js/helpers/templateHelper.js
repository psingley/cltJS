define([
    'jquery',
    'underscore',
    'app',
    'models/general/MediaImageModel',
    'text!templates/general/imageTemplate.html'
], function ($, _, App, MediaImageModel, imageTemplate) {
    var templateHelper = {
        renderImage: function (mediaImageModel) {
            var template = Backbone.Marionette.TemplateCache.get(imageTemplate);
            var imageHtml = Backbone.Marionette.Renderer.render(template, mediaImageModel);
            return imageHtml;
        }
    };
    return templateHelper;
});