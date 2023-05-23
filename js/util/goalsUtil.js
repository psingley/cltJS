define([
    'app',
    'services/marketingCenterService',
    'util/objectUtil',
	'cookie',
	'util/bingTrackingUtils',
], function (App, marketingCenterService, objectUtil, cookie, BingTrackingUtils) {
	var goalsUtil = {
		//ENGAGEMENT VALUE GOALS
		emailSignup: function(data, callback) {
			this._submitGoal('Email Signup', data, false, callback);
		},
		communicateWithAExpert: function(data, callback) {
			this._submitGoal('Communicate with an Expert', data, true, callback);
		},
		requestOrDownloadBrochure: function (data, callback) {
			this._submitGoal('Request or Download Brochure', data, true, callback);
		},

		//READINESS SCORE GOALS
		bookingEngineSelectDates: function(data, callback) {
			this._submitGoal('Booking Engine Select Dates', data, true, callback);
		},
		bookingEngineAddRooming: function(data, callback) {
			this._submitGoal('Booking Engine Add Rooming', data, true, callback);
		},
		bookingEngineAddCustomizations: function(data, callback) {
			this._submitGoal('Booking Engine Add Customizations', data, true, callback);
		},
		bookingEngineAddFlights: function(data, callback) {
			this._submitGoal('Booking Engine Add Flights', data, true, callback);
		},
		bookingEngineAddTravelerInfo: function(data, callback) {
			this._submitGoal('Booking Engine Add Traveler Info', data, true, callback);
		},
		agentSearch: function(data, callback) {
			this._submitGoal('Agent Search', data, true, callback);
			this.agentSearchPageEvent(data, callback);
		},
		videoCompleted: function(data, callback) {
			this._submitGoal('Video Completed', data, false, callback);
		},
		socialSharing: function(data, callback) {
			this._submitGoal('Social Sharing', data, true, callback);
		},
		searchPage: function(data, callback) {
			this._submitGoal('Has Searched', data, true, callback);
		},

		//PAGE EVENTS
		agentSearchPageEvent: function (data, callback) {
			this._submitGoal('Agent Search Page Event', data, false, callback);
		},
		brochureDownloadPDF: function(data, callback) {
			this._submitGoal('Brochure Download PDF', data, false, callback);
		},
		brochureFormComplete: function(data, callback) {
			this._submitGoal('Brochure Form Complete', data, false, callback);
		},
		brochureViewOnline: function (data, callback) {
			BingTrackingUtils.trackBingView('Brochure', 'View', 'Online', '1');
			this._submitGoal('Brochure View Online', data, false, callback);
		},
		clickOnRecommendedTour: function(data, callback) {
			this._submitGoal('Click on Recommended Tour', data, false, callback);
		},
		contactUsFormComplete: function (data, callback) {
			BingTrackingUtils.trackBingViewJson({ 'ec': 'Contact ', 'ea': 'Click', 'el': 'ContactUs', 'ev': '1' });
			this._submitGoal('Contact Us Form Complete', data, false, callback);
		},
		getInspired: function (data, callback) {
			this._submitGoal('Get Inspired', data, false, callback);
		},
		shareEmail: function(data, callback) {
			this._submitGoal('Share Email', data, false, callback);
		},
		shareFacebook: function(data, callback) {
			this._submitGoal('Share Facebook', data, false, callback);
		},
		sharePinterest: function(data, callback) {
			this._submitGoal('Share Pinterest', data, false, callback);
		},
		sharePrint: function(data, callback) {
			this._submitGoal('Share Print', data, false, callback);
		},
		shareTwitter: function(data, callback) {
			this._submitGoal('Share Twitter', data, false, callback);
		},
		videoStarted: function (data, callback) {
			this._submitGoal('Video Started', data, false, callback);
		},
		searchFilterApplied: function (dataKey, data, callback) {
			this._submitGoal('Search Filter Applied', data, false, callback, null, dataKey);
		},
		tourDetailOptionClicked: function (dataKey, data, callback) {
			this._submitGoal('Tour Detail Option', data, false, callback, null, dataKey);
		},

		//GOAL FUNCTIONS
		_saveConfig: function() {
			var numberOfYears = 10;
			cookie.set(App.siteSettings.siteName + '.analytics', JSON.stringify(App.Goals), { expires: (365 * numberOfYears), path: '/' });
		},
		_loadConfig: function() {
			if (App.Goals) {
				return;
			}

			var goalConfig = cookie.get(App.siteSettings.siteName + '.analytics');

			if (!goalConfig) {
				App.Goals = {};
				return;
			}

			App.Goals = $.parseJSON(goalConfig);
		},
		_submitGoal: function(goal, data, oneTimeOnly, successcallback, errorCallback, dataKey) {
			this._submit(goal, data, oneTimeOnly, successcallback, errorCallback, marketingCenterService.submitGoal, dataKey);
		},
		_submit: function(goal, data, oneTimeOnly, successcallback, errorCallback, service, dataKey) {
			this._loadConfig();

			if (!App.Goals) {
				return;
			}

			var shouldContinue = true;
			if (oneTimeOnly) {
				//if one time only, look in App.Goals and see if it exists
				$.each(App.Goals, function (analyticObject) {
					if (App.Goals[analyticObject].name === goal) {
						shouldContinue = false;

					}
				});
			}

			if (!shouldContinue) {
				return;
			}

			var goalObject = {
				name: goal,
				oneTimeOnly: oneTimeOnly,
				data: data,
				dateAccrued: new Date(),
				url: window.location.href.toString()
			};

			service(goal, dataKey, data, successcallback, errorCallback);

			var key = objectUtil.getObjectLength(App.Goals);
			App.Goals[key] = goalObject;

			this._saveConfig();
		}
	};

	return goalsUtil;
});
