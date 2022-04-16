"use strict";

module.exports = {

    "canonical": function () {
        if (this.permalink.endsWith("index.html")) {
            return this["base-url"] + this.permalink.replace("./", "").replace("index.html", "");
        }
        else {
            return this["base-url"] + this.permalink.replace("./", "");
        }
    },
    "alternate": function () {
        var links = [];

        return links;
    }
};