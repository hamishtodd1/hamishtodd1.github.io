/*
    Things on the HUD plane, they are 2D
        Points are lines going out from your eyes
        Lines are planes
        It's just that after you're done calculating them, you intersect them with that plane

    Overhaul
        No AB, A/B, A+B - Colored triangles
        On the floor, that's where the positions of things are projected to

    Where should the boxes be?
        I mean, things attached to your face IS horrible after all
        You kind of want to read left to right, top to bottom
        They appear on the screen in a place dependent on where they come in the pile of instructions you're looking at

    

    Inventing a text editor again
        You're thinking this because you like algebra. But people don't care about algebra! So, don't do this!
        Always facing towards you, positioned using one of your hands
        And then, yes, you can "cancel boxes away"
        Wow, you've invented an editor again
            And while you're at it, have sliders and complex space on there too
            And have it interacted with using the keyboard. Great.
            And yet, nobody has this right now
 */

function initCircuits() {

    let dottedGeo = new THREE.BufferGeometry()

    // it only needs to be 2D. Somewhat thick
    // could even animate chevrons going along

    let bigWireMat1 = new THREE.LineBasicMaterial({ color: 0xFF0000 })
    let bigWireMat2 = new THREE.LineBasicMaterial({ color: 0x00FF00 })

    // let bigWireGeo = new THREE.PlaneGeometry(1.,1.)
    // bigWireGeo.translate(0.,0.5,0.)
    // let bigWireMat = new THREE.MeshPhong2Material()
    // bigWireMat.injections = [
    //     //it's on a camera plane, immediately in front of the camera
    // ]

    let plane1 = new Fl()
    let plane2 = new Fl()
    let bigWireGeo = new THREE.PlaneGeometry(1.,1.,10,10)
    class BigWire extends THREE.Line {
        constructor(isOut) {
            super(bigWireGeo, isOut?bigWireMat1:bigWireMat2)
            scene.add(this)
            
            return this
        }

        //gonna bring it in front of everything manually, "put on top" doesn't really work
        set(p1, p2, d) {

            // p1.inner(p1.joinPt(d,fl0),plane1)
            // p1.add(p2,fl0)


            p1.pointToVertex(v1).toArray(this.geometry.attributes.position.array, 0)
            p2.pointToVertex(v1).toArray(this.geometry.attributes.position.array, 3)
            this.geometry.attributes.position.needsUpdate = true
        }
    }

    let circuits = []
    let opMats = {
        "mul": text("A×B", true, "#000000", true),
        "mulReverse": text("A/B", true, "#000000", true),//AB̃
        "add": text("A+B", true, "#000000", true),
    }
    operators.forEach(op => {
        if (opMats[op] === undefined)
            console.error("need to make a new opmat for ", op)
    })


    // let triangleGeometry = new THREE.PlaneGeometry(1.,1.,20,1)
    // triangleGeometry.translate(.5,0.,0.)
    // for(let i = 0; i < triangleGeometry.attributes.position.count; ++i) {
    //     let x = triangleGeometry.attributes.position.array[i*3+0]
    //     let y = triangleGeometry.attributes.position.array[i*3+1]
    //     let decreasing = smoothstep(x) * .4
    //     triangleGeometry.attributes.position.array[i * 3 + 1] += y > 0. ? -decreasing : decreasing
    // }
    // triangleGeometry.translate(-.4,0.,0.)
    // triangleGeometry.scale(2.,2.6,2.)
    let triangleGeometry = new THREE.CircleGeometry(.7, 64)
    class Circuit extends THREE.Group {
        constructor() {

            super()
            scene.add(this)
            circuits.push(this)

            this.inWires = [new BigWire(false), new BigWire(false)]
            this.outWire = new BigWire(true)

            let allWires = [this.inWires[0], this.inWires[1], this.outWire]
            allWires.forEach(wire => {
                this.add(wire)
            })
    
            this.opGroup = new THREE.Group()
            this.opGroup.scale.multiplyScalar(.3)
            this.add(this.opGroup)

            let triangle = new THREE.Mesh(triangleGeometry, new THREE.MeshBasicMaterial({ color: 0xCCCCCC }))
            triangle.position.z = -.01
            this.opGroup.add( triangle )

            this.text = new THREE.Mesh(unchangingUnitSquareGeometry, opMats["mul"])
            makeThingOnTop(this.text)
            this.text.position.y -= .06
            this.opGroup.add(this.text)
        }
    }
    for(let i = 0; i < 10; i++)
        new Circuit()

    let centerOfAllThree = new Fl()
    updateCircuitAppearances = () => {

        let lowestUnusedCircuit = 0
        snappables.forEach(s => {

            if (!s.visible || s.affecters[0] === null || !s.circuitVisible )
                return

            let c = circuits[lowestUnusedCircuit]

            if (opIsSingleArgument(s.affecters[2]))
                console.warn("gotta do something")

            c.text.material = opMats[operators[s.affecters[2]]]
            c.text.scale.x = c.text.scale.y * (c.text.material.map.image.width / c.text.material.map.image.height)

            c.visible = true

            s.updateFromAffecters()

            s.affecters[0].getArrowCenter(fl0)
            s.affecters[1].getArrowCenter(fl1)
            s.getArrowCenter(fl2)

            fl0.add(fl1, centerOfAllThree).normalize()
            centerOfAllThree.add(fl2, centerOfAllThree)

            centerOfAllThree.pointToVertex(c.opGroup.position)
            c.inWires[0].set(fl0, centerOfAllThree)
            c.inWires[1].set(fl1, centerOfAllThree)
            c.outWire.set(fl2, centerOfAllThree)

            c.opGroup.lookAt(camera.position)

            ++lowestUnusedCircuit
            if (lowestUnusedCircuit>=circuits.length)
                new Circuit()
        })

        for(let i = lowestUnusedCircuit; i < circuits.length; i++)
            circuits[i].visible = false
    }
}