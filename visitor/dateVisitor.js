"use strict";

const BasePageVisitor = require("enginaer/lib/pageVisitor");

class DateVisitor extends BasePageVisitor {

    constructor() {
        super("date");
    }

    visit(page) {
        var dateString = page.get("date");
        var date = new Date(Date.parse(dateString));

        page.set("date", date);
    }
}

module.exports = DateVisitor;