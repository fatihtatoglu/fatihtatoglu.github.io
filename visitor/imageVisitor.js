"use strict";

const BasePageVisitor = require("enginaer/lib/pageVisitor");
const htmlParser = require("node-html-parser");
const marked = require("marked");

class ImageVisitor extends BasePageVisitor {

    constructor() {
        super("image");

        marked.setOptions({
            breaks: true,
            smartLists: true,
            headerIds: false
        });
    }

    visit(page) {
        let html = htmlParser.parse(page.content);
        let images = html.querySelectorAll("p img");
        if (images.length === 0) {
            return;
        }

        let figure = `<figure>
        <img src='{0}' alt='{1}'>
        <figcaption>{2}</figcaption>
        </figure>`;

        images.forEach((img) => {
            let imageHTML = figure.replace("{0}", img.getAttribute("src"));
            imageHTML = imageHTML.replace("{1}", img.getAttribute("alt"));

            let title = img.getAttribute("title");
            if (title) {
                title = marked.parse(title);
            }

            imageHTML = imageHTML.replace("{2}", title);

            img.parentNode.replaceWith(imageHTML);
        });

        page.content = html.toString();
    }
}

module.exports = ImageVisitor;