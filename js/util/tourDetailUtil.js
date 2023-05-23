define([
	'jquery',
	'underscore',
	'backbone',
	'app',
	'goalsUtil',
	'util/objectUtil'
], function ($, _, Backbone, App, GoalsUtil, ObjectUtil) {
	var tourDetailUtil = {
		showExpandedSection: function ($expanded, $closeButton, view) {
			var $currentExpandedItem = $expanded.find(".full_description"),
			id = view.model.get('id');

			if ($currentExpandedItem.length > 0 && $currentExpandedItem.data('id') === id) {
				return false;
			}

			var html = view.render().el;
			if ($expanded.is(':visible')) {
				$expanded.fadeOut(400, function () {
					$expanded.html(html);
					$expanded.data('id', id);
					$expanded.fadeIn(400);
				});
			} else {
				$expanded.html(html);
				$expanded.data('id', id);
				$closeButton.show();
				$expanded.slideDown(700);
			}
		},
		//Generate the text that appears in each row
		getSeatsLeftText: function (seatsLeft) {
			var outerScope = this;
			if (!App.Tour || !App.Tour.settings || !App.Tour.settings.seatsRemainingMessageThreshold)
				return "";

			var threshold = App.Tour.settings.seatsRemainingMessageThreshold;

			if (seatsLeft > 0 && seatsLeft < threshold) {
				if (seatsLeft == 1) {
					return App.dictionary.get('tourRelated.FreeFormText.OnlyOneSeatRemaining');
				} else {
					var xSeatsRemaining = App.dictionary.get('only @@SeatsRemaining@@ seats remaining');
					return xSeatsRemaining.replace("@@SeatsRemaining@@", seatsLeft);
				}
			}
			return "";
		},
		//Sets the "Pick from x tour dates text"
		generatePickFromText: function (availableDatesCount) {
			var titleText = "";
			switch (availableDatesCount) {
				case (0):
					titleText = App.dictionary.get("tourRelated.FreeFormText.PickFromTourDates")
					+ " - " + App.dictionary.get("currently there are no dates available");
					$('#section-dates-content').hide();
					break;
				case (1):
					titleText = App.dictionary.get("tourRelated.FreeFormText.PickFromTourDate")
					break;
				default:
					titleText = App.dictionary.get("tourRelated.FreeFormText.PickFromTourDates")
					break;
			}
			//Replace the token and create the text
			titleText = titleText.replace("@@TotalDays@@", availableDatesCount);
			$('#totalPackageDates').replaceWith(titleText);
			return;
		},
		formatNumberWithCommas: function formatNumber(num) {
			if (num) {
				return num.toString().replace(/(\d)(?=(\d{3})+(?!\d))/g, "$1,")
			}
			return "";
		},
		closeExpandedSection: function (e, $expanded, $closeButton) {
			e.preventDefault();
			$expanded.slideUp(700, function () {
				$expanded.empty();
				$closeButton.hide();
			});
		},
		updateColumnHeights: function ($columns) {
			// Tour Details - other tours
			if ($columns.length > 0) {
				var maxHeight = -1;
				$columns.css('display', 'block');
				$columns.each(function () {
					maxHeight = maxHeight > $(this).height() ? maxHeight : $(this).height();
				});

				$columns.each(function () {
					$(this).height(maxHeight);
				});
			}
		},
		wireGoals: function () {
			//wire addthis share buttons to goal util
			$(".addthis_button_pinterest_share").click(function () {
				GoalsUtil.socialSharing('pinterest');
				GoalsUtil.sharePinterest();
			});

			$(".addthis_button_twitter").click(function () {
				GoalsUtil.socialSharing('twitter');
				GoalsUtil.shareTwitter();
			});

			$(".addthis_button_facebook").click(function () {
				GoalsUtil.socialSharing('facebook');
				GoalsUtil.shareFacebook();
			});

			$(".inpage_social a.print").click(function () {
				GoalsUtil.socialSharing('print');
				GoalsUtil.sharePrint();
			});

			$("#otherTours a.recommendedTour").click(function () {
				var tourId = $(this).data('id');
				GoalsUtil.clickOnRecommendedTour(tourId);
			});

			$("#tourDetailOtherTours a.OtherTourItems").click(function () {
			    var tourId = $(this).data('id');
			    GoalsUtil.clickOnRecommendedTour(tourId);
			});
		},
		OnLoad: function () {

			this.wireGoals();

			$(".inpage_social a.print").click(function (e) {
				e.preventDefault();

				//expand the personalize your tour section to include contents when print button clicked
				$('#extensionExpandedView').show();
				window.print();
			});

			//if package dates view all dates has items display it
			if ($('.expanded input:radio[name="date"]').length == 0) {
				$('#tourDatesViewMore').hide();
			}
			this.updateItineraryDepartingDate();

			//disable calendar icons for muted tour dates
			$('input:radio[name="date"]:disabled').each(function () {

				$(this).parent().parent().find('.ui-datepicker-trigger').attr('src', '/img/icons_calendar_off.png');

			});

			this.updateItineraryDepartingDate();

		},
		getPackageDate: function () {
			var packageDates = $('input:radio[name="date"]');

			if (packageDates.length == 1) {
				packageDates.first().attr('checked', 'checked');
				return packageDates.first().val();
			}

			var packageDateId = $('input:radio[name="date"]:checked').val();

			//check to see if an option has been selected
			if (packageDateId === undefined) {
				return null;
			}

			return packageDateId;
		},
		updateItineraryDepartingDate: function () {
			var selectedPackageDate = $('input:radio[name="date"]:checked');
			if (selectedPackageDate === undefined) {
				console.log("There was an issue getting selected package date");
			} else {
				$('#yourItinerarySectionDate').html(selectedPackageDate.attr("startdate"));
			}
		},
		updateOtherToursHeight: function () {
			// Tour Details - other tours
			if ($("#other_tours_section").length) {
				var maxHeight = -1;
				$('#other_tours_section .col').css('display', 'block');
				$('#other_tours_section .col').each(function () {
					maxHeight = maxHeight > $(this).height() ? maxHeight : $(this).height();
				});

				$('#other_tours_section .col').each(function () {
					$(this).height(maxHeight);
				});
			}
		},
		//update tour package title
		updateTourInfo: function (tourPackageTitle, subTitle, bannerPromotionImage) {
			$('#tourPackageTitle').html(tourPackageTitle);
			if (!ObjectUtil.isNullOrEmpty(subTitle)) {
                subTitle = subTitle.charAt(0).toUpperCase() + subTitle.slice(1);
            }
            $('#tourPackageSubTitle').html(subTitle);
			//only update if the image is different
			if ($('img#bannerPromotionImage') != bannerPromotionImage.url) {
				$('img#bannerPromotionImage').attr('src', bannerPromotionImage.url);
				$('img#bannerPromotionImage').attr('alt', bannerPromotionImage.altTag);
			}
		},
		isBookingPage: function () {
			return $('#isBookingPage').val();
		},
		getPriceText: function(price){
			var priceText = App.siteSettings.currencySymbol + this.formatNumberWithCommas(price);
			if (App.siteSettings.currencySymbol === "£") {
				priceText = App.dictionary.get('common.Misc.From') + " " + priceText;
			}

			if (App.siteSettings.toursUsePointsSystem) {
				priceText = this.formatNumberWithCommas(price) + " " + App.dictionary.get('tourRelated.FreeFormText.Pts');
			}

			return priceText;
		},
		scrollToId: function(id){
			$('html,body').animate({scrollTop: $("#"+ id).offset().top},'slow');
		},
		getQueryStringParamValue: function (param) {
		    var url = window.location.href.slice(window.location.href.indexOf('?') + 1).split('&');
		    for (var i = 0; i < url.length; i++) {
		        var urlparam = url[i].split('=');
		        if (urlparam[0] == param) {
		            return urlparam[1];
		        }
		    }

		},
		replaceLinkAttrVals: function(type, attrType, orgin, replacement) {
			//var orig_href = $('link[rel=' + type + ']').attr(attrType);
			//var new_href = orig_href.replace(orgin, replacement);
		    $('[rel=' + type + ']').each(function (e) {
                var h = $(this).attr('href');

                //if it is EN-GB do not do it for explorations web-667
                var hrefwithlang = $(this).attr('href');
                if (hrefwithlang.indexOf("/en-gb/") < 0) {

                    $(this).attr('href', h.replace(orgin, replacement).split("?")[0]);
                }
			});
		}
	};

	return tourDetailUtil;
});