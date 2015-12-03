'use strict';

var et = require('elementtree');
var tokml = require('gtran-kml');
var JSZip = require('jszip');
var fs = require('fs');

module.exports = function(layers, fileName, callback) {
    var kmlList = [];
    generateKmls('doc', layers, kmlList);

    var zip = JSZip();
    var root = et.Element('kml');
    root.attrib.xmlns = 'http://www.opengis.net/kml/2.2';

    var doc = et.SubElement(root, 'Document');

    kmlList.forEach(function(kml) {
        var fullPath = kml.directory + '/' + kml.fileName + '.kml';

        zip.file(fullPath, kml.data);

        var folderNode = getFolder(doc, kml.directory.substring(4));
        if(!folderNode) {
            folderNode = createFolder(doc, kml.directory.substring(4));
        }

        var networkLink = et.SubElement(folderNode, 'NetworkLink');

        var name = et.SubElement(networkLink, 'name');
        name.text = kml.fileName;

        var link = et.SubElement(networkLink, 'Link');
        var href = et.SubElement(link, 'href');
        href.text = fullPath;
    });

    var xmlTree = new et.ElementTree(root);

    zip.file('doc.kml', xmlTree.write());
    var buffer = zip.generate({type:"nodebuffer"});

    if(fileName) {
        fs.writeFile(fileName, buffer, function(err) {
            if(callback) { callback(err, fileName); }
            return fileName;
        });
    } else {
        if(callback) { callback(null, buffer); }
        return buffer;
    }
};

function generateKmls(filePath, layers, kmlList) {
    layers.forEach(function(item) {
        var layerSymbol, featureName;

        if (item.options) {
            layerSymbol = item.options.symbol;
            featureName = item.options.name;
        }

        if(item.type === 'layer') {
            tokml.fromGeoJson(item.features, null, {
                symbol: layerSymbol,
                name: featureName
            }, function(err, file) {
                if(err) {
                    console.error('error generating kml', err);
                    return;
                }

                var layerObject = {
                    directory: filePath,
                    fileName: item.name,
                    data: file
                };

                kmlList.push(layerObject);
            });
        } else {
            generateKmls(filePath + '/' + item.name, item.content, kmlList);
        }
    });
}

function getFolder(node, path) {
    if(!path) { return node; }

    var xpath = '.';
    path.split('/').forEach(function(folder) {
        xpath += "Folder[@name='" + folder + "']";
    });

    return node.find(xpath);
}

function createFolder(root, path) {
    var folders = path.split('/');

    var node = root;
    for(var i = 0, maxLen = folders.length; i < maxLen; i++) {
        var matchNode = node.find("./Folder[@name='" + folders[i] + "']");

        if(!matchNode) {
            matchNode = et.SubElement(node, 'Folder');
            matchNode.attrib.name = folders[i];

            var name = et.SubElement(matchNode, 'name');
            name.text = folders[i];
        }

        node = matchNode;
    }

    return node;
}
