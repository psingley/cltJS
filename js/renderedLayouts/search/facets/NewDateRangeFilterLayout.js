define([
    'jquery',
    'underscore',
    'backbone',
    'moment',
    'event.aggregator',
    'app',
    'collections/search/searchOptions/ParameterCollection',
    'models/search/searchOptions/ParameterModel',
    'util/uriUtil',
    'util/objectUtil',
], function ($, _, Backbone, moment, EventAggregator, App, ParameterCollection, ParameterModel, UriUtil, ObjectUtil) {
    var selectedYear;
    var selectedMonth;
    var maxRangeYear = Number(new Date().getFullYear() + 2);
    var defaultStart;
    var defaultEnd;
    let minDateVal = document.getElementById("fdMinValue");
    let maxDateVal = document.getElementById("fdMaxValue");
    let startOrEnd = "start";
    let thestartdate = document.getElementById("thestartdate");
    let theenddate = document.getElementById("theenddate");
    let arrMinDates = [];
    let arrMaxDates = [];
    var DateRangeFilterLayout = Backbone.Marionette.Layout.extend({
        initialize: function () {
            var outerScope = this;
            outerScope.createCalendar();
            this.selectStartEnd("begin");
            startOrEnd = "start";
            if ($('#dateRangeFilter').length <= 0) {
                return;
            }
            //start/end events
            $("#strbtn").on("click", (e) => { startOrEnd = "start"; this.selectStartEnd(e); });
            $("#strbtn").on("mouseenter", (e) => { this.selectStartEnd(e); });
            $("#strbtn").on("mouseleave", (e) => { this.selectStartEnd(e); });
            $("#endbtn").on("click", (e) => { startOrEnd = "end"; this.selectStartEnd(e); });
            $("#endbtn").on("mouseenter", (e) => { this.selectStartEnd(e); });
            $("#endbtn").on("mouseleave", (e) => { this.selectStartEnd(e); });

            $("#btnSubmitSearch").on("click", (e) => {
                document.getElementById("dateRangeError").style.display = "none";
                e.preventDefault();
                let min = thestartdate.textContent;
                let max = theenddate.textContent;
                if (this.validateDate(min, max)) {
                    outerScope.applyFilter(min, max, ['start', 'end']);
                    EventAggregator.trigger('searchFilterApplied', 'start|end', [min, max]);
                }
                else {
                    document.getElementById("dateRangeError").style.display = "block";
                }
            });

            $("#cancelbtn").on("click", (e) => {
                startOrEnd = "start";
                this.selectStartEnd("begin");
                let startYear = new Date(defaultStart).getFullYear();
                let startMonth = new Date(defaultStart).toLocaleString('default', { month: 'short' });
                let endYear = new Date(defaultEnd).getFullYear();
                let endMonth = new Date(defaultEnd).toLocaleString('default', { month: 'short' });
                document.querySelector("#endbtn .triangle").classList.remove("triangle_selected");
                document.querySelector("#endbtn").classList.remove("triangle_selected");
                document.querySelector("#endbtn").classList.remove("startend_borderselected");
                minDateVal.textContent = startMonth + " " + startYear;
                maxDateVal.textContent = endMonth + " " + endYear;
                thestartdate.textContent = new Date(defaultStart).getMonth() + 1 + "-" + startYear;
                theenddate.textContent = new Date(defaultEnd).getMonth() + 1 + "-" + endYear;
                this.selectYearButton(startYear);
                this.enableMonths(startYear, endYear, new Date(defaultEnd).getMonth() + 1);
                document.getElementById("dateRangeError").style.display = "none";
            }),
                //on year button selection
             $(".yearbtn").on("click", (e) => {
                    document.getElementById("dateRangeError").style.display = "none";
                    selectedYear = e.currentTarget.getAttribute("data-year-only");
                    let minyear = e.currentTarget.getAttribute("data-year-only").replace(/\//gi, '-');
                    let maxyear = Number(selectedYear);
                    /*let max = new Date($.parseJSON($('#defaultSearchResults').val()).maxDate);*/
                    //select and unselect Years buttons
                    this.selectYearButton(selectedYear);
                    //enable and/or disable Months buttons
                 this.enableMonths(selectedYear, new Date(defaultEnd).getFullYear(), new Date(defaultEnd).getMonth() + 1);
                    //enable valid months based on search results
                    let minmonth = "";
                    let maxmonth = "";
                    let themonthcount = 0;
                 document.querySelectorAll('.monthbtn').forEach((mn) => {
                        if (themonthcount === 0) {
                            if (mn.disabled !== true) {
                                minmonth = mn.getAttribute("data-month");
                                themonthcount++;
                            }
                        }
                        if (mn.disabled !== true) {
                            maxmonth = mn.getAttribute("data-month");
                        }
                    });
                    if (startOrEnd === "start") {
                        //add Start and End Dates to hidden inputs
                        thestartdate.textContent = minmonth + "-" + minyear;
                        //show updated Start Date 
                        minDateVal.textContent =
                            new Date(minmonth)
                                .toLocaleString('default', { month: 'short' }) + " " +
                            e.currentTarget.getAttribute("data-year-only");
                    }
                    if (startOrEnd === "end") {
                        //show updated End Date 
                        maxDateVal.textContent =
                            new Date(maxmonth)
                                .toLocaleString('default', { month: 'short' }) + " " +
                            e.currentTarget.getAttribute("data-year-only");
                        theenddate.textContent = maxmonth + "-" + maxyear;
                 }

                 this.selectStartEnd(e);
             });

            $(".monthbtn").on("click", (e) => {
                document.getElementById("dateRangeError").style.display = "none";
                selectedMonth = e.currentTarget.getAttribute("data-month");
                let newselecteddate = new Date(selectedMonth).toLocaleString('default', { month: 'short' }) + " " + selectedYear;
                document.querySelectorAll('.monthbtn').forEach(mn => {
                    if (mn.classList.contains("selectedmonth")) {
                        mn.classList.remove("selectedmonth");
                    }
                });
                e.currentTarget.classList.add("selectedmonth");

                if (startOrEnd === "start") {
                    minDateVal.textContent = newselecteddate;
                    thestartdate.textContent = selectedMonth
                        + "-" + selectedYear;
                }
                if (startOrEnd === "end") {
                    maxDateVal.textContent = newselecteddate;
                    theenddate.textContent = selectedMonth
                        + "-" + selectedYear;
                }
            });

            EventAggregator.on('requestResultsComplete', function (performSearch) {
                var resultsMin = performSearch.get('minDate');
                var resultsMax = performSearch.get('maxDate');
                defaultStart = resultsMin;
                defaultEnd = resultsMax;
                maxRangeYear = new Date(resultsMax).getFullYear();
                outerScope.setCalendar(resultsMin, resultsMax);

            });
        },
        validateDate(min, max) {
            const [minMonth, minYear] = min.split('-');
            const [maxMonth, maxYear] = max.split('-');
            let md = (new Date(minYear, minMonth - 1));
            let mx = (new Date(maxYear, maxMonth - 1));
            if (md > mx) {
                return false;
            }
            else {
                return true;
            }
        },


        selectStartEnd: function (e) {
            let startbtn = document.getElementById("strbtn");
            let triangle_s = document.querySelector("#strbtn .triangle");
            let endbtn = document.getElementById("endbtn")
            let triangle_e = document.querySelector("#endbtn .triangle");

            if (e === "begin") {
                startbtn.classList.add("startend_borderselected");
                triangle_s.classList.add("triangle_selected");
            }
            if (e === "click") {
                document.querySelectorAll('.monthbtn').forEach(mn => {
                    mn.classList.remove("selectedmonth");
                    if (Number(mn.getAttribute("data-month")) === Number(thestartdate.textContent.split("-")[0])) {
                        mn.classList.add("selectedmonth");
                    }
                });
                document.querySelectorAll('.yearbtn').forEach(ell => {
                    if (Number(ell.textContent) === Number(thestartdate.textContent.split("-")[1])) {
                        ell.click();
                    }
                });
            }
            else if (e.type === "click") {
                document.querySelectorAll('.monthbtn').forEach(mn => {
                    mn.classList.remove("selectedmonth")
                });

                if (e.currentTarget.id === "strbtn") {
                    e.currentTarget.classList.add("startend_borderselected");
                    endbtn.classList.remove("startend_borderselected");
                    triangle_s.classList.add("triangle_selected");
                    triangle_e.classList.remove("triangle_selected");
                    document.querySelectorAll('.monthbtn').forEach(mn => {
                        if (Number(mn.getAttribute("data-month")) === Number(thestartdate.textContent.split("-")[0])) {
                            mn.classList.add("selectedmonth");
                        }
                    });
                    document.querySelectorAll('.yearbtn').forEach(ell => {
                        if (Number(ell.textContent) === Number(thestartdate.textContent.split("-")[1])) {
                            ell.click();
                        }
                    });
                }
                else if (e.currentTarget.id === "endbtn") {
                    endbtn.classList.add("startend_borderselected");
                    startbtn.classList.remove("startend_borderselected");
                    triangle_e.classList.add("triangle_selected");
                    triangle_s.classList.remove("triangle_selected");
                    document.querySelectorAll('.monthbtn').forEach(mn => {
                        if (Number(mn.getAttribute("data-month")) === Number(theenddate.textContent.split("-")[0])) {
                            mn.classList.add("selectedmonth");
                        }
                    });
                    document.querySelectorAll('.yearbtn').forEach(ell => {
                        if (Number(ell.textContent) === Number(theenddate.textContent.split("-")[1])) {
                            ell.click();
                        }
                    });
                }
                //year button was selected
                else {
                    if (startOrEnd === "start") {
                        if (document.querySelectorAll('.monthbtn')[0].disabled === false) {
                            document.querySelectorAll('.monthbtn')[0].classList.add("selectedmonth");
                        }
                        else {
                            document.querySelectorAll('.monthbtn').forEach(mn => {
                                if (Number(mn.getAttribute("data-month")) === Number(thestartdate.textContent.split("-")[0])) {
                                    mn.classList.add("selectedmonth");
                                }
                            });
                        }
                    }
                    else if(startOrEnd === "end")  {
                        if (document.querySelectorAll('.monthbtn')[11].disabled === false) {
                            document.querySelectorAll('.monthbtn')[11].classList.add("selectedmonth");
                        }
                        else {
                            document.querySelectorAll('.monthbtn').forEach(mn => {
                                if (Number(mn.getAttribute("data-month")) === Number(theenddate.textContent.split("-")[0])) {
                                    mn.classList.add("selectedmonth");
                                }
                            });
                        }
                    }
                }
                
            }
            else if (e.type === "mouseenter") {
                e.currentTarget.classList.add("startend_borderselected");
                e.currentTarget.querySelector(".triangle").classList.add("triangle_selected");
            }
            else if (e.type === "mouseleave") {
                if (e.currentTarget.id === "strbtn") {
                    if (startOrEnd !== "start") {
                        startbtn.classList.remove("startend_borderselected");
                        triangle_s.classList.remove("triangle_selected");
                    }
                    if (startOrEnd === "end") {
                        endbtn.classList.add("startend_borderselected");
                        triangle_e.classList.add("triangle_selected");
                    }
                }
                else if (e.currentTarget.id === "endbtn") {
                    if (startOrEnd !== "end") {
                        endbtn.classList.remove("startend_borderselected");
                        triangle_e.classList.remove("triangle_selected");
                    }
                    if (startOrEnd === "start") {
                        startbtn.classList.add("startend_borderselected");
                        triangle_s.classList.add("triangle_selected");
                    }
                }
            }
        },
        selectYearButton: function (year) {
            document.querySelectorAll('.yearbtn').forEach(ell => ell.classList.remove("daterangeselected"));
            document.querySelectorAll('.yearbtn').forEach(ell => {
                if (Number(ell.textContent) === Number(year)) {
                    ell.classList.add("daterangeselected");
                    selectedYear = Number(ell.textContent);
                }
                if (Number(ell.textContent) > Number(maxRangeYear)) {
                    ell.disabled = true;
                }

            });
        },
        enableMonths: function (year, maxyear, maxmonth) {
            if (Number(maxyear) < Number(year)) {
                document.querySelectorAll('.monthbtn').forEach(mn => {
                    mn.disabled = true;
                });
            }
            else {
                document.querySelectorAll('.monthbtn').forEach(mn => {
                    if (Number(year) === Number(new Date().getFullYear())) {
                        if (mn.dataset.month > new Date().getMonth()) {
                            mn.removeAttribute("disabled");
                        }
                        else {
                            mn.disabled = true;
                        }
                    }
                    else if (Number(year) === Number(new Date().getFullYear() + 1)) {
                        if (maxyear !== year) {
                            mn.disabled = false;
                        }
                        else {
                            if (Number(mn.dataset.month) > Number(maxmonth)) {
                                mn.disabled = true;
                            }

                            else {
                                mn.removeAttribute("disabled");
                            }
                        }
                    }
                    else if (Number(year) === Number(new Date().getFullYear() + 2)) {
                        if (Number(mn.dataset.month) > Number(maxmonth)) {
                            mn.disabled = true;
                        }
                        else {
                            mn.removeAttribute("disabled");
                        }
                    }
                });
            }
        },
        setCalendar: function (resultsMin, resultsMax) {
            //set hidden start and end date inputs
            if (App.Search.searchOptions.get("parameters").findWhere({ id: "start" }) != null) {
                thestartdate.textContent = App.Search.searchOptions.get("parameters").findWhere({ id: "start" }).get('values')[0];
                theenddate.textContent = App.Search.searchOptions.get("parameters").findWhere({ id: "end" }).get('values')[0];
            }
            else {
                thestartdate.textContent = new Date(resultsMin).getMonth() + 1 + "-" + new Date(resultsMin).getFullYear();
                theenddate.textContent = new Date(resultsMax).getMonth() + 1 + "-" + new Date(resultsMax).getFullYear();
            }

            var currentyear;
            var uriStart = UriUtil.getUrlVars().start;
            var uriEnd = UriUtil.getUrlVars().end;

            if (uriStart === null || uriStart === undefined) {
                currentyear = new Date().getFullYear();
                let maxdate = new Date(resultsMax);
                let mindate = new Date(resultsMin);
                let maxmonth = maxdate.getMonth() + 1;
                let maxyear = maxdate.getFullYear();
                minDateVal.textContent = new Date(mindate).toLocaleString('default', { month: 'short' }) + " " + new Date(mindate).getFullYear();
                maxDateVal.textContent = new Date(maxdate).toLocaleString('default', { month: 'short' }) + " " + new Date(maxdate).getFullYear();;
                this.selectYearButton(mindate.getFullYear());
                this.enableMonths(currentyear, maxyear, maxmonth);
                document.querySelectorAll('.monthbtn').forEach(mn => {
                    if (Number(mn.dataset.month) === Number(new Date(mindate).getMonth()) + 1) {
                        mn.classList.add("selectedmonth");
                    }
                });
            }
            else {
                currentyear = uriStart.split('-')[1];
                minDateVal.textContent = new Date(uriStart.split('-')[0]).toLocaleString('default', { month: 'short' }) + " " + currentyear;
                maxDateVal.textContent = new Date(uriEnd.split('-')[0]).toLocaleString('default', { month: 'short' }) + " " + uriEnd.split('-')[1];
                let maxmonth = uriEnd.split('-')[0];
                let maxyear = uriEnd.split('-')[1];
                this.selectYearButton(uriStart.split('-')[1]);
                this.enableMonths(currentyear, maxyear, maxmonth);
                document.querySelectorAll('.monthbtn').forEach(mn => {
                    if (Number(mn.dataset.month) === Number(uriStart.split('-')[0])) {
                        mn.classList.add("selectedmonth");
                    }
                });

            }
        },
        applyFilter: function (startVal, endVal, fieldnameValues) {
            var searchOptionsParams = App.Search.searchOptions.get('parameters');
            var startParameterModel;
            var endParameterModel;

            if (searchOptionsParams.length <= 0) {
                var parameterCollection = new ParameterCollection();

                startParameterModel = new ParameterModel({ id: fieldnameValues[0], values: [] });
                startParameterModel.get("values").push(startVal);
                parameterCollection.push(startParameterModel);

                endParameterModel = new ParameterModel({ id: fieldnameValues[1], values: [] });
                endParameterModel.get("values").push(endVal);
                parameterCollection.push(endParameterModel);

                searchOptionsParams = parameterCollection;
            } else {
                var startParameter = searchOptionsParams.findWhere({ id: fieldnameValues[0] });
                if (startParameter === undefined || startParameter === null) {
                    startParameterModel = new ParameterModel({ id: fieldnameValues[0], values: [] });
                    startParameterModel.get("values").push(startVal);

                    searchOptionsParams.push(startParameterModel);
                } else {
                    App.Search.searchOptions.get('parameters').get(fieldnameValues[0]).clear();
                    startParameterModel = new ParameterModel({ id: fieldnameValues[0], values: [] });
                    startParameterModel.get("values").push(startVal);

                    searchOptionsParams.push(startParameterModel);
                }

                var endParameter = searchOptionsParams.findWhere({ id: fieldnameValues[1] });
                if (endParameter === undefined || endParameter === null) {
                    endParameterModel = new ParameterModel({ id: fieldnameValues[1], values: [] });
                    endParameterModel.get("values").push(endVal);

                    searchOptionsParams.push(endParameterModel);
                } else {
                    App.Search.searchOptions.get('parameters').get(fieldnameValues[1]).clear();
                    endParameterModel = new ParameterModel({ id: fieldnameValues[1], values: [] });
                    endParameterModel.get("values").push(endVal);

                    searchOptionsParams.push(endParameterModel);
                }
            }

            App.Search.searchOptions.set({ currentPage: 1 });
            UriUtil.updateSearchOptionsHash(searchOptionsParams);
        },
        createCalendar: function () {
            const currentYear = new Date().getFullYear();
           
            const month = String(new Date().getMonth() + 1).padStart(2, '0');
            const yearloop = 3;
            let years = document.getElementById("years");
            let mindate = "";
            for (let yloop = 0; yloop < yearloop; yloop++) {
                if (currentYear + yloop === currentYear) {
                    mindate = `${month}/${(currentYear + yloop)}`;
                } else {
                    mindate = `01/${(currentYear + yloop)}`;
                }
                years.innerHTML += (`<button  data-year="${mindate}" data-year-only="${(currentYear + yloop)}" class="yearbtn btn btn-secondary align-self-center">${(currentYear + yloop)}</button>`);
            }

            const months = new Array(12).fill(0).map((_, i) => {
                return new Date(`${i + 1}/1/${currentYear}`).toLocaleDateString(undefined, { month: 'short' })
            });
            let themonths = document.getElementById("themonths");

            months.forEach((m, idx) => {
                idx = idx <= 8 ? "0" + (idx + 1) : idx + 1;
                themonths.innerHTML += (`<button data-month=${idx}  disabled class=" monthbtn btn btn-secondary align-self-center"> ${m}</button>`);
            });
            console.log("CurrentYear - " + currentYear, "Min Date - " + mindate, "Years - " + years);
        }
    });

    return DateRangeFilterLayout;
});