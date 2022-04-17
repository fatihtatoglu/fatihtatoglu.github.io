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
        // There is an assumption both language page will be available.
        var links = [];

        var link = this.permalink;
        if (link.endsWith("index.html")) {
            link = link.replace("index.html", "");
        }

        if (this.language === "tr") {
            link = link.replace("./", "");

            links.push({ language: "x-default", href: this["base-url"] + link });
            links.push({ language: "tr", href: this["base-url"] + link });
            links.push({ language: "en", href: this["base-url"] + "en/" + link });
        }
        else if (this.language === "en") {
            link = link.replace("./", "").replace(this.language + "/", "");

            links.push({ language: "x-default", href: this["base-url"] + link });
            links.push({ language: "tr", href: this["base-url"] + link });
            links.push({ language: "en", href: this["base-url"] + "en/" + link });
        }
        
        return links;
    }
};