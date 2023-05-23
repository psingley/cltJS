define([
		'jquery',
		'underscore',
		'backbone',
		'marionette',
		'extensions/marionette/views/RenderedLayout'
	],
	function($, _, Backbone, Marionette, RenderedLayout) {
		var prePostAccordionComponent = RenderedLayout.extend({
			el: '#tour-pre-post-nights-section-container',
			events: {
				'click [data-button="Pre-night"]': 'preButton',
				'click [data-button="Pre-night-close"]': 'preCloseButton',
				'click [data-button="Post-night"]': 'postButton',
				'click [data-button="Post-night-close"]': 'postCloseButton'
			},
			initialize: function() {
				$('.toggle-btn').on('click', function () {
					$(this).toggleClass('active')
				});
			},

			postButton:  _.debounce(function() {
				if ($('.split-accordion').find('[data-content="Pre-night"]').hasClass('is-open') && window.innerWidth >= 768) {
					this.closePreNight();
					setTimeout(this.openPostNight, 500);
				} else {
					if ($('.split-accordion').find('[data-content="Post-night"]').hasClass('is-open')) {
						this.closePostNight();
						return;
                    }
					this.openPostNight();
				}
			}, 500, true),

			preCloseButton: function() {
				this.closePreNight();
			},

			preButton: _.debounce(function () {
				if ($('.split-accordion').find('[data-content="Post-night"]').hasClass('is-open') && window.innerWidth >= 768) {
					this.closePostNight();
					setTimeout(this.openPreNight, 500);
				} else {
					if ($('.split-accordion').find('[data-content="Pre-night"]').hasClass('is-open')) {
						this.closePreNight();
						return;
					}
					this.openPreNight();
				}
			}, 500, true),

			postCloseButton: function () {
				this.closePostNight();
			},

			openPreNight: function() {
				$('.split-accordion').find('[data-content="Pre-night"]').addClass('is-open');
				$('.split-accordion').find('[data-button="Pre-night"]').addClass('is-open');
				$('.split-accordion').find('[data-span="Pre-night"]').removeClass('down');
				$('.split-accordion').find('[data-span="Pre-night"]').addClass('up');
			},

			closePreNight: function() {
				$('.split-accordion').find('[data-content="Pre-night"]').removeClass('is-open');
				$('.split-accordion').find('[data-button="Pre-night"]').removeClass('is-open');
				$('.split-accordion').find('[data-span="Pre-night"]').addClass('down');
				$('.split-accordion').find('[data-span="Pre-night"]').removeClass('up');

			},

			openPostNight: function() {
				$('.split-accordion').find('[data-content="Post-night"]').addClass('is-open');
				$('.split-accordion').find('[data-button="Post-night"]').addClass('is-open');
				$('.split-accordion').find('[data-span="Post-night"]').removeClass('down');
				$('.split-accordion').find('[data-span="Post-night"]').addClass('up');
			},

			closePostNight: function() {
				$('.split-accordion').find('[data-content="Post-night"]').removeClass('is-open');
				$('.split-accordion').find('[data-button="Post-night"]').removeClass('is-open');
				$('.split-accordion').find('[data-span="Post-night"]').addClass('down');
				$('.split-accordion').find('[data-span="Post-night"]').removeClass('up');
			},

			debounce: function(func, wait, immediate) {
				var timeout;
				return function() {
					var context = this, args = arguments;
					var later = function() {
						timeout = null;
						if (!immediate) func.apply(context, args);
					};
					var callNow = immediate && !timeout;
					clearTimeout(timeout);
					timeout = setTimeout(later, wait);
					if (callNow) func.apply(context, args);
				};
			}
		});
		return prePostAccordionComponent;
	});