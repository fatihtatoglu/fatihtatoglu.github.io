"use strict";

const BasePageVisitor = require("enginaer/lib/pageVisitor");

class TitleVisitor extends BasePageVisitor {

    constructor() {
        super("title");
    }

    visit(page) {
        var regex = /<h1\s*.{0,128}>(.*)<\/h1>/g;
        var value = regex.exec(page.content);

        if (value && value.length > 0) {
            page.set("title", value[1]);
        }
    }
}

module.exports = TitleVisitor;