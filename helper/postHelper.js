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
    }
};