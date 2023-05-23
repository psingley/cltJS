/**
 * Created by ssinno on 11/21/13.
 */

define([
    'jquery',
    'underscore',
    'app',
    'moment'
], function ($, _, App, moment) {
    var dateUtil = {
        populateDropDown: function ($daySelect, $monthSelect, $yearSelect) {
            var currentDate = new Date();
            var numOfDays = 31;
            var numOfYearsBack = 150;
            var numOfMonths = 12;

            if ($daySelect.length > 0) {
                for (var i = 1; i <= numOfDays; i++) {
                    $daySelect.append('<option>' + i + '</option>');
                }
            }

            if ($yearSelect.length > 0) {
                for (var i = 0; i <= numOfYearsBack; i++) {
                    var currentYear = currentDate.getFullYear();
                    var year = currentYear - i;

                    $yearSelect.append('<option>' + year + '</option>');
                }
            }

            if ($monthSelect.length > 0) {
                for (var i = 1; i <= numOfMonths; i++) {
                    $monthSelect.append('<option>' + i + '</option>');
                }
            }
        },
        getDateTime: function (date, hour, AMPM) {
            var hours = Number(hour);
            if (AMPM == "PM" && hours < 12) {
                hours = hours + 12;
            } else if (AMPM == "AM" && hours == 12) {
                hours = hours - 12;
            }

            var dateObject = new moment(date);
            dateObject.set('hour', hours);
            dateObject.set('minute', 0);
            dateObject.set('seconds', 0);

            return dateObject;
        },
        getHoursAMPM: function (date) {
            date = this.getMomentDateType(date);

            var hours = date.hours();
            if (hours > 12) {
                hours = hours - 12;
            }else if (hours === 0) {
	            return 11;
            }

            return hours;
        },
        getAMOrPM: function (date) {
           date = this.getMomentDateType(date);
           date.hours();
	        date.local();
	        var hours = date.hours();
            if (hours > 11) {
                return 'PM';
            } else {
                return 'AM';
            }
        },
        getMomentDateType: function (dateZone) {
            if (moment.prototype.isPrototypeOf(dateZone)) {
                return dateZone;
            } else {
            	var date = moment.parseZone(dateZone);
                return moment(date);
            }
        },
        getYYYYMMDD: function(date) {
            var yyyy = date.getFullYear().toString();
            var mm = (date.getMonth() + 1).toString();
            var dd = date.getDate().toString();

            return yyyy + (mm[1] ? mm : "0" + mm[0]) + (dd[1] ? dd : "0" + dd[0]);
        },

		getMMDDYYYY: function (date) {
			var yyyy = date.getFullYear().toString();
			var mm = (date.getMonth() + 1).toString();
			var dd = date.getDate().toString();

			return (mm[1] ? mm : "0" + mm[0]) + (dd[1] ? dd : "0" + dd[0]) + yyyy;
		},

        getMonthName: function(dateStr){
            var date = this.getMomentDateType(dateStr);
            return date.format('MMMM');
        },
        validToday: function(startDate, endDate){
            return moment().isBetween(moment(startDate), moment(endDate), 'day') || moment().isSame(startDate, 'day') || moment().isSame(endDate, 'day');
        },
        validNow: function(startDate, endDate){
            return moment().isBetween(moment(startDate), moment(endDate)) || moment().isSame(startDate) || moment().isSame(endDate);
        }
    };
    return dateUtil;
});