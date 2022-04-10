const { series, parallel, src, dest } = require("gulp");
const clean = require("gulp-clean");
const replace = require("gulp-replace");
const Enginaer = require("enginaer");
const htmlmin = require("gulp-htmlmin");
const versionNumber = require("gulp-version-number");
const sitemap = require("gulp-sitemap");
const anchorRewriter = require("gulp-html-anchor-rewriter");
const os = require("os");

var outputPath = "./dist/";

var siteUrl;
if (os.platform() === "win32") {
//     siteUrl = "file:///F:/workspace/fatihtatoglu/fatihtatoglu.github.io/dist/";
// }
// else {
    siteUrl = "https://blog.tatoglu.net/";
}

console.log();

const config = {
    "base": __dirname,
    "page": {
        "path": ["./page/*.md", "./post/*.md"],
        "visitor": "./visitor/*.js",
        "marked": {
            breaks: true,
            smartLists: true,
            headerIds: false,
            langPrefix: "hljs language-",
            highlight: function (code, lang) {
                const hljs = require('highlight.js');
                const language = hljs.getLanguage(lang) ? lang : 'plaintext';

                return hljs.highlight(code, { language }).value;
            }
        },
    },
    "template": {
        "path": "./template/*.mustache",
        "helpers": "./template/*.js"
    },
    "site-language": "tr",
    "site-culture": "tr-TR",
    "site-title-prefix": "Fatih Tatoğlu - ",
    "site-name": "Fatih Tatoğlu",
    "base-url": siteUrl
};

// Gulp Step 1 - Clean old files.
function cleanAll() {
    return src(outputPath, { allowEmpty: true })
        .pipe(clean({ force: true }));
}

// Gulp Step 2 - Copy all required assets.
function copyAssets() {
    return src(["./css/*.css", "./js/*.js", "./image/*.png", "./image/*.jpg", "./image/favicon/*", "./CNAME", "./.nojekyll", "./robots.txt", "./favicon.ico"], { base: "./" })
        .pipe(dest(outputPath));
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

    var enginær = new Enginaer(config);
    enginær.load();

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
            keyword: [siteUrl, "./", "javascript:;", "index.html"],
            rel: "noopener noreferrer",
            target: "_blank",
            whiteList: true
        }))

        .pipe(dest(outputPath));
}

function generateSiteMap() {
    return src(outputPath + "**/*.html")
        .pipe(sitemap({
            siteUrl: siteUrl,
            images: true
        }))
        .pipe(dest(outputPath));
}

exports.default = series(
    cleanAll,
    parallel(copyAssets, generate),
    generateSiteMap
);