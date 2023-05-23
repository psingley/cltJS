define([
    'jquery',
    'underscore',
    'backbone',
    'jRespond'
], function ($, _, Backbone, jRespond) {
    var responsiveUtil = (function () {
        //private static variables go here
        var mobileShown = false;
        //constructor
        var constructor = function () {
            //private variables
            var $nav = $(".mobile_nav");
            var $navToggle = $(".nav_toggle");
            var $flyout = $(".dropdown_menu.flyout");
            var $flyoutmenu = $(".flyout_menu");

            var resetTourPageOnDesktop = function () {
                $('.sub_sections .container').each(function ()
                {
                    var container = $(this);
                    if (container.attr('shownondesktop') !== undefined && container.attr('shownondesktop') == 'true') {

                        var subSection = container.find('div.section');
                        subSection.show();
                    }
                });
            }

            var handleFlyoutDesktop = function () {
                $(".nav ul > li").not(".nav ul > li:first-child").removeClass("open").removeClass("focused");
                $(".dropdown").unbind("click");
                /*
				$flyoutmenu.hover(function(){
					var ddW = $(this).find(".subregions").width(),
						flyoutWidth = 220,
						newW = ddW + flyoutWidth;
					//$(".dropdown_menu.flyout").stop().animate({width:newW+20}, 250);
					$flyout.width(newW);
					
					if ($(this).hasClass("open")) {
						$(this).removeClass("open");
					} else {
						$(this).addClass("open");
					}
				}, function(){
					$flyout.width("auto");
				})
				
                $(".nav ul > li").not($flyoutmenu).hover(function () {
                    $(this).addClass("open");
                }, function () {
                    $(this).removeClass("open");
                });*/
            }

            var formatFeatureSorting = function () {
                // detach li's first then apply styles to li's that
                // are left to avoid styling the li's that are moved
                var strayOptions = $("#sidebar .block.arrow").slice(1, 5).detach();
                $("#sidebar .block .content").css("display", "block");
                $("#sidebar .block .header").css("display", "none");
                $("#sidebar .features .option_list").addClass("clearfix");
                // build the new sorting list
                var more = $("<div>", { "class": "more-header mobile", "html": "<span>More Filtering Options</span>" }),
                    content = $("<div>", { "class": "content-more" }).append(strayOptions),
                    wrap = $("<div>", { "class": "search_options block arrow" }).append(more).append(content);

                $("#sidebar").append(wrap);
                $("#sidebar .block .content").addClass("clearfix");

                // handler for "More filtering options" button
                $(".more-header").on("click", function () {
                    $(".content-more").slideToggle();
                    $(".more-header").toggleClass("open");
                });
            };

            var unformatFeatureSorting = function () {
                var strayOptions = $("#sidebar .content-more .block.arrow").slice(0, 4).detach();
                $("#sidebar .block .content").css("display", "none");
                $("#sidebar .block .content:first-child").css("display", "block");
                $("#sidebar .block .header").css("display", "block");
                $(".search_options").remove();

                $("#sidebar .block:nth-child(2)").after(strayOptions);
            };

            var handleAccordion = function () {
                $(".sub_section a:first-child, .sub_section a.mobile").on("click", function (e) {
                    e.preventDefault();
                    $(this).toggleClass("open");
                    $(this).next(".content").slideToggle();
                });
                $(".tour_details .sub_sections li a:first-child").on("click", function (e) {
                    e.preventDefault();
                    $(this).next("div").slideToggle();
                });
            };

            var unhandleAccordion = function () {
                $(".sub_section a:first-child, .sub_section a.mobile").unbind("click");
            };


            var activateMobileSidebar = function () {
                if (!$(".search_results").length) {
                    if ($("#sidebar .nav").length) {
                        //var selectedText = $("#sidebar .selected a").text(),
                        var icon = $("<span>", { "class": "subnav_toggle", "html": "toggle" }),
	                        currentPage;

                        if ($("#main").hasClass("guided_travel")) {
                            currentPage = "Guided Travel";
                        } else if ($("#main").hasClass("about")) {
                            currentPage = "About Collette";
                        } else if ($("#main").hasClass("contact")) {
                            currentPage = "Contact Collette";
                        }

                        var wrapped = $("<div>", { "class": "current_page_wrapper" }).append(currentPage).append(icon);
                        //var selectedWrap = $("<header>", {"class":"current_page"}).append(selectedText).append(icon);
                        var selectedWrap = $("<header>", { "class": "current_page" }).append(wrapped);

                        $("#sidebar").prepend(selectedWrap);

                        $(".current_page").on("click", function () {
                            $(this).next("ul").slideToggle();
                            $(this).toggleClass("open");
                        });
                    }
                }
            };

            var resetMobileNav = function () {
                var $nav = $(".mobile_nav");
                $nav.slideUp(0);

                $nav.removeClass("isOpen");
            };

            var resetMobileSubnav = function () {
                $(".current_page").remove();
            }

            var handleMobileNav = function () {
	            $navToggle.on("click", function(e) {
		            $(".dropdown").parents("li").removeClass("open").removeClass("focused");
		            e.preventDefault();
		            $nav.slideToggle();
	            });


                $flyout.unbind("mouseleave");
                $flyoutmenu.unbind("hover");

	            $(".dropdown").not("#header .nav li:first-child .dropdown").on("click", function() {
		            $nav.slideUp();
		            if ($(this).parents("li").hasClass("focused")) {
			            $(this).parents("li").toggleClass("open").toggleClass("focused");
		            } else {
			            $(".nav ul > li").removeClass("open").removeClass("focused");
			            $(this).parents("li").addClass("open focused");
		            }
	            });

	            /*  // Disable until subregions is active 

                $(".flyout_menu a:first-child").on("click", function(e){
                    e.preventDefault();
                    $(this).next(".subregions").slideToggle();
                });
                */
            };

            var $sidenav = $("#sidebar ul"),
                $sidebarToggle = $(".sidebar_toggle");

            $sidebarToggle.on("click", function (e) {
                e.preventDefault();
                $sidenav.slideToggle();
            });

            var unhandleViewportMeta = function () {
                $("#viewport").remove()
            }

            var handleViewportMeta = function () {
                var viewPortTag = document.createElement('meta');
                viewPortTag.id = "viewport";
                viewPortTag.name = "viewport";
                viewPortTag.content = "width=1024,user-scalable=no";
                document.getElementsByTagName('head')[0].appendChild(viewPortTag);
            }


            $(".add_a_feature h5").on("click", function () {
                $(".add_a_feature .features").slideToggle();
                $(".add_a_feature h5").toggleClass("open");
            });


            //public for this instance only
            this.setViewPorts = function () {
                var jRes = jRespond([
                    {
                        label: 'mobile',
                        enter: 0,
                        exit: 767
                    }, {
                        label: 'desktop',
                        enter: 768,
                        exit: 100000
                    }

                ]);
                jRes.addFunc({
                   
                    breakpoint: 'mobile',
                    enter: function () {
                        mobileShown= true;
                        handleMobileNav();
                        if ($(".search_results").length) {
                            formatFeatureSorting();
                        }
                        handleAccordion();
                        activateMobileSidebar();
                        unhandleViewportMeta();
                    },
                    exit: function () {
                        $navToggle.unbind("click");
                        resetMobileNav();
                        unformatFeatureSorting();
                        unhandleAccordion();
                    }
                });
                jRes.addFunc({
                    breakpoint: 'desktop',
                    enter: function () {
                        resetMobileSubnav();
                        handleFlyoutDesktop();
                        //handleViewportMeta();
                        //if mobile version has been shown at least once
                        if (mobileShown == true) {
                            resetTourPageOnDesktop();
                        }
                    },
                    exit: function () {
                    }
                });
            }

            this.setScreenSizeCookie = function () {
                document.cookie = 'maxScreenSize=' + Math.max(screen.width, screen.height) + '; expires=0; path=/';
            }
        };
        return constructor;
    })();

    return responsiveUtil;
});