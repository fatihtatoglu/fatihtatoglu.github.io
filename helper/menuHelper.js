"use strict";

function createSettingMenu(metadata) {
    return {
        "title": "-",
        "order": 0,
        "children": [{
            "element-id": "btnSetting",
            "title": metadata.language === "tr" ? "Tema Ayarları" : "Theme Options"
        }]
    };
}

function createMenuItem(page) {
    return {
        "title": page["title"],
        "url": page["base-url"] + page["permalink"].replace("./", ""),
        "order": page["order"]
    };
}

module.exports = {
    "separator": function () {
        return this.role === "separator";
    },
    "hasChildren": function () {
        return this.children && this.children.length > 0;
    },
    "url": function () {
        if (this.url) {
            return this.url.toString();
        }

        return "javascript:;";
    },
    "menu": function () {
        var menu = [];

        // Thema ayarları.
        menu.push(createSettingMenu(this));

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
                        "children": [createMenuItem(page)]
                    };

                    menu.push(menuItem);
                }
                else {
                    menu[index]["children"].push(createMenuItem(page));
                    menu[index]["children"] = menu[index]["children"].sort((a, b) => a["order"] - b["order"]);
                }
            }
            else {
                var item = createMenuItem(page);
                if (page["published"] != "true") {
                    return;
                }

                menu.push(item);
            }
        });

        return menu.sort((a, b) => a["order"] - b["order"]);
    }
};