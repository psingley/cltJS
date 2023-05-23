var MONTHS = ["January", "February", "March", "April", "May", "June", "July", "August", "September", "October", "November", "December"];

var randomScalingFactor = function () {
	return Math.round(Math.random() * 50 * (Math.random() > 0.5 ? 1 : 1)) + 50;
};
var randomColorFactor = function () {
	return Math.round(Math.random() * 255);
};
var randomColor = function (opacity) {
	return 'rgba(' + randomColorFactor() + ',' + randomColorFactor() + ',' + randomColorFactor() + ',' + (opacity || '.3') + ')';
};
var getColor = function (opacity, r, g, b) {
	return 'rgba(' + r + ',' + g + ',' + b + ',' + (opacity || '.3') + ')';
};

var valuePerVisitConfig = {
	type: 'line',
	data: {
		labels: ["January", "February", "March", "April", "May", "June", "July", "August", "September", "October", "November", "December"],
		datasets: [{
			label: "This Year",
			borderColor: getColor(0.4, '0', '34', '128'),
			backgroundColor: getColor(0.5, '50', '136', '230'),
			pointBorderColor: getColor(0.7, '0', '0', '77'),
			pointBackgroundColor: getColor(0.5, '50', '136', '230'),
			data: [],
			pointBorderWidth: 1
		},
		{
			label: "Last Year",
			data: [],
			borderColor: getColor(0.4, '114', '114', '114'),
			backgroundColor: getColor(0.5, '190', '190', '190'),
			pointBorderColor: getColor(0.7, '63', '63', '63'),
			pointBackgroundColor: getColor(0.5, '190', '190', '190'),
			borderDash: [5, 5],
			pointBorderWidth: 1
		}]
	},
	options: {
		responsive: true,
		title: {
			display: true,
			text: ""
		},
		scales: {
			xAxes: [{
				display: true,
				ticks: {
					userCallback: function (dataLabel, index) {
						return dataLabel;
					}
				}
			}],
			yAxes: [{
				display: true,
				beginAtZero: false
			}]
		}
	}
};

var openCountConfig = {
	type: 'line',
	data: {
		labels: ["January", "February", "March", "April", "May", "June", "July", "August", "September", "October", "November", "December"],
		datasets: [{
			label: "This Year",
			borderColor: getColor(0.4, '172', '68', '0'),
			backgroundColor: getColor(0.5, '223', '119', '9'),
			pointBorderColor: getColor(0.7, '0', '0', '77'),
			pointBackgroundColor: getColor(0.5, '223', '119', '9'),
			data: [],
			pointBorderWidth: 1
		},
		{
			label: "Last Year",
			data: [],
			borderColor: getColor(0.4, '114', '114', '114'),
			backgroundColor: getColor(0.5, '190', '190', '190'),
			pointBorderColor: getColor(0.7, '63', '63', '63'),
			pointBackgroundColor: getColor(0.5, '190', '190', '190'),
			borderDash: [5, 5],
			pointBorderWidth: 1
		}]
	},
	options: {
		responsive: true,
		title: {
			display: true,
			text: ""
		},
		scales: {
			xAxes: [{
				display: true,
				ticks: {
					userCallback: function (dataLabel, index) {
						return dataLabel;
					}
				}
			}],
			yAxes: [{
				display: true,
				beginAtZero: false
			}]
		}
	}
};

