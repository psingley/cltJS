define([
    'jquery',
    'underscore',
    'backbone',
    'marionette',
    'app',
    'views/search/sortOptions/SortOptionView',
    'collections/search/sortOptions/SortOptionCollection',
    // Using the Require.js text! plugin, we are loaded raw text
    // which will be used as our views primary template
    'text!templates/search/sortOptions/sortOptionListTemplate.html',
    'event.aggregator'
], function ($, _, Backbone, Marionette, App, SortOptionView, SortOptionCollection, sortOptionListTemplate, EventAggregator, jqueryPrettySelect) {
    var SortOptionListView = Backbone.Marionette.CompositeView.extend({
        collection: SortOptionCollection,
        itemView: SortOptionView,
        template: Backbone.Marionette.TemplateCache.get(sortOptionListTemplate),
        appendHtml: function (collectionView, itemView) {
            // ensure we nest the child list inside of
            // the current list item
            if (App.isColletteSite) {
                collectionView.$("#ssortOptionsList").append(itemView.el);
            }
            else {
                collectionView.$("#sortOptionsList").append(itemView.el);
            }
        },
        onShow: function () {
            $("#sortOptionText").html(App.Search.searchSettings.get('sortText'));
        },
        events: {
            'change': 'toggleSortOptions'
        },
        toggleSortOptions: function () {
            EventAggregator.trigger('toggleSearchOption');

            console.log("appendHtml");
        }
    });
    // Our module now returns our view
    return SortOptionListView;
});
