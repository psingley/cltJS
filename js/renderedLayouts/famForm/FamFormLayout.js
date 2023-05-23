define([
		'jquery',
		'underscore',
		'backbone',
		'marionette',
		'app',
		'extensions/marionette/views/RenderedLayout'
], function ($, _, Backbone, Marionette, App, RenderedLayout) {
	/**
	* @class famFormLayout
	* @extends RenderedLayout
	*
	*/
	var count = 1;
	var trackerArray = [];
	var uncheckedTracker = false;

	var famFormLayout = RenderedLayout.extend({
		el: $('.fam_form'),
		events: {
			'click .btn': 'submit',
			'click #SelectedFamItems': 'orderTours'
		},
		ui: {
			'$textboxes': '.fam-tour input[type=\'text\']',
			'$tours': '.fam-tour div',
			'$toursContainer': '.fam-tour'
		},
		initialize: function () {
		},
		submit: function () {
			this.removeDollarSign();
			this.reorganizeDomTree();
		},
		removeDollarSign: function () {
			var moneyFields = $("input[id^='DepartureValue']");
			if (moneyFields.length > 0) {
				$.each(moneyFields, function (index, field) {
					field.value = field.value.replace('$', '').replace('£', '');
				});
			}
			return true;
		},
		orderTours: function (e) {

			if (e.target.checked) {
				if (uncheckedTracker == false) {
					e.target.nextElementSibling.value = count++;
				}
				else {
					e.target.nextElementSibling.value = trackerArray[trackerArray.length - 1];
				}
			}
			else {
				for (var i = 0; i < this.ui.$textboxes.length; i++) {
					if (this.ui.$textboxes[i].value > e.target.nextElementSibling.value && this.ui.$textboxes[i].value != "N/A") {
						this.ui.$textboxes[i].value -= 1;
					}
				}
				e.target.nextElementSibling.value = " ";
				count--;
			}
		},
		reorganizeDomTree: function () {
			var elements =_.sortBy(this.ui.$tours, function(item) {
						return $(item).find('#FamItemPrecedence').val();
			});
			$(this.ui.$toursContainer).html(elements);
		}
	});
	return famFormLayout;
});