var clickCountConfig = {
	type: 'line',
	data: {
		labels: ["January", "February", "March", "April", "May", "June", "July", "August", "September", "October", "November", "December"],
		datasets: [{
			label: "This Year",
			borderColor: getColor(0.4, '51', '68', '0'),
			backgroundColor: getColor(0.5, '153', '170', '0'),
			pointBorderColor: getColor(0.7, '0', '0', '77'),
			pointBackgroundColor: getColor(0.5, '153', '170', '0'),
			data: [],
			pointBorderWidth: 1
		},
		{
			label: "Last Year",
			data: [],
			borderColor: getColor(0.4, '114', '114', '114'),
			backgroundColor: getColor(0.5, '190', '190', '190'),
			pointBorderColor: getColor(0.7, '63', '63', '63'),
			pointBackgroundColor: getColor(0.5, '190', '190', '190'),
			borderDash: [5, 5],
			pointBorderWidth: 1
		}]
	},
	options: {
		responsive: true,
		title: {
			display: true,
			text: ""
		},
		scales: {
			xAxes: [{
				display: true,
				ticks: {
					userCallback: function (dataLabel, index) {
						return dataLabel;
					}
				}
			}],
			yAxes: [{
				display: true,
				beginAtZero: false
			}]
		}
	}
};

var emailCountConfig = {
	type: 'line',
	data: {
		labels: ["January", "February", "March", "April", "May", "June", "July", "August", "September", "October", "November", "December"],
		datasets: [{
			label: "This Year",
			borderColor: getColor(0.4, '141', '0', '0'),
			backgroundColor: getColor(0.5, '217', '60', '28'),
			pointBorderColor: getColor(0.7, '141', '0', '0'),
			pointBackgroundColor: getColor(0.5, '217', '60', '28'),
			data: [],
			pointBorderWidth: 1
		},
		{
			label: "Last Year",
			data: [],
			borderColor: getColor(0.4, '114', '114', '114'),
			backgroundColor: getColor(0.5, '190', '190', '190'),
			pointBorderColor: getColor(0.7, '63', '63', '63'),
			pointBackgroundColor: getColor(0.5, '190', '190', '190'),
			borderDash: [5, 5],
			pointBorderWidth: 1
		}]
	},
	options: {
		responsive: true,
		title: {
			display: true,
			text: ""
		},
		scales: {
			xAxes: [{
				display: true,
				ticks: {
					userCallback: function (dataLabel, index) {
						return dataLabel;
					}
				}
			}],
			yAxes: [{
				display: true,
				beginAtZero: false
			}]
		}
	}
};

var engOverTimeConfig = {
	type: 'line',
	data: {
		labels: ["1", "2", "3", "4", "5", "6", "7", "8", "9", "10", "11", "12", "13", "14", "15", "16", "17", "18", "19", "20", "21", "22", "23", "24"],
		datasets: [
			{
				label: "Clicks",
				borderColor: getColor(0.4, '141', '0', '0'),
				backgroundColor: getColor(0.5, '217', '60', '28'),
				pointBorderColor: getColor(0.7, '141', '0', '0'),
				pointBackgroundColor: getColor(0.5, '217', '60', '28'),
				data: [],
				pointBorderWidth: 1
			},
			{
				label: "Opens",
				borderColor: getColor(0.4, '0', '34', '128'),
				backgroundColor: getColor(0.5, '50', '136', '230'),
				pointBorderColor: getColor(0.7, '0', '0', '77'),
				pointBackgroundColor: getColor(0.5, '50', '136', '230'),
				data: [],
				pointBorderWidth: 1
			}
		]
	},
	options: {
		responsive: true,
		title: {
			display: true,
			text: ""
		},
		scales: {
			xAxes: [{
				display: true,
				ticks: {
					userCallback: function (dataLabel, index) {
						return dataLabel;
					}
				}
			}],
			yAxes: [{
				display: true,
				beginAtZero: false
			}]
		}
	}
};

var velocityConfig = {
	type: 'bar',
	data: {
		labels: ["0", "1", "2", "3", "4", "5", "6", "7", "8", "9", "10"],
		datasets: [
			{
				label: "Velocity",
				borderColor: getColor(0.4, '141', '0', '0'),
				pointBorderColor: getColor(0.7, '141', '0', '0'),
				pointBackgroundColor: getColor(0.5, '217', '60', '28'),
				data: [],
				pointBorderWidth: 1
			}
		]
	},
	options: {
		responsive: true,
		title: {
			display: false,
			text: ""
		},
		scales: {
			xAxes: [{
				display: true,
				ticks: {
					userCallback: function (dataLabel, index) {
						return dataLabel;
					}
				}
			}],
			yAxes: [{
				display: true,
				beginAtZero: false
			}]
		}
	}
};

