define([
		'jquery',
		'app'
	],
	function($, App) {
		var siteLanguageService = {
			/**
	* Maintains site-language cookie on ajax requests
	*
	* @method checkEmailExists
	* @param email
	* @returns {*}
	*/
			setLanguageCookie: function(site, language) {

				var params = JSON.stringify({ 'site': site, 'language': language });

				//make ajax request
				var result = $.ajax({
					url: "/Services/SiteSettings/SiteSettingsService.asmx/SetLanguageCookie",
					contentType: "application/json; charset=utf-8",
					dataType: "json",
					data: params,
					type: 'POST'
				});

				return result;
			}
		};

		return siteLanguageService;
	});