define([
    'jquery',
    'underscore',
    'backbone',
    'app',
    'event.aggregator',
	'models/search/searchOptions/SearchOptionsModel'
], function ($, _, Backbone, App, EventAggregator, SearchOptionsModel) {
	return {
		submitGoal: function (goalName, goalDataKey, goalData, successCallback, errorCallback) {
			var ajaxData = { currentItemId: App.siteSettings.currentItemId || $('body').data('current-item-id') || null, goalName: goalName, goalData: goalData || null, goalDataKey: goalDataKey || null };

			var result = $.ajax({
				type: "POST",
				contentType: "application/json; charset=utf-8",
				dataType: "json",
				data: JSON.stringify(ajaxData),
				url: '/Services/MarketingCenter/AnalyticsService.asmx/SubmitGoal'
			});
			return result;
		},
		submitPageEvent: function (goalName, goalData, goalDataKey, successCallback, errorCallback) {
			var ajaxData = { currentItemId: App.siteSettings.currentItemId || $('body').data('current-item-id') || null, goalName: goalName, goalData: goalData || null, goalDataKey: goalDataKey || null };

			var result = $.ajax({
				type: "POST",
				contentType: "application/json; charset=utf-8",
				dataType: "json",
				data: JSON.stringify(ajaxData),
				url: '/Services/MarketingCenter/AnalyticsService.asmx/SubmitPageEvent'
			});
			return result;
		},
		unsubscribe: function (emailAddress, automationStateId, messageId, contactId) {
		    var ajaxData = { emailAddress: emailAddress, automationStateId: automationStateId, messageId: messageId, contactId: contactId };
		    var result = $.ajax({
		        type: "POST",
		        contentType: "application/json; charset=utf-8",
		        dataType: "json",
		        data: JSON.stringify(ajaxData),
		        url: "/Services/MarketingCenter/AnalyticsService.asmx/EmailUnsubscribe"
		    })
        	.complete(function (data) {
        	    EventAggregator.trigger('emailUnsubscribe.done', data.responseJSON.d);

        	    if (data.responseJSON.d) {
        	        EventAggregator.trigger('questionnaire.submit');
        	    }
        	});
		    return result;
		},
		getQueryParams: function (queryString) {
		    var ajaxData = { queryString: queryString };
		    var result = $.ajax({
		        type: "POST",
		        contentType: "application/json; charset=utf-8",
		        dataType: "json",
		        data: JSON.stringify(ajaxData),
		        url: "/Services/MarketingCenter/AnalyticsService.asmx/GetQueryParams"
		    })
		    .complete(function(data) {
		        EventAggregator.trigger('getQueryParams.done', data.responseJSON.d );
		    });
		    return result;
		},
		questionnaire: function (questionId) {
			var ajaxData = { questionId: questionId };

			var result = $.ajax({
				type: "POST",
				contentType: "application/json; charset=utf-8",
				dataType: "json",
				data: JSON.stringify(ajaxData),
				url: "/Services/MarketingCenter/AnalyticsService.asmx/Questionnaire"
			});
			return result;
		},
		upvote: function (currentItemId, datasourceId) {
			var ajaxData = { currentItemId: currentItemId, datasourceId: datasourceId };

			var result = $.ajax({
				type: "POST",
				contentType: "application/json; charset=utf-8",
				dataType: "json",
				data: JSON.stringify(ajaxData),
				url: '/Services/MarketingCenter/AnalyticsService.asmx/UpVote'
			});
			return result;
		},
		feedback: function (feedback, rating) {
			var ajaxData = { feedback: feedback, rating: rating, siteName: App.siteSettings.siteName, currentItemId: App.siteSettings.currentItemId };

			var result = $.ajax({
				type: "POST",
				contentType: "application/json; charset=utf-8",
				dataType: "json",
				data: JSON.stringify(ajaxData),
				url: '/Services/MarketingCenter/AnalyticsService.asmx/Feedback'
			}).complete(function (data) {
				EventAggregator.trigger('feedback.complete', data.responseJSON.d);
			});
			return result;
		},
		predictiveSearch: function(term, resultId, resultUrl){

			var ajaxData = {
				term: term,
				resultId: resultId == undefined ? "" : resultId,
				resultUrl: resultUrl == undefined ? "" : resultUrl,
				currentItemId: App.siteSettings.currentItemId
			};

			var result = $.ajax({
				type: "POST",
				contentType: "application/json; charset=utf-8",
				dataType: "json",
				data: JSON.stringify(ajaxData),
				url: '/Services/MarketingCenter/AnalyticsService.asmx/PredictiveSearch',
				error: function (errorResponse) {
					console.log("Inside Failure");
					console.log(errorResponse.responseText);
				}
			});
			return result;
		},
		tourSearch: function (searchOptions, numberOfResults) {
			searchOptions.set("totalNumberOfResults",numberOfResults);
			var searchOptionsJson = JSON.stringify(searchOptions);

			var result = $.ajax({
				type: "POST",
				contentType: "application/json; charset=utf-8",
				dataType: "json",
				data: JSON.stringify({ searchOptionsJson: searchOptionsJson }),
				url: '/Services/MarketingCenter/AnalyticsService.asmx/TourSearch',
				error: function (errorResponse) {
					console.log("Inside Failure");
					console.log(errorResponse.responseText);
				}
			});
			return result;
		}
	};
});