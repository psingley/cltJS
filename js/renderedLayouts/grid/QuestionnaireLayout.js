define([
		'jquery',
		'underscore',
		'backbone',
		'marionette',
		'app',
		'extensions/marionette/views/RenderedLayout',
		'util/validationUtil',
		'util/objectUtil',
		'views/validation/ErrorView',
		'views/validation/SuccessView',
		'event.aggregator',
		'services/marketingCenterService'
], function ($, _, Backbone, Marionette, App, RenderedLayout, ValidationUtil, ObjectUtil, ErrorView, SuccessView, EventAggregator, MarketingCenterService) {
		var questionnaireLayout = RenderedLayout.extend({
			el: '.section-questionnaire',
			initialize: function () {
				var outerScope = this;

				EventAggregator.on('questionnaire.submit', function () {
					outerScope.submit();
				});
			},
			submit: function () {

				var selectedQuestion = $('input:radio:checked').attr('id');
				if (ObjectUtil.isNullOrEmpty(selectedQuestion)) {
					return;
				}

				MarketingCenterService.questionnaire(selectedQuestion);
			}
		});
		return questionnaireLayout;
	});