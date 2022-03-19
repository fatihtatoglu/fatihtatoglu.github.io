const defaultThemeColor = "aqua";

document.addEventListener('DOMContentLoaded', () => {

    loadSiteSettings();

    bindMenu();
    renderThemeDialog();

    bindThemeButtons();
});

function bindMenu() {
    var menu = document.querySelector("nav>ul");
    var menuitems = menu.querySelectorAll("nav>ul>li");

    var toggler = document.querySelector("nav>span.menu-button");

    function hideAllSubMenus() {
        var submenus = menu.querySelectorAll("nav>ul>li div.sub-menu");
        submenus.forEach(sm => {
            sm.style.display = "none";
        });
    }

    menuitems.forEach((item) => {

        var subMenu = item.querySelector("div.sub-menu");
        if (!subMenu) {
            return;
        }

        // set initial state
        subMenu.style.display = "none";

        item.addEventListener("click", () => {
            if (subMenu.style.display === "none") {

                hideAllSubMenus();

                subMenu.style.display = "block";
            } else {
                subMenu.style.display = "none";
            }
        });
    });

    toggler.addEventListener("click", () => {
        if (menu.style.display === "table") {
            hideAllSubMenus();

            menu.style.display = "none";
        }
        else {
            menu.style.display = "table";
        }
    });
}

function loadSiteSettings() {
    var $html = document.getElementsByTagName("html")[0];
    var themeColor = window.localStorage.getItem("theme-color");

    $html.className = "";

    if (themeColor) {
        $html.classList.add(themeColor);
    }
    else {
        $html.classList.add(defaultThemeColor);

        window.localStorage.setItem("theme-color", defaultThemeColor);
    }
}

function bindThemeButtons() {
    var $btnTheme = document.getElementById("btnTheme");
    var $pnlThemeDialog = document.getElementById("pnlThemeDialog");

    $btnTheme.addEventListener("click", function () {
        if ($pnlThemeDialog) {
            $pnlThemeDialog.style.display = "block";
        }
    });

    window.addEventListener("click", function (e) {
        if (e.target == $pnlThemeDialog) {
            $pnlThemeDialog.style.display = "none";
        }
    });
}

function renderThemeDialog() {

    var $btnThemeDialogOK = document.getElementById("btnThemeDialogOK");
    var dialog = document.getElementById("pnlThemeDialog");
    $btnThemeDialogOK.addEventListener("click", function () {
        var selectedElements = dialog.querySelectorAll("input[type=radio]:checked");
        selectedElements.forEach(function (item) {
            if (item.name === "color") {
                window.localStorage.setItem("theme-color", item.value);
            }
        });

        loadSiteSettings();

        dialog.style.display = "none";
    });
}