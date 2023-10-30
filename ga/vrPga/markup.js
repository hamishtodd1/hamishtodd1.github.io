/*
    You're assuming that there are positions for the start and end in space
    Have it on the camera plane
 */

function initCircuits() {

    // it only needs to be 2D. Somewhat thick
    // could even animate chevrons going along
    // let chevronWire = new THREE
    
    let opMats = {
        "mul": text("AB", true, "#000000"),
        "mulReverse": text("AB̃", true, "#000000"),
        "add": text("A+B", true, "#000000"),
    }
    operators.forEach(op=>{
        if(opMats[op] === undefined)
            console.error("need to make a new opmat for ", op)
    })

    let opMesh = new THREE.Mesh(unchangingUnitSquareGeometry, opMats["mul"])
    opMesh.scale.setScalar(.35)
    opMesh.visible = false
    makeThingOnTop(opMesh)
    scene.add(opMesh)

    let inWire0 = new LineSegment(0xFF0000)
    let inWire1 = new LineSegment(0xFF0000)
    let outWire = new LineSegment(0xFF00FF)
    let allWires = [inWire0,inWire1,outWire]

    allWires.forEach(wire => makeThingOnTop(wire))

    hideCircuit = () => {
        allWires.forEach(wire => {
            wire.visible = false
        })
        
        operators.forEach(op => {
            opMesh.visible = false
        })
    }

    let centerOfAllThree = new Fl()
    showCircuit = (dqViz) => {
        if(dqViz.affecters[0] === null) {
            hideCircuit()
            return
        }

        if (opIsSingleArgument(dqViz.affecters[2]))
            console.warn("gotta do something")

        opMesh.material = opMats[operators[dqViz.affecters[2]]]

        allWires.forEach(wire => {
            wire.visible = true
        })
        opMesh.visible = true

        dqViz.updateFromAffecters()

        dqViz.affecters[0].getArrowCenter(fl0)
        dqViz.affecters[1].getArrowCenter(fl1)
        dqViz.getArrowCenter(fl2)

        fl0.add(fl1,centerOfAllThree).normalize()
        centerOfAllThree.add(fl2,centerOfAllThree)
        centerOfAllThree.pointToVertex(opMesh.position)

        inWire0.set(fl0, centerOfAllThree)
        inWire1.set(fl1, centerOfAllThree)
        outWire.set(fl2, centerOfAllThree)
    }
}

function initMarkup() {

    let markers = [new DqViz(0x00FF00), new DqViz(0x0000FF)]
    markers[0].connection = new LineSegment(0x00FF00)
    markers[1].connection = new LineSegment(0x0000FF)

    function setMarker(marker, toImitate, arrowStartIntended, dq) {

        toImitate.setColor(marker.arrow.material.color.getHex())
        toImitate.updateFromAffecters()

        marker.arrowStart.copy(arrowStartIntended)
        marker.visible = true
        marker.dq.copy(dq || toImitate.dq)

        marker.connection.set( toImitate.getArrowCenter(fl0), marker.getArrowCenter(fl1) )

        marker.connection.visible = true
        marker.connection.geometry.attributes.position.needsUpdate = true
    }

    resetMarkup = () => {

        for (let i = 0; i < 2; i++) {
            markers[i].visible = false
            markers[i].connection.visible = false
        }

        snappables.forEach(snappable => {
            snappable.setColor()
        })

    }
    resetMarkup()

    setMarkup = (dqVizToSnap) => {

        let a0 = dqVizToSnap.affecters[0]
        let a1 = dqVizToSnap.affecters[1]

        // log("yo")

        switch (operators[dqVizToSnap.affecters[2]]) {

            case `mul`:

                //A attatched to the end of B. Yes, it's this way around

                setMarker(markers[0], a1, dqVizToSnap.arrowStart)
                a1.dq.sandwichFl(dqVizToSnap.arrowStart, fl0)
                setMarker(markers[1], a0, fl0)

                break

            case `mulReverse`:

                //it's a0 * ~a1 for this one

                setMarker(markers[0], a1, dqVizToSnap.arrowStart, a1.dq.getReverse(dq0))
                markers[0].dq.sandwichFl(dqVizToSnap.arrowStart, fl0)
                setMarker(markers[1], a0, fl0)

                break

            case `add`:

                //A and B both at the base

                setMarker(markers[0], a1, dqVizToSnap.arrowStart)
                setMarker(markers[1], a0, dqVizToSnap.arrowStart)

                break

            default:

                resetMarkup()
        }
    }
}