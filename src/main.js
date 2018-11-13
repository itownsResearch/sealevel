import * as itowns from 'itowns'
import GuiTools from './gui/GuiTools'
import {createWaterPlaneMesh, modify_level} from './waterPlane'

import IGN_MNT_HR from './layers/IGN_MNT_HIGHRES'
import DARK from './layers/DARK'
import {bati, shadMat, meshes} from './layers/bati'
//import roads from './layers/roads'
import { getColor } from './layers/color'


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
}


const viewerDiv = document.getElementById('viewerDiv');
const globeView = new itowns.GlobeView(viewerDiv, positionOnGlobe);
const menuGlobe = new GuiTools('menuDiv', globeView)

//let levelx = level;
// console.log(colorForWater);
//colorForWater = getColorForLevelX(5);
// console.log('lev ', colorForWater(0));
//console.log('levx ', levelx(0));

// let convert = itowns.Feature2Mesh.convert({
//     color: colorBuildings,
//     altitude: altitudeBuildings,
//     extrude: extrudeBuildings
// });


globeView.addLayer(DARK);
globeView.addLayer(IGN_MNT_HR);
globeView.addLayer(bati)
//globeView.addLayer(roads);
let plane = createWaterPlaneMesh(coords);


globeView.addEventListener(itowns.GLOBE_VIEW_EVENTS.GLOBE_INITIALIZED, () => {
    globeView.scene.add(plane);
    globeView.water = plane;
    console.log('globe initialized -- gg', globeView);
    console.log(globeView.referenceCrs);
    menuGlobe.addImageryLayersGUI(globeView.getLayers( l => l.type === 'color'));
    menuGlobe.addGeometryLayersGUI(globeView.getLayers(l => l.type === 'geometry' && l.id != 'globe'));
    menuGlobe.gui.add({ waterLevel: 0.0 }, 'waterLevel').min(-5).max(20).step(5).onChange((
        function updateWaterLevel(value) {
            let lay = globeView.getLayers(l => l.id == 'WFS Buildings')[0];
            const w = window.innerWidth;
            const h = window.innerHeight;
            adjustAltitude(value);
            // if (value > 10) {
            //     shadMat.uniforms.red.value = value * 0.05;
            //     shadMat.uniforms.green.value = 0.0;
            //     shadMat.uniforms.blue.value = 0.0;
            // }
            // else if (value > 2 && value <= 10 ) {
            //     shadMat.uniforms.red.value = value * 0.05;
            //     shadMat.uniforms.green.value = value * 0.03;
            //     shadMat.uniforms.blue.value = 0.0;
            // }
            // else {
            //     shadMat.uniforms.red.value = 0.0;
            //     shadMat.uniforms.green.value = Math.abs(value * 0.05);
            //     shadMat.uniforms.blue.value = 0.0;
            // }

            for (let i = 0 ; i < meshes.length ; ++i) {
                //console.log('mmm ', meshes[i].material.color);
                let minAlt = meshes[i].minAltitude;
                if (minAlt > 1000) {
                    console.log('klodos !', minAlt);
                }
                else{
                const col = getColor(meshes[i].minAltitude, value);
                //console.log('col ==> ', col);
                meshes[i].material.color = col;//getColor(meshes[i].minAltitude, value);
                }
                //meshes[i].material = shadMat; 
            }
            //shadMat.uniforms.time.value = value * 0.1;
            
            globeView.notifyChange(true);

        }));
});

// for (const layer of globeView.getLayers()) {
//     layer.whenReady.then(function _(layer) {
//         // var gui = debug.GeometryDebug.createGeometryDebugUI(menuGlobe.gui, view, layer);
//         // debug.GeometryDebug.addMaterialLineWidth(gui, view, layer, 1, 10);
//         console.log("layer ready : ", layer.convert);
//         // let array = layer.pickObjectsAt(globeView, new itowns.Coordinates("EPSG:4326", -0.525, 44.85), 70);
//         // console.log("array : ", array);
//     });
// }
