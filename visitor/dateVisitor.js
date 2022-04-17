"use strict";

const BasePageVisitor = require("enginaer/lib/pageVisitor");
const dayjs = require("dayjs");

class DateVisitor extends BasePageVisitor {

    constructor() {
        super("date");
    }

    visit(page) {
        var dateString = page.get("date");
        var language = page.get("language");
        var date = new Date(Date.parse(dateString));

        page.set("date", date);
        page.set("publish-date-datetime", dayjs(date).format("YYYY-MM-DDTHH:mm:ssZZ"));

        if (language === "tr") {
            page.set("publish-date", dayjs(date).format("DD.MM.YYYY"));
        } else if (language === "en") {
            page.set("publish-date", dayjs(date).format("MM/DD/YYYY"));
        }
    }
}

module.exports = DateVisitor;