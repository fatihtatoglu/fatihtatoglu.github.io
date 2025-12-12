import _cli from "./cli.js";
import _log from "./log.js";
import _build from "./build.js";
import _npm from "./npm.js";
import _io from "./io.js";

const VERSION = "0.0.1";

const __filename = _io.url.toPath(import.meta.url);
const __dirname = _io.path.name(__filename);
const ROOT_DIR = _io.path.combine(__dirname, "..");
const SRC_DIR = _io.path.combine(ROOT_DIR, "src");
const DIST_DIR = _io.path.combine(ROOT_DIR, "dist");
const BUILD_SCRIPT = _io.path.combine(ROOT_DIR, "scripts", "build.js");

function printHelp() {
    console.log(_cli.help());
}

async function runWatch() {
    _log.info("Watching src for changes and rebuilding...");
    
    await _npm.watch({
        scriptPath: BUILD_SCRIPT,
        watchPath: SRC_DIR,
        cwd: ROOT_DIR
    });
}

async function runDev() {
    await _build.execute();
    _log.info("Serving dist on http://localhost:3000");

    await _npm.serve({
        distPath: DIST_DIR,
        port: 3000,
        cwd: ROOT_DIR
    });
}

(async function main() {
    if (_cli.options.help) {
        printHelp();
    }
    else if (_cli.options.version) {
        console.log(_cli.version(VERSION));
    }
    else if (_cli.options.watch) {
        await runWatch();
    }
    else if (_cli.options.dev) {
        await runDev();
    }
    else if (_cli.options.build) {
        await _build.execute();
    }
    else {
        printHelp();
    }
})();
