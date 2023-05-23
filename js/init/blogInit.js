// Include Desktop Specific JavaScript files here (or inside of your Desktop Controller, or differentiate based off App.mobile === false)
define([
    "app"
],
    function (App) {
        App.module("NewBlog", function () {
            this.startWithParent = false;
            this.addInitializer(function () {
            	var numToShow = $("#newblog_viewmore").data('slice');
            	var sliceIncrement = numToShow;
            	$("#newblog_viewmore").click(function () {
            		$('.newblog').slice(sliceIncrement, sliceIncrement + numToShow).css({ opacity: 0 })
                        .show()
                        .animate({ opacity: 1 }, 500);
            		sliceIncrement = sliceIncrement + numToShow;

            		if (sliceIncrement >= $('.newblog').length) {
            			$("#newblog_viewmore").hide();
                    }
                });
            });
        });
    });