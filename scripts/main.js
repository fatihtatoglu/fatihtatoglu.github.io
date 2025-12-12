import _cli from "./cli.js";
import _log from "./log.js";
import _build from "./build.js";

const VERSION = "0.0.1";

(async function main() {
    if (_cli.options.version) {
        console.log(_cli.version(VERSION));
    }
    else if (_cli.options.build) {
        await _build.execute();
    }
    else {
        console.log(_cli.help());
    }
})();
