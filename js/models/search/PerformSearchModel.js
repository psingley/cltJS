/**
* This model contains logic for fetching search results,
* facets and defaults and then parsing the data.
*
* @extends Backbone.Model
* @class PerformSearchModel
*/
// Filename: collections/projects
define([
'underscore',
'backbone',
'collections/search/facets/FacetCollection',
'collections/search/results/ResultCollection',
'models/search/facets/FacetModel',

'models/search/results/ResultModel',
'models/search/results/BlogModel',
'collections/search/results/BlogCollection',
'models/search/searchOptions/SearchOptionsModel',
'app'
], function (_, Backbone, FacetCollection, ResultCollection, FacetModel,
	ResultModel, BlogModel, BlogCollection, SearchOptionsModel, App) {
	var PerformSearchModel = Backbone.Model.extend({
		defaults: {
			totalResults: 10,
			redirectToFirstResult: false
		},
		initialize: function () {
			// if results info came, present it in proper format
			if (this.get("results") == null) {
				this.set("results", new ResultCollection());
			}
			else{
				this.set("results", new ResultCollection(
					_(this.get("results")).map(function (result) {
						return new ResultModel(result);
					})));
			}
			// if results info came, present it in proper format
			if (this.get("blogResults") == null) {
				this.set("blogResults", new BlogCollection());
			}
			else{
				this.set("blogResults", new BlogCollection(
					_(this.get("blogResults")).map(function (blogresult) {
						return new BlogModel(blogresult);
					})));
			}

			// if facets info came, present it in proper format
			if (this.get("facets") == null) {
				this.set("facets", new FacetCollection());
			}
			else {
				this.set("facets", new FacetCollection(
					_(this.get("facets")).map(function (facet) {
						return new FacetModel(facet);
					})));
			}

			// if options info came, present it in proper format
			if (this.get("options") == null) {
				this.set("options", new SearchOptionsModel());
			}
			else {
				this.set("options", new SearchOptionsModel(this.get("options")));
			}
			
		}
	});
	// You don't usually return a collection instantiated
	return PerformSearchModel;
});
