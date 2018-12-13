import * as THREE from 'three';

//let nivEau = 5
const red = 0xff0000;
const green = 0x00ff00;
const orange = 0xff5500;
const yellow = 0xffff00;

function getColor(alti, nivEau){
    let color = new THREE.Color(green);
    let flag = nivEau - alti;
    if (flag > 3) {
        color = new THREE.Color(red);
    }
    else if (flag > 2) {
        color = new THREE.Color(orange);
    }
    else if (flag > 0) {
        color = new THREE.Color(yellow);
    }
    if (alti == 9999){
        color = new THREE.Color(0x101010);
        //console.log("9999");
    }
    return color;
}

export { getColor };
