define([
    'jquery',
    'app',
    'underscore',
    'backbone',
    'marionette',
    'util/tourDetailUtil',
    'util/objectUtil',
    'models/tour/otherTours/OtherTourModel',
    'text!templates/tour/otherTours/otherTourTemplate.html'

], function ($, App, _, Backbone, Marionette, TourDetailUtil, ObjectUtil, OtherTourModel, otherTourTemplate) {
    var OtherTourView = Backbone.Marionette.ItemView.extend({
        model: OtherTourModel,
        template: Backbone.Marionette.TemplateCache.get(otherTourTemplate),
        className: "col",
        templateHelpers: function () {
			var outerscope = this;
        	return {
        		daysPhrase: App.dictionary.get('common.Calendar.Days'),
        		mealsPhrase: App.dictionary.get('common.Misc.Meals'),
        		urlTitle: App.dictionary.get('tourRelated.Buttons.TourDetail'),
				imageUrl: function () {
					var image = outerscope.model.get("image");
					if (image != null && image.url != null) {
						return image.url;
					}
					return '';
				},
				imageAltTag: function () {
					var image = outerscope.model.get("image");
					if (image != null && image.altTag != null) {
						return image.altTag;
					}
					return '';
				}
        	};
        },
        onShow: function () {

            var target = this.$el;
	        var title = this.model.get("title");
	        var description = this.model.get("summary");
			var image = this.model.get("image");
			var imageUrl = null;
			if (image != null && image.url != null) {
				imageUrl = image.url;
			}

            if (ObjectUtil.isNullOrEmpty(title)
                || ObjectUtil.isNullOrEmpty(imageUrl)
                || ObjectUtil.isNullOrEmpty(description)) {
                $(target).hide();
                console.log("hiding other tours you may enjoy");
            }
        }
    });
// Our module now returns our view
    return OtherTourView;
});