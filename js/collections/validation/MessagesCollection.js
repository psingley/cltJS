define([
    'jquery',
    'underscore',
    'backbone',
    'marionette',
    'app',
    'models/validation/MessageModel'
], function ($, _, Backbone, Marionette, App, MessageModel) {
    var MessagesCollection = Backbone.Collection.extend({
        defaults: {
            model: MessageModel
        },
        setMessages: function (messages) {
            var outerScope = this;
            this.reset();
            _.each(messages, function (message) {
                var messageModel = new MessageModel({message: message});
                outerScope.add(messageModel);
            });
        }
    });
    return MessagesCollection;
});
/**
 * Created by ssinno on 12/2/13.
 */
