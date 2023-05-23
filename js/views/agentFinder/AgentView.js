define([
    'jquery',
    'underscore',
    'backbone',
    'marionette',
    'app',
    'util/objectUtil',
    'models/agentFinder/AgentModel',
    'text!templates/agentFinder/agentTemplate.html'

], function($, _, Backbone, Marionette,App, ObjectUtil, AgentModel, agentTemplate){
    var AgentView = Backbone.Marionette.ItemView.extend({
        model: AgentModel,
        template: Backbone.Marionette.TemplateCache.get(agentTemplate),
        tagName:"li",
        className: "agent_result",
        templateHelpers: function () {
            if (App.siteSettings.language == "en-AU") {
                return {
                    emailText: '',
                    email: '',
                    phoneText: App.dictionary.get('common.FormLabels.Phone'),
                    distanceText: App.dictionary.get('agentFinder.Distance'),
                    unitOfLength: App.siteSettings.unitOfLength
                }
            }
            return {
                emailText: App.dictionary.get('common.FormLabels.Email'),
                phoneText: App.dictionary.get('common.FormLabels.Phone'),
                distanceText: App.dictionary.get('agentFinder.Distance'),
                unitOfLength: App.siteSettings.unitOfLength
            }
        },
        onRender: function ()
        {
            if (App.siteSettings.language == "en-AU") {
                this.$('.agentFinderEmail').css("display", "none");
            }

          //update class if is specialist  - 'agent_result specialist'
           var isSpecialist=this.model.get("isSpecialist");
           if(isSpecialist){
                this.$el.attr('class',"agent_result specialist") ;
            }
        }
    });
// Our module now returns our view
    return AgentView;
});