const fs = require('fs');
const path = require('path');

exports.listDir = name => {
    return new Promise((resolve, error) => {
        fs.readdir(name, (err, files) => {
            if (err)
                error(err);
            else
                resolve(files);
        });
    });
};

exports.isDir = dir => fs.lstatSync(dir).isDirectory();

exports.allFilesInDir = async name => {
    let items = await this.listDir(name);
    let files = [];
    for (let item of items) {
        let fullPath = path.join(name, item);
        if (this.isDir(fullPath)) {
            files = files.concat(await this.allFilesInDir(fullPath));
        } else {
            files.push(fullPath);
        }
    }
    return files;
};

exports.fileSize = name => fs.statSync(name).size;

exports.createFile = (name, content) => {
    return new Promise((resolve, error) => {
        fs.writeFile(name, content, err => {
            if (err)
                error();
            else
                resolve();
        });
    });
};

exports.deleteFile = file => fs.unlinkSync(file);

exports.createDirectory = name => {
    if (!fs.existsSync(name))
        fs.mkdirSync(name);
};

exports.deleteDirectory = name => {
    if (fs.existsSync(name)) {
        fs.readdirSync(name).forEach(file => {
            const curPath = name + "/" + file;
            if (fs.lstatSync(curPath).isDirectory()) {
                deleteFolderRecursive(curPath);
            } else { // delete file
                fs.unlinkSync(curPath);
            }
        });
        fs.rmdirSync(name);
    }
};

exports.clearDirectory = name => {
    this.deleteDirectory(name);
    this.createDirectory(name);
};