define([
    'jquery',
    'underscore',
    'backbone',
    'marionette',
    'app',
    'event.aggregator'    
], function ($, _, Backbone, Marionette, App, EventAggregator) {

    var SearchHelpWizardButton = Backbone.Marionette.Layout.extend({
        el: $("#searchWizard"),
        events: {
            'click': 'startWizard'
        },
        startWizard: function () {
            EventAggregator.trigger('startWizard');//new event should be active for 
            console.debug("startWizard");
        },
        initialize: function () {

        }
    });
    return SearchHelpWizardButton;
});
