define([
    'jquery',
    'underscore',
    'backbone',
    'app',
    'moment',
    'text!templates/booking/stepTemplate.html',
    'util/objectUtil',
    'util/DateUtil',
    'util/uriUtil',
    'views/validation/ErrorView',
    'event.aggregator',
    'services/bookingService',
    'cookie'
], function ($, _, Backbone, App, Moment, stepTemplate, ObjectUtil, DateUtil, UriUtil, ErrorView, EventAggregator, BookingService, cookie) {
    var bookingUtil = {
        renderStepButtons: function () {
            var $steps = $('.step');
            var numberOfSteps = $steps.length;

            var $stepButtons = $('.stepButton');
            var $stepMessagesRegions = $('.stepMessagesRegion');

            $stepButtons.remove();
            $stepMessagesRegions.remove();

            _.each($steps, function (step) {
                var $step = $(step);
                var number = $step.data('step');
                var continueButton = $step.data('continuebutton');
                if (ObjectUtil.isNullOrEmpty(continueButton)) {
                    continueButton = App.dictionary.get('tourRelated.Booking.ContinueToStep') + ' ' + number;
                }

                //as long as it is not the last step then we can add it
                if (numberOfSteps != number) {
                    var $lastSubSection = $step.find('.section:visible').not(".section .section").last();

                    if (!$lastSubSection.hasClass('booking_engine_head')) {
                        //get the data for the view
                        var nextStep = parseInt(number) + 1;
                        var stepData = { nextStep: nextStep, continueToText: continueButton };

                        var template = Backbone.Marionette.TemplateCache.get(stepTemplate);
                        var nextStepNumber = Backbone.Marionette.Renderer.render(template, stepData);
                        $lastSubSection.append(nextStepNumber);
                    }
                }
            });
        },
        adjustStepPrice: function ($step, prices) {
            var total = 0;
            _.each(prices, function (price) {

                total += parseFloat(price);
            });

            var stepNum = $step.data('step');
            var navStep = $('#step_navigation > li[data-step="' + stepNum + '"]');
            var $currencySelector = navStep.find('.currency');
            if ($currencySelector.length == 0) {
                navStep.find('a').append('<span class="currency"></span>');
            }

            navStep.find('.currency').text(total.toFixed(2).toString().formatPrice() + ' ' + App.siteSettings.currencyCode);
            return total;
        },
        adjustGrandTotal: function () {
            var total = this.getGrandTotal();
            var grandTotalSelector = $('#grandTotal');

            grandTotalSelector.text(total.toFixed(2).toString().formatPrice() + ' ' + App.siteSettings.currencyCode);
        },
        getGrandTotal: function () {
            var total = 0;
            _.each(App.Booking.Steps, function (step) {
                total += step.stepPrice;
            });

            return total;
        },
        getStepNumber: function (e) {
            var $target;
            if (e.target) {
                $target = $(e.target);
            } else {
                $target = $(e);
            }

            var $currentStep = $target.closest('.step');
            var stepNumber = parseInt($currentStep.data('step'));
            return stepNumber;
        },
        goToNextStep: function (e) {
            var $target;
            if (e.target) {
                $target = $(e.target);
            } else {
                $target = $(e);
            }

            UriUtil.setHash($target.attr('href'));
        },
        adjustBookingOverview: function (booking) {
            //update values in sidebar
            var $tourDuration = $('#tourDuration');
            $tourDuration.text(booking.numberOfItineraryDays + ' ' + App.dictionary.get('common.Calendar.Days'));
            var $startDate = $('#startDate');
            var startDate = booking.startDate;
            $startDate.text(startDate);
            var $endDate = $('#endDate');
            var endDate = booking.endDate;
            $endDate.text(endDate);

            if (booking.startDate !== booking.departureDate) {
                var $departureDate = $('#departureDate');
                $departureDate.text(booking.departureDate);
                App.Booking.hasDifferentStartAndDepartureDate = true;
            }

            if (booking.endDate !== booking.arrivalDate) {
                var $arrivalDate = $('#arrivalDate');
                $arrivalDate.text(booking.arrivalDate);
                App.Booking.hasDifferentEndAndArrivalDate = true;
            }

            var $totalDuration = $('#totalDuration');
            var totalDuration = booking.totalNumberOfItineraryDays + ' ' + App.dictionary.get('common.Calendar.Days');
            $totalDuration.text(totalDuration);
        },
        adjustBookingOverviewOffsetInfo: function (showFlag) {
            if (showFlag && App.Booking.tourDateOffset > 0 && App.Booking.hasDifferentStartAndDepartureDate) {
                $('#totalDuration').show();
                $('#totalDurationText').show();
                $('#departureDate').show();
                $('#departureDateText').show();
            } else {
                $('#totalDuration').hide();
                $('#totalDurationText').hide();
                $('#departureDate').hide();
                $('#departureDateText').hide();
            }

            if (showFlag && App.Booking.tourDateReturnOffset > 0 && App.Booking.hasDifferentEndAndArrivalDate) {
                $('#totalDuration').show();
                $('#totalDurationText').show();
                $('#arrivalDate').show();
                $('#arrivalDateText').show();
            } else {
                $('#totalDuration').hide();
                $('#totalDurationText').hide();
                $('#arrivalDate').hide();
                $('#arrivalDateText').hide();
            }
        },
        adjustBookingOverviewOnSelect: function (dateRow) {
            //Update values in sidebar whenever a new date is selected
            var startDate = DateUtil.getMomentDateType(dateRow.attr('startDate'));
            var endDate = DateUtil.getMomentDateType(dateRow.attr('endDate'));
            var startDateText = startDate.format('ll');
            var endDateText = endDate.format('ll');

            var difference = endDate.diff(startDate, "days") + 1;
            var duration;
            if (difference == 1) {
                duration = difference + " " + App.dictionary.get("common.Calendar.Day");
            }
            else {
                duration = difference + " " + App.dictionary.get("common.Calendar.Days");
            }

            var $tourDuration = $('#tourDuration');
            $tourDuration.text(duration);
            var $startDate = $('#startDate');
            $startDate.text(startDateText);
            var $endDate = $('#endDate');
            $endDate.text(endDateText);
        },
        validateStep: function (number) {
            var $stepNavListElement = $('#step_navigation');
            var $currentStep = $stepNavListElement.find('.selected').find('a');
            console.log($currentStep);
            if (ObjectUtil.isNullOrEmpty(number)) {
                console.log('no step number passed in, lets move to the next step');
                number = parseInt($currentStep.parent().data('step')) + 1;
            }

            var $stepToValidate = $stepNavListElement.find('li[data-step="' + number + '"]').find('a');
            var currentStepNumber = $currentStep.data('step');

            //if we are going backwards
            if (parseInt(currentStepNumber) > number) {
                return true;
            }

            //if there is no step currently selected return false
            if ($currentStep.length === 0) {
                return false;
            } else {
                var currentStepSectionId = $stepToValidate.data('sectionid');

                var sections = App.Booking.stepValidator.sections;
                for (var section in sections) {
                    var sectionId = sections[section].id;
                    if (sectionId === currentStepSectionId) {
                        return sections[section].validateStep();
                    }
                }

                console.log('there is no validation set up for this step');
                return false;
            }
        },
        setSummaryFields: function (summaryFields, localCommission) {
            if (!ObjectUtil.isNullOrEmpty(summaryFields)) {
                var $depositDate = $('#depositDate');
                var $depositAmount = $('#depositAmount');
                var $finalPaymentDue = $('#finalPaymentDue');
                var $todaysDeposit = $('#todaysDeposit');
                var $commision = $('#commission');

                if (!ObjectUtil.isNullOrEmpty(summaryFields.formattedDepositDate)) {
                    $depositDate.text(summaryFields.formattedDepositDate);
                } else {
                    console.log('deposit date was null');
                }

                if (!ObjectUtil.isNullOrEmpty(summaryFields.depositAmount)) {
                    var todaysDeposit = summaryFields.depositAmount.toFixed(2);
                    $depositAmount.text(todaysDeposit.toString().formatPrice());
                    $todaysDeposit.text(todaysDeposit.toString().formatPrice() + ' ' + App.siteSettings.currencyCode);
                } else {
                    console.log('deposit amount was null');
                }

                if (!ObjectUtil.isNullOrEmpty(summaryFields.formattedFinalPaymentDate)) {
                    $finalPaymentDue.text(summaryFields.formattedFinalPaymentDate);
                } else {
                    console.log('final payment due was null');
                }

                //show or hide savings text based on offer type and site
                if (!ObjectUtil.isNullOrEmpty(App.Booking.aaaDiscount) && App.isAAASite) {
                    var $discount = $("#savings");
                    var $savingsText = $("#aaaSavingsText");

                    if (!_.isEmpty($discount)) {
                        $discount.show();
                    }

                    if (!_.isEmpty($savingsText)) {
                        $savingsText.show();
                    }
                } else {
                    var $discount = $("#savings");
                    var $savingsText = $("#aaaSavingsText");

                    if (!_.isEmpty($discount)) {
                        $discount.hide();
                    }

                    if (!_.isEmpty($savingsText)) {
                        $savingsText.hide();
                    }
                }
                if (!ObjectUtil.isNullOrEmpty($commision)) {
                    var commisionText = $commision.text();
                    if (commisionText.indexOf('USD') < 0)
                        $commision.text(commisionText + ' ' + App.siteSettings.currencyCode);
                }
            }
        },
        setSummaryTotal: function () {
            if (!ObjectUtil.isNullOrEmpty(App.Booking.cartDetailItems) && App.Booking.cartDetailItems.length > 0) {
                var total = 0;
                var totals = App.Booking.cartDetailItems.pluck('total');
                _.each(totals, function (itemTotal) {
                    total += itemTotal;
                });

                var $summaryTotal = $('#summaryTotal');

                total = total.toFixed(2);
                total = (total).toString().formatPrice();
                if ($summaryTotal.length > 0) {
                    $summaryTotal.text(total);
                }
            }
        },
        setCommissionTotal: function () {
            //only for agents
            var $summaryTotalCommission = $('#summaryTotalCommission');
            var $commission = $('#commission');

            if ($summaryTotalCommission.length > 0 || $commission.length > 0) {
                var totalCommission = 0;
                var totals = App.Booking.cartDetailItems.pluck('totalCommission');
                _.each(totals, function (itemTotal) {
                    totalCommission += itemTotal;
                });

                //lets round it
                totalCommission = totalCommission.toFixed(2);
                totalCommission = (totalCommission).toString().formatPrice();
                if ($summaryTotalCommission.length > 0) {
                    $summaryTotalCommission.text(totalCommission);
                }

                if ($commission.length > 0) {
                    $commission.text(totalCommission + ' ' + App.siteSettings.currencyCode);
                }
            }
        },
        showSection: function ($el) {
            var $section = $el.closest('.section');
            if ($section.length > 0) {
                $section.show();
            }
        },
        hideSection: function ($el) {
            var $section = $el.closest('.section');
            if ($section.length > 0) {
                $section.hide();
            }
        },
        getBookingEngineId: function () {
            var $bookingEngineId = $('#bookingEngineId');
            if ($bookingEngineId.length > 0) {
                return $bookingEngineId.val();
            }

            return null;
        },
        getAirDefaults: function () {
            //get air search flight defaults
            BookingService.flightsForm_GetAirSearchDefaults()
                .done(function (response) {
                    var defaultFlightParameters = JSON.parse(response.d);

                    if (!ObjectUtil.isNullOrEmpty(defaultFlightParameters)) {
                        EventAggregator.trigger('getFlightDefaultsComplete', defaultFlightParameters);
                    } else {
                        console.log('Flight defaults came up null');
                    }
                })
                .fail(function (response) {
                    console.log(response.responseText);
                    console.log('there was an issue getting the flight default parameters');
                });
        },
        isCommissionAvailable: function () {
            var $hide_commission = $('.hide-commission');
            return $hide_commission != null && $hide_commission != undefined
        },
        isCommissionHidden: function () {
            var $hide_commission = $('.hide-commission');

            return $hide_commission && $hide_commission.attr('commission-hidden') === 'true';
        },
        setHideCommissionCookie: function (value) {
            var exdate = new Date(),
                domain = window.location.host,
                path = '/';

            exdate.setDate(exdate.getDate() + 30);
            cookie.set('hideCommissionForAgent', value, { path: path, domain: domain, expires: exdate });
        },
        getHideCommissionCookie: function () {
            return cookie.get('hideCommissionForAgent');
        },
        hideStepPrice: function ($step) {
            var stepNum = $step.data('step');
            var navStep = $('#step_navigation > li[data-step="' + stepNum + '"]');
            var $currencySelector = navStep.find('.currency');
            if ($currencySelector.length > 0) {
                navStep.find('.currency').remove();
            }
        }
    };
    return bookingUtil;
});