$(function () {
    $(".datepicker").datepicker({
        maxDate: new Date()
    });
    $('#tbReport').hide();
    $('#divNoInfo').hide();
    $('#deleteOptions').hide();
    $('body').on('click', '#tbReport tbody tr', function () {
        $(this).toggleClass('selected');
    });
});

var reportResults = {};
var table;

function getSelected() {
    var data = table.rows('.selected').data();
    var results = [];
    for (var i=0; i < data.length; i++)
    {
        results.push(data[i].package.sitecoreId);
    }
    return results;
}

function removePackages() {
    var idsSelected = getSelected();
    if (idsSelected.length > 0) {
        if (confirm('Are you sure you would like to delete the selected archived packages?')) {
            removeExecute('/api/services/SitecoreDatabaseManagement/RemoveArchivedPackages', JSON.stringify(idsSelected));
        }
    }
    else {
        alert('There are no selected items.');
    }
}

function removeAll(){
    if (confirm('Are you sure you would like to delete all archived packages?')) {
        removeExecute('/api/services/SitecoreDatabaseManagement/RemoveArchivedPackagesByDates', JSON.stringify({startDate: $("#tbStartDate")[0].value, endDate: $("#tbEndDate")[0].value}))
    }
}

function removeExecute(url, data){
    $(".overlay").show();
    $.ajax({
        contentType: "application/json; charset=utf-8",
        dataType: "json",
        data: data,
        type: "POST",
        timeout: 1000 * 60 * 30, // 30 minutes
        url: url,
        success: function () {
            removeSuccess();
        },
        error: function (e) {
            var message = e.responseJSON.Message ? e.responseJSON.Message : e.responseText;
            alert(message);
        }
    }).complete(function () {
        $(".overlay").hide();
    });
}

function removeSuccess(){
    $('#divReport').hide();
    reportResults.data = null;
    runReport();
}

function AccessUrl(parameters, isDeleteMode, startDate, endDate) {
    var url = '/sitecore modules/Web/Tabs/' + report.pageName + '.aspx?id=' + report.itemId + '&vs=1&version=1&database=master&readonly=0&db=master&la=en&language=en'+parameters;
    $.ajax({
        type: "GET",
        timeout: 1000 * 60 * 30, // 30 minutes
        url: url,
        success: function (response) {
            console.log(response);
            response.forEach(function (item) {
                item.logDate = new Date(item.logDate);
            });
            reportResults.data = response;
            reportResults.startDate = new Date(startDate);
            reportResults.endDate = new Date(endDate);
            showResults(reportResults.data, isDeleteMode);
        },
        error: function (errorResponse) {
            console.log("Inside Failure");
            console.log(errorResponse.responseText);
        }
    }).complete(function () {
        $("#reportLoading").remove();
    });
}

function runReport() {
    var startDateStr = $("#tbStartDate")[0].value,
        endDateStr = $("#tbEndDate")[0].value;
    var startDate = new Date(startDateStr),
        endDate = new Date(endDateStr);

    // if not enough data loaded, do ajax request and load more
    if (reportResults.data == undefined || reportResults.startDate > startDate || reportResults.endDate < endDate || reportResults.data.length == 0){
        $("#reportLoading").remove();
        $("#tbReport").before("<div class='loading' id='reportLoading'></div>");

        AccessUrl('&startDate=' + startDateStr + '&endDate=' + endDateStr, false, startDateStr, endDateStr);
    }
    //use existing data
    else {
        var data = reportResults.data.filter(function(item){
            return getDateOnly(item.logDate) >= startDate && getDateOnly(item.logDate) <= endDate;
        });
        showResults(data);
    }
    return false;
}

function showResults(data, isDeleteMode){
	var report = $('#tbReport');
    if (data.length > 0) {
        $('#deleteOptions').show();
        $('#divNoInfo').hide();
        report.show();

        table = report.DataTable({
            "data": data,
            "destroy": true,
            "columns": columnsList(report),
            "columnDefs": columnDefs(report),
            "createdRow": function( row, data ) {
                if (data.removed) {
                    $(row).addClass('removed');
                }
            }
        });

        report.on( 'click', 'tr', function (e) {
            if ($(this).hasClass('removed')) {
                e.stopPropagation();
            }
        } );

        $('#divReport').show();
    }
    else{
        if (table != undefined) {
            table.destroy();
        }
        $('#divNoInfo').show();
        $('#tbReport').hide();
    }
}

function columnsList(item){
	var result = [
        { "data": "country.name" },
        { "data": "tour.neoId" },
        { "data": "tour.name" },
        { "data": "package.neoId" },
        { "data": "package.name" },
        { "data": "logDate" }
    ];

    if (item.data('sub-title')){
        result.splice(indexOfLogDateColumn(item) - 1, 0, {"data": "package.subTitle"});
    }

    if (item.data('remove')){
        result.push({"data": "removed"});
    }
	return result;
}

function columnDefs(item){
    var result = [{
        "targets": indexOfLogDateColumn(item),
        "data": "logDate",
        "render": function (data) {
            return getDateOnly(data).toLocaleDateString();
        }
    }];

    if (item.data('remove')){
        result.push({
            "targets": columnsList(item).length - 1,
            "data": "removed",
            "render": function (data) {
                if (data){
                    return "Yes";
                }
                return "";
            }
        });
    }
    return result;
}

function indexOfLogDateColumn(item){
    return item.data('sub-title') ? 6 : 5;
}

function getDateOnly (date) {
    return new Date(date);
}