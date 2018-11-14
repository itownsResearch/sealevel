import * as itowns from 'itowns';
import * as THREE from 'three';
import { getColor } from './color';

function createMaterial(vShader, fShader) {
    let uniforms = {
        time: {type: 'f', value: 0.2},
        waterLevel: {type: 'f', value: 0.0},
        // green: {type: 'f', value: 0.1},
        // blue: {type: 'f', value: 0.1},
        // resolution: {type: "v2", value: new THREE.Vector2()},
    };
    // uniforms.resolution.value.x = window.innerWidth;
    // uniforms.resolution.value.y = window.innerHeight;

    let meshMaterial = new THREE.ShaderMaterial({
        uniforms: uniforms,
        vertexShader: vShader,
        fragmentShader: fShader,
        transparent: true,
        opacity: 0.8,
        side: THREE.DoubleSide
    });
    return meshMaterial;
}

const vertexShader = `
#include <logdepthbuf_pars_vertex>
uniform float time;
attribute float zbottom;
varying float zbot;

void main(){
    gl_Position = projectionMatrix * modelViewMatrix * vec4(position, 1.0);
    zbot = zbottom;
    #include <logdepthbuf_vertex>
}
`;

const fragmentShader = `
#include <logdepthbuf_pars_fragment>
uniform float time;
uniform float waterLevel;
varying float zbot;

#define PI 3.14159
#define TWO_PI (PI*2.0)
#define N 68.5

void main(){
    #include <logdepthbuf_fragment>
    if (abs(zbot) > 1000.0){
        gl_FragColor = vec4(0.0, 0.0, 1.0, 1.0);
        return;
    }
    if (waterLevel - zbot > 3.0){
        gl_FragColor = vec4(1.0, 0.0, 0.0, 1.0);
        return;
    }
    else if (waterLevel - zbot > 2.0){
        gl_FragColor = vec4(0.8, 0.5, 0.0, 1.0);
        return;
    }
    else if (waterLevel - zbot > 0.0){
        gl_FragColor = vec4(0.8, 0.7, 0.0, 1.0);
        return;
    }
    gl_FragColor = vec4(0.0, 1.0, 0.0, 1.0);
}
`;

let shadMat = createMaterial(vertexShader, fragmentShader);
function addShader(result){
    result.material = shadMat; 
    // let k = 0;
    // for (let i = 0 ; i < result.children.length; ++i){
    //     let mesh = result.children[i];
    //     //mesh.material = shadMat;
    //     //console.log("el klodo --> ", mesh.minAltitude)
    //     meshes.push(mesh);
    // }
}

function extrudeBuildings(properties) {
    return properties.hauteur;
}

function altitudeBuildings(properties) {
    return properties.z_min - properties.hauteur;
}

//const nivEau = 20

let getColorForLevelX = (nivEau) => ( (alti) => getColor(alti, nivEau) );
let colorForWater = getColorForLevelX(0);

function colorBuildings(properties) {
    let altiBuilding = altitudeBuildings(properties);
    return colorForWater(altiBuilding);
    //return getColor(altiBuilding, 5);
}


let bati = {
    id: 'WFS Buildings',
    type: 'geometry',
    update: itowns.FeatureProcessing.update,
    convert: itowns.Feature2Mesh.convert({
        color: colorBuildings,
        altitude: altitudeBuildings,
        extrude: extrudeBuildings,
        attributes: { // works for extruded meshes only
            // color: { type: Uint8Array, value: colorBuildings, itemSize:3, normalized:true }, // does not work
            zbottom: { type: Float32Array, value: altitudeBuildings },
            id: { type: Uint32Array, value: (prop, id) => { return id } }
        },
    }),
    onMeshCreated: addShader,
    // onMeshCreated: function scaleZ(mesh) {
    //     mesh.scale.z = 0.01;
    //     meshes.push(mesh);
    // },
    // filter: acceptFeature,
    //mergeFeatures: false,
    source: {
        url: 'http://wxs.ign.fr/oej022d760omtb9y4b19bubh/geoportail/wfs?',
        protocol: 'wfs',
        version: '2.0.0',
        typeName: 'BDTOPO_BDD_WLD_WGS84G:bati_remarquable,BDTOPO_BDD_WLD_WGS84G:bati_indifferencie,BDTOPO_BDD_WLD_WGS84G:bati_industriel',
        projection: 'EPSG:4326',
        ipr: 'IGN',
        format: 'application/json',
        zoom: { min: 14, max: 14 },
        // extent: {
        //     west: 4.568,
        //     east: 5.18,
        //     south: 45.437,
        //     north: 46.03,
        // },
    }
};


// export default bati;
export {bati, getColorForLevelX, colorForWater, shadMat};
