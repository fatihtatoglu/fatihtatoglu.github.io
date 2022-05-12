const fs = require("fs");
const directoryPath = "./css";

fs.access(directoryPath, (error) => {
    if (error) {
        fs.mkdirSync(directoryPath);
    }

    fs.createReadStream("./node_modules/turboc_blog_theme.css/main.css")
        .pipe(fs.createWriteStream(directoryPath + "/main.css"));
});