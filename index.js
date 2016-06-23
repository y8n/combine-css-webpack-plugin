var _ = require('lodash');
var path = require('path');
var fs = require('fs');
var CleanCSS = require('clean-css');

function CSSCombPlugin(opts) {
    this.options = opts;
}
CSSCombPlugin.prototype.apply = function (compiler) {
    var self = this;
    var options = self.options;
    var cssContent;
    compiler.plugin('make', function (compilation, callback) {
        if (!options.source) {
            return callback();
        }
        cssContent = self.cssCombFile(options.source);
        callback();
    });
    compiler.plugin('emit', function (compilation, callback) {
        var relativePath = path.relative(compilation.options.output.path, options.target);
        if(options.useMinify){
            cssContent = new CleanCSS().minify(cssContent).styles;
        }
        compilation.assets[relativePath] = {
            source: function () {
                return cssContent;
            },
            size: function () {
                return cssContent.length;
            }
        };

        callback();
    });
};
CSSCombPlugin.prototype.cssCombFile = function (sourcePath) {
    var commetReg = /\/\*\*?([^]+?)\*\//g;
    var requireReg = /@require\s+(.+)\s/g;
    var fileContent = fs.readFileSync(sourcePath, 'utf8');
    var match, requireMatch, filepath;
    var requireContent = '';
    while ((match = commetReg.exec(fileContent))) {
        while ((requireMatch = requireReg.exec(match[0]))) {
            filepath = path.resolve(path.dirname(sourcePath), requireMatch[1]);
            try {
                requireContent += fs.readFileSync(filepath, 'utf8') + '\n';
            } catch (e) {
            }
        }
    }
    return requireContent + fileContent;
};
module.exports = CSSCombPlugin;