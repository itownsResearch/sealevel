import * as itowns from 'itowns'
import GuiTools from './gui/GuiTools'

import binarySearch from './utils/search'
import createLine from './line'
import mairies from '../data/mairies'

import * as THREE from 'three';  // We need THREE (no more exposed by itowns?)

import IGN_MNT_HR from './layers/IGN_MNT_HIGHRES'
import IGN_MNT from './layers/IGN_MNT'
import DARK from './layers/DARK'
import Ortho from './layers/Ortho'

import WORLD_DTM from './layers/WORLD_DTM'

import { bati, shadMat } from './layers/bati'
import { batiRem, shadMatRem } from './layers/bati_remarquable'


// around Bordeaux
let positionOnGlobe = { longitude: -0.525, latitude: 44.85, altitude: 250 };
let coords = { lon: -0.650, lat: 44.905, deltaLon: 0.160, deltaLat: -0.110 };
// île de Ré
positionOnGlobe = { longitude: -1.412, latitude: 46.208, altitude: 10000 };
coords = { lon: -1.563, lat: 46.256, deltaLon: 0.300, deltaLat: -0.150 };

function adjustAltitude(value) {
    // A.D Here we specify the Z displacement for the water
    var displacement = value;
    globeView.setDisplacementZ(displacement);
    globeView.notifyChange();
    console.log(displacement);

}

const viewerDiv = document.getElementById('viewerDiv');



const htmlInfo = document.getElementById('info');
// Options for segments in particular is not well handled
// We modified some code in itowns and created an issue https://github.com/iTowns/itowns/issues/910
let options = { segments: 128 }; // We specify a more refined tile geomtry than default 16*16
const globeView = new itowns.GlobeView(viewerDiv, positionOnGlobe, options);
const menuGlobe = new GuiTools('menuDiv', globeView)

globeView.addLayer(Ortho);
globeView.addLayer(DARK);
globeView.addLayer(WORLD_DTM);
globeView.addLayer(IGN_MNT_HR);
//globeView.addLayer(bati);
globeView.addLayer(batiRem);

globeView.addLayer({
    type: 'color',
    id: 'iso_1',
    name: 'iso_1',
    transparent: true,
    style: {
        //fill: 'orange',
        fillOpacity: 0.5,
        stroke: 'yellow',
    },
    source: {
        url: '../data/iso_alti_1.geojson',
        protocol: 'file',
        projection: 'EPSG:4326',
    },
});

globeView.addLayer({
    type: 'color',
    id: 'iso_5',
    name: 'iso_1',
    transparent: true,
    style: {
        //fill: 'orange',
        fillOpacity: 0.5,
        stroke: 'red',
        'stroke-width': 0.2
    },
    source: {
        url: '../data/iso_alti_5.geojson',
        protocol: 'file',
        projection: 'EPSG:4326',
    },
});

// let isos = new itowns.GeometryLayer('isos', new THREE.Group());
// isos.update = itowns.FeatureProcessing.update;
// isos.convert = itowns.Feature2Mesh.convert({
//     color: new THREE.Color(0xffffff),
//     });

// isos.source = {
//     url: '../data/iso_alti_0.geojson',
//     protocol: 'file',
//     projection: 'EPSG:4326',
//     format: 'application/json',
//     zoom: { min: 12, max: 12 },
// };

// globeView.addLayer(isos);
console.log(globeView);

/*************************************** WATER A.D ***********************************************/
// Here we create the Tile geometry for the water using a globe with specific vertex displacement
let object3d = new THREE.Object3D();
let segments = 128;
const globeWater = itowns.createGlobeLayer('globeWater', { object3d, segments});
globeWater.disableSkirt = true;
globeWater.opacity = 0.999; // So we can handle transparency check for nice shading
// We can maybe specify a more refined geometry for the water using segments option
// But as the we represent the water as flat (no wave, ellipsoid like) we can keep a light geomtry
// globe2.noTextureColor = new itowns.THREE.Color(0xd0d5d8);

// add globeWater to the view so it gets updated
itowns.View.prototype.addLayer.call(globeView, globeWater);
//globeWater.addLayer(IGN_MNT_HR);
//itowns.View.prototype.addLayer.call(globeView, IGN_MNT_HR, globeWater);

