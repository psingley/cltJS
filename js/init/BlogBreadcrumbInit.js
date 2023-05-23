define([
	"app",
	'jquery',
	'domReady',
	'renderedLayouts/blogNews/BlogBreadcrumbLayout'
	],
	function (App, $, domReady, BlogBreadcrumbLayout) {
		App.module("BlogBreadcrumb", function () {
			this.startWithParent = false;
			this.addInitializer(function () {
				domReady(function () {
					var r = new BlogBreadcrumbLayout();
				});
			});
		});
	});