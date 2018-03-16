import * as itowns from 'itowns';
//import * as itowns from '../node_modules/itowns/dist/itowns';

let positionOnGlobe = { longitude: 2.351323, latitude: 48.856712, altitude: 25000000 };
let viewerDiv = document.getElementById('viewerDiv');
let globeView = new itowns.GlobeView(viewerDiv, positionOnGlobe);


let promises = [];
itowns.Fetcher.json('./layers/JSONLayers/DARK.json').then(function (result) {
    return globeView.addLayer(result);
});

globeView.addEventListener(itowns.GLOBE_VIEW_EVENTS.GLOBE_INITIALIZED, () => {
    Promise.all(promises).then(function () {
        console.log("loading layers done")
    })
});

