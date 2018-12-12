/* global itowns, document */
// eslint-disable-next-line no-unused-vars
import * as itowns from 'itowns'

export function ToolTip(viewer, tooltip, currentWaterLevel, scenario, precisionPx) {
    var mouseDown = 0;
    //var layers = viewer.getLayers(function _(l) { return l.source && l.source.protocol === 'file'; });
    var layers = viewer.getLayers(function _(l) { return l.id === 'iris'; });

    document.body.onmousedown = function onmousedown() {
        ++mouseDown;
    };
    document.body.onmouseup = function onmouseup() {
        --mouseDown;
    };

    function buildToolTip(geoCoord, e) {      
        var visible = false;
        var precision = viewer.controls.pixelsToDegrees(precisionPx || 5);
        var i = 0;
        var p = 0;
        var layer;
        var result;
        var polygon;
        var id;
        var stroke
        var iris;
        var symb;
        let communes = scenario.communes;        
        let getColor = (val, h) => { 
            let diff = h - val;
            if (diff > 0)
                return 'green';
            else if (diff == 0)
                return 'yellow';
            else if (-0.5 < diff && diff < 0)
                return 'orangered';
            return 'red'
        };

        tooltip.innerHTML = '';
        tooltip.style.display = 'none';
        if (geoCoord) {
            visible = false;
            // convert degree precision
            layer = layers[i];
            for (i = 0; i < layers.length; i++) {
                result = itowns.FeaturesUtils.filterFeaturesUnderCoordinate(
                    geoCoord, layer.source.parsedData, precision);

                for (p = 0; p < result.length; p++) {
                    visible = true;
                    if (result[p].type === 'multipolygon') {
                        polygon = result[p].geometry;
                        stroke = polygon.properties.stroke || layer.style.stroke;
                        iris = polygon.properties.iris;
                        symb = '<span id=' + iris + ' >&#9724</span>';
                        tooltip.innerHTML += symb + '  <b>' + polygon.properties.nom_iris + '</b> <br />';
                        tooltip.innerHTML += '<li>Population  : ' + polygon.properties.p15_pop + '</li>'
                        tooltip.innerHTML += '<li>- de 15 ans : ' + polygon.properties.p15_pop0014 + '</li>'
                        tooltip.innerHTML += '<li>+ de 65 ans : ' + polygon.properties.p15_pop65p + '</li>'
                        document.getElementById(iris).style.color = getColor(currentWaterLevel.val, communes[iris].hauteur_dysf);
                        ++id;
                    } 
                }
            }
            if (visible) {
                tooltip.style.left = viewer.eventToViewCoords(e).x + 'px';
                tooltip.style.top = viewer.eventToViewCoords(e).y + 'px';
                tooltip.style.display = 'block';
            }
        }
    }

    function readPosition(e) {
        if (!mouseDown) {
            buildToolTip(viewer.controls.pickGeoPosition(viewer.eventToViewCoords(e)), e);
        } else {
            tooltip.style.left = viewer.eventToViewCoords(e).x + 'px';
            tooltip.style.top = viewer.eventToViewCoords(e).y + 'px';
        }
    }

    function pickPosition(e) {
        buildToolTip(viewer.controls.pickGeoPosition(viewer.eventToViewCoords(e)), e);
    }

    //document.addEventListener('mousemove', readPosition, false);
    document.addEventListener('mouseclick', readPosition, false);
    document.addEventListener('mousedown', pickPosition, false);
}
