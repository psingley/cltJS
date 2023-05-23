define([
		'jquery',
		'underscore',
		'App'				
], function ($, _, App) {
	var trackBingUtils = {

		trackBingView: function (ec, ea, el, ev)
		{
			window.uetq = window.uetq || [];
			window.uetq.push({ 'ec': ec, 'ea': ea, 'el':el, 'ev': ev });
		},

		trackBingViewJson: function (json) {
			window.uetq = window.uetq || [];
			window.uetq.push(json);
		}

	}
	return trackBingUtils;
});