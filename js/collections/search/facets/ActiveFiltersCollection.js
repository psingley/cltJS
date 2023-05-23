define([
'app',
'underscore',
'backbone',
'models/search/ActiveFilterItemModel',
'moment'
], function (App, _, Backbone, ActiveFilterItemModel, moment) {
	var ActiveFiltersCollection = Backbone.Collection.extend({
		defaults: {
			model: ActiveFilterItemModel
		},
		setActiveFilters: function (filterGroups, searchParams) {
			this.reset();
			var outerScope = this;
			var activeFilterItemModel;

			if (_.size(filterGroups) === 1 && filterGroups[0] === "price") {
				activeFilterItemModel = new ActiveFilterItemModel();
				var priceValues = searchParams[filterGroups[0]].split(',');

				var priceRangeTitle = priceValues[0] === priceValues[1]
					? outerScope.formatCurrency(priceValues[0])
					: outerScope.formatCurrency(priceValues[0]) + " - " + outerScope.formatCurrency(priceValues[1]);

				activeFilterItemModel.set({
					fieldname: filterGroups[0],
					filtername: priceValues[0] + "|" + priceValues[1],
					filtertitle: priceRangeTitle
				});

				outerScope.add(activeFilterItemModel);
			}
			else if (_.size(filterGroups) === 1 && filterGroups[0] === "daylength") {
				activeFilterItemModel = new ActiveFilterItemModel();
				var daylengthValues = searchParams[filterGroups[0]].split(',');

				var daylengthTitle = daylengthValues[0] === daylengthValues[1]
					? daylengthValues[0] + " Days"
					: daylengthValues[0] + " - " + daylengthValues[1] + " Days";

				activeFilterItemModel.set({
					fieldname: filterGroups[0],
					filtername: daylengthValues[0] + "|" + daylengthValues[1],
					filtertitle: daylengthTitle
				});

				outerScope.add(activeFilterItemModel);
			}
			else if (_.size(filterGroups) === 1) {

				var fieldnameValues = searchParams[filterGroups[0]].split(',');

				//try to find alternative name
				var facetData = $("#" + filterGroups[0] + " input#staticFacetItems");
				var filterValues = null;
				try {
					filterValues = facetData ? jQuery.parseJSON(facetData.val()) : null;
				} catch (e) {
					console.log("facet filterValues is in a wrong format");
				}
				_.each(fieldnameValues, function (activeFiltersValue) {
					var activeFilterItemModel = new ActiveFilterItemModel();
					var filterTitle = activeFiltersValue;
					//look for alternative title					
					if (filterValues) {
						_.each(filterValues, function (staticValue) {
							if (staticValue.name == activeFiltersValue && staticValue.alternativeTitle && staticValue.alternativeTitle != "") {
								filterTitle = staticValue.alternativeTitle;
							}
						});
					}
					activeFilterItemModel.set({
						fieldname: filterGroups[0],
						filtername: activeFiltersValue,
						filtertitle: filterTitle
					});

					outerScope.add(activeFilterItemModel);
				});
			} else if (_.size(filterGroups) > 1) {
				activeFilterItemModel = new ActiveFilterItemModel();
				var firstFieldnameValue = searchParams[filterGroups[0]].split(',')[0];
				var secondFieldnameValue = searchParams[filterGroups[1]].split(',')[0];

				var firstFilterTitle = firstFieldnameValue;
				var secondFilterTitle = secondFieldnameValue;

				var firstIsDate = moment(firstFieldnameValue, "MM-YYYY", true).isValid();
				var secondIsDate = moment(secondFieldnameValue, "MM-YYYY", true).isValid();
				if (firstIsDate && secondIsDate) {
					firstFilterTitle = moment(firstFieldnameValue, "MM-YYYY").format("MMM YYYY");
					secondFilterTitle = moment(secondFieldnameValue, "MM-YYYY").format("MMM YYYY");
				}
                               
				activeFilterItemModel.set({
					fieldname: filterGroups[0] + "|" + filterGroups[1],
					filtername: firstFieldnameValue + "|" + secondFieldnameValue,
                    filtertitle: firstFilterTitle + " - " + secondFilterTitle
				});

				outerScope.add(activeFilterItemModel);
			}
		},
		formatCurrency: function formatNumber(num) {
			var price = num.toString().replace(/(\d)(?=(\d{3})+(?!\d))/g, "$1,");            
            return App.siteSettings.toursUsePointsSystem ? price : (App.siteSettings.currencySymbol + price);
		}
	});
	return ActiveFiltersCollection;
});