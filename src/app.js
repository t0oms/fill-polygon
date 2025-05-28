const canvas = document.getElementById("canvas");
const context = canvas.getContext("2d");

let isFilled = false;

let currentPoints = [];
let currentSides = [];

const realShape = [
    { x: 0, y: 4.5 },
    { x: 4.5, y: 1.5 },
    { x: 3, y: -3.5 },
    { x: -3, y: -3.5 },
    { x: -4.5, y: 1.5 },
];

function convertToCanvasCoordinates(realPoints, canvasWidth, canvasHeight, width, height) {
    const halfCanvasWidth = canvasWidth / 2;
    const halfCanvasHeight = canvasHeight / 2;

    return realPoints.map(p => {
        return {
            x: halfCanvasWidth + (p.x / (width / 2)) * canvasWidth / 2,
            y: halfCanvasHeight - (p.y / (height / 2)) * canvasHeight / 2
        };
    });
}

function drawPolygon(points) {
    context.clearRect(0, 0, canvas.width, canvas.height);

    const sides = [];

    context.beginPath();
    context.moveTo(points[0].x, points[0].y);
    for (let i = 0; i < points.length; i++) {
        const current = points[i];
        const next = points[(i + 1) % points.length]; 
        context.lineTo(next.x, next.y);
        sides.push([current, next])
    }
    context.closePath();
    context.stroke(); 
    return sides;
}

function getCrossPoints(activeSides, y) {
    const crossPoints = [];

    for (const [p1, p2] of activeSides) {
        const y1 = p1.y;
        const y2 = p2.y;
        const x1 = p1.x; 
        const x2 = p2.x;

        if (y1 === y2) {
            continue;
        };

        if ((y >= Math.min(y1, y2)) && (y < Math.max(y1, y2))) {
            const x = x1 + ((y - y1) * (x2 - x1)) / (y2 - y1);
            crossPoints.push(x);
        }
    }

    crossPoints.sort((a, b) => a - b);

    return crossPoints;
}

function fillPolygon(sides) {
    // sort sides by minimal y coordinate
    sides.sort((sideA, sideB) => {
        const minYA = Math.min(sideA[0].y, sideA[1].y);
        const minYB = Math.min(sideB[0].y, sideB[1].y);
        return minYA - minYB;
    });

    // initialize empty active sides list
    const activeSides = [];

    // go throught all raster rows
    for (let y = 0; y < canvas.height; y++) {
        sides.forEach(side => {
            // if a sides starts in this line, add it to active sides list
            if (side[0].y === y || side[1].y === y) {
                if (!activeSides.includes(side)) {
                    activeSides.push(side);
                }
                else {
                    // throw out the side that end of this row 
                    activeSides.splice(activeSides.indexOf(side), 1);
                }
            }
        });

        // calculate and sort the crosspoints 
        const crossPoints = getCrossPoints(activeSides, y);

        // pair the crosspoints and fill the horizontal intervals
        if (crossPoints.length !== 0 && crossPoints.length % 2 === 0) {
            for (let i = 0; i < crossPoints.length; i+=2) {
                const point1 = crossPoints[i]
                const point2 = crossPoints[i+1]

                context.beginPath();
                context.moveTo(point1, y);
                context.lineTo(point2, y);
                context.strokeStyle = "black";
                context.lineWidth = 1; 
                context.stroke();
            }
        }
    }
}

function readCoordinates(input) {
    const regex = /\((-?\d+(\.\d+)?),\s*(-?\d+(\.\d+)?)\)/g;
    const matches = [...input.matchAll(regex)];
    return matches.map(match => ({
        x: parseFloat(match[1]),
        y: parseFloat(match[3])
    }));
}

document.getElementById("drawButton").addEventListener("click", () => {
    const input = document.getElementById("coords").value;
    const realShape = readCoordinates(input);

    if (realShape.length < 3) {
        return;
    }

    currentPoints = convertToCanvasCoordinates(realShape, canvas.width, canvas.height, 10, 10);
    currentSides = drawPolygon(currentPoints);

    isFilled = false; 
});


document.getElementById("fillButton").addEventListener("click", () => {
    if (!currentPoints.length || !currentSides.length || isFilled) {
        return;
    }

    fillPolygon(currentSides);
    isFilled = true; 
});

currentPoints = convertToCanvasCoordinates(realShape, canvas.width, canvas.height, 10, 10);
currentSides = drawPolygon(currentPoints);
