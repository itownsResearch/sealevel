let bati_raster ={
    type: 'color',
    id: 'WFS Buildings rasterized',
    transparent: true,
    style: {
        // fill: 'red',
        fillOpacity: 0.2,
        // radius: 25,
        lineWidth: 2,
        stroke: 'yellow',
    },
    //linewidth: 15,
    //isValidData: (p) => { console.log(p.properties) ; return true },//isValidData,
    source: {
        url: 'http://wxs.ign.fr/3ht7xcw6f7nciopo16etuqp2/geoportail/wfs?',
        protocol: 'wfs',
        version: '2.0.0',
        typeName: 'BDTOPO_BDD_WLD_WGS84G:bati_remarquable,BDTOPO_BDD_WLD_WGS84G:bati_indifferencie,BDTOPO_BDD_WLD_WGS84G:bati_industriel',
        zoom: { max: 20, min: 14 },
        projection: 'EPSG:4326',
        // extent: {
        //     west: 4.568,
        //     east: 5.18,
        //     south: 45.437,
        //     north: 46.03,
        // },
        ipr: 'IGN',
        format: 'application/json',
    },
};

export {bati_raster}