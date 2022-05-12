const defaultThemeColor = "aqua";
const defaultLanguage = "tr";

document.addEventListener('DOMContentLoaded', () => {
    loadSiteSettings();
    redirectCorrectLanguage();

    bindMenu();
    renderThemeDialog();

    bindThemeButtons();
    dialogCloseButton();
    articleHeaderButton();
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
    var themeColor = window.localStorage.getItem("site-theme");
    var language = window.localStorage.getItem("site-language");

    $html.className = "";

    if (themeColor) {
        $html.classList.add(themeColor);
    }
    else {
        $html.classList.add(defaultThemeColor);
        window.localStorage.setItem("site-theme", defaultThemeColor);
    }

    if (language) {
        $html.setAttribute("lang", language);
    }
    else {
        $html.setAttribute("lang", defaultLanguage);
        window.localStorage.setItem("site-language", defaultLanguage);
    }
}

function bindThemeButtons() {
    var $btnSetting = document.getElementById("btnSetting");
    var $pnlSettingDialog = document.getElementById("pnlSettingDialog");

    $btnSetting.addEventListener("click", function () {
        if ($pnlSettingDialog) {
            $pnlSettingDialog.style.display = "block";
        }
    });

    window.addEventListener("click", function (e) {
        if (e.target == $pnlSettingDialog) {
            $pnlSettingDialog.style.display = "none";
        }
    });
}

function renderThemeDialog() {

    var $btnSettingDialogOK = document.getElementById("btnSettingDialogOK");
    var dialog = document.getElementById("pnlSettingDialog");
    $btnSettingDialogOK.addEventListener("click", function () {
        var selectedElements = dialog.querySelectorAll("input[type=radio]:checked");
        selectedElements.forEach(function (item) {
            if (item.name === "color") {
                window.localStorage.setItem("site-theme", item.value);
            }
            else if (item.name === "lang") {
                window.localStorage.setItem("site-language", item.value);
            }
        });

        loadSiteSettings();
        redirectCorrectLanguage();

        dialog.style.display = "none";
    });
}

function redirectCorrectLanguage() {
    var language = window.localStorage.getItem("site-language");
    var languageUrlLink = document.querySelector("link[rel=alternate][hreflang=" + language + "]");
    if (!languageUrlLink) {
        return;
    }

    var languageUrl = languageUrlLink.getAttribute("href");
    if (languageUrl === window.location.href) {
        return;
    }

    if (languageUrl.startsWith(window.origin)) {
        window.location.replace(languageUrl);
    }
}

function dialogCloseButton() {
    let dialogs = document.querySelectorAll("div.dialog");
    dialogs.forEach((item) => {
        let closeButton = item.querySelector("div.dialog-box div.dialog-content header button");
        closeButton.addEventListener("click", () => {
            item.style.display = "none";
        });
    });
}

function articleHeaderButton() {
    let articleButton = document.querySelector("article > header > button");
    articleButton.addEventListener("click", () => {
        var $pnlThemeDialog = document.getElementById("pnlSettingDialog");
        if ($pnlThemeDialog) {
            $pnlThemeDialog.style.display = "block";
        }
    });
}