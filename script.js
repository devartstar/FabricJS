//  Creating a Canvas and assigning its WIDTH AND HEIGHT

const initCanvas = (id) => {
    return new fabric.Canvas(id, {
        selection: false
    });
}

const canvas = initCanvas('canvas');
const grid = 50;
const reader = new FileReader();


//  CREATING GRID FOR A CANVAS
for (var i = 0; i < 600 / grid; i++) {
    const hlines = new fabric.Line([i * grid, 0, i * grid, 600], {
        stroke: '#ccc',
        selectable: false
    })
    canvas.add(hlines);

    const vlines = new fabric.Line([0, i * grid, 600, i * grid], {
        stroke: '#ccc',
        selectable: false
    })
    canvas.add(vlines);
}


//snapping on Grid

canvas.on('object:moving', function (options) {
    options.target.set({
        left: Math.round(options.target.left / grid) * grid,
        top: Math.round(options.target.top / grid) * grid
    });
});

//Restricting the Rotation Angles

var angles = [0, 90, 180, 270, 360];
canvas.on("object:rotating", function (rotEvtData) {
    var targetObj = rotEvtData.target;
    var angle = targetObj.angle % 360;
    for (var i = 0; i < angles.length; i++) {
        if (angle <= angles[i]) {
            targetObj.angle = angles[i];
            break;
        }
    }
});

//  Canvas Toggle Mode

const toggleMode = (mode) => {
    if (mode === modes.pan) {
        if (currentMode === 'pan') {
            currentMode = '';
        } else {
            currentMode = modes.pan;
            canvas.isDrawingMode = false;
            canvas.requestRenderAll();
        }
    }
    else if (mode === modes.drawing) {
        if (currentMode == 'drawing') {
            currentMode = '';
            canvas.isDrawingMode = false;
            canvas.requestRenderAll();
        } else {
            currentMode = mode.drawing;
            canvas.isDrawingMode = true;
            canvas.requestRenderAll();
        }
    }
}



// add objects

const setPanEvents = (canvas) => {
    console.log('paan');

    canvas.on('mouse:move', (event) => {
        if (mousePressed && currentMode === modes.pan) {
            canvas.setCursor('grab');
            canvas.renderAll();
            const nEvent = event.e;
            const delta = new fabric.Point(nEvent.movementX, nEvent.movementY);
            canvas.relativePan(delta);
        } else if (mousePressed && currentMode === modes.drawing) {
            canvas.isDrawingMode = true;
            canvas.renderAll();
        }
    })

    canvas.on('mouse:down', (event) => {
        mousePressed = true;
        if (currentMode === modes.pan) {
            canvas.setCursor('grab');
            canvas.renderAll();
        }
    });
    canvas.on('mouse:up', (event) => {
        mousePressed = false;
        canvas.setCursor('default');
        canvas.renderAll();
    });

}



let color = '#000000';

const setColorListener = () => {
    // console.log(color + "  1");
    const picker = document.getElementById('colorPicker');
    picker.addEventListener('change', (event) => {
        color = event.target.value;
        canvas.freeDrawingBrush.color = color;
        canvas.renderAll();
        // console.log(color + "   2");
    })
}


let mousePressed = false;
let currentMode;

const createRect = (canvas) => {
    console.log("rect");
    const rect = new fabric.Rect({
        width: 100,
        height: 100,
        fill: 'yellow',
        originX: 'center',
        originY: 'center',
        left: canvas.width / 2,
        top: -50,
        cornerColor: 'black'
    });
    canvas.add(rect);
    canvas.renderAll();
    rect.animate('top', canvas.height / 2, {
        onChange: canvas.renderAll.bind(canvas)
    });
    rect.on('selected', () => {
        rect.set('fill', 'white');
        canvas.renderAll();
        console.log('select rect');
    })
    rect.on('deselected', () => {
        rect.set('fill', 'yellow');
        canvas.renderAll();
        console.log('deselect rect');
    })
}

const createCirc = (canvas) => {
    console.log("circle");
    const circle = new fabric.Circle({
        radius: 30,
        fill: 'pink',
        left: -30,
        top: canvas.height / 2,
        originX: 'center',
        originY: 'center',
        cornerColor: 'black'
    });
    canvas.add(circle);
    canvas.renderAll();
    circle.animate('left', canvas.width - 30, {
        onChange: canvas.renderAll.bind(canvas),
        onComplete: () => {
            circle.animate('left', canvas.width / 2, {
                onChange: canvas.renderAll.bind(canvas),
            })
        }
    });
    circle.on('selected', () => {
        circle.set('fill', 'white');
        canvas.renderAll();
        console.log('select circle');
    })
    circle.on('deselected', () => {
        circle.set('fill', 'pink');
        canvas.renderAll();
        console.log('deselect rect');
    })
}

const groupObjects = (canvas, group, shouldGroup) => {
    if (shouldGroup) {
        const objects = canvas.getObjects();
        group.val = new fabric.Group(objects, {
            cornerColor: 'black'
        });
        clearCanvas(canvas, true);
        canvas.add(group.val);
        canvas.requestRenderAll();
    } else {
        group.val.destroy();
        const oldGroup = group.val.getObjects();
        canvas.remove(group.val);
        canvas.add(...oldGroup);
        group.val = null;
        canvas.requestRenderAll();
    }
}

const clearCanvas = (canvas, state) => {
    state.val = canvas.toSVG();
    canvas.getObjects().forEach((o) => {
        if (o !== canvas.backgroundImage) {
            canvas.remove(o);
        }
    });
}

const restoreCanvas = (canvas, state, backURL) => {
    if (state.val) {
        fabric.loadSVGFromString(state.val, objects => {
            console.log(objects);
            objects = objects.filter(o => o["xlink:href"] !== backURL)
            canvas.add(...objects);
            canvas.requestRenderAll();
        })
    }
}

const group = {};
const svgState = {};


const modes = {
    pan: 'pan',
    drawing: 'drawing'
}

setPanEvents(canvas);



setColorListener();

const addImg = (e) => {
    console.log(e);
    const inputEle = document.getElementById('myImg');
    const file = inputEle.files[0];

    reader.readAsDataURL(file);
}


const inputFile = document.getElementById('myImg');
inputFile.addEventListener('change', addImg);
reader.addEventListener('load', () => {
    console.log(reader.result);
    fabric.Image.fromURL(reader.result, img => {
        canvas.add(img);
        canvas.requestRenderAll();
    })
})