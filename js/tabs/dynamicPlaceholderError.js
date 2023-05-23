$(document).on("click", ".open-button", function () {
	var pageId = this.getAttribute("data-page-id");
	var lang = this.getAttribute("data-language");
	var url = "/sitecore/shell/sitecore/content/Applications/Content Editor.aspx?id=" + pageId + "&la=" + lang + "&fo=" + pageId;
	window.open(url);
});

$(document).on("click", ".view-message", function () {
	var text = this.getAttribute("data-text");
	$(".modal-body > p").replaceWith("<p>" + text + "</p>");
	$("#infoModal").modal("show");
});