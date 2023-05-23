define(['domReady', 'jquery'], function (domReady, $) {
	 var Collette = {};
	Collette.Promotions = {};

	//number of visible promotions to show when the page is loaded
	Collette.Promotions.NumberOfHiddenPromotionsToAdd = 1;

	//number of visible promotions to show when the page is loaded
	Collette.Promotions.NumberOfVisiblePromotions = 0;

	//the amount of times the current user has clicked the view more button
	Collette.Promotions.ViewMoreClickCount = 0;

	//how many promotions to add when clicking the view more button
	Collette.Promotions.ViewMoreAllowableClicks = 0;

	//hides the view more button, shows the continue to search button
	Collette.Promotions.HideViewMoreButton = function () {
		$('.tourListingViewMore').addClass('hide');
		$('.tourListingContinueToSearch').removeClass('hide');
	};

	//initialize the component
	Collette.Promotions.Initialize = function () {

		//set number of visible promotions
		var numberVisiblePromotions = $('.tourListingViewMore').data('visiblepromotions');
		if (parseInt(numberVisiblePromotions) > 0) {
			Collette.Promotions.NumberOfVisiblePromotions = parseInt(numberVisiblePromotions);
		}

		//set allowable clicks
		var allowableClicks = $('.tourListingViewMore').data('allowableclicks');
		if (parseInt(allowableClicks) > 0) {
			Collette.Promotions.ViewMoreAllowableClicks = parseInt(allowableClicks);
		}

		//set number of hidden promotions to show on a view more click
		var promotionsToAdd = $('.tourListingViewMore').data('promotionstoadd');
		if (parseInt(promotionsToAdd) > 0) {
			Collette.Promotions.NumberOfHiddenPromotionsToAdd = parseInt(promotionsToAdd);
		}

		//set click event
		$('.tourListingViewMore').click(function (event) {
			Collette.Promotions.OnClick(event);
		});
	};

	//get all promotions
	Collette.Promotions.GetPromotions = function () {
		return $('ul.tours li');
	};

	//get only visible promotions
	Collette.Promotions.GetVisiblePromotions = function () {
		var promotions = Collette.Promotions.GetPromotions();

		if (promotions == null || promotions.length == 0) {
			return null;
		}

		var visiblePromotions = new Array();
		var i;
		for (i = 0; i < promotions.length; ++i) {
			if (promotions[i] == null) {
				continue;
			}

			if ($(promotions[i]).hasClass('hide')) {
				continue;
			}

			visiblePromotions[i] = promotions[i];
		}

		return visiblePromotions;
	};

	//get only hidden promotions
	Collette.Promotions.GetHiddenPromotions = function () {
		var promotions = Collette.Promotions.GetPromotions();

		if (promotions == null || promotions.length == 0) {
			return null;
		}

		var hiddenPromotions = new Array();
		var i;
		for (i = 0; i < promotions.length; ++i) {
			if (promotions[i] == null) {
				continue;
			}

			if (!$(promotions[i]).hasClass('hide')) {
				continue;
			}

			hiddenPromotions[i] = promotions[i];
		}

		return hiddenPromotions;
	};

	//set view more click event
	Collette.Promotions.OnClick = function (event) {

		event.preventDefault();

		//incremement the click count
		Collette.Promotions.ViewMoreClickCount++;

		if (Collette.Promotions.ViewMoreClickCount == Collette.Promotions.ViewMoreAllowableClicks) {
			//hide view more button, show continue to search button
			Collette.Promotions.HideViewMoreButton();
		}

		//retieve and verify hidden promotions
		var hiddenPromotions = Collette.Promotions.GetHiddenPromotions();
		if (hiddenPromotions == null || hiddenPromotions.length == 0) {
			Collette.Promotions.HideViewMoreButton();
			return false;
		}

		var i;
		for (i = 0; i < hiddenPromotions.length; ++i) {
			if (hiddenPromotions[i] == null) {
				continue;
			}

			//if we have reached the limit, break loop
			if (i == Collette.Promotions.NumberOfHiddenPromotionsToAdd) {
				break;
			}

			$(hiddenPromotions[i]).removeClass('hide');
		}

		return false;
	};

    //wrap a block of text in the domReady object so
    //that is gets called after the dom has loaded.
    domReady(function () {
        //abort if not on the home page
        if ($('.tour_list ul.tours').length == 0) {
            return;
        }

        //verify we have promotions on the page
        var promotions = Collette.Promotions.GetPromotions();
        if (promotions == null || promotions.length == 0) {
            console.log('No promotions found');
            return;
        }
	    
        //if the amount of promotions
        Collette.Promotions.Initialize();

        if (promotions.length <= Collette.Promotions.NumberOfVisiblePromotions) {
            //there are no promotions to hide, show the 'continue to search' button
            Collette.Promotions.HideViewMoreButton();
        } else {
            //hide any promotions that have an index >= to "NumberOfVisiblePromotions"
            var i;
            for (i = 0; i < promotions.length; ++i) {
                if (promotions[i] == null) {
                    continue;
                }

                if (i >= Collette.Promotions.NumberOfVisiblePromotions) {
                    $(promotions[i]).toggleClass('hide');
                }
            }
        }
    });

	return Collette.Promotions;
});
