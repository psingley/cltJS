define([
    'jquery',
    'underscore',
    'backbone',
    'marionette',
    'app',
    'util/objectUtil',
    'models/instantChat/ChatMessageModel',
    'text!templates/instantChat/chatLineTemplate.html'
], function($, _, Backbone, Marionette,App, ObjectUtil, ChatMessageModel, chatLineTemplate){
    var ChatResponseView = Backbone.Marionette.ItemView.extend({
        model: ChatMessageModel,
        template: Backbone.Marionette.TemplateCache.get(chatLineTemplate),
        tagName:"div",
        className: "clearfix chat_line"

    });
// Our module now returns our view
    return ChatResponseView;
});