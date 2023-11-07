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

const outputPath = "./dist/";

let baseUrl;
if (os.platform() === "win32" || os.hostname() === "fth-dev") {
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
            headerIds: false
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
    return src(["./css/*.css", "./image/*.png", "./image/*.jpg", "./image/favicon/*", "./CNAME", "./.nojekyll", "./robots.txt", "./sitemap.xsl"], { base: "./" })
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

    let enginær = new Enginaer(config);
    enginær.load();

    return enginær.generate()

        // replace for image path
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
        // Turkish
        "_about-me": "2023-10-27T00:00:00Z",
        "_index": "2023-10-27T00:00:00Z",
        "_coaching_a-managers-path": "2022-05-28T16:47:14Z",
        "_coaching_core-values-survey": "2022-05-19T15:30:00Z",
        "_coaching_core-values": "2023-10-27T00:00:00Z",
        "_coaching_index": "2023-10-27T00:00:00Z",
        "_coaching_personal-swot": "2022-05-28T15:23:33Z",
        "_coaching_power-of-unknowing": "2022-05-21T23:15:00Z",
        "_coaching_social-loafing": "2022-06-23T09:22:56Z",
        "_coaching_team-cycle": "2022-06-23T12:40:14Z",
        "_coaching_team-group": "2022-06-23T12:00:33Z",
        "_lab_index": "2023-10-27T00:00:00Z",
        "_my-notes_index": "2023-10-27T00:00:00Z",
        "_my-notes_swot-analysis-what": "2023-10-27T00:00:00Z",
        "_my-notes_writing-blog": "2023-10-27T00:00:00Z",
        "_lab_environment_auto-update": "2023-10-27T00:00:00Z",
        "_lab_environment_dev-setup-mint": "2023-10-27T21:44:00Z",
        "_lab_environment_hyperv": "2023-10-27T21:37:00Z",
        "_lab_environment_setup": "2023-10-27T00:00:00Z",
        "_lab_haproxy_cluster": "2023-10-27T00:00:00Z",
        "_lab_haproxy_default-routing": "2023-10-27T00:00:00Z",
        "_lab_haproxy_setup": "2023-10-27T00:00:00Z",
        "_lab_haproxy_ssl-certificate": "2023-10-27T00:00:00Z",
        "_my-notes_republic-100th-anniversary":"2023-10-29T12:37:49Z",

        // English
        "_en_about-me": "2023-10-27T00:00:00Z",
        "_en_index": "2023-10-27T00:00:00Z",
        "_en_coaching_a-managers-path": "2023-10-27T00:00:00Z",
        "_en_coaching_core-values-survey": "2023-10-27T00:00:00Z",
        "_en_coaching_core-values": "2023-10-27T00:00:00Z",
        "_en_coaching_index": "2023-10-27T00:00:00Z",
        "_en_coaching_personal-swot": "2023-10-27T00:00:00Z",
        "_en_coaching_power-of-unknowing": "2023-10-27T00:00:00Z",
        "_en_coaching_social-loafing": "2023-10-27T00:00:00Z",
        "_en_coaching_team-cycle": "2023-10-27T00:00:00Z",
        "_en_coaching_team-group": "2023-10-27T00:00:00Z",
        "_en_lab_index": "2023-10-27T00:00:00Z",
        "_en_my-notes_index": "2023-10-27T00:00:00Z",
        "_en_my-notes_swot-analysis-what": "2023-10-27T00:00:00Z",
        "_en_my-notes_writing-blog": "2023-10-27T00:00:00Z",
        "_en_lab_environment_auto-update": "2023-10-27T00:00:00Z",
        "_en_lab_environment_dev-setup-mint": "2023-10-27T21:44:00Z",
        "_en_lab_environment_hyperv": "2023-10-27T21:37:00Z",
        "_en_lab_environment_setup": "2023-10-27T00:00:00Z",
        "_en_lab_haproxy_cluster": "2023-10-27T00:00:00Z",
        "_en_lab_haproxy_default-routing": "2023-10-27T00:00:00Z",
        "_en_lab_haproxy_setup": "2023-10-27T00:00:00Z",
        "_en_lab_haproxy_ssl-certificate": "2023-10-27T00:00:00Z",
        "_en_my-notes_republic-100th-anniversary":"2023-10-29T12:37:49Z"
    };

    let getLastMod = function (file) {
        let fileName = file.path.replace(file.base, "").replace(file.extname, "").replace(/\\/g, "_").replace(/\//g, "_");

        console.log(fileName);

        return dates[fileName];
    };

    return src(outputPath + "**/*.html")
        .pipe(sitemap({
            changefreq: "monthly",
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