var burndownConfig = {
	type: 'line',
	data: {
		labels: ["0", "1", "2", "3", "4", "5", "6", "7", "8", "9", "10"],
		datasets: [
			{
				label: "Actual",
				borderColor: getColor(0.4, '141', '0', '0'),
				pointBorderColor: getColor(0.7, '141', '0', '0'),
				pointBackgroundColor: getColor(0.5, '217', '60', '28'),
				data: [],
				pointBorderWidth: 1
			},
			{
				label: "Base Line",
				borderColor: getColor(0.4, '0', '34', '128'),
				pointBorderColor: getColor(0.7, '0', '0', '77'),
				pointBackgroundColor: getColor(0.5, '50', '136', '230'),
				data: [],
				pointBorderWidth: 1
			}
		]
	},
	options: {
		responsive: true,
		title: {
			display: true,
			text: ""
		},
		scales: {
			xAxes: [{
				display: true,
				ticks: {
					userCallback: function (dataLabel, index) {
						return dataLabel;
					}
				}
			}],
			yAxes: [{
				display: true,
				beginAtZero: false
			}]
		}
	}
};

var engByDayConfig = {
	type: 'bar',
	data: {
		labels: ["Sunday", "Monday", "Tuesday", "Wednesday", "Thursday", "Friday", "Saturday"],
		datasets: [
			{
				label: "Clicks",
				borderColor: getColor(0.4, '141', '0', '0'),
				backgroundColor: getColor(0.5, '217', '60', '28'),
				pointBorderColor: getColor(0.7, '141', '0', '0'),
				pointBackgroundColor: getColor(0.5, '217', '60', '28'),
				data: [],
				pointBorderWidth: 1
			},
			{
				label: "Opens",
				borderColor: getColor(0.4, '0', '34', '128'),
				backgroundColor: getColor(0.5, '50', '136', '230'),
				pointBorderColor: getColor(0.7, '0', '0', '77'),
				pointBackgroundColor: getColor(0.5, '50', '136', '230'),
				data: [],
				pointBorderWidth: 1
			}
		]
	},
	options: {
		responsive: true,
		title: {
			display: true,
			text: ""
		},
		scales: {
			xAxes: [{
				display: true,
				ticks: {
					userCallback: function (dataLabel, index) {
						return dataLabel;
					}
				}
			}],
			yAxes: [{
				display: true,
				beginAtZero: false
			}]
		}
	}
};

function getSum(total, num) {
	return total + Math.round(num);
}

function getDayOfYear() {
	var now = new Date();
	var start = new Date(now.getFullYear(), 0, 0);
	var diff = now - start;
	var oneDay = 1000 * 60 * 60 * 24;
	var day = Math.floor(diff / oneDay);
	return day;
}

