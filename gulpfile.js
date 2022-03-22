const { series, parallel, src, dest } = require("gulp");
const clean = require("gulp-clean");
const replace = require("gulp-replace");
const enginær = require("enginaer");
const htmlmin = require("gulp-htmlmin");
const versionNumber = require("gulp-version-number");
const sitemap = require("gulp-sitemap");
const anchorRewriter = require("gulp-html-anchor-rewriter");

var output = "./dist/";
var siteUrl = "https://blog.tatoglu.net/";

enginær.setOptions({
    "output": output,

    "asset": {
        "base": "./",
        "path": [
            "./css/*.css",
            "./js/*.js",
            "./image/*.png",
            "./image/*.jpg",
            "./image/favicon/*",
            "./CNAME",
            "./.nojekyll",
            "./robots.txt"
        ]
    },

    "page": {
        "path": [
            "./page/*.md",
            "./post/**/*.md"
        ],
        "enrichers": [
            {
                "key": "title",
                "type": "raw",
                "handler": function (fileRawContent) {
                    var titleRegex = /<h1>(.*)<\/h1>/g;
                    var titleResult = titleRegex.exec(fileRawContent);

                    return titleResult[1];
                }
            },
            {
                "key": "tags",
                "type": "metadata",
                "handler": function (value) {
                    return value.split().map(v => {
                        return v.replace(/\_/g, " ");
                    });
                }
            },
            {
                "key": "date",
                "type": "metadata",
                "handler": function (value) {
                    return new Date(Date.parse(value));
                }
            },
            {
                "sourceKey": "date",
                "targetKey": "publish-date",
                "type": "generate",
                "handler": function (date) {
                    return date.toISOString();
                }
            },
            {
                "sourceKey": "date",
                "targetKey": "publish-date-localformat",
                "type": "generate",
                "handler": function (date, config) {
                    return date.toLocaleDateString(config["site-culture"]);
                }
            },
            {
                "sourceKey": "date",
                "targetKey": "publish-date-title",
                "type": "generate",
                "handler": function (date, config) {
                    return date.toString(config["site-culture"]);
                }
            },
            {
                "type": "menu",
                "handler": function (metadata, menu, config) {
                    var title = "-";
                    var menuItem = {
                        "title": title,
                        "order": 0,
                        "children": [
                            {
                                "element-id": "btnTheme",
                                "title": "Tema Ayarları"
                            }
                        ]
                    };

                    menu[title] = menuItem;
                }
            },
            {
                "type": "menu",
                "handler": function (metadata, menu) {

                    var layout = metadata.get("layout");
                    var title = metadata.get("title");
                    if (layout !== "page" && layout !== "index") {
                        return;
                    }

                    var menuGroupName = metadata.get("group");
                    if (menuGroupName) {

                        if (!menu[menuGroupName]) {
                            menu[menuGroupName] = {
                                title: menuGroupName,
                                "order": 999,
                                "children": []
                            };
                        }

                        var menuGroup = menu[menuGroupName];

                        var menuItem = {
                            "title": title,
                            "url": metadata.get("permalink"),
                            "order": metadata.get("order")
                        };

                        if (metadata.get("published") !== "true") {
                            menuItem["disabled"] = true;
                            delete menuItem["url"];
                        }

                        menuGroup["children"].push(menuItem);
                        menuGroup["children"] = menuGroup["children"].sort(function (a, b) {
                            return a["order"] - b["order"];
                        });


                        menu[menuGroupName] = menuGroup;
                    }
                    else {
                        var menuItem = {
                            "title": title,
                            "url": metadata.get("permalink"),
                            "order": metadata.get("order")
                        };

                        if (metadata.get("published") !== "true") {
                            menuItem["disabled"] = true;
                            delete menuItem["url"];
                        }

                        menu[title] = menuItem;
                    }
                }
            }
        ]
    },

    "template": {
        "path": "./template/*.mustache",
        "helpers": {
            "separator": function () {
                return this.role === "separator";
            },
            "hasChildren": function () {
                return this.children && this.children.length > 0;
            },
            "url": function () {
                if (this.url) {
                    return this.url;
                }

                return "javascript:;";
            },
            "isPost": function () {
                return this.layout === "post";
            }
        }
    },

    "config": {
        "site-language": "tr",
        "site-culture": "tr-TR",
        "site-title-prefix": "",
        "site-name": "Fatih Tatoğlu",
        "base-url": siteUrl
    },

    "marked": {
        breaks: true,
        smartLists: true,
        headerIds: false
    }
});

// Gulp Step 1 - Clean old files.
function cleanAll() {
    return src([enginær.outputPath], { allowEmpty: true })
        .pipe(clean({ force: true }));
}

// Gulp Step 2 - Copy all required assets.
function copyAssets() {
    return src(enginær.assetPath, { base: enginær.assetBasePath })
        .pipe(dest(enginær.outputPath));
}

// Gulp Step 3 - Add Pages
function loadPages() {
    return src(enginær.pagePath)
        .pipe(enginær.setPages());
}

// Gulp Step 4 - Add Templates
function loadTemplates() {
    return src(enginær.templatePath)
        .pipe(enginær.setTemplates());
}

// Gulp Step 5 - Generate Output
function generate() {
    const versionConfig = {
        'value': '%MDS%',
        'append': {
            'key': 'v',
            'to': ['css', 'js'],
        },
    };

    return enginær.generate()

        // replace heading for theme
        .pipe(replace("<h1>", "<header><h1>"))
        .pipe(replace("</h1>", "</h1></header>"))

        // replace fo4 image path
        .pipe(replace(/..\/..\/..\/image\//g, "image/"))

        // compress html file
        .pipe(htmlmin({ collapseWhitespace: true }))

        // add version number for css and js files for preventing cache
        .pipe(versionNumber(versionConfig))

        // add rel and target for outgoing links
        .pipe(anchorRewriter({
            target: "_new"
        }))
        .pipe(anchorRewriter({
            keyword: "twitter.com",
            rel: "nofollow"
        }))
        .pipe(anchorRewriter({
            keyword: "instagram.com",
            rel: "nofollow"
        }))

        .pipe(dest(output));
}

function generateSiteMap() {
    return src(output + "**/*.html")
        .pipe(sitemap({
            siteUrl: siteUrl,
            changefreq: "weekly",
            images: true
        }))
        .pipe(dest(output));
}

exports.default = series(
    cleanAll,

    parallel(copyAssets, loadPages, loadTemplates),

    generate,

    generateSiteMap
);