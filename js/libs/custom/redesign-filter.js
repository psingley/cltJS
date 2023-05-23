//used for Product Detail Page Hero Modal
function openTab(tabName) {
    var i;
    var x = document.getElementsByClassName("thetab");
    for (i = 0; i < x.length; i++) {
        x[i].style.display = "none";
    }
    document.getElementById(tabName).style.display = "block";
    document.querySelectorAll("a.flex-fill").forEach((a) => {
        a.style.textDecoration = a.classList.contains(tabName) ? "underline" : "none";
    });

}

function toggleArrowsBoxes(id) {

    document.getElementById(id).classList.add('show');
    document.getElementById(id).parentNode.querySelector(".fa").classList.remove("collapsed");
}


//function openFilters() {
//    if (window.location.hash !== null) {
//        let hash = window.location.hash.substr(1);
//        let h = 0;
//        if (hash.includes("badgenamesfacet") || hash.includes("offertype")) {
//            toggleArrowsBoxes("Popular");
//            h = 1;
//        }
//        if (hash.includes("cities") || hash.includes("countrynames") || hash.includes("continentnames")) {
//            toggleArrowsBoxes("Where");
//            h = 1;
//        }
//        if (hash.includes("stylenamesfacet")) {
//            toggleArrowsBoxes("TourStyles");
//            h = 1;
//        }
//        if (hash.includes("tourlength_description")) {
//            toggleArrowsBoxes("tourlength");
//            h = 1;
//        }
//        if (hash.includes("activitylevel")) {
//            toggleArrowsBoxes("Activity");
//            h = 1;
//        }
//        if (hash.includes("stars")) {
//            toggleArrowsBoxes("CustomerReviews");
//            h = 1;
//        }
//        if (hash.includes("price")) {
//            toggleArrowsBoxes("priceRangeFilter");
//            h = 1;
//        }
//        if (hash.includes("featuresfacet")) {
//            document.querySelector("div#featuresfacet div").classList.add('show')
//            document.getElementById("featuresfacet").parentNode.querySelector(".fa").classList.remove("collapsed");
//            h = 1;
//        }
//        if (hash.includes("start")) {
//            toggleArrowsBoxes("dateRangeFilter");
//            h = 1;
//        }
//        if (h === 1) {
//            toggleArrowsBoxes("filterrow");
//        }
//    }

//}

function getFilterCount() {
    var length = document.querySelectorAll('.active-filter-set:not([style*="display: none;"])').length;
    if (length > 0) {
        document.getElementById("activefiltercount").textContent =
            length + " selected";
        document.getElementById("activefiltercount2").textContent =
            length + " selected";
    }
    else {
        document.getElementById("activefiltercount2").textContent = "";
    }
}

function updateFilterCount() {
    var length = document.querySelectorAll('.active-filter-set:not([style*="display: none;"])').length;
    if (length > 0) {
        document.getElementById("activefiltercount2").textContent =
            length + " selected";
    }
    else {
        document.getElementById("activefiltercount2").textContent = "";
    }
}

function toggleFilters() {
    var vw = document.documentElement.clientWidth;
    console.log(vw);
    if (vw <= 999) {
        let elementToMove = document.getElementById('filterPanelView');
        let elToMove = document.querySelector('.ssort-by .new_select');
        let elToMoveOld = document.querySelector('.ssort-by .old_select');
        let destinationElement = document.getElementById('modalfilters');
        destinationElement.appendChild(elToMoveOld);
        destinationElement.appendChild(elToMove);
        destinationElement.appendChild(elementToMove);
    }

}


function untoggleFilters() {
    var vw = document.documentElement.clientWidth;
    try {
        if (vw >= 1000) {
            let elementToMove = document.getElementById('filterPanelView');
            let elToMoveOld = document.querySelector('#modalfilters .old_select');
            let elToMove = document.querySelector('#modalfilters .new_select');
            let destinationElement = document.getElementById('filterrow');
            let desEl = document.querySelector('.ssort-by');
            desEl.appendChild(elToMoveOld);
            desEl.appendChild(elToMove);
            destinationElement.appendChild(elementToMove);
        }
        else {
            let filters = document.getElementById('filterrow');
            if (filters.classList.contains('show')) {
                filters.classList.remove('show');
            }
        }
    }
    catch { }
}

//function openFilter(facet, title) {
//    console.log("THIS DOES NOTHING");
//}

