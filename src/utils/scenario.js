import createLine from '../line'

function createLinks(scenar) {
    const lines = [];
    for (let i = 0; i < scenar.links.length ; ++i) {
        const line = createLine(scenar.links[i].from.pos, scenar.links[i].to.pos, "l_"+ i);
        line.visible = false;
        console.log('creating **line** ', scenar.links[i].from.pos, scenar.links[i].to.pos, "l_"+ i)
        lines[i] = line;
    }
    return lines;
}

export { createLinks };