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
    let buttonWidth = .15
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
            -.61,
            0.)
        buttonGroup.add(btn)

        btn.onClick = () => {
            currentColorBtn = btn
        }
    }
    currentColorBtn = buttons[0]

    let buttonNames = [`undo`,`redo`, `mic`]
    let undoneStrokes = []
    buttonNames.forEach((name, i) => {
        let button = new THREE.Mesh(unchangingUnitSquareGeometry, new THREE.MeshBasicMaterial({
            transparent: true
        }))
        buttons.push(button)

        button.onClick = () => {
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
        }

        textureLoader.load( `data/icons/` + name + `.png`, texture => {
            button.material.map = texture
            button.material.needsUpdate = true
            button.position.set(
                (i - buttonNames.length / 2. + .5) * buttonWidth * 1.1,
                .61,
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
            scene.add(this)

            strokeMeshes.push(this)

            this.curve = new THREE.SplineCurve([
                new THREE.Vector2(mousePlanePosition[13], mousePlanePosition[12])
            ])
            this.color = new THREE.Color()
        }

        extendToMouse(){
            let newPt = new THREE.Vector2(mousePlanePosition[13], mousePlanePosition[12])
            this.curve.points.push(newPt)

            let radius = .02
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
            strokeMeshes.forEach(stroke => {
                stroke.position.z -= .005
            })
            currentStroke = null

            undoneStrokes.length = 0
        }
        else if(currentTextGroup)
            endVoiceInput()
    })
    document.addEventListener(`pointermove`, () => {

        if (currentStroke) 
            currentStroke.extendToMouse()
        else if (currentTextGroup) {
            currentTextGroup.position.x = mousePlanePosition[13]
            currentTextGroup.position.y = mousePlanePosition[12]
        }
        else if(deleteMode) {

            mousePlanePosition.pointToVec3(v1)

            strokeMeshes.forEach(stroke => {
                let hit = false
                stroke.curve.points.forEach(pt => {
                    if ( sq(v1.x-pt.x)+sq(v1.y-pt.y) < .005)
                        hit = true
                })
                if (hit)
                    stroke.dispose()
            })
        }
    })


    function onPointerDownLowerButton() {
        if (currentStroke)
            return

        deleteMode = true
    }
    function onPointerDownUpperButton() {
        if (currentStroke)
            return //this one could theoretically work but the other doesn't so fuck it

        deleteMode = true
    }
    
    function onPointerDownNoButtons() {

        if(currentStroke) {
            //got one already? it's a pinch!
            currentStroke.dispose()
            currentStroke = null
            return
        }

        let inButton = false

        mousePlanePosition.pointToVec3(v1)
        buttons.forEach((btn, i) => {
            v2.copy(v1)
            buttons[i].worldToLocal(v2)
            if (v2.x > -.5 && v2.x < .5 &&
                v2.y > -.5 && v2.y < .5) {
                inButton = true
                btn.onClick()
            }
        })

        if (inButton)
            return

        pointerDown = true

        currentStroke = new StrokeMesh()
    }


    let lowerButtonProfile = { button: 5, buttons: 32 }
    let upperButtonProfile = { button: 2, buttons: 2 }
    document.addEventListener(`pointerdown`, event=>{
        log(event.button, event.buttons)

        if(event.button == lowerButtonProfile.button && event.buttons == lowerButtonProfile.buttons)
            onPointerDownLowerButton()
        else if (event.button == upperButtonProfile.button && event.buttons == upperButtonProfile.buttons)
            onPointerDownUpperButton()
        else
            onPointerDownNoButtons()
    })
}