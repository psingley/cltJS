define([
    'jquery',
    'underscore',
    'backbone',
    'marionette',
    'app',
    'event.aggregator',
    'collections/booking/tourCustomizations/BookingPackageUpgradeCollection',
    'views/booking/tourCustomizations/TourOptionListView',
    'text!templates/booking/tourCustomizations/tourOptionLayoutTemplate.html',
    'util/objectUtil'
], function ($, _, Backbone, Marionette, App, EventAggregator, PackageUpgradeCollection, TourOptionListView, tourOptionLayoutTemplate, ObjectUtil) {
    var TourOptionLayoutView = Backbone.Marionette.Layout.extend({
        template: Backbone.Marionette.TemplateCache.get(tourOptionLayoutTemplate),
        tagName: 'div',
        className: 'booking customizations optional_excursions',
        regions: {
            'tourOptionListRegion': '#tourOptionList'
        },
        onShow: function () {
            var outerScope = this;
            var tourOptions = new PackageUpgradeCollection();
            var preTourOptions = new PackageUpgradeCollection();
            var postTourOptions = new PackageUpgradeCollection();

            tourOptions.set(
                _(outerScope.collection.filter(function (packageUpgrade) {
                    var isNotPrePostOption = ObjectUtil.isNullOrEmpty(packageUpgrade.get('parentTourLayoutId'));
                    return isNotPrePostOption;
                })).map(function (tourOption) {
                        return tourOption;
                    })
            );

 /*           preTourOptions.set(
                _(outerScope.collection.filter(function (packageUpgrade) {
                    var parentTourLayoutId = packageUpgrade.get('parentTourLayoutId');
                    var isPreOption = false;

                    if (!ObjectUtil.isNullOrEmpty(parentTourLayoutId)) {
                        var parentPackageUpgrade = App.Booking.preExtensions.find(function (upgrade) {
                            var tourLayoutId = upgrade.get('tourLayoutId');
                            return tourLayoutId == parentTourLayoutId;
                        });

                        if (parentPackageUpgrade != undefined) {
                            isPreOption = true;
                        }
                    }

                    return isPreOption;
                })).map(function (tourOption) {
                        return tourOption;
                    })
            );

            postTourOptions.set(
                _(outerScope.collection.filter(function (packageUpgrade) {
                    var parentTourLayoutId = packageUpgrade.get('parentTourLayoutId');
                    var isPostOption = false;

                    if (!ObjectUtil.isNullOrEmpty(parentTourLayoutId)) {
                        var parentPackageUpgrade = App.Booking.postExtensions.find(function (upgrade) {
                            var tourLayoutId = upgrade.get('tourLayoutId');
                            return tourLayoutId == parentTourLayoutId;
                        });

                        if (parentPackageUpgrade != undefined) {
                            isPostOption = true;
                        }
                    }

                    return isPostOption;
                })).map(function (tourOption) {
                        return tourOption;
                    })
            );*/

            if (tourOptions.length != 0 || preTourOptions.length != 0 || postTourOptions.length != 0) {
                this.tourOptionListRegion.show(new TourOptionListView({collection: tourOptions}));
                //this.preTourOptionListRegion.show(new TourOptionListView({collection: preTourOptions}));
                //this.postTourOptionListRegion.show(new TourOptionListView({collection: postTourOptions}));
            } else {
                this.$el.closest('.section').hide();
            }

            this.onExtensionsChosen();
        },
        templateHelpers: function () {
             var result = {
                pricePpText: App.dictionary.get('tourRelated.Booking.TourCustomizations.PricePp'),
                personsText: App.dictionary.get('tourRelated.Booking.TourCustomizations.Persons'),
                descriptionText: App.dictionary.get('tourRelated.Booking.Description')
            };
            var optionalTextItem = $("#aaa-optional-excursions-credit");
            if (optionalTextItem.length > 0){
                result.showOptionalHeader = true;
                result.copyHeader = optionalTextItem.data("title");
                result.copyText = optionalTextItem.data("description");
            }
            else {
                result.showOptionalHeader = false;
            }
            return result;
        },
        onExtensionsChosen: function(){
            var outerScope = this;
            EventAggregator.on('extensionChosen', function ($target, packageUpgradeModel) {
                var isPre = packageUpgradeModel.get('serviceDay') == 0;
                if (!$target[0].checked)
                {
                    if (isPre)
                    {
                        new Backbone.Marionette.Region({ el: "#preTourOptionList"}).reset();
                    }
                    else
                    {
                        new Backbone.Marionette.Region({ el: "#postTourOptionList"}).reset();
                    }
                    return;
                }

                var extensionTourLayoutId = packageUpgradeModel.get('tourLayoutId');
                var tourOptions = new PackageUpgradeCollection();

                tourOptions.set(
                    _(outerScope.collection.filter(function (packageUpgrade) {
                        var parentTourLayoutId = packageUpgrade.get('parentTourLayoutId');
                        return (!ObjectUtil.isNullOrEmpty(parentTourLayoutId) && parentTourLayoutId == extensionTourLayoutId)
                    })).map(function (tourOption) {
                            return tourOption;
                    }));
                if (isPre)
                {
                    new Backbone.Marionette.Region({ el: "#preTourOptionList"}).show(new TourOptionListView({collection: tourOptions}));
                }
                else
                {
                    new Backbone.Marionette.Region({ el: "#postTourOptionList"}).show(new TourOptionListView({collection: tourOptions}));
                }
            });
        }
    });

    return TourOptionLayoutView;
});