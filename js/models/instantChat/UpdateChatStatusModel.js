// Filename: models/facetItems
define([
    'jquery',
    'underscore',
    'backbone',
    'models/instantChat/ChatMessageModel',
    'models/instantChat/ChatMessageResponseModel'
], function ($, _, Backbone, ChatMessageModel, ChatMessageResponseModel) {
    var UpdateChatStatusModel = Backbone.Model.extend({
        defaults: {
            chatMessageResponse: ChatMessageResponseModel
        },
        url: function () {
            return '/services/avaya/ChatService.asmx/UpdateStatus';
        },
        initialize: function () {
            this.chatMessageResponse = new ChatMessageResponseModel();
            this.on("change", this.fetchCollections);
            this.on("change", this.fillModels);
        },
        parse: function (response) {
            var data = JSON.parse(response.d);
            return data;
        },
        fetchCollections: function () {
            //when we call fetch for the model we want to fill its collections
            this.chatMessageResponse.chatMessages.set(
                _(this.get("chatMessages")).map(function (chatMessage) {
                    return new ChatMessageModel(chatMessage);
                })
            );
        },
        fillModels: function () {
            this.chatMessageResponse.chatStatusCode = this.get("chatStatusCode");
            this.chatMessageResponse.sessionId = this.get("sessionId");
            this.chatMessageResponse.chatStatusMessage = this.get("chatStatusMessage");
            this.chatMessageResponse.sessionActive = this.get("sessionActive");
        }
    });
    // Return the model for the module
    return UpdateChatStatusModel;
});