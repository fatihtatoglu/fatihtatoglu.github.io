"use strict";

const { tree } = require("gulp");

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

            if (this["permalink"] === page["permalink"]) {
                page["selected"] = true;
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
    },
    "labSide": function () {
        var currentGroup = this.group;
        if (!currentGroup) {
            currentGroup = "-";
        }

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
            if (currentGroup !== group) {
                return;
            }

            if (!labs[group]) {
                labs[group] = {
                    "title": page["groupTitle"],
                    "pages": []
                };
            }

            if (this["permalink"] === page["permalink"]) {
                page["selected"] = true;
            }
            else { page["selected"] = false; }

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