define([
'jquery',
'underscore',
'backbone',
'marionette',
'app',
'models/tour/cruiseComponents/CruiseComponentModel',
'text!templates/tour/cruiseComponents/cruiseComponentFullTemplate.html',
'util/objectUtil',
'util/htmlUtil',
'util/tourDetailUtil'
], function ($, _, Backbone, Marionette, App, CruiseComponentModel, tourExtensionFullTemplate, ObjectUtil, HtmlUtil, TourDetailUtil) {
	var CruiseComponentFullView = Backbone.Marionette.ItemView.extend({
		model: CruiseComponentModel,
		template: Backbone.Marionette.TemplateCache.get(tourExtensionFullTemplate),
		className: 'full_description',
		templateHelpers: function () {
			return {
				title: this.model.get('name')
			}
		}
	});
	return CruiseComponentFullView;
});