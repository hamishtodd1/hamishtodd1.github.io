function initBrushStroke() 
{
    let buttons = []
    let deleteMode = false
    let currentStroke = null
    let currentColorBtn = null

    /////////////
    // Buttons //
    /////////////

    let buttonGroup = new THREE.Group()
    buttonGroup.scale.multiplyScalar(2.6)
    scene.add(buttonGroup)

    let col = new THREE.Color()
    let buttonWidth = .18
    let hueDivisions = 9
    let greyDivisions = 3
    let numButtons = hueDivisions + greyDivisions
    for(let i = 0; i < numButtons; ++i) {
        
        if(i < hueDivisions)
            col.setHSL(i / hueDivisions, 1., .5)
        else {
            let grey = (i - hueDivisions) / (greyDivisions-1)
            col.setRGB(grey,grey,grey)
        }
        
        let btn = new THREE.Mesh(unchangingUnitSquareGeometry, new THREE.MeshBasicMaterial({ color: col }))
        btn.scale.setScalar(buttonWidth)
        buttons.push(btn)
        btn.position.set(
            (i - numButtons / 2. + .5) * buttonWidth * 1.1,
            -.5,
            0.)
        buttonGroup.add(btn)

        btn.onClick = () => {
            currentColorBtn = btn
        }
    }
    currentColorBtn = buttons[0]

    let buttonNames = [`undo`,`redo`, `mic`,`eraser`]//,`paste`]
    let undoneStrokes = []
    buttonNames.forEach((name, i) => {
        let button = new THREE.Mesh(unchangingUnitSquareGeometry, new THREE.MeshBasicMaterial({
            transparent: true
        }))
        buttons.push(button)

        button.onClick = (event) => {
            if(name == `undo`) {
                if(strokeMeshes.length > 0) {
                    undoneStrokes.push(strokeMeshes.pop())
                    scene.remove(undoneStrokes[undoneStrokes.length-1])
                }
            }
            else if(name == `redo`) {
                if(undoneStrokes.length > 0) {
                    strokeMeshes.push(undoneStrokes.pop())
                    scene.add(strokeMeshes[strokeMeshes.length-1])
                }
            }
            else if(name == `mic`)
                startVoiceInput()
            else if(name === `eraser`)
                deleteMode = true
            // else if (name == `paste`) {
            //     pasteFromClipboard(event)
            // }
        }

        textureLoader.load( `data/icons/` + name + `.png`, texture => {
            button.material.map = texture
            button.material.needsUpdate = true
            button.position.set(
                (i - buttonNames.length / 2. + .5) * buttonWidth * 1.1,
                .625,
                0.
            )
            button.scale.setScalar(buttonWidth)
            buttonGroup.add(button)
        })
    })
    
    let cameraPositionOld = camera.position.clone()
    adjustControlsToCamera = () => {
        buttonGroup.scale.multiplyScalar(camera.position.z / cameraPositionOld.z)
        
        buttonGroup.position.x += camera.position.x - cameraPositionOld.x
        buttonGroup.position.y += camera.position.y - cameraPositionOld.y

        cameraPositionOld.copy(camera.position)
    }

    ///////////////////////
    // Stroke definition //
    ///////////////////////    

    //why this is needed, I don't know
    class Dummy extends THREE.Curve {
        getPoint(t, optionalTarget = new THREE.Vector3()) {
            currentStroke.curve.getPoint(t, optionalTarget)
            return optionalTarget
        }
    }

    let strokeMeshes = []
    class StrokeMesh extends THREE.Mesh {
        
        constructor() {

            super(
                new THREE.BufferGeometry(),
                new THREE.MeshBasicMaterial({ color: currentColorBtn.material.color }))
            this.material.depthTest = false
            this.material.depthWrite = false
            scene.add(this)

            strokeMeshes.push(this)

            this.curve = new THREE.SplineCurve([
                new THREE.Vector2(handPosition[13], handPosition[12])
            ])
            this.color = new THREE.Color()
        }

        extendToMouse(){
            let newPt = new THREE.Vector2(handPosition[13], handPosition[12])
            this.curve.points.push(newPt)

            let radius = .01
            const path = new Dummy();
            const newGeo = new THREE.TubeGeometry(path, 512, radius, 4, false);
            currentStroke.geometry.copy(newGeo)
            newGeo.dispose()
        }

        dispose() {
            strokeMeshes.splice(strokeMeshes.indexOf(this), 1)
            scene.remove(this)
            this.geometry.dispose()
            this.material.dispose()
        }
    }


    /////////////////////
    // General control //
    /////////////////////

    document.addEventListener(`pointerup`, () => {
        deleteMode = false
        if(currentStroke) {
            currentStroke = null

            undoneStrokes.length = 0
        }
        else if(currentTextGroup)
            endVoiceInput()
    })
    document.addEventListener(`pointermove`, (event) => {

        if (currentStroke) 
            currentStroke.extendToMouse()
        else if (currentTextGroup) {
            currentTextGroup.position.x = handPosition[13]
            currentTextGroup.position.y = handPosition[12]
        }
        else if(deleteMode) {

            handPosition.pointToVec3(v1)

            strokeMeshes.forEach(stroke => {
                let hit = false
                stroke.curve.points.forEach(pt => {
                    if ( sq(v1.x-pt.x)+sq(v1.y-pt.y) < .005)
                        hit = true
                })
                if (hit)
                    stroke.dispose()
            })

            textGroups.forEach(group => {
                group.children.forEach(child => {
                    v2.copy(v1)
                    child.updateMatrixWorld()
                    child.worldToLocal(v2)
                    if (v2.x > -.5 && v2.x < .5 &&
                        v2.y > -.5 && v2.y < .5) {
                        group.remove(child)
                        child.geometry.dispose()
                        child.material.dispose()
                    }
                })
            })

            event.stopPropagation()
        }
    })

    // function pasteFromClipboard (event) {
    //     log(event.clipboardData)
    //     const items = (event.clipboardData || event.originalEvent.clipboardData).items;

    //     // Check if clipboard contains an image
    //     for (const item of items) {
    //         if (item.type.indexOf('image') !== -1) {
    //             const file = item.getAsFile();
    //             const reader = new FileReader();

    //             reader.onload = function (event) {
    //                 const img = new Image();
    //                 img.onload = function () {
    //                     const canvas = document.createElement("canvas")                        
    //                     const ctx = canvas.getContext('2d');
    //                     ctx.clearRect(0, 0, canvas.width, canvas.height);
    //                     ctx.drawImage(img, 0, 0, canvas.width, canvas.height);

    //                     createImageBitmap(img).then(function (bitmap) {
    //                         ctx.drawImage(bitmap, 0, 0, canvas.width, canvas.height);

    //                         let material = new THREE.MeshBasicMaterial({ map: new THREE.CanvasTexture(canvas) })
    //                         let mesh = new THREE.Mesh(unchangingUnitSquareGeometry, material)
    //                         scene.add(mesh)
    //                         mesh.scale.x = img.naturalWidth / img.naturalHeight
    //                         mesh.position.x = camera.position.x
    //                         mesh.position.y = camera.position.y
    //                     });
    //                 };
    //                 img.src = event.target.result;
    //             };

    //             reader.readAsDataURL(file);
    //         }
    //     }
    // }

    // document.addEventListener(`paste`, pasteFromClipboard)

    function onPointerDownLowerButton(event) {
        if (currentStroke)
            return

        deleteMode = true

        event.stopPropagation()
    }
    function onPointerDownUpperButton(event) {
        
        if (currentStroke)
            return //this one could theoretically work but the other doesn't so fuck it

        deleteMode = true

        event.stopPropagation()
    }
    
    function onPointerDownNoButtons(event) {

        if(currentStroke) {
            //got one already? it's a pinch!
            currentStroke.dispose()
            currentStroke = null
            return
        }

        let inButton = false

        handPosition.pointToVec3(v1)
        buttons.forEach((btn, i) => {
            v2.copy(v1)
            buttons[i].worldToLocal(v2)
            if (v2.x > -.5 && v2.x < .5 &&
                v2.y > -.5 && v2.y < .5) {
                inButton = true
                btn.onClick(event)
            }
        })

        if (inButton)
            return

        pointerDown = true

        currentStroke = new StrokeMesh()
    }


    
    document.addEventListener(`pointerdown`, event=>{

        if(event.button == lowerPenButtonProfile.button && event.buttons == lowerPenButtonProfile.buttons)
            onPointerDownLowerButton(event)
        else if (event.button == upperPenButtonProfile.button && event.buttons == upperPenButtonProfile.buttons)
            onPointerDownUpperButton(event)
        else
            onPointerDownNoButtons(event)
    })
}