
define([
    'jquery',
    'underscore',
    'backbone',
    'app',
    'services/searchService',
    'views/search/results/SearchResultItemView',
    'event.aggregator',
    'text!templates/search/results/searchResultListTemplate.html'
], function ($, _, Backbone, App, SearchService, SearchResultItemView, EventAggregator, resultListTemplate) {
    var totalPages = Number(0);
    var currentPage = 1;
    let toursPerPage = Number(12);
    var SearchResultsPager = Backbone.Marionette.CompositeView.extend({
        template: Backbone.Marionette.TemplateCache.get(resultListTemplate),
        itemView: SearchResultItemView,
        tagName: 'div',
        attributes: function () {
            return {
                class: "row"
            }
        },
        events: {
            'click .tour-details-header .modal-title a': 'scrollToActiveTour',
            'click ul#thepager li a': 'getPagerContent'

        },
        initialize: function () {

            var outerScope = this;
            this.mainButtons = $("#searchResultView").data("mainbuttons");
            this.extraButtons = $("#searchResultView").data("extrabuttons");
            this.mainClass = $("#searchResultView").data("mainclass");
            this.showDetailsbar = Boolean($("#searchResultView").data("buttonpanelstatus"));

        },
        onShow: function () {
            $(window).scrollTop(500);
            this.showHideViewMore();
        },

        createQueryString(thecase, page) {
            let rp = "";
            let cp = "";
            let href = "#";
            let xtr = Boolean(false);
            let qs = window.location.href;
            if (qs.includes("currentPage")) {
                cp = "currentPage=" +
                    parseInt(App.Search.searchOptions.get('currentPage'));
            }
            else if (qs.includes("#q")) {
                cp = window.location.hash;
                xtr = true;
            }
            else {
                cp = "find-your-tour";
                xtr = true;
            }
            switch (thecase) {
                case "Pre":
                    rp = `currentPage=${Number(currentPage) - 1}`;
                    break;
                case "Num":
                    rp = `currentPage=${Number(page)}`
                    break;
                case "Next":
                    rp = `currentPage=${Number(currentPage) + 1}`; 
                    break;
                case "First":
                    rp = `currentPage=1`; 
                    break;
                case "Last":
                    rp = `currentPage=${Number(totalPages)}`; 
                    break;

            }
            href = xtr ? this.noPageHref(rp) : qs.replace(`${cp}`, rp);
            return href;
        },

        noPageHref: function (h) {
            let sh = window.location.hash ? window.location.hash : "#q/";
            let amp = window.location.hash ? "&"  : "";
            let href = window.location.href.replace(window.location.hash, '') + sh + amp + h;
            return href;
          
        },

        //based on https://www.codingnepalweb.com/pagination-ui-design-javascript/
        buildPagingBar: function () {
            let page = Number(currentPage);
            let liTag = '';
            let active;
            let beforePage = Number(currentPage) - 1;
            let afterPage = Number(currentPage) + 1;
            if (page !== Number(1) && totalPages > 2) {
                liTag += `<li class=""><a class="btn prev" style="line-height: 42px; height: 42px;
                            width: 42px;" href='${this.createQueryString("Pre", plength)}'><i class="fas fa-angle-left"></i></a></li>`;
            }
            if (totalPages <= 5) {
                for (var plength = 1; plength <= totalPages; plength++) {
                    active = plength === page ? "active" : "";
                    liTag += `<li class="numb ${active}"><a href='${this.createQueryString("Num", plength)}'><span>${plength}</span></a></li>`;
                }
            }

            if (totalPages > 5) {
                if (page > 2) { //if page value is less than 2 then add 1 after the previous button
                    liTag += `<li class="first numb"><a href='${this.createQueryString("First", plength)}'>1</a></li>`;
                    if (page > 3) { //if page value is greater than 3 then add this (...) after the first li or page
                        liTag += `<li class="dots"><span>...</span></li>`;
                    }
                }
                //how many pages or li show before the current li
                if (page === totalPages) {
                    beforePage = beforePage - 2;
                } else if (page === totalPages - 1) {
                    beforePage = beforePage - 1;
                }
                // how many pages or li show after the current li
                if (page === 1) {
                    afterPage = afterPage + 2;
                } else if (page === 2) {
                    afterPage = afterPage + 1;
                }

                if (plength === 0) { //if plength is 0 than add +1 in plength value
                    plength = plength + 1;
                } 
                if (plength > 1 && plength !== totalPages) {
                    liTag += `<li class="numb ${active}"><a href='${this.createQueryString("Num", plength)}'>${plength}</a></li>`;
                }
                for (plength = beforePage; plength <= afterPage; plength++) {
                    if (plength > totalPages) { //if plength is greater than totalPage length then continue
                        continue;
                    }
                    if (plength === 0) {
                        plength = plength + 1;
                    }
                    active = plength === page ? "active" : "";
                    liTag += `<li class="numb ${active}"><a href='${this.createQueryString("Num", plength)}'><span>${plength}</span></a></li>`;
                }

                if (page < totalPages - 1) { //if page value is less than totalPage value by -1 then show the last li or page
                    if (page < totalPages - 2) { //if page value is less than totalPage value by -2 then add this (...) before the last li or page
                        liTag += `<li class="dots"><span>...</span></li>`;
                    }
                    liTag += `<li><a href='${this.createQueryString("Last", plength)}'>${totalPages}</a></li>`;
                }

            }

            if (page !== Number(totalPages) & totalPages > 2) {
                liTag += `<li><a class="btn next" style="line-height: 42px; height: 42px;
                            width: 42px;" href='${this.createQueryString("Next", plength)}'><i class="fas fa-angle-right"></i></a></li>`;
            }
          
            document.getElementById("thepager").innerHTML = liTag; //add li tag inside ul tag
            return liTag;
        },


        showHideViewMore: function () {
            //var isAllowToUpdate = $.parseJSON($("#searchResultView").attr("data-updateonurl").toLowerCase()); 
            var thecurrentPage = App.Search.searchOptions.get('currentPage');
            var numOfResults = App.Search.performSearch.get('totalResults');
            totalPages = Math.ceil(numOfResults / toursPerPage);
            currentPage = thecurrentPage;
            //build the pager
            document.getElementById("thepager").innerHTML = this.buildPagingBar();

        },
        
        getPagerContent: function (e) {
            $('#search-hero').animate({
                scrollTop: 500 //$('.tour-active').offset().top - activeTourOffsetTop
            }, "slow");
        },
        itemViewOptions: function (model, index) {
            return {
                resultNumber: index + 1
            }
        },
        appendHtml: function (collectionView, itemView, indexw) {
            // ensure we nest the child list inside of
            // the current list item
            collectionView.$("#searchResult:last").append(itemView.el);
        },
        templateHelpers: function () {
            var isTourDetailButtonsExist = this.mainButtons.length > 0 || this.extraButtons.length > 0;

            return {
                isTourDetailButtonsExist: isTourDetailButtonsExist,
                columnSize: function () {
                    if (isTourDetailButtonsExist) {
                        return "col-xs-12 col-sm-6 col-md-7 col-lg-8";
                    }
                    return "col-xs-12";
                },
                closeText: App.dictionary.get('common.Buttons.Close'),
                learnMoreText: App.Search.searchSettings.get("SeeDetailsMessage"),
                allPricesAreIn: function () {
                    if (App.siteIds.Marriott != App.siteSettings.siteId) {
                        return '*' + App.dictionary.get('tourRelated.FreeFormText.AllPricesAreIn') + ' ' + App.siteSettings.currencyCode;
                    }
                    return "";
                }
            }
        }
    });
    // Our module now returns our view
    return SearchResultsPager;
});
