define([
    'jquery',
    'underscore',
    'backbone',
    'marionette',
    'app',
    'models/tour/tourExtensions/TourExtensionModel',
    'text!templates/tour/tourExtensions/tourExtensionFullTemplate.html',
    'util/objectUtil',
    'util/htmlUtil',
    'util/tourDetailUtil'
], function ($, _, Backbone, Marionette, App, TourExtensionModel, tourExtensionFullTemplate, ObjectUtil, HtmlUtil, TourDetailUtil) {
    var TourExtensionFullView = Backbone.Marionette.ItemView.extend({
        model: TourExtensionModel,
        template: Backbone.Marionette.TemplateCache.get(tourExtensionFullTemplate),
        className: 'full_description',
        templateHelpers: function () {
            var serviceOrder = this.model.get('serviceOrder'),
                title = this.model.get('title'),
                nightText = App.dictionary.get('tourRelated.FreeFormText.Night'),
                serviceType = this.model.get('serviceType'),
                formattedTitle = this.model.get('title'),
                notes =  this.model.get('notes');

            if (serviceType.id !== App.taxonomy.getId('serviceTypes', 'Extension')) {
                formattedTitle = serviceOrder.name + ' ' + nightText + ': ' + title;
            } else {
                formattedTitle = title + ' ' + serviceType.name;
            }

            return {
                formattedTitle: formattedTitle,
                tourNotesText: App.dictionary.get('tourRelated.TourDetails.NotesLabel'),

                getDetailImageUrl: function(detailImage, image) {
                    if(ObjectUtil.isNullOrEmpty(detailImage) || ObjectUtil.isNullOrEmpty(detailImage.url) ){
                        if(ObjectUtil.isNullOrEmpty(image) || ObjectUtil.isNullOrEmpty(image.url) ){
                            return 'https://i.gocollette.com/placeholders/hotel-holder.jpg';
                        }
                        return image.url;
                    }
                    return detailImage.url;
                },

                getAltTag: function (detailImage, image) {
                   if (ObjectUtil.isNullOrEmpty(detailImage) || ObjectUtil.isNullOrEmpty(detailImage.altTag)) {
                      if (ObjectUtil.isNullOrEmpty(image) || ObjectUtil.isNullOrEmpty(image.altTag)) {
                         return '';
                      }
                      return image.altTag;
                   }
                   return detailImage.altTag;
                },

                getNotes: function() {
                    if(!ObjectUtil.isNullOrEmpty(notes)) {
                        return notes;
                    }

                    return "";
                },

                showNotes: function() {
                    return !ObjectUtil.isNullOrEmpty(notes);
                }
            }
        }
    });
    return TourExtensionFullView;
});