function setSumChart(canvasId, config) {
	var ctx = document.getElementById(canvasId).getContext("2d");

	canvasId = '#' + canvasId;

	//email count - this year
	var emailThisYear = $(canvasId).parent('.canvasParent').data('thisyear');
	var emailThisYearSum = 0;
	var monthNumber = 1;
	var monthSum = 0;
	for (var i = 0; i < emailThisYear.length; i++) {
		if (monthNumber === emailThisYear[i].month) {
			monthSum += emailThisYear[i].count;
			emailThisYearSum += emailThisYear[i].count;
		} else {
			config.data.datasets[0].data.push(monthSum);
			console.log(canvasId + '- this year: Month - ' + monthNumber + ', Amt - ' + monthSum);

			monthSum = 0;
			monthNumber = emailThisYear[i].month;
		}
	}

	config.data.datasets[0].data.push(monthSum);
	console.log(canvasId + '- this year: Month - ' + monthNumber + ', Amt - ' + monthSum);
	console.log(' ');

	//email count - last year
	var emailLastYear = $(canvasId).parent('.canvasParent').data('lastyear');
	var emailLastYearSum = 0;
	var currentDayNumber = getDayOfYear();
	monthNumber = 1;
	monthSum = 0;
	for (var i = 0; i < emailLastYear.length; i++) {
		if (monthNumber === emailLastYear[i].month) {
			monthSum += emailLastYear[i].count;
		} else {
			config.data.datasets[1].data.push(monthSum);
			console.log(canvasId + '- last year: Month - ' + monthNumber + ', Amt - ' + monthSum);

			monthSum = 0;
			monthNumber = emailLastYear[i].month;
		}

		if (emailLastYear[i].key < currentDayNumber) {
			emailLastYearSum += parseInt(emailLastYear[i].count);
		}
	}

	config.data.datasets[1].data.push(monthSum);
	console.log(canvasId + '- last year: Month - ' + monthNumber + ', Amt - ' + monthSum);

	$(canvasId).parents('.row-fluid').find('.visits.data').html(emailThisYearSum);
	$(canvasId).parents('.row-fluid').find('.comparison.data').html('compared to ' + emailLastYearSum + ' this time last year');

	var percentage = Math.floor((emailThisYearSum / emailLastYearSum) * 100);
	var howWeDoingElement = $(canvasId).parents('.row-fluid').find('.data-label.delta-wrapper');

	if (percentage < 100) {
		var arrowHtml = "<img src='/img/down.png' height=50>";
		var percentageHtml = "<span class='updown'>Behind " + (100 - percentage) + "%</span>";

		howWeDoingElement.html(arrowHtml + percentageHtml);
	}
	else if (percentage > 100) {
		var arrowHtml = "<img src='/img/up.png' height=50>";
		var percentageHtml = "<span class='updown'>Ahead " + (percentage - 100) + "%</span>";

		howWeDoingElement.html(arrowHtml + percentageHtml);
	} else {
		howWeDoingElement.html('no change from last year, ' + percentage + '%');
	}

	var chart = new Chart(ctx, config);
	console.log(' ');
	console.log(' ');
}

