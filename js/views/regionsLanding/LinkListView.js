define([
    'jquery',
    'underscore',
    'backbone',
    'marionette',
    'views/regionsLanding/LinkView',
    'collections/regionsLanding/LinkCollection'
], function ($, _, Backbone, Marionette, LinkView, LinkCollection) {
    var LinkListView = Backbone.Marionette.CollectionView.extend({
        collection: LinkCollection,
        itemView: LinkView,
        tagName:"ul",
        className: "nav navbar-nav navbar-right"
    });
    // Our module now returns our view
    return LinkListView;
});
