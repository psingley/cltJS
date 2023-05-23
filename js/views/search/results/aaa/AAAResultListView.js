define([
    'jquery',
    'underscore',
    'backbone',
    'marionette',
    'app',
    'views/search/results/SearchResultsCollectionLayout',
    'views/search/results/aaa/AAAResultView'
], function ($, _, Backbone, Marionette, App, ResultListView, AAAResultView) {
    /**
     * @class AAAResultListView
     * @constructor
     * @extends ResultListView
     */
    var AAAResultListView = ResultListView.extend({
        itemView: AAAResultView
    });
    return AAAResultListView;
});