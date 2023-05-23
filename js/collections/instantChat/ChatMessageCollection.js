define([
    'underscore',
    'backbone',
    'models/instantChat/ChatMessageModel'
], function(_, Backbone, ChatMessageModel){
    var ChatMessageCollection = Backbone.Collection.extend({
        defaults: {
            model: ChatMessageModel
        }
    });
    // Return the model for the module
    return ChatMessageCollection;
});