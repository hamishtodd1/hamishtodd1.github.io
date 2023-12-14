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

function initCircuitsNew() {

    {
        let injections = [
            {
                type: `vertex`,
                precedes: ``,
                str: egaVerboseGlsl + egaGlsl + `
                float TAU = 6.283185307179586;
                uniform float[8] dq;
                uniform vec3 extraVec1; //left start
                uniform vec3 extraVec2; //right start
                out float numChevronsAlong;
                out float r;
                out float alongness;
            \n`
            },
            {
                type: `vertex`,
                precedes: `	#include <project_vertex>`,
                str: `

                // You have a start point, and a dq, and 

                r = transformed.x < 0. ? -1. : 1.;
                vec4 start = vec4( transformed.x < 0. ? extraVec1 : extraVec2,1.);
                
                alongness = transformed.z;

                float[8] alongLog; multiplyScalar( dq, alongness, alongLog );
                float[8] along; dqExp( alongLog, along );
                vec4 alonged = sandwichDqPoint( along, start );
                transformed = alonged.xyz / alonged.w;
                
                // transformed.xyz += ;

                // vNormal = vec3(0.,1.,0.);
            `,
                //` transformed.y += 0.; vNormal.x += 0.;\n`
            },
            {
                type: `fragment`,
                precedes: ``,
                str: `
                uniform vec3 extraVec3; //x is num chevrons long
                in float alongness;
                in float r;
            \n`
            },
            {
                type: `fragment`,
                precedes: `	#include <dithering_fragment>`,
                str: `
                float numChevronsAlong = (alongness) * extraVec3.x + abs(r);
                bool isYellow = mod( numChevronsAlong, 2. ) < 1.;
                gl_FragColor.rgb *= isYellow ? 0. : 1.;
            \n`
            },
        ]

        let geo = new THREE.PlaneGeometry(1., 1., 1, 100)
        geo.rotateX(Math.PI / 2.)
        geo.translate(0.,0.,.5)
        let mat = new THREE.MeshPhong2Material({
            color: 0xFFFF00,
            side:THREE.DoubleSide //not ideal but needed for now
        })
        mat.injections = injections
        let mrh = new THREE.Mesh(geo, mat)
        scene.add(mrh)

        let start  = new Fl()
        
        let translation = new Dq()
        let momentumLine = new Dq()
        let radius = .07
        blankFunction = () => {

            start[7] = 1.
            start.point(Math.cos(-frameCount * .01), 0., -1.5, 1.)

            //note you are sending in a logarithm
            mat.dq[5] = 1.
            mat.dq[1] = 1.
            mat.extraVec3.x = mat.dq.exp(dq0).pointTrajectoryArcLength(start) / radius
            // log(mat.extraVec3.x)

            start.momentumLine(mat.dq,momentumLine).normalize()
            momentumLine.addScaled(e02,  radius, dq1).mulReverse(momentumLine, translation).sqrtSelf()
            translation.sandwich(start, fl0).pointToVertex(mat.extraVec1)
            momentumLine.addScaled(e02, -radius, dq1).mulReverse(momentumLine, translation).sqrtSelf()
            translation.sandwich(start, fl0).pointToVertex(mat.extraVec2)
        }
    }

    // dotted lines going up
    {
        const dottedGeo = new THREE.BufferGeometry()
        const dotLen = .03
        const dotWidthHalf = .01
        const numDots = 300
        const dotVerts = 6
        dottedGeo.setAttribute('position', new THREE.BufferAttribute(new Float32Array(dotVerts * 3 * numDots), 3))
        const dgp = dottedGeo.attributes.position.array
        for (let i = 0; i < numDots; ++i) {
            let y = i * dotLen * 2.

            //tri 1
            dgp[(i * dotVerts + 0) * 3 + 0] = -dotWidthHalf
            dgp[(i * dotVerts + 0) * 3 + 1] = y + 0.
            dgp[(i * dotVerts + 1) * 3 + 0] = dotWidthHalf
            dgp[(i * dotVerts + 1) * 3 + 1] = y + dotLen
            dgp[(i * dotVerts + 2) * 3 + 0] = -dotWidthHalf
            dgp[(i * dotVerts + 2) * 3 + 1] = y + dotLen

            //tri 2
            dgp[(i * dotVerts + 3) * 3 + 0] = -dotWidthHalf
            dgp[(i * dotVerts + 3) * 3 + 1] = y + 0.
            dgp[(i * dotVerts + 4) * 3 + 0] = dotWidthHalf
            dgp[(i * dotVerts + 4) * 3 + 1] = y + 0.
            dgp[(i * dotVerts + 5) * 3 + 0] = dotWidthHalf
            dgp[(i * dotVerts + 5) * 3 + 1] = y + dotLen
        }
        dottedGeo.attributes.position.needsUpdate = true
        let clippingPlane = new THREE.Plane(new THREE.Vector3(0., -1., 0.), 1.)
        renderer.localClippingEnabled = true
        log(clippingPlane)
        var dm = new THREE.Mesh(dottedGeo, new THREE.MeshBasicMaterial({
            color: 0xFFFFFF,
            clippingPlanes: [clippingPlane],
            // side:THREE.DoubleSide
        }))
        scene.add(dm)
    }

    let opGeo = new THREE.BufferGeometry().setFromPoints([
        new THREE.Vector3(0., 0., 0.25),
        new THREE.Vector3(0.5,0.,0.), 
        new THREE.Vector3(0., 0.,-0.25)])
    let m = new THREE.Mesh(opGeo, new THREE.MeshBasicMaterial({color:0xCCCCCC}))
    scene.add(m)

    //we're going to have some circular arcs

    updateCircuitAppearancesNew = () => {
        let lookAngle = Math.atan2(camera.position.x, camera.position.z)
        dm.rotation.y = lookAngle
    }
}

function initCircuits() {

    initCircuitsNew()

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
    // let bigWireGeo = new THREE.PlaneGeometry(1.,1.,10,10)
    let bigWireGeo = new THREE.BufferGeometry().setFromPoints([new THREE.Vector3(),new THREE.Vector3()])
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
        "sandwich": text("A↷B", true, "#000000", true),
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

        updateCircuitAppearancesNew()

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
            c.opGroup.position.y = camera.position.y
            c.opGroup.lookAt(camera.position)

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