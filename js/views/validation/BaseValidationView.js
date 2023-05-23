define([
    'jquery',
    'underscore',
    'backbone',
    'marionette',
    'util/objectUtil',
    'models/validation/ValidationModel',
    'text!templates/validation/validationTemplate.html',
    'collections/validation/MessagesCollection',
    'views/validation/MessageListView',
    'util/dataLayerUtil'
], function ($, _, Backbone, Marionette, ObjectUtil, ValidationModel, validationTemplate, MessageCollection, MessageListView, DataLayerUtil) {
    var BaseValidationView = Backbone.Marionette.Layout.extend({
        tagName: 'div',
        template: Backbone.Marionette.TemplateCache.get(validationTemplate),
        regions: {
            validationMessages: '.validationMessages'
        },
        onRender: function () {
            var messageCollection = new MessageCollection();
            messageCollection.setMessages(this.options);
            this.validationMessages.show(new MessageListView({ collection: messageCollection }));
            //send ONLY ERROR messages to dataLayer

            if (document.location.href.indexOf('booking') !== -1) {
                setTimeout(function () {
                    var mc = messageCollection;
                    if (mc) {
                        if (document.querySelector('.errorMessages')) {
                            DataLayerUtil.ErrorMessages("Client-side validation", mc);
                        }
                    }
                }, 1500);
            }
        }
    });
    // Our module now returns our view
    return BaseValidationView;
});
