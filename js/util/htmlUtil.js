define([
    'jquery',
    'app'
], function ($, App) {
	var htmlUtil = {
		htmlEncode: function (value) {
			//create a in-memory div, set it's inner text(which jQuery automatically encodes)
			//then grab the encoded contents back out.  The div never exists on the page.
			return $('<div/>').text(value).html();
		},
		htmlDecode: function (value) {
			return $('<div/>').html(value).text();
		},
		scrollTo: function (anchor, offset, speed) {
			var target = $(anchor);
			target = target.length ? target : $('[name=' + el.hash.slice(1) + ']');
			if (target.length) {
				$('html,body').animate({
					scrollTop: target.offset().top - offset,
					easing:'easein'
				}, speed);
			}
		}
	};
	return htmlUtil;
});