$(function () {
    $(".datepicker").datepicker({
        maxDate: new Date()
    });
    $('#tbReport').hide();
    $('#divNoInfo').hide();
    $('body').on('click', '#tbReport tbody tr', function () {
        $(this).toggleClass('selected');
    });
});

var reportResults = {};
var table;

function AccessUrl(parameters, startDate, endDate, siteName) {
    var url = '/sitecore modules/Web/Tabs/' + report.pageName + '.aspx?id=' + report.itemId + '&vs=1&version=1&database=master&readonly=0&db=master&la=en&language=en'+parameters;
    $.ajax({
        type: "GET",
        timeout: 1000 * 60 * 30, // 30 minutes
        url: url,
        success: function (response) {
            console.log(response);
            if (Object.prototype.toString.call(response) === '[object Array]') {
                reportResults.data = response;
                reportResults.startDate = startDate;
                reportResults.endDate = endDate;
                reportResults.siteName = siteName;
            }
            showResults(reportResults.data);
        },
        error: function (errorResponse) {
            console.log("Inside Failure");
            console.log(errorResponse.responseText);
        }
    }).complete(function () {
        $(".loading").remove();
    });
}

function runReport() {
    var startDateStr = $("#tbStartDate")[0].value,
        endDateStr = $("#tbEndDate")[0].value,
        siteName = $("#ddlSites").val();

    $('#divReport').hide();
    $('#divNoInfo').hide();
    $("#sitesList").after("<div class='loading'></div>");
    AccessUrl('&startDate=' + startDateStr + '&endDate=' + endDateStr + '&siteName=' + siteName, false, startDateStr, endDateStr, siteName);
    return false;
}

function showResults(data){
    if (data != undefined && data.length > 0) {
        $('#divNoInfo').hide();
        $('#tbReport').show();

        setTable(data);

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

function setTable(data) {
	switch (report.itemId) {
		case "{106F371A-7990-4F2E-8CB7-57D9935A223A}":
			var lang = $('#ddlSites option:selected')[0].getAttribute("data-lang");
			table = $('#tbReport').DataTable({
            "lengthMenu": [ [50, 100, 500, -1], [50, 100, 500, "All"] ],
            "pageLength": 50,
            "data": data,
            "destroy": true,
            "columns": [
                { "data": "term" },
                { "data": "resultUrl" },
                { "data": "searchCount" },
	            { "data" : "resultId"}
            ],
			columnDefs: [
			{
				"targets": 3,
				"data": "resultId",
				"render": function(data) {
					return data == null ? "" : '<a class="sync-button open-button" data-lang="' + lang + '" data-landing-page-id="' + data + '">View</a>';
				}
			}]
			});
			break;
		default:
			table = $('#tbReport').DataTable({
				"lengthMenu": [[50, 100, 500, -1], [50, 100, 500, "All"]],
				"pageLength": 50,
				"data": data,
				"destroy": true,
				"columns": [
					{ "data": "term" },
					{ "data": "searchCount" },
					{ "data": "resultCount" }
				]
			});
			break;
	}
}

function getDateOnly (date) {
    return new Date(date);
}

$(document).on("click", ".open-button", function () {
	var landingPageId = this.getAttribute("data-landing-page-id");
	var lang = this.getAttribute("data-lang");
	var url = '/sitecore/shell/sitecore/content/Applications/Content Editor.aspx?id=' + landingPageId + '&la=' + lang + '&fo=' + landingPageId;
	window.open(url);
});