define([
    'underscore',
    'backbone',
    'models/agentFinder/AgentModel'
], function(_, Backbone, AgentModel){
    var AgentCollection = Backbone.Collection.extend({
        defaults: {
            model: AgentModel
        }
    });
    // Return the model for the module
    return AgentCollection;
});