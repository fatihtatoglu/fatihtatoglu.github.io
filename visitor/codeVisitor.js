"use strict";

const BasePageVisitor = require("enginaer/lib/pageVisitor");
const htmlParser = require("node-html-parser");

class CodeVisitor extends BasePageVisitor {
    constructor() {
        super("code");
    }

    visit(page) {
        // added config, according to the following link.
        // Link: https://github.com/taoqf/node-html-parser/issues/190
        let html = htmlParser.parse(page.content, {
            blockTextElements: {
                script: true,
                noscript: true,
                style: true,
                code: true
            }
        });

        let elements = html.querySelectorAll("pre code");
        if (elements.length === 0) {
            return;
        }

        elements.forEach((e) => {

            // language-shell-user
            let outputHTML = e.innerHTML.replaceAll("fatihtatoglu@fth-linux:~$", "<span class='language-shell-user'>fatihtatoglu@fth-linux:~$</span>");
            outputHTML = outputHTML.replaceAll("fatihtatoglu@fth-dev:~$", "<span class='language-shell-user'>fatihtatoglu@fth-dev:~$</span>");
            outputHTML = outputHTML.replaceAll("devops@haproxy-01:~$", "<span class='language-shell-user'>devops@haproxy-01:~$</span>");
            outputHTML = outputHTML.replaceAll("devops@haproxy-02:~$", "<span class='language-shell-user'>devops@haproxy-02:~$</span>");

            // language-shell-root
            outputHTML = outputHTML.replaceAll("root@haproxy-01:/home/devops#", "<span class='language-shell-root'>root@haproxy-01:/home/devops#</span>");

            // language-powershell-user
            outputHTML = outputHTML.replaceAll("PS C:\\Users\\Fatih Tatoğlu&gt;", "<span class='language-powershell-user'>PS C:\\Users\\Fatih Tatoğlu&gt;</span>");

            e.innerHTML = outputHTML;
        });

        page.content = html.toString();
    }
}

module.exports = CodeVisitor;