// Filename: models/facetItems
define([
    'jquery',
    'underscore',
    'backbone',
    'models/agentFinder/AgentModel',
    'collections/agentFinder/AgentCollection'
], function ($, _, Backbone, AgentModel, AgentCollection) {
    var AgentFinderModel = Backbone.Model.extend({
        defaults: {
            zipCode: '',
            agents: AgentCollection,
            showError : true,
            showNotification: false
        },
        initialize: function () {
            this.agents = new AgentCollection();
            //fetch calls an on change event.
            this.on("change", this.fetchCollections);
            this.on("change", this.fillModels);
        },
        parse: function (response) {
            var data = JSON.parse(response.d);
            return data;
        },
        fetchCollections: function () {
            //when we call fetch for the model we want to fill its collections
            this.agents.set(
                _(this.get("agents")).map(function (agent) {
                    return new AgentModel(agent);
                })
            );
        },
        fillModels: function () {
            this.zipCode = this.get("zipCode");
        }
    });
    // Return the model for the module
    return AgentFinderModel;
});