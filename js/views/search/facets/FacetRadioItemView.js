define([
	'jquery',
	'underscore',
	'backbone',
	'marionette',
	// Using the Require.js text! plugin, we are loaded raw text
	// which will be used as our views primary template
	'text!templates/search/facets/facetRadioItemTemplate.html',
	'app',
	'models/search/facetItems/FacetItemModel',
	'models/search/searchOptions/ParameterModel'	
], function ($, _, Backbone, Marionnette, facetRadioItemTemplate, App, FacetItemModel, ParameterModel) {
	var FacetRadioItemView = Backbone.Marionette.ItemView.extend({
		model: FacetItemModel,
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

		template: Backbone.Marionette.TemplateCache.get(facetRadioItemTemplate),
		initialize: function (options) {
			this.checked = options.checked;
			this.showToolTip = options.checked;
		},
		templateHelpers: function () {
			return {
				facetItem: this.model,		
				badgeIconCss: function () {
					var css = this.facetItem.get("badgeIconCss");
					if (css == undefined) return "";
					return css;
				},
				fieldName: function () {
					var fieldName = this.facetItem.get("fieldName");
					if (fieldName == undefined) return "radio";
					return fieldName;
				},
				badgeTitle: function () {
					var text = this.facetItem.get("alternativeTitle");
					if (!text || text == "") {
						if (this.facetItem.get("name") === "Explorations") {
							text = "Small Groups";

						}
						else {
							text = this.facetItem.get("name");
						}
					}
					return text;
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
	return FacetRadioItemView;
});
