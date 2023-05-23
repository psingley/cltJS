define([
		'jquery',
		'app'
], function ($,App) {
	var suggestionsService = {
		getSuggestions: function(input) {
			//fetch the results
			var data = { term: input.term, datasourceId: input.datasourceId, site: App.siteSettings.siteName, language: App.siteSettings.language };
			var result = $.ajax({
				type: "POST",
				contentType: "application/json; charset=utf-8",
				url: '/Services/Search/SuggestionsService.asmx/GetSuggestions',
				dataType: "json",
				data: JSON.stringify(data),
				error: function(errorResponse) {
					console.log("Inside Failure");
					console.log(errorResponse.responseText);
				}
			});
			return result;
		}
	}
	return suggestionsService;
});