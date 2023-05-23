define([
			"app",
			'jquery',
			'underscore',
			'marionette',
			'backbone',
			'renderedLayouts/feedback/FeedbackModalLayout'
],
		function (App, $, _, Marionette, Backbone, Layout) {

			$(".feedback-button").on("click", function(e) {
				e.preventDefault();
				var feedbackModule = App.module("feedbackModule");

				if (App.feedbackModalLayout == null) {
					feedbackModule.start();
				}
				feedbackModule.displayModal($(this));
			});

			App.module("feedbackModule", function (feedbackModule) {

				this.startWithParent = false;

				this.addInitializer(function() {
					if (App.feedbackModalLayout == null) {
						App.feedbackModalLayout = new Layout();
					}
				});

				this.addFinalizer(function () { });

				feedbackModule.displayModal = function(clickedButton)
				{
					if (clickedButton == null) {
						return;
					}

					if (App.feedbackModalLayout == null) {
						App.feedbackModalLayout = new Layout();
					} else {
						App.feedbackModalLayout.initialize();
					}

					$('#feedback-modal').modal('show');
				}
			});
		});