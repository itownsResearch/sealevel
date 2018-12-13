export const iso_1_config = {
    type: 'color',
    id: 'iso_1',
    name: 'iso_1',
    transparent: true,
    visible: false,
    style: {
        //fill: 'orange',
        fillOpacity: 0.5,
        stroke: 'yellow',
    },
    source: {
        url: 'data/iso_alti_1.geojson',
        protocol: 'file',
        projection: 'EPSG:4326',
    },
};

export const iso_5_config = {
    type: 'color',
    id: 'iso_5',
    name: 'iso_1',
    transparent: true,
    visible: false,
    style: {
        //fill: 'orange',
        fillOpacity: 0.5,
        stroke: 'red',
        'stroke-width': 0.2
    },
    source: {
        url: 'data/iso_alti_5.geojson',
        protocol: 'file',
        projection: 'EPSG:4326',
    },
};
