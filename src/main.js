import * as itowns from 'itowns'
import GuiTools from './gui/GuiTools'
import {createWaterPlaneMesh, modify_level} from './waterPlane'
import binarySearch from './utils/search'

import * as THREE from 'three';  // We need THREE (no more exposed by itowns?)

import IGN_MNT_HR from './layers/IGN_MNT_HIGHRES'
import IGN_MNT from './layers/IGN_MNT'
import DARK from './layers/DARK'
import Ortho from './layers/Ortho'

import WORLD_DTM from './layers/WORLD_DTM'

import {bati, shadMat} from './layers/bati'
import {batiRem, shadMatRem} from './layers/bati_remarquable'

//import roads from './layers/roads'
//import { getColor } from './layers/color'


// around Bordeaux
let positionOnGlobe = { longitude: -0.525, latitude: 44.85, altitude: 250 };
let coords = {lon: -0.650, lat: 44.905, deltaLon: 0.160, deltaLat: -0.110 };
// île de Ré
positionOnGlobe = { longitude: -1.412, latitude: 46.208, altitude: 10000 };
coords = {lon: -1.563, lat: 46.256, deltaLon: 0.300, deltaLat: -0.150 };

function adjustAltitude(value) {
    modify_level(globeView.water.geometry.getAttribute('position'), value);
    globeView.water.geometry.attributes.position.needsUpdate = true;
    globeView.water.updateMatrixWorld();

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
let options = {segments:128}; // We specify a more refined tile geomtry than default 16*16
const globeView = new itowns.GlobeView(viewerDiv, positionOnGlobe, options);
const menuGlobe = new GuiTools('menuDiv', globeView)

globeView.addLayer(DARK);
globeView.addLayer(WORLD_DTM);
globeView.addLayer(IGN_MNT_HR);
//globeView.addLayer(Ortho);
globeView.addLayer(bati);
globeView.addLayer(batiRem);
//globeView.addLayer(roads);
let plane = createWaterPlaneMesh(coords);



console.log(globeView);

/*************************************** WATER A.D ***********************************************/
// Here we create the Tile geometry for the water using a globe with specific vertex displacement
let  object3d = new THREE.Object3D();
const globeWater = itowns.createGlobeLayer('globeWater', { object3d });
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
   // globeView.scene.add(plane);
    globeView.water = plane;
    globeView.controls.minDistance = 50;  // Allows the camera to get closer to the ground
    console.log('globe initialized ?', globeView);
    console.log(globeView.referenceCrs);
    
    menuGlobe.addImageryLayersGUI(globeView.getLayers( l => l.type === 'color'));
    menuGlobe.addGeometryLayersGUI(globeView.getLayers(l => l.type === 'geometry' && l.id != 'globe'));

    menuGlobe.gui.add({ waterLevel: 0.0 }, 'waterLevel').min(0).max(20).step(0.05).onChange((
        function updateWaterLevel(value) {
            //let lay = globeView.getLayers(l => l.id == 'WFS Buildings')[0];
            //console.log('lay', lay);
            
            adjustAltitude(value);
            shadMat.uniforms.waterLevel.value = value;
            shadMatRem.uniforms.waterLevel.value = value;
            
            globeView.notifyChange(true);
        }));
    window.addEventListener('mousemove', picking, false);

});


// from itowns examples, can't say I really understand what is going on...
function picking(event) {
    if(globeView.controls.isPaused()) {
        var htmlInfo = document.getElementById('info');
        var intersects = globeView.pickObjectsAt(event, 3, 'WFS Buildings Remarquable');
        var properties;
        var info;
        htmlInfo.innerHTML = ' ';
        if (intersects.length) {
            var geometry = intersects[0].object.feature.geometry;
            console.log(intersects[0].object.feature);
            var idPt = (intersects[0].face.a) % (intersects[0].object.feature.vertices.length / 3);
            var id = binarySearch(geometry, idPt);
            properties = geometry[id].properties;

            Object.keys(properties).map(function (objectKey) {
                var value = properties[objectKey];
                var key = objectKey.toString();
                if (key[0] !== '_' && key !== 'geometry_name') {
                    info = value.toString();
                    htmlInfo.innerHTML +='<li><b>' + key + ': </b>' + info + '</li>';
                    //console.log('geom ', geometry[id]);                    
                }
            });
        }
    }
}

// function pickingGeomLayer(event) {

//     if(event.buttons === 0){
//         //console.log('resultoss ', resultoss);
        
//         let lay = globeView.getLayers(l => l.id == 'WFS Buildings')[0];
//         const layer_is_visible = globeView.getLayers(l => l.id == 'WFS Buildings')[0].visible;
//         if (!layer_is_visible)
//             return;
//         let results = globeView.pickObjectsAt(event, 1, 'WFS Buildings');
//         //let results = lay.pickObjectsAt(globeView, event, 5);
//         if (results.length < 1){
//             console.log("no properties");
//             return;
//         }
//         //console.log("res length ", results[0]);
//         htmlInfo.innerHTML = 'Batiment';
//         htmlInfo.innerHTML += '<hr>';
//         let props = results[0].object.properties;
//         console.log(props);
        
//         for (const k in props) {
//             // if (k === 'bbox' || k === 'geometry_name' || k === 'id' || k === 'id_parc' || k === 'imu_dir')
//             //     continue;
//             htmlInfo.innerHTML += '<li><b>' + k + ':</b> [' + props[k] + ']</li>';
//         }
//     }
// };

// function pickingRaster(event) {
//     let layer = globeView.getLayers(l => l.id == 'WFS Buildings rasterized')[0];
//     if (layer.visible == false)
//         return;
//     let geocoord = globeView.controls.pickGeoPosition(globeView.eventToViewCoords(event));
//     if (geocoord === undefined)
//         return;
//     let result = itowns.FeaturesUtils.filterFeaturesUnderCoordinate(geocoord, layer.feature, 5);
//     htmlInfo.innerHTML = 'Parcelle';
//     htmlInfo.innerHTML += '<hr>';
//     if (result[0] !== undefined) {
//         const props = result[0].feature.properties
//         for (const k in props) {
//             if (k === 'bbox' || k === 'geometry_name')
//                 continue;
//             htmlInfo.innerHTML += '<li>' + k + ': ' + props[k] + '</li>';
//         }
//     }
// }
