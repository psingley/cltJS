define([
    'jquery',
    'underscore',
    'backbone',
    'marionette',
    'app',
    'util/objectUtil',
    'util/tourDetailUtil',
    'models/tour/packageUpgrades/PackageUpgradeModel',
    'text!templates/tour/optionalExcursions/optionalExcursionsTemplate.html',
    'util/htmlUtil',
    'views/tour/optionalExcursions/OptionalExcursionsFullView'
], function ($, _, Backbone, Marionette, App, ObjectUtil, TourDetailUtil, PackageUpgradeModel, tourOptionTemplate, HtmlUtil, OptionalExcursionsFullView) {
    var TourOptionView = Backbone.Marionette.ItemView.extend({
        model: PackageUpgradeModel,
        template: Backbone.Marionette.TemplateCache.get(tourOptionTemplate),
        className: 'block',
        events: {
            'click': 'showFullDetail'
        },
        initialize: function (options) {
            this.$expandedView = options.$expandedView;
            this.$closeButton = options.$closeButton;
        },
        templateHelpers: function () {
            var fullTitle = this.getFormattedTitle();
            var fullExcursionOnlyAvailable = this.getFullExcursionOnlyAvailable();
            return {
                fullTitle: fullTitle,
                fullExcursionOnlyAvailable: fullExcursionOnlyAvailable
            };
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
        getFullExcursionOnlyAvailable: function () {
            var parentTourLayoutTitle = this.model.get("parentTourLayoutTitle");
            if (parentTourLayoutTitle) {
                return App.dictionary.get('tourRelated.FreeFormText.ExcursionOnlyAvailableWith') + " " + parentTourLayoutTitle;
            }
            return "";
        },
        showFullDetail: function (e) {
            e.preventDefault();
            var view = new OptionalExcursionsFullView({model: this.model});
            TourDetailUtil.showExpandedSection(this.$expandedView, this.$closeButton, view);
        }
    });
    // Our module now returns our view
    return TourOptionView;
});