// UGLY WAY. NEED TO REUSE IGN_MNT_HR  (TODO: check already used ID problem)
// We give the water the information of the ground to make some rendering
// using water height and other stuff
// DONE, we change the ID, it should use the itowns cache so we share the data between globe and water
IGN_MNT_HR.id = 'HR_DTM_forWater';
itowns.View.prototype.addLayer.call(globeView, IGN_MNT_HR, globeWater);
// Ortho.id = 'Ortho_forWater';
// itowns.View.prototype.addLayer.call(globeView, Ortho, globeWater);
// itowns.Fetcher.json('src/layers/IGN_MNT_HIGHRES.json').then(function _(worldDTM) {
//     worldDTM.id = 'toto';
//     itowns.View.prototype.addLayer.call(globeView, worldDTM, globeWater);
// });
/*
itowns.Fetcher.json('./layers/JSONLayers/OPENSM.json').then(function _(osm) {
    itowns.View.prototype.addLayer.call(globeView, osm, globeWater);
});
*/
/**************************************************************************************************/
let time = 0;
globeView.addEventListener(itowns.GLOBE_VIEW_EVENTS.GLOBE_INITIALIZED, () => {
    globeView.controls.minDistance = 50;  // Allows the camera to get closer to the ground
    console.log('globe initialized ?', globeView);
    console.log(globeView.referenceCrs);

    menuGlobe.addImageryLayersGUI(globeView.getLayers(l => l.type === 'color'));
    menuGlobe.addGeometryLayersGUI(globeView.getLayers(l => l.type === 'geometry' && l.id != 'globe'));

    let flagLines = [false, false];
    menuGlobe.gui.add({ waterLevel: 0.1 }, 'waterLevel').min(0.1).max(6).step(0.04).onChange((
        function updateWaterLevel(value) {
            //let lay = globeView.getLayers(l => l.id == 'WFS Buildings')[0];
            //console.log('lay', lay);

            adjustAltitude(value);
            shadMat.uniforms.waterLevel.value = value;
            shadMatRem.uniforms.waterLevel.value = value;

            if (value >= 3.0 && !flagLines[0]) {
                let line1 = createLine(mairies["bati_remarquable.28316"]['pos'], mairies["bati_remarquable.159618"]['pos'], 'Line1');
                globeView.scene.add(line1);
                //console.log(globeView.scene);
                flagLines[0] = true;

            }
            if (value >= 5.5 && !flagLines[1]) {
                let line2 = createLine(mairies["bati_remarquable.159618"]['pos'], mairies["bati_remarquable.159593"]['pos'], 'Line2');
                globeView.scene.add(line2);
                //console.log(globeView.scene);
                flagLines[1] = true;

            }
            if (value < 3 && flagLines[0]) {
                //globeView.scene.re
                let selectedObject = globeView.scene.getObjectByName('Line1');
                globeView.scene.remove(selectedObject);
                flagLines[0] = false;
            }
            if (value < 5.5 && flagLines[1]) {
                //globeView.scene.re
                let selectedObject = globeView.scene.getObjectByName('Line2');
                globeView.scene.remove(selectedObject);
                flagLines[1] = false;
            }
            globeView.notifyChange(true);

        }));
    adjustAltitude(0.1);
    animateLines();
    window.addEventListener('mousemove', picking, false);
});


// from itowns examples, can't say I really understand what is going on...
function picking(event) {
    if (globeView.controls.isPaused()) {
        var htmlInfo = document.getElementById('info');
        var intersects = globeView.pickObjectsAt(event, 10, 'WFS Buildings Remarquable');
        var properties;
        var info;
        htmlInfo.innerHTML = ' ';
        if (intersects.length) {
            var geometry = intersects[0].object.feature.geometry;
            var idPt = (intersects[0].face.a) % (intersects[0].object.feature.vertices.length / 3);
            var id = binarySearch(geometry, idPt);
            properties = geometry[id].properties;

            Object.keys(properties).map(function (objectKey) {
                var value = properties[objectKey];
                var key = objectKey.toString();
                if (key[0] !== '_' && key !== 'geometry_name') {
                    info = value.toString();
                    htmlInfo.innerHTML += '<li><b>' + key + ': </b>' + info + '</li>';
                    //console.log('geom ', geometry[id]);                    
                }
            });
            if (properties['nature'] === 'Mairie') {
                // getting some bullshit info
                let coords = globeView.controls.pickGeoPosition(globeView.eventToViewCoords(event));
                console.log('coords', coords.as('EPSG:4978').xyz());
                htmlInfo.innerHTML += '<p class="beware">' + mairies[properties['id']]['text'] + '</p>'
                console.log('coords', coords.as('EPSG:4978').xyz());
                console.log('geom ', geometry[id]);

                //console.log(mairies[properties['id']]['text']);
            }
        }
    }
}

function animateLines(){
    //time = time / 1000;
    let line1 = globeView.scene.getObjectByName('Line1');
    let line2 = globeView.scene.getObjectByName('Line2');
    if (line1)
        line1.material.dashSize = Math.abs(Math.cosh(time)) * 50.0;
    if (line2)
        line2.material.dashSize = Math.abs(Math.sinh(time)) * 50.0;
    time += 0.005;
    //console.log("lol", time);
    if (time > 3/*Math.PI/2*/){
        time = 0;//-Math.PI/2;
    }
    globeView.notifyChange(true);
    requestAnimationFrame(animateLines);
};