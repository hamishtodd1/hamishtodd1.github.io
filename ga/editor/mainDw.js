/*
    Fairly likely: you want to make one vector in terms of two or three others (Maybe also them-multiplied-by-integer complex numbers).

    choosing the next thing to happen
        it'd be crowded to have every single variable. But maybe they only appear in place if you're almost going to snap to them?
        drawing
            functions from time to multivectors
            individual multivectors
            draw on top of what's already in there, eg a tangent vector on a curve
            Grabbing a free parameter and editing it
    
    Fourier or taylor? Well sometimes you join up your loop. Fourier for that
        If you've got projective geometry, i.e. lines = circles with center at infinity, can't you have a square wave represented exactly?

    So you're on a new line
        There's a displayWindow but nothing in there
        You type some mvs, say 3 of them, and they appear in there but you don't have an operation yet
        If you click in the thing you make a new mv. Only got the 2 dimensions soooo
        System goes through every combination of + and * for... certainly the basis vectors and what you've put in your line, maybe your whole scope

    Could put only highlighted ones in there

    making the things with the mouse, in a certain plane
        Vector, translator
        "transformation" may roll together many things? Click in one place, unclick in another

    We also want this thing to be able to edit, not just create
        
*/

function initMainDw() {

    mainDw = DisplayWindow(false)
    mainDw.scale.setScalar(8.)
    mainDw.renderOrder = carat.renderOrder + 1
    carat.material.depthTest = false

    let buttons = {}
    function addButton(newLabel,func)
    {
        let index = 0
        for(label in buttons) ++index

        buttons[newLabel] = text(newLabel)	
        buttons[newLabel].scale.multiplyScalar(.1)
        mainDw.add(buttons[newLabel])	

        buttons[newLabel].position.y = -.5 - buttons[newLabel].scale.y * .5 - .001
        buttons[newLabel].position.x = (index-1.) * .3
        buttons[newLabel].position.z = .01

        onClicks.push({
            z: () => mouse.checkIfOnScaledUnitSquare(buttons[newLabel]) ? 2. : -Infinity,
            start: () => { selectedFunctionality = newLabel },
        })

        buttons[newLabel].func = func
    }

    updateFunctions.push(() => {
        for (functionality in buttons)
            buttons[functionality].material.color.g = functionality === selectedFunctionality ? 0. : 1.

        v1.copy(carat.position)
        pad.localToWorld(v1)
        let bottomYDestination = v1.y - .5 * pad.scale.y
        if (bottomYDestination > camera.topAtZZero - mainDw.scale.y - .3)
            bottomYDestination = camera.topAtZZero - mainDw.scale.y - .3
        mainDw.bottomY += .1 * (bottomYDestination - mainDw.bottomY)
        mainDw.position.x = camera.rightAtZZero - mainDw.scale.x * .5
    })

    addButton("vector", () => {
        //TODO they're getting created permanently

        let variable = variables[numFreeParameterMultivectors - 1]

        mouse.getZZeroPosition(v1)
        mainDw.worldToLocal(v1)
        for (let i = 0, il = variable.elements.length; i < il; ++i)
            variable.elements[i] = 0.
        variable.elements[1] = v1.x
        variable.elements[2] = v1.y

        //COULD use numerals to display the string it as a linear combination of the things, but where would be the fun in that?
    })

    addButton("rotor", () => {
        //bivector always goes up on screen, always in a certain plane

        //probably the right thing to do is have a stanford teapot and rotate that thing
    })

    //better: doodle on what seems to you like a plane, but it's extruded in z because z is input time
    //or the doodling stays on the plane and if you look at it three dimensionally it's extruded?
    {
        var mouseTrail = new THREE.Line(new THREE.Geometry())
        mainDw.scene.add(mouseTrail)
        for (let i = 0; i < 256; i++)
            mouseTrail.geometry.vertices.push(new THREE.Vector3())
        var lastTrailVertexToBeAssigned = 0
        
        addButton("curve", () => {
            let ndcOnDisplayWindow = mainDw.worldToLocal(mouse.getZZeroPosition(v1))

            mouseTrail.geometry.vertices[lastTrailVertexToBeAssigned].set(ndcOnDisplayWindow.x, ndcOnDisplayWindow.y, 0.)
            mouseTrail.geometry.vertices[lastTrailVertexToBeAssigned].multiplyScalar(8.)
            for (let i = lastTrailVertexToBeAssigned + 1, il = mouseTrail.geometry.vertices.length; i < il; i++)
                mouseTrail.geometry.vertices[i].copy(mouseTrail.geometry.vertices[lastTrailVertexToBeAssigned])
            mouseTrail.geometry.verticesNeedUpdate = true

            ++lastTrailVertexToBeAssigned
            if (lastTrailVertexToBeAssigned >= mouseTrail.geometry.vertices.length)
                lastTrailVertexToBeAssigned = 0

            //bit better would be to have it be flat then set the extrusion once you're done
        })
    }

    onClicks.push({
        z: () => mouse.checkIfOnScaledUnitSquare(mainDw) ? 1. : -Infinity,
        start: () => {
            if(selectedFunctionality === "vector" ) {
                ++numFreeParameterMultivectors

                //perhaps it's bad to do this - editing things in the dw should not add to the text, only modify?
                //perhaps it should be that free parameters get a certain marking, a little handle you can grab
                
                let newlineNeeded = backgroundString[carat.positionInString] !== "\n" || (carat.positionInString !== 0 && backgroundString[carat.positionInString - 1] !== "\n")

                if ( newlineNeeded ) {
                    let backgroundStringLength = backgroundString.length
                    while (backgroundString[carat.positionInString] !== "\n" && carat.positionInString !== backgroundStringLength - 1)
                        ++carat.positionInString
                    addStringAtCarat("\n")
                }

                let threeCharacterInsertion = variables[numFreeParameterMultivectors - 1].name
                while (threeCharacterInsertion.length < 3) threeCharacterInsertion += " "
                addStringAtCarat( threeCharacterInsertion )

                // if (newlineNeeded)
                //     addStringAtPosition("\n", carat.positionInString)
            }
        },
        during:()=>{
            buttons[selectedFunctionality].func()
        }
    })

    let selectedFunctionality = "rotor"

    return mainDw
}