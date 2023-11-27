/*
    TODO
        Have it on the camera plane
        wires don't change thickness and always have chevrons going down them from your pov
        Rendered on top of everything
        Given three points and a directed Y shape, probably easy to find a natural way to put that on a sphere
        Circular arcs, ideally all the same length and not overlapping
 */

function initCircuits() {

    // it only needs to be 2D. Somewhat thick
    // could even animate chevrons going along
    // let chevronWire = new THREE

    let circuits = []
    let opMats = {
        "mul": text("A×B", true, "#000000"),
        "mulReverse": text("A/B", true, "#000000"),//AB̃
        "add": text("A+B", true, "#000000"),
    }
    operators.forEach(op => {
        if (opMats[op] === undefined)
            console.error("need to make a new opmat for ", op)
    })

    class Circuit extends THREE.Group {
        constructor() {

            super()
            scene.add(this)
            circuits.push(this)

            this.inWires = [new LineSegment(0xFF0000), new LineSegment(0xFF0000)]
            this.outWire = new LineSegment(0xFF00FF)

            this.allWires = [this.inWires[0], this.inWires[1], this.outWire]
            this.allWires.forEach(wire => {
                this.add(wire)
                makeThingOnTop(wire)
            })
    
            this.opMesh = new THREE.Mesh(unchangingUnitSquareGeometry, opMats["mul"])
            this.opMesh.scale.multiplyScalar(.3)
            makeThingOnTop(this.opMesh)
            this.add(this.opMesh)
        }
    }
    for(let i = 0; i < 10; i++) {
        new Circuit()
    }

    let centerOfAllThree = new Fl()
    updateCircuitAppearances = () => {

        let lowestUnusedCircuit = 0
        snappables.forEach(s => {

            if (!s.visible || s.affecters[0] === null || !s.circuitVisible )
                return

            let c = circuits[lowestUnusedCircuit]

            c.opMesh.lookAt(camera.position)

            if (opIsSingleArgument(s.affecters[2]))
                console.warn("gotta do something")

            c.opMesh.material = opMats[operators[s.affecters[2]]]
            c.opMesh.scale.x = c.opMesh.scale.y * (c.opMesh.material.map.image.width / c.opMesh.material.map.image.height)

            c.visible = true

            s.updateFromAffecters()

            s.affecters[0].getArrowCenter(fl0)
            s.affecters[1].getArrowCenter(fl1)
            s.getArrowCenter(fl2)

            fl0.add(fl1, centerOfAllThree).normalize()
            centerOfAllThree.add(fl2, centerOfAllThree)

            centerOfAllThree.pointToVertex(c.opMesh.position)
            c.inWires[0].set(fl0, centerOfAllThree)
            c.inWires[1].set(fl1, centerOfAllThree)
            c.outWire.set(fl2, centerOfAllThree)

            ++lowestUnusedCircuit
            if (lowestUnusedCircuit>=circuits.length)
                new Circuit()
        })

        for(let i = lowestUnusedCircuit; i < circuits.length; i++)
            circuits[i].visible = false
    }
}