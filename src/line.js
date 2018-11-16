import * as THREE from 'three';

function createLine(first, second, name){
    let firstpos = new THREE.Vector3(first.x, first.y, first.z);
    let secondpos = new THREE.Vector3(second.x, second.y, second.z);
    let segmentCount = 100;
    //let radius = firstpos.distanceTo(secondpos);

    let material = new THREE.LineDashedMaterial({ color: 0x00ff00, linewidth: 3, dashSize: 50, gapSize: 80 });
    let k = 200;
    let v = new THREE.Vector3(1, 0, -(secondpos.x - firstpos.x)/(secondpos.z - firstpos.z));
    v = v.multiplyScalar(k);
    let p1 = new THREE.Vector3(firstpos.x + 1*(secondpos.x - firstpos.x)/8, firstpos.y + 1*(secondpos.y - firstpos.y)/8, firstpos.z + 1*(secondpos.z - firstpos.z)/8);
    p1 = p1.add(v);
    let p2 = new THREE.Vector3(firstpos.x + 7*(secondpos.x - firstpos.x)/8, firstpos.y + 7*(secondpos.y - firstpos.y)/8, firstpos.z + 7*(secondpos.z - firstpos.z)/8);
    p2 = p2.add(v);
    let mid = new THREE.Vector3(firstpos.x + 1*(secondpos.x - firstpos.x)/2, firstpos.y + 1*(secondpos.y - firstpos.y)/2, firstpos.z + 1*(secondpos.z - firstpos.z)/2);
    mid = mid.add(v);
    
    let curve = new THREE.CubicBezierCurve3(
        firstpos,
        p1,
        p2,
        secondpos
    );
    // console.log(firstpos);
    // console.log(p1);
    // console.log(p2);
    // console.log(secondpos);
    //curve = new THREE.QuadraticBezierCurve3(firstpos, mid, secondpos);
    
    let points = curve.getPoints(segmentCount);
    let geometry = new THREE.Geometry().setFromPoints(points);
    //geometry.computeLineDistances();

    
    let line = new THREE.Line(geometry, material);
    line.computeLineDistances();
    line.name = name;
    line.updateMatrixWorld();
    return line;
}

export default createLine;