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

    var circuitsGroup = new THREE.Group()
    obj3dsWithOnBeforeRenders.push(circuitsGroup)
    if (!spectatorMode)
        scene.add(circuitsGroup)
    let circuits = []

    initCircuitsMeshes()

    let triVerts = [
        new THREE.Vector3(0.5, 0., 0.),
        new THREE.Vector3(0., 0., -0.25),
        new THREE.Vector3(0., 0., 0.25),]
    let triGeo = new THREE.BufferGeometry().setFromPoints(triVerts)
    

    // let opMats = {
    //     "mul": text("A×B", true, "#000000", true),
    //     "mulReverse": text("A/B", true, "#000000", true),//AB̃
    //     "add": text("A+B", true, "#000000", true),
    //     "sandwich": text("A↷B", true, "#000000", true),
    // }
    // operators.forEach(op => {
    //     if (opMats[op] === undefined)
    //         console.error("need to make a new opmat for ", op)
    // })

    // let curvedTriGeo = new THREE.PlaneGeometry(1.,1.,20,1)
    // curvedTriGeo.translate(.5,0.,0.)
    // for(let i = 0; i < curvedTriGeo.attributes.position.count; ++i) {
    //     let x = curvedTriGeo.attributes.position.array[i*3+0]
    //     let y = curvedTriGeo.attributes.position.array[i*3+1]
    //     let decreasing = smoothstep(x) * .4
    //     curvedTriGeo.attributes.position.array[i * 3 + 1] += y > 0. ? -decreasing : decreasing
    // }
    // curvedTriGeo.translate(-.4,0.,0.)
    // curvedTriGeo.scale(2.,2.6,2.)
    class Circuit extends THREE.Group {
        constructor() {

            super()
            circuitsGroup.add(this)
            circuits.push(this)

            this.opBg = new THREE.Mesh(triGeo, new THREE.MeshBasicMaterial({ color: 0xCCCCCC }))
            // this.opBg.position.x = -.8
            this.opBg.position.z = -1.
            this.add(this.opBg)
            this.opBg.onBeforeRender = () => {
                this.opBg.rotation.y = camera.lookAtAngle
            }

            this.dottedLines = [
                new DottedLine(), new DottedLine(), new DottedLine(),
            ]
            this.floorWires = [
                new FloorWire(this), new FloorWire(this), new FloorWire(this),
            ]
            this.floorWires.forEach( fw => {this.add(fw)})
            this.dottedLines.forEach(dl => {this.add(dl)})

            // this.text = new THREE.Mesh(unchangingUnitSquareGeometry, opMats["mul"])
            // this.text.position.y -= .06
            // this.opGroup.add(this.text)
        }

        getOpBgCorner(target, index, additionX, additionY, additionZ) {
            target.set(additionX || 0., additionY || 0., additionZ || 0.)
            target.add(triVerts[index])
            return this.opBg.localToWorld(target)
        }
    }
    for(let i = 0; i < 10; i++)
        new Circuit()

    let snappablePos = new Fl()
    let onFloor = new Fl()
    let cameraSideDirection = new Fl()
    let circleDirection = new THREE.Vector3()
    let centralAxis = new Dq()
    circuitsGroup.onBeforeRender = () => {

        // updateCircuitAppearancesNew()

        camera.frustum.top.meet(camera.frustum.bottom, dq0).meet(e0, cameraSideDirection)
        cameraSideDirection.directionToGibbsVec(circleDirection).normalize().negate()
        // cameraSideDirection.log()

        let lowestUnusedCircuit = 0
        snappables.forEach(s => {

            //"circuitVisible" is the only interaction of the outside world with this stuff
            if (!s.visible || !s.circuitVisible || s.affecters[0] === null )
                return

            let c = circuits[lowestUnusedCircuit]

            if (opIsSingleArgument(s.affecters[2]))
                console.warn("gotta do something")

            c.visible = true


            // c.text.material = opMats[operators[s.affecters[2]]]
            // c.text.scale.x = c.text.scale.y * (c.text.material.map.image.width / c.text.material.map.image.height)

            // c.visible = true

            let dls = c.dottedLines
            dls.forEach((dl,i) => {

                let isOut = i === 0

                let snappable = isOut ? s : s.affecters[i-1]
                let fw = c.floorWires[i]
                if(snappable === null) {
                    dl.visible = false
                    fw.visible = false
                    return
                }
                else {
                    dl.visible = true
                    fw.visible = true
                }

                snappable.getArrowCenter(snappablePos)
                dl.setHeight(snappablePos.pointToGibbsVec(v1).y)
                snappablePos.projectOn(e2, onFloor)
                onFloor.pointToGibbsVec(dl.position)
            })

            getDesiredCenter(c)
            
            dls.forEach((dl, i) => {

                // if(i !== 1)
                //     return
                
                let isOut = i === 0
                let fw = c.floorWires[i]

                let ourCorner = c.opBg.localToWorld(v1.copy( triVerts[i] ))
                let start = isOut ? ourCorner : dl.position
                let end   = isOut ? dl.position : ourCorner
                let startPt = fl0.pointFromGibbsVec(start)
                let endPt = fl3.pointFromGibbsVec(end)

                rotationAxisFromDirAndPoints(
                    circleDirection,
                    ourCorner,
                    dl.position,
                    centralAxis )

                let startPlane = centralAxis.joinPt(startPt, fl1)
                let endPlane = centralAxis.joinPt(endPt, fl2)
                
                let rotationMoreThan180 = isOut ? 
                    (startPlane.joinPt(endPt, fl4))[0] < 0. :
                    (endPlane.joinPt(startPt, fl4))[0] > 0.

                // log(startPlane)

                endPlane.mulReverse(startPlane, dq0).sqrtSelf()
                // log(rotationMoreThan180)
                // if (rotationMoreThan180)
                //     dq0.multiplyScalar(-1.,dq0)                
                dq0.normalize().logarithm(fw.material.dq)

                // debugPlanes[0].fl.copy(startPlane)
                // centralAxis.meet(e2, debugPlanes[0].markupPos)
                // debugPlanes[1].fl.copy(endPlane)
                // centralAxis.meet(e2, debugPlanes[1].markupPos)
                // log(endPlane)
                // debugDqs[0].dq.copy(centralAxis)

                fw.start.pointFromGibbsVec(start).normalize()
                
            })

            ++lowestUnusedCircuit
            if (lowestUnusedCircuit >= circuits.length)
                new Circuit()
        })

        for(let i = lowestUnusedCircuit; i < circuits.length; i++)
            circuits[i].visible = false
    }
}