define([
		"app",
		'jquery',
		'underscore',
		'marionette',
		'backbone'
	],
	function(App, $, _, Marionette, Backbone) {
		App.module("ActivityLevel",
			function() {
				this.startWithParent = true;

				this.addInitializer(function() {
				//	$('.activity-level-modal').activityLevelModal();
				});

				/**
				* ACTIVITY LEVEL MODAL CONTROLLER
				* Currently designed to support only one activity level modal per page
				* */
				$.fn.activityLevelModal = function() {

					// activity level is set in the activity level icon
					// located in the TOUR DETAILS HIGHLIGHTS component
					var activityLevel = parseInt($('#activity-level-icon').attr('data-activity-level')) - 1;

					var $modal = this;
					var $selectorsWrap = $modal.find('.bullet-selectors');
					var $selector = $selectorsWrap.find('div');
					var $content = $modal.find('.bullet-content');
					var currentIndex;

					$selector.eq(activityLevel).addClass('is-tour');

					setBullet(activityLevel);

					$selectorsWrap.on('click',
						'div',
						function() {
							setBullet($(this).index());
						});

					function setBullet(index) {
						if (index === currentIndex) {
							return;
						}
						$selectorsWrap.find('.is-active').removeClass('is-active');
						$content.find('.is-active').removeClass('is-active');
						$selector.eq(index).addClass('is-active');
						$content.children().eq(index).addClass('is-active');
						currentIndex = index;
					}
				};
			});
	});