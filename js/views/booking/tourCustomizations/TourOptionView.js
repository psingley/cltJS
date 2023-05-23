define([
    'jquery',
    'underscore',
    'backbone',
    'app',
    'models/booking/tourCustomizations/BookingPackageUpgradeModel',
    'text!templates/booking/tourCustomizations/tourOptionTemplate.html',
    'event.aggregator',
    'views/booking/tourCustomizations/BasePackageUpgradeView',
    'util/ObjectUtil'
], function ($, _, Backbone, App, PackageUpgradeModel, tourOptionTemplate, EventAggregator, BasePackageUpgradeView, ObjectUtil) {
    var TourOptionView = BasePackageUpgradeView.extend({
        model: PackageUpgradeModel,
        template: Backbone.Marionette.TemplateCache.get(tourOptionTemplate),
        regions: {
            'travelersRegion': '.travelerCheckBoxes'
        },
        ui: {
            'tourOptionDetails': '.tour_option_details',
            'moreDetailsLink': '.tour_option_details_link'
        },
        events: {
            'click .packageUpgrade_checkbox': 'togglePackageUpgrade',
            'click input[name=traveler]': 'updateCheckboxQuantity',
            'click .tour_option_details_link': 'showMoreDetails'
        },
        className: 'ga-optional-excursions',
        templateHelpers: function () {
            var outerScope = this;

            var city = this.model.get('city'),
                cityText = ObjectUtil.isNullOrEmpty(city) ? '' : city.name,
                durationText = this.getDurationText(),
                transportationIncluded = this.model.get('transportationIncluded'),
                comments = this.model.get('comments'),
                notes = this.model.get('notes'),
                showNotes = !ObjectUtil.isNullOrEmpty(notes),
                showComments = !ObjectUtil.isNullOrEmpty(comments);

            return {
                dayText: App.dictionary.get('common.Calendar.Day'),
                moreDetailsText: App.dictionary.get('tourRelated.Booking.MoreDetails'),
                cityLabel: App.dictionary.get('common.FormLabels.City'),
                currencySymbol: App.siteSettings.currencySymbol,
                cityText: cityText,
                durationText: durationText,
                transportationIncluded: transportationIncluded,
                transportationIncludedLabel: App.dictionary.get('tourRelated.TourDetails.TransportationIncluded'),
                comments: comments,
                notes: notes,
                showComments: showComments,
                showNotes: showNotes,

                extensionText: function () {
                    var parentTourLayout = outerScope.model.get('parentTourLayoutId');
                    if (!ObjectUtil.isNullOrEmpty(parentTourLayout)) {
                        return App.dictionary.get('tourRelated.Booking.TourCustomizations.Extension');
                    } else {
                        return '';
                    }
                },
                isChecked: function() {
                    if (App.Booking.assignedPackageUpgrades.contains(outerScope.model)) {
                        return "checked";
                    }
                }
            }
        },
        initialize: function () {
            this.constructor.__super__.initialize.apply(this);
        },
        optionSelected: function() {
            var currentPackagePrompt = this.model.get("packagePrompt").id;

            if (!ObjectUtil.isNullOrEmpty(currentPackagePrompt))
            {
                var $parent = this.$el.parent();

                var $options = $parent.find('.ga-optional-excursions');
                var outerScope = this;

                _.each($options, function (optionRow) {
                    var $optionRow = $(optionRow);
                    var $optionCheckBox = $optionRow.find('.packageUpgrade_checkbox');
                    var currentId = $optionCheckBox.data('id');
                    if (currentId != outerScope.model.get("id")){
                        var option = _.find(App.Booking.tourOptions.models, function (packageUpgrade) {
                            if (ObjectUtil.isNullOrEmpty(packageUpgrade)) {
                                return;
                            }
                            return currentId === packageUpgrade.id;
                        });

                       if (ObjectUtil.isNullOrEmpty(option) || ObjectUtil.isNullOrEmpty(option.get('packagePrompt'))){
                           return;
                       }

                       var packagePrompt = option.get('packagePrompt');
                       if (currentPackagePrompt === packagePrompt.id){
                           if (outerScope.$checkbox.is(':checked')) {
                               outerScope.hideUpgrade($optionCheckBox, $optionRow);
                           } else {
                               outerScope.showUpgrade($optionCheckBox, $optionRow, option);
                           }
                       }
                    }

                });
            }
        },
        getDurationText: function () {
            var duration = this.model.get('duration'),
                hourText = App.dictionary.get('common.Calendar.Hour'),
                hoursText = App.dictionary.get('common.Calendar.Hours'),
                durationText = App.dictionary.get('tourRelated.Booking.Duration');

            var hour = duration === 1 ? hourText : hoursText;

            return durationText + ': ' + duration + ' ' + hour;
        },
        showMoreDetails: function (e) {
            e.preventDefault();

            var $tourOptionDetails = $(this.ui.tourOptionDetails);
            var $moreDetailsLink = $(this.ui.moreDetailsLink);
            var expanded = $tourOptionDetails.hasClass('expanded');

            if (expanded) {
                $tourOptionDetails.removeClass('expanded');
                $moreDetailsLink.removeClass('close');
            } else {
                $tourOptionDetails.addClass('expanded');
                $moreDetailsLink.addClass('close');
            }
        }
    });

    return TourOptionView;
});