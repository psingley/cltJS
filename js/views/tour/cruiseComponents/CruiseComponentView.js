define([
'jquery',
'underscore',
'backbone',
'marionette',
'app',
'util/objectUtil',
'util/tourDetailUtil',
'models/tour/cruiseComponents/CruiseComponentModel',
'text!templates/tour/cruiseComponents/cruiseComponentTemplate.html',
'views/tour/cruiseComponents/CruiseComponentFullView',
'util/tourDetailUtil',
'jquery.cycle'
], function ($, _, Backbone, Marionette, App, ObjectUtil, TourDetailUtil, CruiseComponentModel, cruiseComponentTemplate, CruiseComponentFullView, TourDetailUtil, JqueryCycle) {
	var CruiseComponentView = Backbone.Marionette.ItemView.extend({
		model: CruiseComponentModel,
		template: Backbone.Marionette.TemplateCache.get(cruiseComponentTemplate),
		className: 'col',
		events: {
			'click .btn': 'showFullDetail',
			'click #slideshow-slider-cruise': 'showFullImage'
		},
		ui: {
			'$button': '.btn'
		},
		initialize: function (options) {
			this.$expandedView = options.$expandedView;
			this.$closeButton = options.$closeButton;
		},
		templateHelpers: function () {
			var outerScope = this;
			return {
				title: this.model.get('name'),
				images: this.model.get("images"),
				getImageUrl: function () {
					var images = outerScope.model.get("images");
					if (ObjectUtil.isNullOrEmpty(images[0]) || ObjectUtil.isNullOrEmpty(images[0].src)) {
						return 'https://i.gocollette.com/placeholders/hotel-holder.jpg';
					}
					return images[0].src;
				},
				detailsText: App.dictionary.get('tourRelated.FreeFormText.TourCruiseDetails'),
				prevText: App.dictionary.get('common.Buttons.Prev'),
				nextText: App.dictionary.get('common.Buttons.Next')
			}
		},
		onShow: function () {
			var description = this.model.get('description');
			var images = this.model.get('images');

			if (ObjectUtil.isNullOrEmpty(description)) {
				this.ui.$button.hide();
			}

			var slideShow = $(this.$el).find('#slideshow-slider-cruise');
			if (ObjectUtil.isNullOrEmpty(description) || images.length < 1) {
				console.log("hiding slider section");
				$('#slider_section').hide();
				slideShow.cycle().cycle('pause');
			} else if (slideShow && slideShow.length > 0) {
				$('#slider_section').show();
				slideShow.cycle().cycle('pause');
			}
		},
		showFullDetail: function (e) {
			e.preventDefault();
			var view = new CruiseComponentFullView({ model: this.model });
			TourDetailUtil.showExpandedSection(this.$expandedView, this.$closeButton, view);
		},
		showFullImage: function (e) {
			var owlModal = $('#owl-modal');
			owlModal.empty();

			var nonActive = $(e.currentTarget).find('img:not(.cycle-slide-active):not(.cycle-sentinel)').map(function () { return $(this).attr('src'); });
			var active = $(e.currentTarget).find('img.cycle-slide-active:not(.cycle-sentinel)').map(function () { return $(this).attr('src'); });
			$.merge(active, nonActive);

			_.each(active, function (url) {
				var item = $('<div>', { 'class': 'item' }).appendTo(owlModal);
				$('<img>', { 'src': url }).appendTo(item);
			});

			$('#modalGallery').show();

			//if the carousel has previous been init, destry so we can easily recreate
			var owlCarousel = owlModal.data('owlCarousel');
			if (owlCarousel) {
				owlCarousel.destroy();
			}

			// no need for a carousel if there is only one image
			if (active.length > 1) {
				owlModal.owlCarousel({
					items: 1,
					autoHeight: true,
					singleItem: true,
					navigation: true,
					pagination: false,
					nav: true
				});
			}
		}
	});
	// Our module now returns our view
	return CruiseComponentView;
});