define([
		'jquery',
		'underscore',
		'App',
		'util/seoTaggingUtil',
		'util/validationUtil',
		'util/objectUtil',		
		'goalsUtil'
], function ($, _, App, SeoTaggingUtil, ValidationUtil, ObjectUtil, goalsUtil) {
	var brochuresOrderFormUtil = {

		trackPdfDownload: function (e) {				
			        var brochureId = $(e.currentTarget).attr('data-id');
			        this.trackBrochureGATag('Download PDF', brochureId);
			        goalsUtil.requestOrDownloadBrochure('Download PDF');
			        goalsUtil.brochureDownloadPDF(brochureId);
		        },

		trackViewBrochure: function (e) {			 
			var brochureId = $(e.currentTarget).attr('data-id');
			this.trackBrochureGATag('View Online', brochureId);			
			goalsUtil.requestOrDownloadBrochure('View Online');
			goalsUtil.brochureViewOnline(brochureId);
		},
		
		trackBrochureGATag: function (eventAction, brochureId) {
			//for google tag manager
			try {
				dataLayer.push({
					'event': 'gaEvent',
					'eventCategory': 'Brochure',
					'eventAction': eventAction,
					'eventLabel': brochureId,
					'eventValue': 1
				});
			} catch (ex) {
				console.log(ex);
			}
		},

		trackBrochuresRequested: function (brochuresRequested) {
			//for google tag manager
			try {
				var $brochuresRequested = brochuresRequested;
				dataLayer.push({
					'event': 'gaEvent',
					'eventCategory': 'Brochure',
					'eventAction': 'Mail Request',
					'eventLabel': 'Brochure(s) Mailed - ' + $("form#brochureRequestForm select[name='state']") + ' - ' + $brochuresRequested
				});
			} catch (ex) {
				console.log(ex);
			}
		}
	};
	return brochuresOrderFormUtil;
});