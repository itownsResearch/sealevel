import * as itowns from 'itowns';

import * as THREE from 'three';
import { getColor } from './color'


function altitudeRoads(properties) {
    // console.log('props ', properties);
    //console.log("z_ini : ", properties.z_ini);
    return 5;
}

let getColorForLevelX = (nivEau) => ( (alti) => getColor(alti, nivEau) );
let colorForWater = getColorForLevelX(5);

function colorRoads(properties){
    let altiRoads = properties.z_ini;
    //console.log('alti_roads ', altiRoads);
    return colorForWater(altiRoads);
}

//coords = {lon: -1.563, lat: 46.256, deltaLon: 0.300, deltaLat: -0.150 };

//let meshes = [];
let roads = {
    id: 'WFS Roads',
    type: 'geometry',
    update: itowns.FeatureProcessing.update,
    convert: itowns.Feature2Mesh.convert({
        color: colorRoads,
        altitude: altitudeRoads,
    }),
    //onMeshCreated: testoss,
    // onMeshCreated: function scaleZ(mesh) {
    //     mesh.scale.z = 0.1;
    //     meshes.push(mesh);
    // },
    // filter: acceptFeature,
    linewidth: 3,
    source: {
        url: 'http://wxs.ign.fr/3ht7xcw6f7nciopo16etuqp2/geoportail/wfs?',
        protocol: 'wfs',
        version: '2.0.0',
        typeName: 'BDTOPO_BDD_WLD_WGS84G:route',
        projection: 'EPSG:4326',
        ipr: 'IGN',
        format: 'application/json',
        zoom: { min: 15, max: 15 },
        // extent: {
        //     west: -1.560,
        //     east: -1.260,
        //     south: 46.256,
        //     north: 46.106,
        // },
    }
};

// let roads = {
//     type: 'color',
//     id: 'WFS Roads rasterized',
//     transparent: true,
//     style: {
//         // fill: 'red',
//         // fillOpacity: 0.9,
//         // radius: 25,
//         lineWidth: 2,
//         stroke: 'yellow',
//     },
//     //linewidth: 15,
//     //isValidData: (p) => { console.log(p.properties) ; return true },//isValidData,
//     source: {
//         url: 'http://wxs.ign.fr/3ht7xcw6f7nciopo16etuqp2/geoportail/wfs?',
//         protocol: 'wfs',
//         version: '2.0.0',
//         typeName: 'BDTOPO_BDD_WLD_WGS84G:route',
//         zoom: { max: 20, min: 14 },
//         projection: 'EPSG:4326',
//         // extent: {
//         //     west: 4.568,
//         //     east: 5.18,
//         //     south: 45.437,
//         //     north: 46.03,
//         // },
//         ipr: 'IGN',
//         format: 'application/json',
//     },
// };


export default roads;