define([
    'jquery',
    'underscore',
    'backbone',
    'marionette',
    'app',
    'event.aggregator',
    'views/agentFinder/AgentView',
    'collections/agentFinder/AgentCollection'
], function ($, _, Backbone, Marionette, App, EventAggregator, AgentView, AgentCollection) {
    var AgentListView = Backbone.Marionette.CollectionView.extend({
        collection: AgentCollection,
        tagName:"ul",
        className:"agent_results",
        itemView: AgentView
    });
    // Our module now returns our view
    return AgentListView;
});