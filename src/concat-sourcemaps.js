var fs = require('fs');
var path = require('path');
var sourcemap = require('source-map');
var SourceMapConsumer = sourcemap.SourceMapConsumer;
var SourceMapGenerator = sourcemap.SourceMapGenerator;
var SourceNode = sourcemap.SourceNode;

/**
 * Concatenate the given source files, additionally merging the corresponding source-map files.
 *
 * @param {string[]} src
 * @param {string} dest
 */
function concat(src, dest) {

    var sourceNodes = [/*SourceNode*/];
    for(var i = 0; i < src.length; i++) {
        var filepath = src[i];

        var filename = path.basename(filepath);
        var sourcemapFilepath = filepath + '.map';

        var sourceMap;
        if(fs.existsSync(sourcemapFilepath)) {
            sourceMap = new SourceMapConsumer(fs.readFileSync(sourcemapFilepath, 'utf-8'));
        } else {
            sourceMap = new SourceMapConsumer(JSON.stringify({
                version: 3,
                file: filename,
                sourceRoot: "",
                sources: [],
                names: [],
                mappings: ""
            }));
        }
        var sourceCode = fs.readFileSync(filepath, 'utf-8').toString();

        // remove all sourceMappingURL declarations - there can be only one, ours!
        // "//@ sourceMappingURL=filename.js.map"
        // "//# sourceMappingURL=filename.js.map"
        sourceCode = sourceCode.replace(/\/\/(@|#) sourceMappingURL=\S*/g, '');

        var node = SourceNode.fromStringWithSourceMap(sourceCode, sourceMap);
        sourceNodes.push(node);
    }

    var destFilename = path.basename(dest);
    var destFilepath = dest;

    // generate concatenated source plus source map
    var result = new SourceNode(null, null, null, sourceNodes).toStringWithSourceMap({ file: destFilename });

    // append sourceMappingURL
    var source = result.code + '//# sourceMappingURL=' + destFilename + '.map';

    // write everything to the fs
    fs.writeFileSync(destFilepath, source, 'utf-8');
    fs.writeFileSync(destFilepath + '.map', result.map, 'utf-8');
}

exports.concat = concat;
