function initMainDw() {
    
    let mainDw = DisplayWindow()
    mainDw.scale.x = 10.5
    mainDw.scale.y = mainDw.scale.x
    mainDw.renderOrder = carat.renderOrder + 1
    carat.material.depthTest = false

    let buttons = {}
    function addButton(newLabel)
    {
        let index = 0
        for(label in buttons) ++index

        buttons[newLabel] = text(newLabel)	
        buttons[newLabel].scale.multiplyScalar(.1)
        mainDw.add(buttons[newLabel])	

        buttons[newLabel].position.y = -.5 - buttons[newLabel].scale.y * (.5 + index * 1.1)
        buttons[newLabel].position.z = .01

        onClicks.push({
            z: () => mouse.checkIfOnScaledUnitSquare(buttons[newLabel]) ? 2. : -Infinity,
            start: () => { selectedFunctionality = newLabel },
        })
    }
    addButton("make vector")
    addButton("make R->R2")
    let selectedFunctionality = null

    updateFunctions.push(() =>
    {
        for (functionality in buttons)
            buttons[functionality].material.color.g = functionality === selectedFunctionality ? 0. : 1.

        v1.copy(carat.position)
        pad.localToWorld(v1)
        let bottomYDestination = v1.y - .5 * pad.scale.y
        if (bottomYDestination > camera.topAtZZero - mainDw.scale.y)
            bottomYDestination = camera.topAtZZero - mainDw.scale.y
        mainDw.bottomY += .1 * (bottomYDestination - mainDw.bottomY)
        mainDw.position.x = camera.rightAtZZero - mainDw.scale.x * .5
    })

    //better: doodle on what seems to you like a plane, but it's extruded in z because z is input time
    //or the doodling stays on the plane and if you look at it three dimensionally it's extruded?
    {
        var mouseTrail = new THREE.Line(new THREE.Geometry())
        mainDw.scene.add(mouseTrail)
        for (let i = 0; i < 256; i++)
            mouseTrail.geometry.vertices.push(new THREE.Vector3())
        var lastTrailVertexToBeAssigned = 0
    }

    onClicks.push({
        z: () => mouse.checkIfOnScaledUnitSquare(mainDw) ? 1. : -Infinity,
        start: () => {
            if(selectedFunctionality === "make vector" ) {
                ++numFreeParameterMultivectors
                let threeCharacterInsertion = variables[numFreeParameterMultivectors - 1].name
                while (threeCharacterInsertion.length < 3) threeCharacterInsertion += " "
                addStringAtCarat( threeCharacterInsertion )
            }
        },
        during:()=>{
            if ( selectedFunctionality === "make R->R2") {
                let ndcOnDisplayWindow = mainDw.worldToLocal(mouse.getZZeroPosition(v1))

                mouseTrail.geometry.vertices[lastTrailVertexToBeAssigned].set(ndcOnDisplayWindow.x, ndcOnDisplayWindow.y, 0.)
                mouseTrail.geometry.vertices[lastTrailVertexToBeAssigned].multiplyScalar(8.)
                for (let i = lastTrailVertexToBeAssigned + 1, il = mouseTrail.geometry.vertices.length; i < il; i++)
                    mouseTrail.geometry.vertices[i].copy(mouseTrail.geometry.vertices[lastTrailVertexToBeAssigned])
                mouseTrail.geometry.verticesNeedUpdate = true

                ++lastTrailVertexToBeAssigned
                if (lastTrailVertexToBeAssigned >= mouseTrail.geometry.vertices.length)
                    lastTrailVertexToBeAssigned = 0
            }

            if ( selectedFunctionality === "make vector") {
                //TODO they're getting created permanently

                let variable = variables[numFreeParameterMultivectors - 1]

                mouse.getZZeroPosition(v1)
                mainDw.worldToLocal(v1)
                for (let i = 0, il = variable.elements.length; i < il; ++i)
                    variable.elements[i] = 0.
                variable.elements[1] = v1.x
                variable.elements[2] = v1.y

                //COULD use numerals to display the string it as a linear combination of the things, but where would be the fun in that?
            }
        }
    })
}