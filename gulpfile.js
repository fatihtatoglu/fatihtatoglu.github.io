const { series, parallel, src, dest } = require("gulp");

const Enginaer = require("enginaer");
const anchorRewriter = require("gulp-html-anchor-rewriter");

const clean = require("gulp-clean");
const replace = require("gulp-replace");
const htmlmin = require("gulp-htmlmin");
const versionNumber = require("gulp-version-number");
const sitemap = require("gulp-sitemap");
const minify = require("gulp-minify");

const os = require("os");

var outputPath = "./dist/";

var baseUrl;
if (os.platform() === "win32" || os.hostname() === "mint-development") {
    baseUrl = "http://localhost:8080/";
}
else {
    baseUrl = "https://blog.tatoglu.net/";
}

const config = {
    "base": __dirname,
    "page": {
        "path": ["./page/**/*.md", "./post/**/*.md"],
        "visitor": "./visitor/*.js",
        "marked": {
            breaks: true,
            smartLists: true,
            headerIds: false,
            langPrefix: "hljs language-",
            highlight: function (code, lang) {
                const hljs = require("highlight.js");
                const language = hljs.getLanguage(lang) ? lang : "plaintext";

                return hljs.highlight(code, { language }).value;
            }
        },
    },
    "template": {
        "path": "./template/*.mustache",
        "helpers": "./helper/*.js"
    },
    "site-title-prefix": "Fatih Tatoğlu - ",
    "site-name": "Fatih Tatoğlu",
    "base-url": baseUrl
};

// Gulp Step 1 - Clean old files.
function cleanAll() {
    return src(outputPath, { allowEmpty: true })
        .pipe(clean({ force: true }));
}

// Gulp Step 2 - Copy all required assets.
function copyAssets() {
    return src(["./css/*.css", "./image/*.png", "./image/*.jpg", "./image/favicon/*", "./CNAME", "./.nojekyll", "./robots.txt", "./favicon.ico", "./sitemap.xsl"], { base: "./" })
        .pipe(dest(outputPath));
}

function jsMinify() {
    return src(["./js/*.js"], { base: "./" })
        .pipe(minify({
            ext: {
                src: "-debug.js",
                min: ".js"
            },
            compress: true,
            mangle: true
        }))
        .pipe(dest(outputPath));
}

// Gulp Step 3 - Generate Output
function generate() {
    const versionConfig = {
        "value": "%MDS%",
        "append": {
            "key": "v",
            "to": ["css", "js"],
        },
    };

    var enginær = new Enginaer(config);
    enginær.load();

    return enginær.generate()

        // replace heading for theme
        .pipe(replace("<h1>", "<header><h1>"))
        .pipe(replace("</h1>", "</h1><button>#</button></header>"))

        // replace fo4 image path
        .pipe(replace(/\.\.\/\.\.\/image/g, "image"))
        .pipe(replace(/\.\.\/image/g, "image"))

        // compress html file
        .pipe(htmlmin({ collapseWhitespace: true }))

        // add version number for css and js files for preventing cache
        .pipe(versionNumber(versionConfig))

        // add rel and target for outgoing links
        .pipe(anchorRewriter({
            keyword: [baseUrl, "./", "javascript:;", "index.html"],
            rel: "noopener noreferrer",
            target: "_blank",
            whiteList: true
        }))

        .pipe(dest(outputPath));
}

function generateSiteMap() {

    let getHref = function (siteUrl, file, lang, _loc) {
        if (lang === "en") {
            return siteUrl + lang + "/" + file.replace("tr/", "").replace("en/", "");
        }
        else {
            return siteUrl + file.replace("tr/", "").replace("en/", "");
        }
    };

    let dates = {
        "_hakkimda": "2022-05-11",
        "_index": "2022-03-14",
        "_kendime-notlar_blog-yazmak": "2022-03-20",
        "_kendime-notlar_index": "2022-04-08",
        "_kocluk_bilmemenin-gucu": "2022-05-21",
        "_kocluk_degerler": "2022-05-16",
        "_kocluk_index": "2022-04-07",
        "_kocluk_survey-core-values": "2022-05-19",
        "_projeler_enginaer": "2022-03-24",
        "_projeler_gulp-html-link-duzenleyicisi": "2022-04-08",
        "_projeler_index": "2022-04-07",
        "_projeler_turboc-blog-temasi": "2022-03-22",
        "_kendime-notlar_swot-analizi": "2022-05-24T15:34:54Z",
        "_kocluk_bireysel-swot-analizi": "2022-05-28T15:23:33Z",
        "_kocluk_bir-yoneticinin-yolu": "2022-05-28T16:47:14Z",
        "_kendime-notlar_haproxy": "2022-05-28T18:49:21Z",
        "_kendime-notlar_haproxy-varsayilan-statik-cevap": "2022-05-28T23:10:41Z",
        "_kendime-notlar_haproxy-ssl-sertifikasi-tanimlama": "2022-05-28T23:26:58Z"
    };

    let getLastMod = function (file) {
        var fileName = file.path.replace(file.base, "").replace(file.extname, "").replace(/\\/g, "_").replace(/\//g, "_");
        return dates[fileName];
    };

    return src(outputPath + "**/*.html")
        .pipe(sitemap({
            changefreq: "weekly",
            siteUrl: baseUrl,
            images: true,
            hreflang: [
                { lang: "tr", getHref },
                { lang: "en", getHref }
            ],
            lastmod: getLastMod
        }))
        .pipe(replace("<urlset", "<?xml-stylesheet type=\"text/xsl\" href=\"" + baseUrl + "sitemap.xsl\"?> <urlset"))
        .pipe(replace(/\n/g, ""))
        .pipe(replace(/\r/g, ""))
        .pipe(replace("  ", ""))
        .pipe(dest(outputPath));
}

exports.default = series(
    cleanAll,
    parallel(copyAssets, jsMinify),
    generate,
    generateSiteMap
);