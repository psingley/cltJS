/**
 * The base result view class for showing search results
 * @class ResultView
 * @extend Backbone.Marionette.ItemView
 */
define([
    'jquery',
    'underscore',
    'backbone',
    'marionette',
    'moment',
    'models/search/results/ResultModel',
    'util/objectUtil',
    'text!templates/search/results/blogResultsTemplate.html',
    'app',
	'event.aggregator',
	'cookie',
	'util/uriUtil'
], function ($, _, Backbone, Marionette, moment, ResultModel, ObjectUtil,
				resultItemTemplate, App, EventAggregator, cookie, UriUtil) {
	var BlogResultItemView = Backbone.Marionette.ItemView.extend({
		template: Backbone.Marionette.TemplateCache.get(resultItemTemplate),
		model: ResultModel,
		tagName: 'div',
		className: function () {
			return 'post';
		},
		TourDetailsLayout : null,//module that needs only for agents
		attributes: function () {
			var self = this;
			return {
				class: "post",
				id: "post-" + self.options.resultNumber,
				"data-postid": self.model.get("id")
			}
		},
		ui: {
			'$tags': '.tags',
			'$mainButtonsEl': 'nav.tour-main-nav a',
			'$extraButtonsEl': 'ul.list-simple a'
		},
		events: {
			'click nav.tour-main-nav a': 'optionClickedMainNav',
			'click ul.list-simple a': 'optionClickedSubNav'
		},
		initialize: function (options) {
			this.template = Backbone.Marionette.TemplateCache.get(resultItemTemplate);
			var self = this;
		},
		onShow: function () {
			//this.showResults();
		},
		templateHelpers: function () {
			var viewContext = this;
			return {
				urlWithHash: function () {
					var searchOptionsParams = App.Search.searchOptions.get('parameters');
					var serializableObject = searchOptionsParams.serializableObject(App.Search.searchOptions);

					delete serializableObject.currentPage;
					delete serializableObject.parent;
					delete serializableObject.sortDirection;
					delete serializableObject.sortBy;

					var updateUrl = function(url) {
						var uri = viewContext.model.get("uri");
						if (uri != null && uri.Language.Name != "en") {
								url = url.replace("/en/", "/" + uri.Language.Name + "/");
								return url;
						}
						return url;
					}

					var url = updateUrl(viewContext.model.get("url"));

					if (Object.getOwnPropertyNames(serializableObject).length > 0) {
						var hash = UriUtil.getUriHash(serializableObject);
						return url + "#" + hash;
					} else {
						return url;
					}
				},
				formattedDate: function () {
					if (moment(viewContext.model.get("fullDate")).format("YYYY") == "0001") {
						return "";
					}

					return moment(viewContext.model.get("fullDate")).format("MMMM D, YYYY");
				},
				hasTags: function () {
					var tags = viewContext.model.get("tags");
					if (tags == null) {
						return false;
					}

					if (!tags.length) {
						return false;
					}

					return true;
				},
				hasBlogImage: function () {
					var imageUrl = viewContext.model.get("imageUrl");
					if (imageUrl == null) {
						return false;
					}

					if (!imageUrl.length) {
						return false;
					}

					return true;
				},
				resultNumber: viewContext.resultNumber,
				readMoreText: App.dictionary.get('cares.ReadMore', 'Read More'),
				tourId: viewContext.model.get("id"),
				tourDetailsText: App.dictionary.get('search.TourDetails', 'Tour Details')				
			}
		}
	});
	// Our module now returns our view
	return BlogResultItemView;
});