function setValueChart(canvasId, config, isAverage) {
	var ctx = document.getElementById(canvasId).getContext("2d");
	canvasId = '#' + canvasId;

	//this year data
	var emailThisYear = $(canvasId).parent('.canvasParent').data('thisyear');
	var currentDayNumber = getDayOfYear();
	var monthNumber = 1;
	var dayStat = 0;
	var toBeChartedStats = null;
	var monthStats = [];
	var thisYearStats = [];
	var lastYearStats = [];
	var thisYearClicksPerOpen = 0;
	var lastYearClicksPerOpen = 0;
	var numberOfDaysThisYear = 0;

	for (var i = 0; i < emailThisYear.length; i++) {

		numberOfDaysThisYear++;
		dayStat = emailThisYear[i].average;
		if (!isAverage) {
			dayStat = dayStat * 100;
		}

		//add to yearly totals
		thisYearStats.push(dayStat);
		if (emailThisYear[i].clicksPerOpen) {
			thisYearClicksPerOpen += emailThisYear[i].clicksPerOpen;
		}

		if (monthNumber === emailThisYear[i].month) {

			//set for this day
			monthStats.push(dayStat);
			console.log(canvasId + '- this year: Month - ' + monthNumber + ', Amt - ' + dayStat + ', ' + emailThisYear[i].actionSum + " / " + emailThisYear[i].recipientSum);
		} else {

			toBeChartedStats = (monthStats.reduce(getSum) / monthStats.length);

			//submit month to chart dataset
			config.data.datasets[0].data.push(toBeChartedStats.toFixed(2));
			console.log(canvasId + '- this year: To Be Charted Month - ' + monthNumber + ', Amt - ' + toBeChartedStats + ', ' + monthStats.reduce(getSum) + ' / ' + monthStats.length);

			//reset monthly counts
			monthStats = [];

			//set for this day
			monthStats.push(dayStat);
			monthNumber = emailThisYear[i].month;
			console.log(' ');
			console.log(canvasId + '- this year: Month - ' + monthNumber + ', Amt - ' + dayStat + ', ' + emailThisYear[i].actionSum + " / " + emailThisYear[i].recipientSum);
		}
	}

	//submit the end of this year data to chart
	toBeChartedStats = (monthStats.reduce(getSum) / monthStats.length);
	config.data.datasets[0].data.push(toBeChartedStats.toFixed(2));
	console.log(canvasId + '- this year: To Be Charted Month - ' + monthNumber + ', Amt - ' + toBeChartedStats + ', ' + monthStats.reduce(getSum) + ' / ' + monthStats.length);
	console.log(' ');

	var emailLastYear = $(canvasId).parent('.canvasParent').data('lastyear');
	var numberOfDayslastYear = 0;
	monthNumber = 1;
	monthStats = [];
	for (var i = 0; i < emailLastYear.length; i++) {

		dayStat = emailLastYear[i].average;
		if (!isAverage) {
			dayStat = dayStat * 100;
		}

		//increment totals only for days up to today
		if (emailLastYear[i].key <= currentDayNumber) {
			lastYearStats.push(dayStat);
			if (emailLastYear[i].clicksPerOpen) {
				lastYearClicksPerOpen += emailLastYear[i].clicksPerOpen;
				numberOfDayslastYear++;
			}
		}

		if (monthNumber === emailLastYear[i].month) {

			//set for this day
			monthStats.push(dayStat);
			console.log(canvasId + '- last year: Month - ' + monthNumber + ', Amt - ' + dayStat + ', ' + emailLastYear[i].actionSum + " / " + emailLastYear[i].recipientSum);
		} else {

			toBeChartedStats = (monthStats.reduce(getSum) / monthStats.length);

			//submit month to chart dataset
			config.data.datasets[1].data.push(toBeChartedStats.toFixed(2));
			console.log(canvasId + '- last year: To Be Charted Month - ' + monthNumber + ', Amt - ' + toBeChartedStats + ', ' + monthStats.reduce(getSum) + ' / ' + monthStats.length);

			//reset monthly counts
			monthStats = [];

			//set for this day
			monthStats.push(dayStat);
			monthNumber = emailLastYear[i].month;
			console.log(' ');
			console.log(canvasId + '- last year: Month - ' + monthNumber + ', Amt - ' + dayStat + ', ' + emailLastYear[i].actionSum + " / " + emailLastYear[i].recipientSum);
		}
	}

	//submit the end of last year data to chart
	toBeChartedStats = (monthStats.reduce(getSum) / monthStats.length);
	config.data.datasets[1].data.push(toBeChartedStats.toFixed(2));
	console.log(canvasId + '- last year: To Be Charted Month - ' + monthNumber + ', Amt - ' + toBeChartedStats + ', ' + monthStats.reduce(getSum) + ' / ' + monthStats.length);

	//left side totals
	var thisYearAverage = parseFloat((thisYearStats.reduce(getSum) / thisYearStats.length).toFixed(2));
	var lastYearAverage = parseFloat((lastYearStats.reduce(getSum) / lastYearStats.length).toFixed(2));

	var sym = '';
	if (!isAverage) {
		sym = '%';
	}

	$(canvasId).parents('.row-fluid').find('.visits.data').html(thisYearAverage + sym);
	$(canvasId).parents('.row-fluid').find('.comparison.data').html('compared to ' + lastYearAverage + sym + ' this time last year');

	if (lastYearClicksPerOpen > 0) {
		var againstOpensThisYear = ((thisYearClicksPerOpen / parseFloat(numberOfDaysThisYear) * 100)).toFixed(2);
		var againstOpensLastYear = ((lastYearClicksPerOpen / parseFloat(numberOfDayslastYear) * 100)).toFixed(2);

		$(canvasId).parents('.row-fluid').find('.visits.opendata').html(againstOpensThisYear + sym);
		$(canvasId).parents('.row-fluid').find('.comparison.opendata').html('compared to opens ' + againstOpensLastYear + sym + ' this time last year');
	}

	var howWeDoingElement = $(canvasId).parents('.row-fluid').find('.data-label.delta-wrapper');

	var arrowHtml;
	var percentageHtml;
	if (thisYearAverage < lastYearAverage) {
		arrowHtml = "<img src='/img/down.png' height=50>";
		percentageHtml = "<span class='updown'>Behind " + (lastYearAverage - thisYearAverage).toFixed(2) + sym + "</span>";

		howWeDoingElement.html(arrowHtml + percentageHtml);
	}
	else if (thisYearAverage > lastYearAverage) {
		arrowHtml = "<img src='/img/up.png' height=50>";
		percentageHtml = "<span class='updown'>Ahead " + (thisYearAverage - lastYearAverage).toFixed(2) + sym + "</span>";

		howWeDoingElement.html(arrowHtml + percentageHtml);
	} else {
		howWeDoingElement.html('no change from last year');
	}

	var chartInfo = { thisYearSum: thisYearClicksPerOpen, lastYearSum: lastYearClicksPerOpen };
	chartTotals[canvasId] = chartInfo;

	var chart = new Chart(ctx, config);
	console.log(' ');
	console.log(' ');
}

