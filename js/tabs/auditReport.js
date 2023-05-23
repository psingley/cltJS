$(function () {
	$(document).tooltip({
		content: function () {
			return $(this).attr("title");
		}
	});
});

function getReport(button) {
	$(".site-button.current").removeClass("current");
	$(button).addClass("current");
	var lang = button.getAttribute("data-lang");
	var site = button.getAttribute("data-site");
	var url = '/sitecore modules/Web/Tabs/' + report.pageName + '.aspx?id=' + report.itemId + '&vs=1&version=1&database=master&readonly=0&db=master&la=' + lang + '&language=' + lang + '&siteName=' + site;
    if (button.getAttribute("data-root") != undefined)
    {
        url = url + '&root=' + button.getAttribute("data-root");
    }
	$("#divReport").remove();
    $(".loading").remove();
	$("#sitesList").after("<div class='loading'></div>");
	$.ajax({
		type: "GET",
		timeout: 1000*60*30, // 30 minutes
		url: url,
		success: function(response) {
			$("#sitesList").after(response);
		},
		error: function(errorResponse) {
			console.log("Inside Failure");
			console.log(errorResponse.responseText);
		}
	}).complete(function() {
		$(".loading").remove();
	});
}

function getTourUpdates(item, tourId) {
    var currentButton = $(".site-button.current")[0];
    var lang = currentButton.getAttribute("data-lang");
    var site = currentButton.getAttribute("data-site");
	var url = '/sitecore modules/Web/Tabs/' + report.pageName + '.aspx?id=' + report.itemId + '&vs=1&version=1&database=master&readonly=0&db=master&tourId=' + tourId + '&la=' + lang + '&language=' + lang + '&siteName=' + site;
	$.ajax({
		type: "GET",
		url: url,
		success: function (response) {
			$(item).parent().parent().after(response);
            $(item).parent().parent().remove();
		},
		error: function (errorResponse) {
			console.log("Inside Failure");
			console.log(errorResponse.responseText);
		}
	});
}

function exportReport() {
	var url = '/sitecore modules/Web/Tabs/' + report.pageName + '.aspx?id=' + report.itemId + '&vs=1&version=1&database=master&readonly=0&db=master&la=en&language=en&export=true';
	$(".exportLoading").remove();
	$("#fileLink").remove();
	$("#exportButton").after("<div class='exportLoading'></div>");
	checkExportStatus(url);
}

function checkExportStatus(url){
	var gotResult = false;
	$.ajax({
		type: "GET",
		timeout: 1000*60*30, // 30 minutes
		url: url,
		success: function(response) {
			if (response != "In progress"){
				gotResult = true;
				$(".exportLoading").remove();
				$("#exportButton").after("<a id='fileLink' href="+ response + ">Download file</a>");
			}
		}
	}).complete(function() {
		if (!gotResult) {
			setTimeout('checkExportStatus("'+ url +'")', 30000);
		}
	});
}
