


document.addEventListener("mousemove", (e) => {
    console.log("document.mousemove", e);
});

document.addEventListener("touchstart", (e) => {
    console.log("document.touchstart", e);
});

window.addEventListener("resize", (e) => {
    console.log("window.resize", e);
});

window.addEventListener("scroll", (e) => {
    console.log("window.scroll", e);
});

window.addEventListener("pageshow", (e) => {
    console.log("window.pageshow", e);
});