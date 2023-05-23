define([
		"app",
		'jquery',
        "require",
		'underscore',
		'marionette',
		'backbone',
		'util/objectUtil'
	],
	function(App, $, _, Require, Marionette, Backbone, ObjectUtil) {
		App.module("Tour-Detail-Sticky-Nav",
			function() {
				this.startWithParent = false;
				this.addInitializer(function() {
					$('#tour_detail_sub_nav').tourDetailStickyNav();
				});
			});

		$.fn.tourDetailStickyNav = function() {

			var $stickyNav = this;
			var offset = $stickyNav.offset();
			var $stickyHeader = $('.sub-nav-content h1');
			var $stickyHeight = $('#tour_detail_sub_nav').height();
			var $stickyNavTop = (!ObjectUtil.isNullOrEmpty(offset)) ? offset.top + (offset.top * .45) : $('main').offset().top;
			var $stickyNavPlaceHolder = $('.tour-detail-sub-nav-placeholder');
			var $stickyNavLink = $('#tourdetailsubnav a');
			var $stickyHeaderSpan = $('.sub-nav-content h1 span.large');
			var $stickyPrice = $('.space-between h4');
			var $stickySmall = $('h1 span.small');
			var $stickyLegal = $('p.legal');
			var $stickySubNav = $('.sub-nav-actions');
			var $stickySmallPrice = $('.smallprice');
			var $h1width = $stickyHeader.css('width');
			var $hNavBar = $(".header-navbar");

			$(document).on('scroll', checkScrollPosition);
			$(window).on('resize', debounce(checkForMobile));

			function checkForMobile() {

			    if ($(window).width() < 768) {

			        $($hNavBar).css('position', '');

				    if ($stickyNav.hasClass('is-fixed') === true) {
				        unstickIt();
				    }

				} else {
				    checkScrollPosition();
				}
			}

			function checkScrollPosition() {

			    if ($(window).width() < 768) {
			        //add back main collette site sticky nav
							return;
			    }
			    else {
                    //remove main collette site sticky nav
			        if ($($hNavBar).css('position', 'fixed')) {
			            $($hNavBar).css('position', 'relative');
			        }

							// Highlights Page Position in Sub Nav
							var position = $(this).scrollTop();

							$('.tour-section:visible').each(function() {
								var target = $(this).offset().top;
								var contentTop = $('#tour_detail_highlights').offset().top;
								var id = $(this).attr('id');

								if (position >= target - $stickyHeight - 30) {
									$stickyNavLink.removeClass('active');
									$('#tourdetailsubnav a[href=#' + id + ']').addClass('active');
								}

								if (position < contentTop) {
									$stickyNavLink.removeClass('active');
								}
							});
			    }

				var hasClass = $stickyNav.hasClass('is-fixed');
				if ($stickyNavTop < $(window).scrollTop() && hasClass === false) {
					stickIt();
				} else if ($stickyNavTop >= $(window).scrollTop() && hasClass === true) {
					unstickIt();
				}
			}

			function stickIt() {
				$stickyNavPlaceHolder.css('height', $stickyNav.height());
				$stickyHeader.css('margin', '0 0 10px 0');
				$stickyHeaderSpan.addClass('sticky-h1');
				$stickyPrice.hide();
				$stickySmall.hide();
				$stickyLegal.hide();
				$stickySmallPrice.show();
				$stickySubNav.addClass('sticky-sub-nav-actions');
				$stickyNav.addClass('is-fixed');
				$stickyNav.stop(true,false).animate({'top':'0'}, 500);
			}

			function unstickIt() {
				$stickyNav.removeClass('is-fixed').css('top', '-150px');
				$stickyNavPlaceHolder.css('height', 0);
				$stickyHeader.css('margin', '');
				$stickyHeaderSpan.removeClass('sticky-h1');
				$stickySmall.show();
				$stickyLegal.show();
				$stickyPrice.show();
				$stickySmallPrice.hide();
				$stickyHeader.removeClass('h1-line-height');
				$stickySubNav.removeClass('sticky-sub-nav-actions');
			}

			function debounce(func, wait, immediate) {

				var timeout;
				return function() {
					var context = this, args = arguments;
					var later = function() {
						timeout = null;
						if (!immediate) func.apply(context, args);
					};
					var callNow = immediate && !timeout;
					clearTimeout(timeout);
					timeout = setTimeout(later, wait);
					if (callNow) func.apply(context, args);
				};
			}

			checkScrollPosition();
		};
	});
