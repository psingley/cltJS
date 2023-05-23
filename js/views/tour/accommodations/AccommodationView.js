define([
'jquery',
'underscore',
'backbone',
'marionette',
'util/objectUtil',
'models/tour/accommodations/AccommodationModel',
'text!templates/tour/accommodations/accommodationTemplate.html'

], function ($, _, Backbone, Marionette, ObjectUtil, AccommodationModel, accommodationTemplate) {
	var AccommodationView = Backbone.Marionette.ItemView.extend({
		model: AccommodationModel,
		template: Backbone.Marionette.TemplateCache.get(accommodationTemplate),
		leonardoImageUrl: "https://deeljyev3ncap.cloudfront.net",
		tagName: "div",
		className: "hotel_block",
		attributes: {
			target: '_blank'
		},
		events: {
			'click .hotelImage_link': 'openHotelModal',
			'click .title': 'openHotelModal'
		},
		onRender: function () {
			var outerscope = this;
			var media = outerscope.model.get("image");
			var $hotelelement = outerscope.$el.find('.hotelImage_link');
			//if ((!ObjectUtil.isNullOrEmpty(media)) && (!ObjectUtil.isNullOrEmpty(media.mediaImageUrl))) { // && (media.mediaImageUrl.indexOf(this.leonardoImageUrl) < 0)) {
			//	$hotelelement.removeClass('hotelImage_link').addClass('hotelImage_link_leonardo');
			//}
			$('#hotelmodal').on('hide.bs.modal', function () {
				VFM.onReady(function () {
					VFM.load({ id: "vfmviewer", pid: "" });
				});
			});

		},
		templateHelpers: function () {
			var outerScope = this;

			return {
				getCityHtml: function () {
					return outerScope.model.get("city");
				},
				getImageUrl: function () {
					var image = outerScope.model.get("image");
					if (ObjectUtil.isNullOrEmpty(image) || ObjectUtil.isNullOrEmpty(image.url)) {
						return 'https://i.gocollette.com/placeholders/hotel-holder.jpg';
					}

					return image.url;
				},
				getCursorStyle: function () {
					var richMediaUrl = outerScope.model.get("richMediaUrl");

					if (ObjectUtil.isNullOrEmpty(richMediaUrl)) {
						return 'style="cursor:default"';
					}

					return '';
				},
				getAltTag: function () {
				   var image = outerScope.model.get("image");
				   if (ObjectUtil.isNullOrEmpty(image) || ObjectUtil.isNullOrEmpty(image.altTag)) {
				      return '';
				   }

				   return image.altTag;
				}
			}
		},
		openHotelModal: function (e) {
			var outerscope = this;

			var richMediaUrl = outerscope.model.get("richMediaUrl");
			var hotelImageViewer = $('#hotelmodal').find('#hotelTitle');

			$(hotelImageViewer).empty();
			$(hotelImageViewer).html(this.model.get("title"));

			//if (!ObjectUtil.isNullOrEmpty(richMediaUrl) && !ObjectUtil.isNullOrEmpty(VFM)) {
				VFM.onReady(function () {
					VFM.load({ id: "vfmviewer", pid: outerscope.model.get("vendorPropertyId") });

					$('#hotelmodal').modal('show');
				});
			//}
		}
	});
	// Our module now returns our view
	return AccommodationView;
});