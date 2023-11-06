let fth = (function () {
    var $btnLightTheme = document.getElementById("btnLightTheme");
    var $btnDarkTheme = document.getElementById("btnDarkTheme");
    var $menuButton = document.querySelector("nav i.menu-icon");
    var $menuList = document.querySelector("nav ul");
    var $html = document.getElementsByTagName("html")[0];

    var bindThemeButtons = function () {
        $btnLightTheme.addEventListener("click", () => {
            $btnLightTheme.style.display = "none";
            $btnDarkTheme.style.display = "inline-block";

            $html.classList.add("light");
            $html.classList.remove("dark");

            window.localStorage.setItem("theme", "light");
        });

        $btnDarkTheme.addEventListener("click", () => {
            $btnDarkTheme.style.display = "none";
            $btnLightTheme.style.display = "inline-block";

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

            $btnTurkish.style.display = "inline-block";
        }

        let $btnEnglish = document.getElementById("btnEnglish");
        if ($btnEnglish) {
            $btnEnglish.addEventListener("click", () => {
                window.localStorage.setItem("language", "en");
                redirectCorrectLanguage();
            });

            $btnEnglish.style.display = "inline-block";
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
                $btnLightTheme.style.display = "none";
                $btnDarkTheme.style.display = "inline-block";
            }
            else if (currentTheme === "dark") {
                $btnDarkTheme.style.display = "none";
                $btnLightTheme.style.display = "inline-block";
            }
        }
        else {
            window.localStorage.setItem("theme", "light");
            $btnLightTheme.style.display = "none";
            $btnDarkTheme.style.display = "inline-block";
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
                currentLanguage = "tr";
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

    var feedbackSurvey = function () {
        var $btnFeedback = document.getElementById("btnFeedback");
        var $pnlFeedback = document.getElementById("pnlFeedbackSurvey");
        var $btnFeedbackSurveyClose = document.getElementById("btnFeedbackSurveyClose");

        $btnFeedback.addEventListener("click", () => {
            var iframe = $pnlFeedback.querySelector("iframe");
            if (iframe) {
                iframe.src = iframe.src;
            }

            $pnlFeedback.style.display = "block";
        });

        $btnFeedbackSurveyClose.addEventListener("click", () => {
            $pnlFeedback.style.display = "none";
        });

        $btnFeedback.style.display = "inline-block";
    };

    var handleResize = function () {
        $main = document.getElementsByTagName("main")[0];

        window.addEventListener("resize", function () {
            var $p = document.createElement("p");
            $p.innerHTML = "width: " + window.innerWidth + " height:" + window.innerHeight;

            $main.prepend($p);

            setTimeout(function () {
                $main.removeChild($p);
            }, 3000);
        });
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
            feedbackSurvey();
            handleResize();
        }
    };
})();

document.addEventListener("DOMContentLoaded", () => {
    fth.bindMenu();
    fth.updateMenu();

    fth.loadSite();
});