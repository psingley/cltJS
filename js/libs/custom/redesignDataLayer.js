//Predictive search see - js/util/datalayerutil.js
// added headerSearchBarContent per hrp-425

function isAgent() {
    var d = document.querySelector('body').getAttribute('data-isagent');
    if (d === null || d === 'undefined') {
        d = false;
    }
    return d;
}


function isNotNull(x) {
    if (x)
        return x;
    else {
        return "";
    }
}

function removeHtml(str) {
    return str.replace(/(<([^>]+)>)/ig, '');
}

function IsAgent() {
    var d = document.querySelector('body').getAttribute('data-isagent');
    if (d === null || d === 'undefined') {
        d = false;
    }
    return d;
}

function TourProductPage_DataLayer() {

    var newTourDetails = document.getElementById('newTourDetails');
    window.dataLayer = window.dataLayer || []; 
    let toursubtitle = isNotNull(newTourDetails.getAttribute('data-toursubtitle')) ? removeHtml(newTourDetails.getAttribute('data-toursubtitle')) : "";
    let activitylevel = isNotNull(newTourDetails.getAttribute('data-activity-level')) ? "Level " + newTourDetails.getAttribute('data-activity-level') : "";
    let tourstyle = isNotNull(newTourDetails.getAttribute('data-product-type'));
 
    let discount = isNotNull(newTourDetails.getAttribute('data-discount'));
    if (discount !== "none") discount = Number(discount).toFixed(2);
    let tourprice = isNotNull(newTourDetails.getAttribute('data-price'));
    if (tourprice !== "") {
        tourprice = Number(tourprice).toFixed(2);
    }

    let dates = [];
    dates = ReformatTourDate(newTourDetails.getAttribute('data-startdate'), newTourDetails.getAttribute('data-enddate'));

    dataLayer.push({
        'ProductId': isNotNull(newTourDetails.getAttribute('data-tourseriesid')),
        'ProductName': isNotNull(newTourDetails.getAttribute('data-tourtitle')),
        'ProductYear': isNotNull(newTourDetails.getAttribute('data-product-year')),
        'TourSubtitle': toursubtitle,
        'TourStyle': tourstyle,
        'PackageId': isNotNull(newTourDetails.getAttribute('data-packageid')),
        'PackageDateId': isNotNull(newTourDetails.getAttribute('data-packagedateid')),
        'PackageDate': dates[2],
        'PackageDates': {
            "startdate": dates[0],
            "enddate": dates[1]
        },
        'ActivityLevel': activitylevel,
        'TotalDays': isNotNull(newTourDetails.getAttribute('data-totaldays')),
        'TourPrice': tourprice,
        'TourSavings': discount,
        'Action': isNotNull(newTourDetails.getAttribute('data-action')),
        'IsAgent': IsAgent(),
        'event': 'dataLayerPush'
    });

    localStorage.activityLevel = activitylevel;
    localStorage.tourStyle = tourstyle;
}


function ReformatTourDate(startdate, enddate) {
    let dates = [];
    let startdatetime = new Date(startdate);
    let formatted_startdate = startdatetime.getMonth() + 1 + "-" + startdatetime.getDate() + "-" + startdatetime.getFullYear();
    dates.push(formatted_startdate);
    let enddatetime = new Date(enddate);
    let formatted_enddate = enddatetime.getMonth() + 1 + "-" + enddatetime.getDate() + "-" + enddatetime.getFullYear();
    dates.push(formatted_enddate);
    let formatted_packagedate = formatted_startdate + " - " + formatted_enddate;
    dates.push(formatted_packagedate);

    return dates;
}

function homePageSearchData() {
   
    const whereField = document.querySelectorAll("#inputSelectedRegions")[0];
    const whenField = document.querySelector('.category-filter');
    const styleField = "";

   
    dataLayer.push({
        'homepageTravelToolWhere': whereField.textContent,
        'homepageTravelToolWhen': whenField.textContent,
        'homepageTravelToolStyle': "",
        'IsAgent': IsAgent(),
        'event': 'dataLayerPush'

    });


}
