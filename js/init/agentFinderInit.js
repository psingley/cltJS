define([
        "app",
        'jquery',
        'underscore',
        'marionette',
        'backbone',
        'renderedLayouts/agentFinder/AgentFinderLayout',
        'util/seoTaggingUtil'
],
    function (App, $, _, Marionette, Backbone, AgentFinderLayout, SeoTaggingUtil) {
        // Agent Finder
        $(".agent_finder").on("click", function (e) {
            e.preventDefault();

            if (App.agentFinderModule.agentFinderLayout) {
                App.module('agentFinderModule').stop();
            } else {
            	App.module('agentFinderModule').start();
            }
           
			var agentFindarModal = $("#agentFinderResultSection");
			agentFindarModal.modal();
			agentFindarModal.on("hidden.bs.modal", function (e) {
				//let's clear the model
				$('#agentFinderZipCode').val('');
				$('#agentListView').html('');
				$('#resultsTitle').html('');
				App.module('agentFinderModule').stop();
			});
			agentFindarModal.on("show.bs.modal", function(e) {
				App.module('agentFinderModule').start();
			});
        });

        App.module('agentFinderModule', function (agentFinderModule) {
            this.startWithParent = false;

            agentFinderModule.addInitializer(function () {
                this.agentFinderLayout = new AgentFinderLayout();
            });

            agentFinderModule.addFinalizer(function () {
                agentFinderModule.agentFinderLayout = null;
            });
        });
    });
