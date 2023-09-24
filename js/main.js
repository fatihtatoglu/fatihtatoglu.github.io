let fth = (function () {
    var $btnLightTheme = document.getElementById("btnLightTheme");
    var $btnDarkTheme = document.getElementById("btnDarkTheme");
    var $menuButton = document.querySelector("nav i.menu-icon");
    var $menuList = document.querySelector("nav ul");
    var $html = document.getElementsByTagName("html")[0];

    var bindThemeButtons = function () {
        $btnLightTheme.addEventListener("click", () => {
            $btnLightTheme.setAttribute("disabled", "disabled");
            $btnDarkTheme.removeAttribute("disabled");

            $html.classList.add("light");
            $html.classList.remove("dark");

            window.localStorage.setItem("theme", "light");
        });

        $btnDarkTheme.addEventListener("click", () => {
            $btnDarkTheme.setAttribute("disabled", "disabled");
            $btnLightTheme.removeAttribute("disabled");

            $html.classList.add("dark");
            $html.classList.remove("light");

            window.localStorage.setItem("theme", "dark");
        });
    };

    var bindMenuToggle = function () {
        $menuButton.addEventListener("click", () => {
            $menuList.classList.toggle("show");
        });
    };

    var bindLanguageButton = function () {
        let $btnTurkish = document.getElementById("btnTurkish");
        if ($btnTurkish) {
            $btnTurkish.addEventListener("click", () => {
                window.localStorage.setItem("language", "tr");
                redirectCorrectLanguage();
            });
        }

        let $btnEnglish = document.getElementById("btnEnglish");
        if ($btnEnglish) {
            $btnEnglish.addEventListener("click", () => {
                window.localStorage.setItem("language", "en");
                redirectCorrectLanguage();
            });
        }
    };

    var paintCurrentPageOnMenu = function () {
        var $menuList = document.querySelector("nav ul");
        var currentPage = window.location.href;
        var menuListItems = $menuList.querySelectorAll("li a");

        for (let i = 0; i < menuListItems.length; i++) {
            const item = menuListItems[i];

            let href = item.href.replace("/index.html", "/");
            if (href === currentPage) {
                item.classList.add("active");
                break;
            }
        }
    };

    var themeLoading = function () {
        var currentTheme = window.localStorage.getItem("theme");

        if (currentTheme && (currentTheme === "light" || currentTheme === "dark")) {
            $html.classList.add(currentTheme);

            if (currentTheme === "light") {
                $btnLightTheme.setAttribute("disabled", "disabled");
            }
            else if (currentTheme === "dark") {
                $btnDarkTheme.setAttribute("disabled", "disabled");
            }
        }
    };

    var languageLoading = function () {
        var currentLanguage = window.localStorage.getItem("language");
        if (!currentLanguage) {
            currentLanguage = navigator.language;

            if (currentLanguage.indexOf("en-") === 0) {
                currentLanguage = "en";
            }
            else if (currentLanguage.indexOf("tr-") === 0) {
                currentLanguage = "tr";
            }
            else {
                currentLanguage = "en";
            }
        }

        $html.setAttribute("lang", currentLanguage);
        window.localStorage.setItem("language", currentLanguage);
    };

    var redirectCorrectLanguage = function () {
        var language = window.localStorage.getItem("language");
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
    };

    return {
        bindMenu: function () {
            bindThemeButtons();
            bindMenuToggle();
            bindLanguageButton();
        },
        updateMenu: function () {
            paintCurrentPageOnMenu();
        },
        loadSite: function () {
            themeLoading();
            languageLoading();
            redirectCorrectLanguage();
        }
    };
})();

document.addEventListener("DOMContentLoaded", () => {
    fth.bindMenu();
    fth.updateMenu();

    fth.loadSite();
});