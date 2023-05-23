// Filename: models/facetItems
define([
    'jquery',
    'underscore',
    'backbone',
    'collections/instantChat/ChatMessageCollection'
], function($,_, Backbone, ChatMessageCollection){
    var ChatMessageResponse = Backbone.Model.extend({
        defaults: {
            chatMessages: ChatMessageCollection,
            sessionActive:false,
            chatStatusMessage:'',
            sessionId:'',
            chatStatusCode:''
        } ,
        initialize: function () {
            this.chatMessages = new ChatMessageCollection();
        }
    });
    // Return the model for the module
    return ChatMessageResponse;
});