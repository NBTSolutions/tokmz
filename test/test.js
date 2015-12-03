var tokmz = require('../src/tokmz.js');
var fs = require('fs');
var logger = require('log4js').getLogger();

var chai = require('chai');
var expect = chai.expect;

describe('Testing tokmz()', function() {

    var fileName = 'test/result/test.kmz';

    var pointJson = {
        'type': 'FeatureCollection',
        'features': [{
            'type': 'Feature',
            'geometry': {"type":"Point","coordinates":[-70.2532459795475,43.6399758607149]},
            'properties': {
              'id': 1,
              'Name': 'test'
            }
        }]
    };

    var pointSymbol = {
        color: '#2dcd86',
        alpha: 255,
        scale: 1,
        icon: 'http://maps.google.com/mapfiles/kml/shapes/square.png'
    };

    var polygonJson= {
        'type': 'FeatureCollection',
        'features': [{
            'type': 'Feature',
            'geometry': {"type":"Polygon","coordinates":[[[-70.2,43.6],
                                                          [-74.2,40.6],
                                                          [-62, 35],
                                                          [-70.2,43.6]]]},
            'properties': {
              'id': 1,
              'Name': 'test'
            }
        }]
    };

    var polygonSymbol = {
        color: '#000',
        fill: true,
        outline: false
    };

    var polylineJson = {
        'type': 'FeatureCollection',
        'features': [{
            'type': 'Feature',
            'geometry': {"type":"LineString","coordinates":[[-70.2,43.6], [-74.2,40.6]]},
            'properties': {
              'id': 1,
              'Name': 'test'
            }
        }]
    };

    var polylineSymbol = {
        color: '#2dcd86',
        width: 2
    };

    var layers = [
        { type: 'folder', name: 'test', content: [
            { type: 'layer', name: 'polygon_layer', features: polygonJson, options: {symbol: polygonSymbol, name: 'Name'} }
        ] },
        { type: 'layer', name: 'point_layer', features: pointJson, options: { symbol: pointSymbol, name: 'Name' } },
        { type: 'layer', name: 'polyline_layer', features: polylineJson, options: { symbol: polylineSymbol, name: 'Name'} }
    ];

    it('should save the object array as a KML file with Q.', function() {
        tokmz(layers, fileName, function(err) {
            if(err) { console.error(err); }

            expect(fs.statSync(fileName)).to.exist;
        })
    });

});
