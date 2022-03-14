document.addEventListener('DOMContentLoaded', () => {
    var menuitems = document.querySelectorAll("nav>ul>li");
    menuitems.forEach((item) => {

        var subMenu = item.querySelector("div.sub-menu");
        if (subMenu) {
            item.addEventListener("mouseover", () => {
                subMenu.style.display = "block";
            });

            item.addEventListener("mouseleave", () => {
                subMenu.style.display = "none";
            });

            subMenu.addEventListener("click", () => {
                subMenu.style.display = "none";
            });
        }
    });

    var $html = document.getElementsByTagName("html")[0];

    var $lnkSmallTheme = document.getElementById("lnkSmallTheme");
    var $lnkMediumTheme = document.getElementById("lnkMediumTheme");
    var $lnkLargeTheme = document.getElementById("lnkLargeTheme");
    var $lnkThemeLight = document.getElementById("lnkThemeLight");
    var $lnkThemeDark = document.getElementById("lnkThemeDark");

    $lnkSmallTheme.addEventListener("click", () => {
        $html.setAttribute("data-width", "small");

        window.localStorage.setItem("theme-width", "small");
    });

    $lnkMediumTheme.addEventListener("click", () => {
        $html.setAttribute("data-width", "");

        window.localStorage.setItem("theme-width", "");
    });

    $lnkLargeTheme.addEventListener("click", () => {
        $html.setAttribute("data-width", "large");

        window.localStorage.setItem("theme-width", "large");
    });

    $lnkThemeLight.addEventListener("click", () => {
        $html.setAttribute("data-theme", "light");

        window.localStorage.setItem("theme-color", "light");
    });

    $lnkThemeDark.addEventListener("click", () => {
        $html.setAttribute("data-theme", "dark");

        window.localStorage.setItem("theme-color", "dark");
    });
});