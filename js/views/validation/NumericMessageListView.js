define([
    'jquery',
    'underscore',
    'backbone',
    'marionette',
    'app',
    'views/validation/MessageView',
    'collections/validation/MessagesCollection'
], function ($, _, Backbone, Marionette, App, MessageView, MessagesCollection) {
    var MessageListView = Backbone.Marionette.CollectionView.extend({
        tagName: 'ol',
        itemView: MessageView,
        collection: MessagesCollection
    });
    return MessageListView;
});