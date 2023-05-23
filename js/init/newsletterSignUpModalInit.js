define([
			"app",
			'jquery',
			'underscore',
			'marionette',
			'backbone',
			'util/objectUtil',
			'event.aggregator',
			'renderedLayouts/modals/NewsletterSignUpLayout',
			'util/newsletterUtil'
],
		function (App, $, _, Marionette, Backbone, ObjectUtil, EventAggregator, NewsletterSignUpLayout, NewsletterUtil) {

			var startNewsletterModal = function () {
				var newletterSignUpModule = App.module("newletterSignUpModule");

				if (App.newsletterSignUpLayout == null) {
					newletterSignUpModule.start();
				}
				newletterSignUpModule.displayModal();
			};

			EventAggregator.on('initNewsletterSignUpModal', function () {
			        var showModalFunc = function () {
			            if ($(".modal.fade.in").length >= 1) {
			                setTimeout(showModalFunc, 5000);
			                return;
			            }
			            if (!NewsletterUtil.isAnyModalOrPopupOpened()) {
                            NewsletterUtil.newsletterModalShowCheck(function() {
                                NewsletterUtil.setModalShownCookie('newsLetterModalShown');
                                startNewsletterModal();
                            });
                        }
			        };
			        showModalFunc();
			});

			$(".newsletter-signup-modal").on("click", function (e) {
				e.preventDefault();

				// $(this) - clicked button
				if($(this)) {
					// don't show modal in other ways: on timer, mouse leave,
					// on scroll if a user opens modal himself
                    NewsletterUtil.setModalShownCookie('newsLetterModalShown');
					startNewsletterModal();
				}
			});

			App.module("newletterSignUpModule", function (newletterSignUpModule) {

				this.startWithParent = false;

				this.addInitializer(function () {
					if (App.newsletterSignUpLayout == null) {
						App.newsletterSignUpLayout = new NewsletterSignUpLayout();
					}
				});

				this.addFinalizer(function () { });

				newletterSignUpModule.displayModal = function () {
					if (App.newsletterSignUpLayout == null) {
						App.newsletterSignUpLayout = new NewsletterSignUpLayout();
						App.newsletterSignUpLayout.initialize();
					} else {
						App.newsletterSignUpLayout.initialize();
					}
					 $('#newsletter-modal').modal('show');
				}
			});
		});