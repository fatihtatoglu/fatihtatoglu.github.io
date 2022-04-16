"use strict";

module.exports = {
    "isLocal": function () {
        return this["base-url"].indexOf("localhost") >= 0;
    }
};