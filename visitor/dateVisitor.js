"use strict";

const BasePageVisitor = require("enginaer/lib/pageVisitor");
const dayjs = require("dayjs");

class DateVisitor extends BasePageVisitor {

    constructor() {
        super("date");
    }

    visit(page) {
        var dateString = page.get("date");
        var date = new Date(Date.parse(dateString));

        page.set("date", date);
        page.set("publish-date", dayjs(date).format("DD.MM.YYYY"));
        page.set("publish-date-datetime", dayjs(date).format("YYYY-MM-DDTHH:mm:ssZZ"));
    }
}

module.exports = DateVisitor;