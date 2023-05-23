define([
		'jquery',
		'underscore',
		'backbone'
	], function ($, _, Backbone) {
		var pageStickyNavLayout = Backbone.Marionette.Layout.extend({
			el: '#region-navbar',
			events: {
				'click .scroll-to': 'scrollTo'
			},
			initialize: function () {
				var outerScope = this;
				outerScope.showNavButtons();

			},
			scrollTo: function (e) {
				e.preventDefault();
				var navBarHeight = Number($("[class='page-sticky-nav navbar navbar-default shadow affix-top']").outerHeight());
				var scrollOffset = Number(e.target.getAttribute('data-offset')) + navBarHeight;

				//If page is mobile, do not apply any offset to the scroll
				if ($('.logo').find('.mobile').css('display') != 'none') {
					scrollOffset = 0;
				}

				if (location.pathname.replace(/^\//, '') === e.target.pathname.replace(/^\//, '') && location.hostname === e.target.hostname) {
					var target = $(e.target.hash);
					target = target.length ? target : $('[name=' + e.target.hash.slice(1) + ']');
					if (target.length) {
						$('html,body').animate({
							scrollTop: target.offset().top - scrollOffset
						}, 750);
						return false;
					}
				}
				return true;
			},
			//Display navigation links if correlated anchors are on the page
			showNavButtons: function () {
				if ($("#next-webinar").length > 0) {
					var nextLink = $('a[href = "#next-webinar"]');
					$(nextLink).closest('li').css('display', 'inline');
					$(".navbar-toggle").css('visibility', 'visible');
				}
				if ($("#past-webinars").length > 0) {
					var pastLink = $('a[href = "#past-webinars"]');
					$(pastLink).closest('li').css('display', 'inline');
					$(".navbar-toggle").css('visibility', 'visible');
				}
			}
		});
		return pageStickyNavLayout;
	});