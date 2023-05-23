define([
    'jquery',
    'underscore',
    'backbone',
    'marionette',
    'app',
    'event.aggregator',
    'views/booking/flights/InTourTransferListView',
    'text!templates/booking/flights/inTourTransferLayoutTemplate.html',
	'util/booking/bookingUtil'
], function ($, _, Backbone, Marionette, App, EventAggregator, InTourTransferListView, inTourTansferLayoutTemplate, BookingUtil) {
    var InTourTransferLayoutView = Backbone.Marionette.Layout.extend({
        className: 'booking customizations optional_excursions',
        template: Backbone.Marionette.TemplateCache.get(inTourTansferLayoutTemplate),
        regions: {
            'inTourTransfersListRegion': '#inTourTransfersList'
        },
        initialize: function () {
            var outerScope = this;
            if (App.Booking.inTourTransfers.length == 0) {
                var $section = this.$el.closest('.section');
                $section.hide();
            }

            //hide departure transfers if post night hotel was chosen and hide arrival transfers if pre night hotel was chosen
            EventAggregator.on('submitTourCustomizationsComplete', function () {
                if (outerScope.preHotelUpgradeIsIncluded() || outerScope.preExtensionIsIncluded()) {
                    outerScope.removeTransfers('.inTourTransfer.arrival');
                    outerScope.hideTransfers($('.inTourTransfer.arrival'));
                } else {
                    outerScope.showTransfers($('.inTourTransfer.arrival'));
                }

                if (outerScope.postHotelUpgradeIsIncluded() || outerScope.postExtensionIsIncluded()) {
                    outerScope.removeTransfers('.inTourTransfer.departure');
                    outerScope.hideTransfers($('.inTourTransfer.departure'));
                } else {
                    outerScope.showTransfers($('.inTourTransfer.departure'));
                }
            });

            EventAggregator.on('searchForAirChanged', function () {
                //if they are not getting air from us show in tour transfers
                if (!App.Booking.Steps['flightStep'].getAddAir() && !App.Booking.Steps['flightStep'].getRequestACallback()
                    && App.Booking.inTourTransfers.length > 0) {
                	outerScope.$el.closest('.section').show();
                } else {
                    //if they are getting air hide this section
                    //and remove all selected transfers
                    outerScope.removeTransfers('.inTourTransfer');
                    outerScope.$el.closest('.section').hide();
                }
                BookingUtil.renderStepButtons();
            });
        },
        templateHelpers: function () {
            return {
                pricePpText: App.dictionary.get('tourRelated.Booking.TourCustomizations.PricePp'),
                descriptionText: App.dictionary.get('tourRelated.Booking.Description'),
                personsText: App.dictionary.get('tourRelated.Booking.TourCustomizations.Persons')
            }
        },
        onRender: function () {
            this.inTourTransfersListRegion.show(new InTourTransferListView({collection: App.Booking.inTourTransfers}));
        },
        postHotelUpgradeIsIncluded: function () {
            return _.some(App.Booking.assignedPackageUpgrades.models, function(model) {
                return model.get('serviceType').id === App.taxonomy.getId('serviceTypes', 'Hotel') && model.get('serviceOrder').id === App.taxonomy.getId('serviceOrders', 'Post');
            });
        },
        preHotelUpgradeIsIncluded: function () {
            return _.some(App.Booking.assignedPackageUpgrades.models, function(model) {
                return model.get('serviceType').id === App.taxonomy.getId('serviceTypes', 'Hotel') && model.get('serviceOrder').id === App.taxonomy.getId('serviceOrders', 'Pre');
            });
        },
        postExtensionIsIncluded: function () {
            return _.some(App.Booking.assignedPackageUpgrades.models, function(model) {
                return model.get('serviceType').id === App.taxonomy.getId('serviceTypes', 'Extension') && model.get('serviceOrder').id === App.taxonomy.getId('serviceOrders', 'Post');
            });
        },
        preExtensionIsIncluded: function () {
            return _.some(App.Booking.assignedPackageUpgrades.models, function(model) {
                return model.get('serviceType').id === App.taxonomy.getId('serviceTypes', 'Extension') && model.get('serviceOrder').id === App.taxonomy.getId('serviceOrders', 'Pre');
            });
        },
        showTransfers: function (transfersDivs) {
            if (transfersDivs) {
                _.each(transfersDivs, function (transferDiv) {
                    $(transferDiv).removeClass('muted');
                    var $checkbox = $(transferDiv).find('.packageUpgrade_checkbox');
                    if ($checkbox) {
                        $checkbox.css('visibility', 'visible');
                        $checkbox.prop('disabled', false);
                        var transferId = $checkbox.data('id');
                        var transfer = _.some(App.Booking.assignedPackageUpgrades.models, function (item) {
                            return item.get('id') === transferId;
                        });
                        if (transfer) {
                            $checkbox.prop('checked', true);
                        } else {
                            $checkbox.prop('checked', false);
                        }
                    }
                });
            }
        },

        removeTransfers: function (transferType) {
            var $transfersDivs =
                    $(this.regions.inTourTransfersListRegion)
                    .find(transferType);

            if($transfersDivs && $transfersDivs.length > 0) {
                var outerScope = this;
                _.each($transfersDivs, function ($transferDiv) {
                    var $checkbox =  $($transferDiv).find('.packageUpgrade_checkbox');
                    var transferId = $checkbox.data('id');

                    var transfer = _.find(App.Booking.inTourTransfers.models, function (element) {
                        return element.get('id') === transferId;
                    });

                    outerScope.uncheckTransfersCheckboxes($transferDiv, $checkbox);
                    if (transfer) {
                        EventAggregator.trigger('togglePackageUpgrades', $checkbox, transfer);
                        App.Booking.Steps['flightStep'].updateSubmissionStatus();
                    }
                });
            }
        },
        hideTransfers: function (transfersDivs) {
            var outerScope = this;
            if (transfersDivs) {
                _.each(transfersDivs, function (transferDiv) {
                    $(transferDiv).addClass('muted');
                    //delete price
                    var $checkbox = $(transferDiv).find('.packageUpgrade_checkbox');
                    if ($checkbox) {
                        $checkbox.css('visibility', 'hidden');
                        $checkbox.prop('disabled', true);
                        $checkbox.prop('checked', false);
                        outerScope.closeTravelerCheckboxes(transferDiv);
                    }
                });
            }
        },
        uncheckTransfersCheckboxes: function($transferDiv, $transferCheckbox) {
            if ($($transferCheckbox).is(':checked')) {
                $transferCheckbox.prop('checked', false);

                this.closeTravelerCheckboxes($transferDiv);
            }
        },
        closeTravelerCheckboxes: function (transferDiv) {
            var travelersDiv = $(transferDiv).find('.travelerCheckBoxes > div');
            if (transferDiv) {
                travelersDiv.remove();
            }
        }
    });
    return InTourTransferLayoutView;
});