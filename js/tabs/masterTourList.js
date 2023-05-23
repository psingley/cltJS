$(function () {
    $('#divReport').hide();
});

var report = {
    pageName: "MasterTourList",
    itemId: "{567A705E-EEC0-4485-BA05-F405002C9563}"
};

var table;

function getReport(button) {
    $(".site-button.current").removeClass("current");
    $(button).addClass("current");
    var lang = button.getAttribute("data-lang");
    var site = button.getAttribute("data-site");
    var url = '/sitecore modules/Web/Tabs/' + report.pageName + '.aspx?id=' + report.itemId + '&vs=1&version=1&database=master&readonly=0&db=master&la=' + lang + '&language=' + lang + '&siteName=' + site;
    $(".loading").remove();
    $('#divReport').hide();
    $("#sitesList").after("<div class='loading'></div>");
    $.ajax({
        type: "GET",
        timeout: 1000*60*30, // 30 minutes
        url: url,
        success: function(response) {
            $('#divReport').show();
            if (response.value.length > 0) {
                $('#tbReport').show();
                table = $('#tbReport').DataTable({
                    "data": response.value,
                    "destroy": true,
                    "columns": [
                        {"data": "tourId"},
                        {"data": "tourName"},
                        {"data": "packageId"},
                        { "data": "packageName" },
						{ "data": "sitecoreId" },
						{ "data": "landingPageId" }
                    ],
                    "columnDefs": [{
                    	"targets": 4,
                    	"data": "sitecoreId",
                    	"render": function (data) {
                    		return data == null ? '<img src="/~/icon/Applications/16x16/delete2.png">' : '<img src="/~/icon/Applications/16x16/check2.png">';
                    	}
					},
	                {
	                    "targets": 5,
	                    "data": "landingPageId",
	                    "render": function (data) {
	                    	return data == null ? "" : '<a class="sync-button open-button" data-lang="' + lang + '" data-landing-page-id="' + data + '">View</a>';
	                    }
	               }]
                });
            }
            else{
                if (table != undefined) {
                    table.destroy();
                }
                $('#tbReport').hide();
            }
            var date = new Date();
            $("#spTime").text(date.toLocaleString());
            $("#spReportTitle").text(site);
            $("#spPagesNum").text(response.key);
        },
        error: function(errorResponse) {
            console.log("Inside Failure");
            console.log(errorResponse.responseText);
        }
    }).complete(function() {
        $(".loading").remove();
    });
}

$(document).on("click", ".open-button", function () {
	var landingPageId = this.getAttribute("data-landing-page-id");
	var lang = this.getAttribute("data-lang");
	var url = '/sitecore/shell/sitecore/content/Applications/Content Editor.aspx?id=' + landingPageId + '&la=' + lang + '&fo=' + landingPageId;
	window.open(url);
});

