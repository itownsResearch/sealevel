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

globeView.addLayer(DARK);
globeView.addLayer(WORLD_DTM);
globeView.addLayer(IGN_MNT_HR);
//globeView.addLayer(Ortho);
//globeView.addLayer(bati);
globeView.addLayer(batiRem);





console.log(globeView);

/*************************************** WATER A.D ***********************************************/
// Here we create the Tile geometry for the water using a globe with specific vertex displacement
let object3d = new THREE.Object3D();
const globeWater = itowns.createGlobeLayer('globeWater', { object3d }, { options: { segments: 2 } });
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

globeView.addEventListener(itowns.GLOBE_VIEW_EVENTS.GLOBE_INITIALIZED, () => {
    globeView.controls.minDistance = 50;  // Allows the camera to get closer to the ground
    console.log('globe initialized ?', globeView);
    console.log(globeView.referenceCrs);

    menuGlobe.addImageryLayersGUI(globeView.getLayers(l => l.type === 'color'));
    menuGlobe.addGeometryLayersGUI(globeView.getLayers(l => l.type === 'geometry' && l.id != 'globe'));

    let flagLine = false;
    menuGlobe.gui.add({ waterLevel: 0.1 }, 'waterLevel').min(0.1).max(20).step(0.05).onChange((
        function updateWaterLevel(value) {
            //let lay = globeView.getLayers(l => l.id == 'WFS Buildings')[0];
            //console.log('lay', lay);

            adjustAltitude(value);
            shadMat.uniforms.waterLevel.value = value;
            shadMatRem.uniforms.waterLevel.value = value;

            if (value >= 6.5 && !flagLine) {
                let line = createLine(mairies["bati_remarquable.28316"]['pos'], mairies["bati_remarquable.159618"]['pos'], 'dashedLine');
                globeView.scene.add(line);
                console.log(globeView.scene);
                flagLine = true;

            }
            if (value <= 6.5 && flagLine) {
                //globeView.scene.re
                let selectedObject = globeView.scene.getObjectByName('dashedLine');
                globeView.scene.remove(selectedObject);
                flagLine = false;
            }
            globeView.notifyChange(true);

        }));
    adjustAltitude(0.1);
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
                htmlInfo.innerHTML += '<p class="beware">' + mairies[properties['id']]['text'] + '</p>'
                let coords = globeView.controls.pickGeoPosition(globeView.eventToViewCoords(event));
                console.log('coords', coords.as('EPSG:4978').xyz());
                console.log('geom ', geometry[id]);

                //console.log(mairies[properties['id']]['text']);
            }
        }
    }
}
