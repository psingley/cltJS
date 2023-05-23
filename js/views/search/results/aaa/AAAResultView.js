define([
    'jquery',
    'underscore',
    'backbone',
    'marionette',
    'app',
    'views/search/results/SearchResultItemView',
    'text!templates/search/results/aaa/aaaSearchResultsTemplate.html',
    'util/objectUtil'
], function ($, _, Backbone, Marionette, App, ResultView, aaaResultItemTemplate, ObjectUtil) {
    /**
     * @class AAAResultView
     * @constructor
     * @extends ResultView
     */
    var AAAResultView = ResultView.extend({
        template: Backbone.Marionette.TemplateCache.get(aaaResultItemTemplate),
        templateHelpers: function () {
            var viewContext = this;
            var helpers = {
                isCaa: App.siteSettings.siteLanguage === "en-TT",
                withOutAAAText: App.dictionary.get('tourRelated.FreeFormText.WithOutAAA')
                /*memberBenefitAAA: App.dictionary.get('tourRelated.FreeFormText.MemberBenefitAAA')*/
                
            };

            return _.extend(helpers, ResultView.prototype.templateHelpers.apply(this));
        }
    });
    return AAAResultView;
});