define([
	'jquery',
	'underscore',
	'backbone',
	'marionette',
	// Using the Require.js text! plugin, we are loaded raw text
	// which will be used as our views primary template
	'text!templates/search/facets/facetItemTemplate.html',
	'app',
	'models/search/facetItems/FacetItemModel',
	'models/search/searchOptions/ParameterModel' 
], function ($, _, Backbone, Marionnette, facetItemTemplate, App, FacetItemModel, ParameterModel) {
	var FacetItemView = Backbone.Marionette.ItemView.extend({
		model: FacetItemModel,		
		template: Backbone.Marionette.TemplateCache.get(facetItemTemplate),
		initialize: function (options) {
			this.checked = options.checked;
		},
		tagName: 'label',
		attributes: function () {			
			if (this.options.showToolTip) {
				var tooltip = this.model.get("tooltip") != null ? this.model.get("tooltip") : "";
				return {
					role: "tabpanel",
					for: this.model.get("name"),
					class: "filter-checkbox " + this.model.get("badgeCss"),
					"data-toggle": "popover",
					"data-trigger": "hover focus",
					title: "",
					"data-content": tooltip.replace(/(<([^>]+)>)/ig, ""),
					"data-original-title": this.model.get("name")
				}
			}
			return {
				role: "tabpanel",
				for: this.model.get("name"),
				class: "filter-checkbox " + this.model.get("badgeCss"),
				"data-toggle": "popover",
				"data-trigger": "hover focus"				
			}
		},

		templateHelpers: function () {
			return {
				facetItem: this.model,
				badgeCss: function () {
					var css = this.facetItem.get("badgeCss");
					return css;
				},
				badgeTitle: function () {
					var text = this.facetItem.get("alternativeTitle");
					if (!text || text == "") {
						text = this.facetItem.get("name");
					}
					return text;
				},
				badgeIconCss: function () {
					var css = this.facetItem.get("badgeIconCss");
					if (css == undefined) return "";
					return css;
				},
				showReviews: function () {
					if (App.siteSettings.showFeefoReviews) {
						return true;
					}
					return false;
				},
				starsFacet: function () {
					if (this.facetItem.attributes.fieldName == "Customer Reviews") {
						return true;
					} else {
						return false;
					}
				}
			};
		},
		onRender: function () {
			if (this.checked == true) {
				var $facetItemInput = this.$el.find('input');
				$facetItemInput.attr('checked', true);
			
			}
			this.$el.popover();

			
		}
});
// Our module now returns our view
return FacetItemView;
});
