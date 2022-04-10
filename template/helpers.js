"use strict";

module.exports = {
    "separator": function () {
        return this.role === "separator";
    },
    "hasChildren": function () {
        return this.children && this.children.length > 0;
    },
    "url": function () {
        if (this.url) {
            return this.url;
        }

        return "javascript:;";
    },
    "isPost": function () {
        return this.layout === "post";
    },
    "canonical": function () {
        if (this.permalink.endsWith("index.html")) {
            return this["base-path"] + this.permalink.replace("./", "").replace("index.html", "");
        }
        else {
            return this["base-path"] + this.permalink.replace("./", "");
        }
    },
    "coaching": function () {
        return this.layout === "post" && this.category === "coaching" && this.published === "true";
    },
    "notes": function () {
        return this.layout === "post" && this.category === "notes" && this.published === "true";
    },
    "projects": function () {
        return this.layout === "post" && this.category === "projects" && this.published === "true";
    },
    "postImage": function () {
        if (this["image"]) {
            return this["image"].replace("./", "");
        }

        return undefined;
    },
    "menu": function () {
        var menu = [];

        // Thema ayarları.
        menu.push({
            "title": "-",
            "order": 0,
            "children": [{
                "element-id": "btnTheme",
                "title": "Tema Ayarları"
            }]
        });

        this.pages.forEach((page) => {

            if (page["layout"] === "post") {
                return;
            }

            var group = page["group"];
            if (group) {
                var index = menu.findIndex((v, i) => {
                    if (v["group"] == group) {
                        return i;
                    }
                });

                if (index === -1) {

                    var menuItem = {
                        "group": group,
                        "title": group,
                        "order": page["groupOrder"],
                        "children": [{
                            "title": page["title"],
                            "url": page["permalink"],
                            "order": page["order"]
                        }]
                    };

                    menu.push(menuItem);
                }
                else {
                    menu[index]["children"].push({
                        "title": page["title"],
                        "url": page["permalink"],
                        "order": page["order"]
                    });

                    menu[index]["children"] = menu[index]["children"].sort((a, b) => a["order"] - b["order"]);
                }
            }
            else {
                var item = {
                    "title": page["title"],
                    "url": page["permalink"],
                    "order": page["order"]
                };

                if (page["published"] != "true") {
                    return;
                }

                menu.push(item);
            }
        });

        return menu.sort((a, b) => a["order"] - b["order"]);
    }
};