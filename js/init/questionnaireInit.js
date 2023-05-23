// Include Desktop Specific JavaScript files here (or inside of your Desktop Controller, or differentiate based off App.mobile === false)
define([
		"app",
		'chosen',
		"renderedLayouts/grid/QuestionnaireLayout",
		'domReady'
	],
	function (App, Chosen, Questionnaire, domReady) {
		App.module("Questionnaire", function () {
			this.startWithParent = false;

			this.addInitializer(function () {
				domReady(function () {
					var layout = new Questionnaire();
				});
			});
		});
	});