define([
		'jquery',
		'underscore',
		'backbone',
		'marionette',
		'extensions/marionette/views/RenderedLayout',
	],

	function($, _, Backbone, Marionette, RenderedLayout) {
		var explorationsSite = RenderedLayout.extend({
			initialize: function() {

				$(function() {
					// Disable carousel videos until fully loaded
					$('#tour_detail_hero').find('.wistia_click_to_play').addClass('notPlayable');
					// Remove border from last hamburger menu item
					$('.sidebar-nav > li > a').last().css({ 'border-bottom': 'none' });
					// Toggle dropdowns in the hamburger menu
					$('.hamburger-drop .dropdown-toggle').on('click', function() {
						$(this).toggleClass('dropdown-open');
					});

					// Replaces small modal close x's with big FontAwesome x's
					var modalXs = [];
					var btnRegex = /<button type="button" class="close" data-dismiss="modal".+<\/button>/gi;
					$("button.close").each(function() {
						if ($(this)[0].outerHTML.match(btnRegex)) {
							modalXs.push($(this));
						}
					});

					modalXs.forEach(function(x) {
						x[0].outerHTML = '<button type="button" class="close" data-dismiss="modal" aria-hidden="true"><i class="fa fa-times fa-2x" aria-hidden="true"></i><span class="sr-only">Close</span></button>';
					});
				});

				var setBlogVideoCss = function (video) {
				    video.bind("play", function () {
				        var containerHeightInt = parseInt($('.wistia_popover_embed').css('height'));
				        video.videoHeight(containerHeightInt);
				        $('.wistia_popover_embed, .wistia_placebo_close_button').css({ 'top': '40px' });
				    });
				    
				}

				// Force short video height to match correct popover height
				var setVideoCss = function(video) {
					if ($(video.container.offsetParent).hasClass('tour-detail-hero--inner')) {
						$('#tour_detail_hero').find('.wistia_click_to_play').removeClass('notPlayable');

						video.bind("play", function() {
							var containerHeightInt = parseInt($('.wistia_popover_embed').css('height'));
							video.videoHeight(containerHeightInt);
							$('.wistia_popover_embed, .wistia_placebo_close_button').css({ 'top': '80px' });
						});
					}
				}
				window._wq = window._wq || [];
				if ($("#blogVideo").length > 0) {
				    _wq.push({
				        id: "_all",
				        onReady: function (video) {
				            setBlogVideoCss(video);
				        }
				    });
				}
				else {
				    _wq.push({
				        id: "_all",
				        onReady: function (video) {
				            setVideoCss(video);
				        },

				    });
				}

				// Globals
				var $windowWidth = $(window).width();
				var $searchBox = $('.form-control.search-box.explor-searchbox');
				var searchOpen = false;
				var searchBoxWidth = 0;
				var hamburgerWidth = 600;

				// Create style tag to force predictive search results width
				var setPredictiveWidth = function(searchBoxWidth) {
					var widthStyle = ".predictive-search-results {max-width:" + searchBoxWidth +"px!important;}"
					if (!$('#predictiveSearchResultsWidth').length) {
						$("<style id=predictiveSearchResultsWidth>")
						.prop("type", "text/css")
						.html(widthStyle)
						.appendTo("head");
					} else if ( $('#predictiveSearchResultsWidth').html() == widthStyle) {
						return;
					} else {
						$('#predictiveSearchResultsWidth').html(".predictive-search-results {max-width:" + searchBoxWidth +"px!important;}");
					}
				}

				// Expanding search bar
				var setSearchBoxWidth = function() {
					if ($windowWidth > 480) {
						searchBoxWidth = 360;
					} else {
						searchBoxWidth = $('.nav-wrapper').outerWidth() - 25;
					}
				}

				var openSearch = function() {
					$('.search-toggle').hide();
					$('.main-search-btn').toggleClass('no-vis');

					setSearchBoxWidth();
					setPredictiveWidth(searchBoxWidth);

					$searchBox.animate({ width: searchBoxWidth, right: '0' }, 200).toggleClass('hidden-search');
					$('.close-search').toggleClass('no-vis');

					searchOpen = true;
				}

				var closeSearch = function() {
					$('.predictive-search-results, .suggestion-loader').hide();
					$searchBox.val('');
					$('.main-search-btn, .close-search').toggleClass('no-vis');

					$searchBox.animate({ width: 0 }, 200, function() {
						$(this).toggleClass('hidden-search');
						$('.search-toggle').show();
					});

					searchOpen = false;
				}

				$('.close-search, .back-to-top').on('click', function() {
					if (searchOpen) {
						closeSearch();
					}
				});

				// Open search box, focus on it if not on mobile
				$('.search-toggle').on('click', function() {
					if (!searchOpen) {
						openSearch();
						if ($windowWidth >= 768) {
							$(this).siblings('.search-box').focus();
						}
					}
				});

				// Hamburger menu reveal
				$(".fa-bars").click(function(e) {
					e.preventDefault();
					if ($windowWidth <= hamburgerWidth) {
						$('.hamburger-container').css('width', $windowWidth);
					}
					$('#sidebar-wrapper').show();
					$('#hamburgerModal').modal('show');
					$("body").toggleClass("hamburger-open");

					if (searchOpen) {
						closeSearch();
					}
				});

				var closeHamburger = function() {
					$('#hamburgerModal').modal('hide');
					$('.collapse').collapse("hide");
					$('.hamburger-drop > a').removeClass('dropdown-open');
					$("body").toggleClass("hamburger-open");
				}

				// Only one dropdown menu open at once
				$('.hamburger-drop').on('click', function() {
					$(this)
						.siblings('.hamburger-drop')
						.children('.collapse.in')
						.collapse('hide')
						.parent()
						.find('a')
						.removeClass('dropdown-open');
				});

				// Close hamburger nav, nav also closes to show modals.
				$('.hamburger-close, #hamburgerModal, .hamburger-contact-btn[data-toggle="modal"]').on('click', function(e) {
					// Without .hide() .sidebar-nav width is not calculated correctly (possibly caused by opening a modal while another is open)
					if ($(e.target).is('.hamburger-contact-btn[data-toggle="modal"], .hamburger-contact-btn[data-toggle="modal"] > i')) {
						$('#sidebar-wrapper').hide();
					}
					closeHamburger();
				});

				// Handle safari mobile body scrolling when modal open
				$('#hamburgerModal').on('touchstart', function(e) {
					e.preventDefault();
					e.stopPropagation();
					closeHamburger();
				});

				// Close hamburger when opening a link from inside of it
				$('.sidebar-nav').find('a').not('.dropdown-toggle').on('click', function() {
					closeHamburger();
				});

				// Listen for resize changes
				window.addEventListener("resize", function() {
					var oldWidth = $windowWidth;
					$windowWidth = $(window).width();

					if (searchOpen && (oldWidth != $windowWidth)) {
						closeSearch();
					}

					if ($('#hamburgerModal').is(':visible') && $windowWidth <= hamburgerWidth) {
						$('.hamburger-container').css('width', $windowWidth);
					} else {
						$('.hamburger-container').css('width', hamburgerWidth.toString() + 'px');
					}
				}, false);

				//Language Selector -- Should be removed and integrated with current language selector functionality
				$('.country-dropdown').on('click', function() {
					$(this)
						.children('.dropdown-menu')
						.toggle()
						.toggleClass('open');

					if (searchOpen) {
						$searchBox.removeClass('predictive-visible');
					}
				});

				// Close language selector dropdown when clicking outside of the element
				$(document).on('click', function(e) {
					e.stopPropagation();

					$('.country-dropdown')
						.find('.dropdown-menu.open')
						.toggle()
						.removeClass('open');

					if (searchOpen) {
						$searchBox.removeClass('predictive-visible');
					}
				});

				var stickyNavReveal = function(stickyNavTrigger) {
					if ($(window).scrollTop() >= stickyNavTrigger && !$('.sticky-nav').hasClass('sticky-open')) {
							$('.sticky-nav').addClass('sticky-open');
							if (searchOpen) {
								closeSearch();
							}
						} else if ($(window).scrollTop() <= stickyNavTrigger && $('.sticky-nav').hasClass('sticky-open')) {
							$('.sticky-nav').removeClass('sticky-open');
							if (searchOpen) {
								closeSearch();
							}
						}
					}

				$(window).scroll(function() {
					var stickyNavTrigger = $('.nav-wrapper').outerHeight();
					stickyNavReveal(stickyNavTrigger);
				});

				// Change searchBox css if predictive results are visible
				$searchBox.on('input propertychange paste', function() {
					if (!$(this).hasClass('predictive-visible')) {
						$(this).addClass('predictive-visible');
					} else if ($(this).val() == '') {
						$(this).removeClass('predictive-visible');
					}
				});

				//Bouncing arrow
				$("#arrow-scroll").click(function() {
					$('html, body').animate({
						scrollTop: ($('.wrapper').first().offset().top) - 35
					}, 500);
				});

				$("#book-now-button-continue").on('click', function () {
					$('#book-now-button').modal('hide');
				});


				if ($('.video-filter').length > 0) {
				    $("main#main").css('background-color', 'white');
				}
			}
		});

		return explorationsSite;
	});