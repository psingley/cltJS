define([
	'jquery',
	'underscore',
	'backbone',
	'app',
	'extensions/marionette/views/RenderedLayout'
], function ($, _, Backbone, App, RenderedLayout) {
	var ArchiveDatesLayout = RenderedLayout.extend({
		el: '.care-archive-dates',
		initialize: function () {
			var outerScope = this;
			$(".chosen-select").change(function (e) {
				outerScope.selectDate(e);
			});

			var queryDate = this.getQueryVariable("date");
			if (queryDate.length > 0) {
				$(".chosen-select").val(queryDate);
				$(".chosen-select").trigger("chosen:updated");
			}
		},
		selectDate: function (e) {
			var target = $(e.currentTarget);
			var date = target.val();
			if (date.length > 0) {
				window.location.search = App.caresDate + date;
			} else {
				window.location.href = window.location.href.split(/[?#]/)[0];
			}
		},
		getQueryVariable: function (key) {
			var query = window.location.search.substring(1);
			var vars = query.split('&');
			for (var i = 0; i < vars.length; i++) {
				var pair = vars[i].split('=');
				if (decodeURIComponent(pair[0]) == key) {
					return decodeURIComponent(pair[1]);
				}
			}
			return "";
		}
	});
	return ArchiveDatesLayout;
});