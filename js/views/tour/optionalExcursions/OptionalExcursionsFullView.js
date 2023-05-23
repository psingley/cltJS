define([
    'jquery',
    'underscore',
    'backbone',
    'marionette',
    'app',
    'models/tour/optionalExcursions/OptionalExcursionsModel',
    'text!templates/tour/optionalExcursions/optionalExcursionFullTemplate.html',
    'util/objectUtil',
    'util/htmlUtil',
    'util/tourDetailUtil'
], function ($, _, Backbone, Marionette, App, OptionalExcursionsModel, tourOptionFullTemplate, ObjectUtil, HtmlUtil, TourDetailUtil) {
    var OptionalExcursionsFullView = Backbone.Marionette.ItemView.extend({
        model: OptionalExcursionsModel,
        template: Backbone.Marionette.TemplateCache.get(tourOptionFullTemplate),
        className: 'full_description',
        templateHelpers: function () {
            var fullTitle = this.getFormattedTitle(),
                city = this.model.get('city'),
                cityText = ObjectUtil.isNullOrEmpty(city) ? '' : city.name,
                durationText = this.getDurationText(),
                transportationIncluded = this.model.get('transportationIncluded'),
                comments = this.model.get('comments'),
                notes = this.model.get('notes'),
                showNotes = !ObjectUtil.isNullOrEmpty(notes),
                showComments = !ObjectUtil.isNullOrEmpty(comments);

            return {
                closeText: App.dictionary.get('common.Buttons.Close'),
                fullTitle: fullTitle,
                cityText: cityText,
                durationText: durationText,
                transportationIncluded: transportationIncluded,
                transportationIncludedLabel: App.dictionary.get('tourRelated.TourDetails.TransportationIncluded'),
                comments: comments,
                notes: notes,
                showComments: showComments,
                showNotes: showNotes
            };
        },
        getDurationText: function () {
            var duration = this.model.get('duration'),
                hourText = App.dictionary.get('common.Calendar.Hour'),
                hoursText = App.dictionary.get('common.Calendar.Hours'),
                durationText = App.dictionary.get('tourRelated.Booking.Duration');

            var hour = duration <= 1 ? hourText : hoursText;

            return durationText + ': ' + duration + ' ' + hour;
        },
        getFormattedTitle: function () {
            var title = HtmlUtil.htmlDecode(this.model.get("title"));
            if (App.siteSettings.toursUsePointsSystem){
                return title;
            }

            var price = this.model.getLowestSinglePrice();

            if (typeof price !== 'string') {
                price = price.toString();
            }

            if (!ObjectUtil.isNullOrEmpty(price)) {
                title += " - " + price.formatPrice();
            }
            return title;
        },
        closeSection: function (e) {
            TourDetailUtil.closeExpandedSection(e);
        }
    });
    return OptionalExcursionsFullView;
});