let buildings = {
    mairie_1: {
        id: "bati_remarquable.28316", nature: "Mairie", text : "PC opérationnel jusqu'à niveau d'eau 3.0m",
        pos: { x: 4421399.830905276, y: -109842.52430467895, z: 4580221.793246654 },
    },
    mairie_2: {
        id: "bati_remarquable.159618", nature: "Mairie", text : "PC opérationnel jusqu'à niveau d'eau 5m",
        pos: {x: 4419000.037332533, y: -110924.06646068735,  z: 4582499.789135131 },
    },
    mairie_3: {
        id: "bati_remarquable.159593", nature: "Mairie", text : "PC Principal",
        pos: {x: 4420865.45494784,   y: -105597.55458782926,  z: 4580849.799729405 },
    },
};


let scenario = {
    links: [
        { from: buildings['mairie_2'], to: buildings['mairie_3'], hauteur_dysf: 5 },
        { from: buildings['mairie_1'], to: buildings['mairie_2'], hauteur_dysf: 3 },
        //ugly hack ?
        { from: buildings['mairie_1'], to: buildings['mairie_3'], hauteur_dysf: 99 },
    ],

    //the keys are the iris code
    communes: {
        17286: { hauteur_dysf: 3 },
        17318: { hauteur_dysf: 3 },
        17019: { hauteur_dysf: 3 },
        17207: { hauteur_dysf: 3 },
        17121: { hauteur_dysf: 3 },
        17051: { hauteur_dysf: 5 },
        17161: { hauteur_dysf: 6 },
        17360: { hauteur_dysf: 5 },
        17297: { hauteur_dysf: 5 },
        17369: { hauteur_dysf: 6 },

    }
};

export default scenario