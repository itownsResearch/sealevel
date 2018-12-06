import * as itowns from 'itowns';
import * as THREE from 'three';
import { getColor } from './color';

function createMaterial(vShader, fShader) {
    let uniforms = {
        waterLevel: {type: 'f', value: 0.0},
        opacity: {type: 'f', value: 1.0},
        z0: {type: 'f', value: 0.0},
        z1: {type: 'f', value: 2.0},
        //color0: {type: 'c', value: new THREE.Color(0x888888)},
        color0: {type: 'c', value: new THREE.Color(0x006600)},
        color1: {type: 'c', value: new THREE.Color(0xbb0000)},
        //color1: {type: 'c', value: new THREE.Color(0x4444ff)},
    };

    let meshMaterial = new THREE.ShaderMaterial({
        uniforms: uniforms,
        vertexShader: vShader,
        fragmentShader: fShader,
        transparent: true,
        opacity: 0.5,
        side: THREE.DoubleSide
    });
    return meshMaterial;
}

const vertexShader = `
#include <logdepthbuf_pars_vertex>
attribute float zbottom;
uniform float waterLevel;
uniform float opacity;
uniform vec3 color0;
uniform vec3 color1;
uniform float z0;
uniform float z1;

varying vec4 v_color;
void main(){
    gl_Position = projectionMatrix * modelViewMatrix * vec4(position, 1.0);
    float t = smoothstep(z0, z1, waterLevel-zbottom); // zbottom+z0 -> 0, zbottom+z1 -> 1
    v_color = vec4(mix(color0, color1, t), opacity);
}
`;

const fragmentShader = `
#include <logdepthbuf_pars_fragment>
varying vec4 v_color;
void main(){
    #include <logdepthbuf_fragment>
    gl_FragColor = v_color;
}
`;

let resultoss;
let shadMat = createMaterial(vertexShader, fragmentShader);
function addShader(result){
    result.material = shadMat;
    //console.log("result ", result)
    resultoss = result;
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
    return properties.z_max - properties.hauteur;
}

//const nivEau = 20

let getColorForLevelX = (nivEau) => ( (alti) => getColor(alti, nivEau) );
let colorForWater = getColorForLevelX(0);

function colorBuildings(properties) {
    let altiBuilding = altitudeBuildings(properties);
    //console.log(properties);
    return colorForWater(altiBuilding);
    //return getColor(altiBuilding, 5);
}

function  acceptFeature(p) {
    return p.z_min !== 9999;
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
//            color: { type: Uint8Array, value: (prop, id, extruded) => { return new THREE.Color(extruded ? 0xff8888 : 0xffffff);}, itemSize:3, normalized:true },
            zbottom: { type: Float32Array, value: altitudeBuildings },
            id: { type: Uint32Array, value: (prop, id) => { return id;} }
        },
    }),
    onMeshCreated: addShader,
    // onMeshCreated: function scaleZ(mesh) {
    //     mesh.scale.z = 0.01;
    //     meshes.push(mesh);
    // },
    filter: acceptFeature,
    //mergeFeatures: false,
    source: {
        url: 'http://wxs.ign.fr/oej022d760omtb9y4b19bubh/geoportail/wfs?',
        protocol: 'wfs',
        version: '2.0.0',
        //typeName: 'BDTOPO_BDD_WLD_WGS84G:bati_remarquable,BDTOPO_BDD_WLD_WGS84G:bati_indifferencie,BDTOPO_BDD_WLD_WGS84G:bati_industriel',
        typeName: 'BDTOPO_BDD_WLD_WGS84G:bati_indifferencie,BDTOPO_BDD_WLD_WGS84G:bati_industriel',
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
export {bati, getColorForLevelX, colorForWater, shadMat, resultoss};
