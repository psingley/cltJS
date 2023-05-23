define([
	'jquery',
	'underscore',
	'backbone',
	'marionette',
	'app',
	'event.aggregator',
	'util/objectUtil',
	'views/validation/SuccessView',
	'views/validation/ErrorView',
	'services/marketingCenterService',
	'extensions/marionette/views/RenderedLayout'
], function($, _, Backbone, Marionette, App, EventAggregator, ObjectUtil, SuccessView, ErrorView, Service, RenderedLayout) {
	var FeedbackModalLayout = RenderedLayout.extend({
		el: '#feedback-modal',
		events: {
			'click #submitButton': 'submit',
			'click .ratingsRow button': 'setRanking'
		},
		ui: {
			'$txtFeedback': '#txtFeedback',
			'$messages': '#feedbackMessages',
			'$ratingsButtons': '.ratingsRow button'
		},
		initialize: function(options) {

			//clear form
			this.ui.$txtFeedback.val('');
			this.ui.$messages.html('');

			//define where the error box will live
			App.addRegions({
				messagesRegion: '#feedbackMessages'
			});

			EventAggregator.on('feedback.complete', function (success) {
				if (success) {
					var successView = new SuccessView([App.dictionary.get('common.Misc.ThankYou')]);
					App.messagesRegion.show(successView);
				}
			});

			App.messagesRegion.close();
		},
		rank:0,
		setRanking: function(e) {
			e.preventDefault();

			this.rank = parseInt($(e.target).html());

			this.ui.$ratingsButtons.addClass('btn-info');

			$(e.target).removeClass('btn-info');
		},
		submit: function(e) {
			e.preventDefault();

			var errorMessages = [];
			if (ObjectUtil.isNullOrEmpty(this.ui.$txtFeedback.val())) {
				errorMessages.push(App.dictionary.get('common.FormValidations.FeedbackTextIsMissing'));
			}

			if (this.rank <= 0 || this.rank > 10) {
				errorMessages.push(App.dictionary.get('common.FormValidations.FeedbackRatingIsMissing'));
			}

			if (errorMessages.length == 0) {
				App.messagesRegion.close();
				Service.feedback(this.ui.$txtFeedback.val(), this.rank);
				console.log("Feedback Modal Layout - Submission Sent");
			} else {
				var errorView = new ErrorView(errorMessages);
				App.messagesRegion.show(errorView);
			}
		}
	});
	return FeedbackModalLayout;
});
