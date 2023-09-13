"use strict";

function createMenuItem(page) {
    return {
        "title": page["title"],
        "url": page["base-url"] + page["permalink"].replace("./", ""),
        "order": page["order"]
    };
}

module.exports = {
    "url": function () {
        if (this.url) {
            return this.url.toString();
        }

        return "javascript:;";
    },
    "menu": function () {
        var menu = [];

        this.pages.forEach((page) => {

            if (page["layout"] === "post") {
                return;
            }

            var item = createMenuItem(page);
            if (page["published"] != "true") {
                return;
            }

            menu.push(item);
        });

        return menu.sort((a, b) => a["order"] - b["order"]);
    }
};