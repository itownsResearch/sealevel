import * as itowns from 'itowns'
import * as THREE from 'three';



var coords = {};
function modify_level(attribute, alt) {
    // position of the mesh
    // around Bordeaux
    // const meshCoord1 = new itowns.Coordinates("EPSG:4326", -0.650, 44.905,  0 + alt).as("EPSG:4978").xyz();
    // const meshCoord2 = new itowns.Coordinates("EPSG:4326", -0.490, 44.905,  0 + alt).as("EPSG:4978").xyz();
    // const meshCoord3 = new itowns.Coordinates("EPSG:4326", -0.490, 44.798,  0 + alt).as("EPSG:4978").xyz();
    // const meshCoord4 = new itowns.Coordinates("EPSG:4326", -0.650, 44.798,  0 + alt).as("EPSG:4978").xyz();

    const meshCoord1 = new itowns.Coordinates("EPSG:4326", coords.lon, coords.lat, 0 + alt).as("EPSG:4978").xyz();
    const meshCoord2 = new itowns.Coordinates("EPSG:4326", coords.lon + coords.deltaLon, coords.lat, 0 + alt).as("EPSG:4978").xyz();
    const meshCoord3 = new itowns.Coordinates("EPSG:4326", coords.lon + coords.deltaLon, coords.lat + coords.deltaLat,  0 + alt).as("EPSG:4978").xyz();
    const meshCoord4 = new itowns.Coordinates("EPSG:4326", coords.lon, coords.lat  + coords.deltaLat, 0 + alt).as("EPSG:4978").xyz();

    attribute.setXYZ(0, meshCoord1.x, meshCoord1.y,  meshCoord1.z);
    attribute.setXYZ(1, meshCoord2.x, meshCoord2.y,  meshCoord2.z);
    attribute.setXYZ(2, meshCoord3.x, meshCoord3.y,  meshCoord3.z);
    attribute.setXYZ(3, meshCoord3.x, meshCoord3.y,  meshCoord3.z);
    attribute.setXYZ(4, meshCoord4.x, meshCoord4.y,  meshCoord4.z);
    attribute.setXYZ(5, meshCoord1.x, meshCoord1.y,  meshCoord1.z);
  }

function createWaterPlaneMesh(c) {
    // creation of the new mesh (a cylinder)
    coords = c;
    let texture = new THREE.TextureLoader().load( './data/eau.jpg' );
    texture.wrapS = THREE.RepeatWrapping;
    texture.wrapT = THREE.RepeatWrapping;
    texture.repeat.set( 100, 100 );

    let geometry = new THREE.BufferGeometry();

    let position = new THREE.BufferAttribute( new Float32Array(18), 3 ) ;
    
    modify_level(position, 0);
    position.dynamic = true;
    geometry.addAttribute( 'position',  position);
    let material = new THREE.MeshBasicMaterial( { map: texture, side: THREE.DoubleSide, transparent: true, opacity: 0.5});
    let mesh = new THREE.Mesh(geometry, material);

    // update coordinate of the mesh
    mesh.updateMatrixWorld();
    return mesh;
  
    // what is the purpose of all of this ??
    // const myID = globeView.mainLoop.gfxEngine.getUniqueThreejsLayer();
    // globeView.water.traverse((obj) => {obj.layers.set(myID);});
    // globeView.camera.camera3D.layers.enable(myID);
}

export { createWaterPlaneMesh, modify_level }