function setEngagementByDayChart(canvasId, config) {
	var ctx = document.getElementById(canvasId).getContext("2d");
	canvasId = '#' + canvasId;

	var openData = $(canvasId).parent('.canvasParent').data('opens');
	for (var i = 0; i < openData.length; i++) {
		config.data.datasets[1].data.push(openData[i].value);
	}

	var clickData = $(canvasId).parent('.canvasParent').data('clicks');
	for (var i = 0; i < clickData.length; i++) {
		config.data.datasets[0].data.push(clickData[i].value);
	}

	//var sentData = $(canvasId).parent('.canvasParent').data('sent');
	//for (var i = 0; i < sentData.length; i++) {
	//	config.data.datasets[2].data.push(sentData[i].value);
	//}

	var chart = new Chart(ctx, config);
}

function setEngagementOverTimeChart(canvasId, config) {
	var ctx = document.getElementById(canvasId).getContext("2d");
	canvasId = '#' + canvasId;

	var openData = $(canvasId).parent('.canvasParent').data('opens');
	for (var i = 0; i < openData.length; i++) {
		config.data.datasets[1].data.push(openData[i].value);
	}

	var clickData = $(canvasId).parent('.canvasParent').data('clicks');
	for (var i = 0; i < clickData.length; i++) {
		config.data.datasets[0].data.push(clickData[i].value);
	}

	var chart = new Chart(ctx, config);
}

function setVelocityChart(canvasId, config) {
	var ctx = document.getElementById(canvasId).getContext("2d");
	canvasId = '#' + canvasId;

	config.data.labels = [];

	var velocityData = $(canvasId).parent('.canvasParent').data('velocity');
	for (var i = 0; i < velocityData.length; i++) {
		config.data.labels.push(velocityData[i].key);
		config.data.datasets[0].data.push(velocityData[i].value);
	}

	var chart = new Chart(ctx, config);
}

function setDesktopMobileBreakdown() {
	var desktopSum = $('.desktopMobileBreakdown').data('desktop');
	var mobileSum = $('.desktopMobileBreakdown').data('mobile');

	var totalSum = desktopSum + mobileSum;
	var desktopPercentage = ((desktopSum / totalSum) * 100).toFixed(0);
	var mobilePercentage = ((mobileSum / totalSum) * 100).toFixed(0);

	$('#desktopEngagement').html(desktopPercentage);
	$('#mobileEngagement').html(mobilePercentage);

	var i = 0;
	var dPerc = parseInt(desktopPercentage);
	var progress = function () {
		if (i < dPerc) {
			$('#progressBarEngagement').css('width', i + '%');
			i += 2;
			setTimeout(progress, 5);
		} else {
			$('#progressBarEngagement').css('width', dPerc + '%');
		}
	}

	progress();
}

var chartTotals = {};