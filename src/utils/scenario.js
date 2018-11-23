import createLine from '../line'

// creates an array of lines from links in a scenario json
function createLinks(scenar) {
    let links = [];
    //let links = {};
    let i = 0;
    for (let e of scenar.links) {
        // let first = e[to];
        // let second = e[from];
        //const id = "l_"+ i;
        const line = createLine(e.from.pos, e.to.pos, "l_"+ i);
        //console.log('creating line ', e['from']['pos'], e['to']['pos'], "l_"+ i)
        console.log('creating *line* ', e.from.pos, e.to.pos, "l_"+ i)
        const link = {line, hauteur_dysf: e.hauteur_dysf, onScreen: false };
        links.push(link);
        //links.push(line);
        ++i;
    }
    return links;
}

export { createLinks };