"use strict";

module.exports = {
    "isLocal": function () {
        return this["base-url"].indexOf("localhost") >= 0;
    },
    "isEnglish": function () {
        return this.language === "en";
    },
    "isTurkish": function () {
        return this.language === "tr";
    }
};