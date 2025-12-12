import commandLineArgs from "command-line-args";
import commandLineUsage from "command-line-usage";

function getCliOptionDefinitions() {
    /**@type commandLineArgs.OptionDefinition[] */
    const optionDefinitions = [
        {
            name: "help",
            alias: "h",
            type: Boolean,
            description: "Show command line help."
        },
        {
            name: "version",
            alias: "v",
            type: Boolean,
            description: "Print version information."
        },
        {
            name: "init",
            type: Boolean,
            description: "Initialize the project structure with sample content."
        },
        {
            name: "build",
            type: Boolean,
            description: "Build the project and prepare the deployable artifact."
        }
    ];

    return optionDefinitions;
}

function parseArgv() {
    const optionDefinitions = getCliOptionDefinitions();

    /** @type commandLineArgs.CommandLineOptions */
    const options = commandLineArgs(optionDefinitions);

    return options;
}

function help() {
    const optionDefinitions = getCliOptionDefinitions();

    /** @type commandLineUsage.Section */
    const commandSections = [{
        header: "Enginær",
        content: "A minimal, dependency-light static site generator."
    },
    {
        header: "Options",
        optionList: optionDefinitions
    },
    {
        header: "Project Details",
        content: "Project Home: {underline https://tatoglu.net/project/enginær}"
    },
    {
        content: "GitHub: {underline https://github.com/fatihtatoglu/enginær}"
    }];

    const usage = commandLineUsage(commandSections);
    return usage;
}

function version(version_number) {
    const version = commandLineUsage({
        header: "Enginær v" + version_number,
        content: "A minimal, dependency-light static site generator.",
    });

    return version;
}

const API = {
    options: parseArgv(),
    help: help,
    version: version
};

export default API;