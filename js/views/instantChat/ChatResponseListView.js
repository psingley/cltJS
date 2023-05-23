define([
    'jquery',
    'underscore',
    'backbone',
    'marionette',
    'app',
    'event.aggregator',
    'views/instantChat/ChatResponseView',
    'collections/instantChat/ChatMessageCollection'
], function ($, _, Backbone, Marionette, App, EventAggregator, ChatResponseView, ChatMessageCollection) {
    var ChatResponseListView = Backbone.Marionette.CollectionView.extend({
        collection: ChatMessageCollection,
        tagName:"div",
        itemView: ChatResponseView
    });
    // Our module now returns our view
    return ChatResponseListView;
});
