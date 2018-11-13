import * as itowns from 'itowns';
import * as THREE from 'three';
import { getColor } from './color';

function createMaterial(vShader, fShader) {
    let uniforms = {
        time: {type: 'f', value: 0.2},
        red: {type: 'f', value: 1.0},
        green: {type: 'f', value: 0.2},
        blue: {type: 'f', value: 0.2},
        resolution: {type: "v2", value: new THREE.Vector2()},
    };

    uniforms.resolution.value.x = window.innerWidth;
    uniforms.resolution.value.y = window.innerHeight;

    let meshMaterial = new THREE.ShaderMaterial({
        uniforms: uniforms,
        vertexShader: vShader,
        fragmentShader: fShader,
        transparent: true,
        opacity: 0.7,
        side: THREE.DoubleSide
    });
    return meshMaterial;
}

const vertexShader = `
#include <logdepthbuf_pars_vertex>
uniform float time;
varying vec4 modelpos;

void main(){
    modelpos =  vec4(position, 1.0);
    gl_Position = projectionMatrix * modelViewMatrix * vec4(position, 1.0);
    #include <logdepthbuf_vertex>
}
`;

const fragmentShader = `
#include <logdepthbuf_pars_fragment>
uniform float time;
uniform float red;
uniform float green;
uniform float blue;
uniform vec2 resolution;
varying vec4 modelpos;

#define PI 3.14159
#define TWO_PI (PI*2.0)
#define N 68.5

void main(){
    #include <logdepthbuf_fragment>
    // vec2 center = (modelpos.xy);
    gl_FragColor = vec4(red*1.0, green*1.0, blue*4.0, 1.0);
}
`;
let meshes = []
let shadMat = createMaterial(vertexShader, fragmentShader);
function addShader(result){
    //meshes = [];
    //let mesh;
    result.material = shadMat; 
    let k = 0;
    for (let i = 0 ; i < result.children.length; ++i){
        let mesh = result.children[i];
        //mesh.material = shadMat;
        //console.log("el klodo --> ", mesh.minAltitude)
        meshes.push(mesh);
    }
    console.log('m length : ', meshes.length);
    
    // for (let i = 0 ; i < result.feature.geometry.length ; ++i){
    //     mesh = result.feature.geometry[i];
    //     let z = mesh.properties.z_min;
    //     shadMat.uniforms.time.value = z * 0.01;
    // };
    //console.log("el klodo --> ", result)
}

function extrudeBuildings(properties) {
    return properties.hauteur;
}

function altitudeBuildings(properties) {
    //console.log(properties);
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
        extrude: extrudeBuildings
    }),
    onMeshCreated: addShader,
    // onMeshCreated: function scaleZ(mesh) {
    //     mesh.scale.z = 0.01;
    //     meshes.push(mesh);
    // },
    // filter: acceptFeature,
    mergeFeatures: false,
    source: {
        url: 'http://wxs.ign.fr/3ht7xcw6f7nciopo16etuqp2/geoportail/wfs?',
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
export {bati, getColorForLevelX, colorForWater, shadMat, meshes};