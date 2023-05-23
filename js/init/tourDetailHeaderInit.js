define([
		"app",
		'jquery',
		'underscore',
		'marionette',
		'backbone',
		'util/objectUtil'

	],
	function(App, $, _, Marionette, Backbone, ObjectUtil) {
		App.module("Tour-Detail-Header",
			function() {
				this.startWithParent = false;
				this.addInitializer(function () {

					if (App.siteIds.Marriott != App.siteSettings.siteId) {
						$('#currencyLabelPricing').html(App.siteSettings.currencyCode);
						$('#currencyLabelPricingDiv').append(' ' + App.siteSettings.currencyCode)
					} else {
						$('#currencyLabelPricing').hide();
						$('#currencyLabelPricingDiv').hide();
                    }


					//add print functionality to print icon
					if ($('.tour-detail-print').length > 0) {
						$('.tour-detail-print').click(function() {
							window.print();
							return false;
						});
					}

								// Do work with currentElement
					$.fn.tourDetailSubNav = function() {

						var $nav = this;
						var $expandShare = $nav.find('[data-button="expand-share"]');
						var $socialExpanded = $('.social-expanded');
						if ($("#tourdetailsreviews").length == 0) { $('a[href=#tourdetailsreviews]').hide(); }
						if ($("#tour_detail_other_tours").length == 0) { $('a[href=#tour_detail_other_tours]').hide(); }
						$expandShare.on('click',
							function () {
								if ($socialExpanded.css("display") == "none") {
									$socialExpanded.css("display", "inline-flex");
								} else {
									$socialExpanded.css("display", "none");
								}
							});

						var $offerRibbon = $('.offer-ribbon');
						$offerRibbon.on('click',
							function(e) {
								e.preventDefault();
								var target = $('#tour_detail_offers');
								$('html,body').animate({
									scrollTop: $(target).offset().top - 170
								}, 1000);
							});

							//Add "Product Rating" label if tour has reviews
							if ($(".feefo-tour-detail-image img").length){
								$(".feefo-tour-detail-image").prepend("Product Rating:");
							}

					};

					$('#tour_detail_sub_nav').tourDetailSubNav();

				});
			});
	});
