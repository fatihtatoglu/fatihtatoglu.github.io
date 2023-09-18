var $menuButton = document.querySelector("nav i.menu-icon");
var $menuList = document.querySelector("nav ul");

var $btnLightTheme = document.getElementById("btnLightTheme");
var $btnDarkTheme = document.getElementById("btnDarkTheme");

var $html = document.getElementsByTagName("html")[0];

var currentPage = window.location.href;
if (window.location.pathname === "/") {
    currentPage = window.location.href + "index.html";
}
var menuListItems = $menuList.querySelectorAll("li a");

for (let i = 0; i < menuListItems.length; i++) {
    const item = menuListItems[i];

    if (item.href === currentPage) {
        item.classList.add("active");
        break;
    }
}

$menuButton.addEventListener("click", () => {
    $menuList.classList.toggle("show");
});

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