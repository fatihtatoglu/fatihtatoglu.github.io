"use strict";

module.exports = {
    "isPost": function () {
        return this.layout === "post";
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
    "postTags": function () {
        if (this["tags"]) {
            return '"' + this["tags"].join('","') + '"';
        }

        return undefined;
    },
    "labs": function () {
        var labs = {};
        this.pages.forEach((page) => {
            if (page["layout"] !== "post") {
                return;
            }

            var category = page["category"];
            if (category !== "lab") {
                return;
            }

            let group = page["group"];
            if (!labs[group]) {
                labs[group] = {
                    "title": page["groupTitle"],
                    "pages": []
                };
            }

            labs[group]["pages"].push(page);

        });

        var result = [];
        for (const key in labs) {

            var item = {
                id: key,
                title: labs[key].title,
                pages: labs[key].pages.sort((a, b) => a["order"] - b["order"])
            };

            result.push(item);
        }

        console.log(result);

        return result;
    }
};