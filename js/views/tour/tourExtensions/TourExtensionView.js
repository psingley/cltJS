define([
    'jquery',
    'underscore',
    'backbone',
    'marionette',
    'app',
    'util/objectUtil',
    'util/tourDetailUtil',
    'models/tour/tourExtensions/TourExtensionModel',
    'text!templates/tour/tourExtensions/tourExtensionTemplate.html',
    'views/tour/tourExtensions/TourExtensionFullView',
    'util/tourDetailUtil'
], function ($, _, Backbone, Marionette, App, ObjectUtil, TourDetailUtil, TourExtensionModel, tourExtensionTemplate, TourExtensionFullView, TourDetailUtil) {
    var TourExtensionView = Backbone.Marionette.ItemView.extend({
        model: TourExtensionModel,
        template: Backbone.Marionette.TemplateCache.get(tourExtensionTemplate),
        className: 'col',
        events: {
            'click .btn': 'showFullDetail'
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

            var serviceOrder = this.model.get('serviceOrder'),
                title = this.model.get('title'),
                nightText = App.dictionary.get('tourRelated.FreeFormText.Night'),
                serviceType = this.model.get('serviceType'),
                formattedTitle = this.model.get('title'),
                serviceTypeDetail = this.model.get('serviceTypeDetail');

            var price;
            if (serviceType.id === App.taxonomy.getId('serviceTypes', 'Hotel')) {
            	formattedTitle = serviceOrder.name + ' ' + nightText + ': ' + title + ' - ' + serviceTypeDetail.name + ' double pricing';
                price = this.model.getLowestDoublePrice() * 2 ;
            }
            else if (serviceType.id === App.taxonomy.getId('serviceTypes', 'Extension')) {
                formattedTitle = title + ' ' + serviceType.name;
                price = this.model.getLowestDoublePrice();
                var modal = $('#extension_notes_modal');
                if (modal.length > 0) {
                    var notesButton = $('.extensionModalButton');
                    notesButton.show();
                }
            }
            else {
                formattedTitle = serviceOrder.name + ' ' + nightText + ': ' + title;
                price = this.model.getLowestSinglePrice();
            }

	        var shouldShowPrice = true;
			if (price === 0) {
				shouldShowPrice = false;
			}

            if (typeof price !== 'string') {
                price = price.toString();
            }

            price = price.formatPrice();

			//check here to see if price is zero, if so set to N/A

            return {
                extensionDetailsText: App.dictionary.get('tourRelated.FreeFormText.ExtensionDetails'),
                ppText: function (){
                    if (serviceType.id === App.taxonomy.getId('serviceTypes', 'Hotel')) {
	                    return App.dictionary.get('tourRelated.FreeFormText.PerNight');
                    }
                    return App.siteSettings.siteId == App.siteIds.Marriott ? App.dictionary.get('tourRelated.FreeFormText.PerPerson') : App.dictionary.get('tourRelated.FreeFormText.PP');
                },
                showPrice: function() {
	                return shouldShowPrice;
                },
                formattedPrice: price,
                formattedTitle: formattedTitle,
                getImageUrl: function () {
	                var image = outerScope.model.get("image");
                	if (ObjectUtil.isNullOrEmpty(image) || ObjectUtil.isNullOrEmpty(image.url)) {
                		return 'https://i.gocollette.com/placeholders/hotel-holder.jpg';
                	}

                	return image.url;
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
        onShow: function () {
            var description = this.model.get('description');

            if (ObjectUtil.isNullOrEmpty(description)) {
                this.ui.$button.hide();
            }
        },
        showFullDetail: function (e) {
            e.preventDefault();
            var view = new TourExtensionFullView({model: this.model});
            TourDetailUtil.showExpandedSection(this.$expandedView, this.$closeButton, view);
        }
    });
    // Our module now returns our view
    return TourExtensionView;
});