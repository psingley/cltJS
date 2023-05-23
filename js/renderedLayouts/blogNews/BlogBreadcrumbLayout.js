define([
		'jquery',
		'underscore',
		'backbone',
		'marionette',
		'extensions/marionette/views/RenderedLayout',
		'util/uriUtil',
        'util/objectUtil',
		'event.aggregator'
], function ($, _, Backbone, Marionette, RenderedLayout, UriUtil, ObjectUtil, EventAggregator) {

	var BlogBreadcrumbLayout = RenderedLayout.extend({
		initialize: function() {
			var outerscope = this;
			this.showHideBreadcrumbs();
			EventAggregator.on('requestResultsComplete', function() {
				outerscope.showHideBreadcrumbs();
			});
		},

		showHideBreadcrumbs: function () {
		    var urlVars = UriUtil.getUrlVars();

			var filteredCrumb = $('#filteredCrumb');
			var breadCrumbNav = $('#blogBreadcrumb');

		    var pageTemplateType = breadCrumbNav.data('templatetype');
		    var isHomePage = pageTemplateType == 'Blog Folder';

			var searchKey = Object.keys(urlVars)[0];
			var excludedParams = ["currentPage", "sortDirection", "sortBy"];

			if (filteredCrumb.length > 0 && excludedParams.indexOf(searchKey) < 0  && (searchKey || !isHomePage)) {
				$(breadCrumbNav).show();

				if (searchKey || isHomePage) {
				    var url = '#' + UriUtil.getUriHash(urlVars);
				    $(filteredCrumb).children().each(function () {
				        this.href += url;
				    });
				    $(filteredCrumb).find('#filteredCrumbText').text(urlVars[searchKey]);
				    $(filteredCrumb).show();
				}		

			} else {
				$(breadCrumbNav).hide();
				$(filteredCrumb).hide();
			}
		}

	});
	return BlogBreadcrumbLayout;
});
