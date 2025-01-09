function initVizes3d(localScene) {

    let sphereGeo = new THREE.SphereGeometry(1., 32, 32)
    let planeGeo = new THREE.PlaneGeometry(1., 1., 32, 32)
    class SphereViz extends THREE.Object3D {
        constructor(color) {

            super()

            this.sphere = new THREE.Mesh(sphereGeo, new THREE.MeshPhongMaterial({ color }))
            this.plane = new THREE.Mesh(planeGeo, new THREE.MeshPhongMaterial({ color }))
            this.add(this.sphere)
            this.add(this.plane)

            localScene.add(this)

            this.mv = new Cga()
        }

        onBeforeRender() {

            let isPlane = this.mv.inner(e1230, cga0).sqScalar() < .001
            this.sphere.visible = !isPlane
            this.plane.visible = isPlane
            if(!isPlane) {
                this.mv.spherePosToVec(this.sphere.position)
            }

            // this.sphere.position.copy(this.mv)
            // this.plane.position.copy(this.mv)
        }
    }
    window.SphereViz = SphereViz
}

function initVizes2d() {

    let altering = -1
    let posInbeliefSpaceScene = new THREE.Vector3()
    let freeGaussians = []
    let connectingArcs = []
    document.addEventListener('mousemove', e => {
        if (altering !== -1) {
            
            beliefSpaceScene.worldToLocal(posInbeliefSpaceScene.copy(mousePos))

            if (posInbeliefSpaceScene.y > bg.scale.y / 2.)
                posInbeliefSpaceScene.y = bg.scale.y / 2.
            if(posInbeliefSpaceScene.y < 0.)
                posInbeliefSpaceScene.y = 0.
            if (posInbeliefSpaceScene.x > bg.scale.x / 2.) {
                posInbeliefSpaceScene.x = bg.scale.x / 2.
                //maybe infinity?
            }
            if (posInbeliefSpaceScene.x < -bg.scale.x / 2.) {
                posInbeliefSpaceScene.x = -bg.scale.x / 2.
                //maybe infinity?
            }

            ppVizes[altering].gaussian.setMeanSd(posInbeliefSpaceScene.x, posInbeliefSpaceScene.y)
            resetRatIfExistent(ppVizes[altering])

            if(freeGaussians.length > 1) {

                let index = 0
                for(let i = 0, il = freeGaussians.length; i < il; ++i) {
                    for(let j = i+1, jl = freeGaussians.length; j < jl; ++j) {
                        connectingArcs[index].setFromStartEnd(freeGaussians[i].viz, freeGaussians[j].viz)
                        connectingArcs[index].visible = true
                        ++index
                    }
                }
                for(let i = index, il = connectingArcs.length; i < il; ++i)
                    connectingArcs[i].visible = false
            }
        }
    })
    document.addEventListener('mousedown', e => {
        if(e.button !== 0)
            return

        beliefSpaceScene.worldToLocal(posInbeliefSpaceScene.copy(mousePos))

        let inFrame = Math.abs(posInbeliefSpaceScene.x) < bg.scale.x / 2. && Math.abs(posInbeliefSpaceScene.y) < bg.scale.y / 2.
        if(!inFrame)
            return

        altering = -1
        let lowestDist = Infinity
        let minDist = .15
        ppVizes.forEach((ppv,i)=>{
            if(ppv.visible === false)
                return
            let dist = posInbeliefSpaceScene.distanceTo(ppv.positions[0].y > 0. ? ppv.positions[0] : ppv.positions[1])
            if ( dist < lowestDist && dist < minDist) {
                lowestDist = dist
                altering = i
            }
        })

        if(altering === -1) {
            // debugger
            col0.setHSL( Math.random(), 1., .5 )
            let gaussian = new Gaussian(col0.getHex())
            altering = ppVizes.indexOf(gaussian.viz)
            gaussian.setMeanSd(posInbeliefSpaceScene.x, posInbeliefSpaceScene.y)

            gaussian.visible = true
            gaussian.viz.visible = true

            freeGaussians.push(gaussian)
        }
    })
    document.addEventListener('mouseup', e => {
        if (e.button === 0)
            altering = -1
    })

    beliefSpaceScene = new THREE.Group()
    simplyMoveableThings.push(beliefSpaceScene)
    beliefSpaceScene.position.y = -1.87
    scene.add(beliefSpaceScene)

    let bg = new THREE.Mesh(unchangingUnitSquareGeometry, new THREE.MeshBasicMaterial({ color: 0xA2D6F9 }))
    bg.scale.setScalar(2.7,1.6,1.)
    bg.position.z = -.1
    beliefSpaceScene.add(bg)
    let frame = new THREE.Mesh(unchangingUnitSquareGeometry, new THREE.MeshBasicMaterial({ color: 0x000000 }))
    frame.scale.set(bg.scale.x + .1, bg.scale.y + .1, 1.)
    frame.position.z = -.11
    beliefSpaceScene.add(frame)

    let circlePoints = []
    for (let i = 0; i < 100; ++i) {
        let angle = i / 100 * Math.PI * 2.
        circlePoints.push(new THREE.Vector3(Math.cos(angle), Math.sin(angle), 0))
    }
    let circleGeo = new THREE.BufferGeometry(1., 500).setFromPoints(circlePoints)
    let lineGeo = new THREE.BufferGeometry(1., 100).setFromPoints([new THREE.Vector3(0., 999., 0.), new THREE.Vector3(0., -999., 0.)])

    let horizontalLine = new Mv31() // guaranteed to always be e2 for the actual thing. Whatever.
    let leftAndRightPp = new Mv31()
    let leftAndRightVecs = [ new THREE.Vector3(), new THREE.Vector3() ]
    let defaultMat = new THREE.LineBasicMaterial({ color: 0x00ff00 })
    let center = new Mv31()
    let someClippingPlanes = [
        new THREE.Plane().setComponents( 1.,0.,0., bg.scale.x/2.),
        new THREE.Plane().setComponents(-1.,0.,0., bg.scale.x/2.),
        new THREE.Plane().setComponents( 0.,1.,0., bg.scale.y/2.),
    ]
    class CircleViz extends THREE.Object3D {

        constructor(color) {

            //if you want orientation for this, i.e. spikes,
            //one option for the sake of consistencey is for it to be stateful
            //eg there is a "starting point" on the circle being dragged around
            //jesus it is way easier with center-and-radius

            super()

            let mat = color === undefined ? defaultMat : new THREE.LineBasicMaterial({
                color,
                clippingPlanes: [
                    new THREE.Plane().setComponents(  1., 0., 0., 0.),
                    new THREE.Plane().setComponents( -1., 0., 0., 0.),
                ],
            })
            this.circle = new THREE.LineLoop(circleGeo, mat)
            this.line = new THREE.LineLoop(lineGeo, mat)
            this.add(this.circle)
            this.add(this.line)

            this.mv = new Mv31()

            beliefSpaceScene.add(this)

            obj3dsWithOnBeforeRenders.push(this)
        }

        setFromStartEnd(startViz, endViz) {
            endViz.mv.mulReverse(startViz.mv, mv0).cheapSqrt(mv0).selectGrade(2,mv0)
            mv0.inner(_e1pm, this.mv)
            let xStart = startViz.pt1.getWorldPosition(v1).x
            let xEnd   = endViz.pt1.getWorldPosition(v1).x
            let higher = xStart > xEnd ? xStart : xEnd
            let lower = xStart < xEnd ? xStart : xEnd
            this.circle.material.clippingPlanes[0].constant = -lower
            this.circle.material.clippingPlanes[1].constant = higher
        }

        onBeforeRender() {

            if(this.mv.isZero()) {
                this.circle.visible = false
                this.line.visible = false
            }

            // zero-bugs version
            // let screenBounds = [e1+e0, e1-e0...]
            // screenBounds.forEach(bound => {
            //     let intersection = bound.wedge(this.mv, mv0)
            //     if (intersection.sqScalar() < 0.) {
            //         // inner product with e120, that's the center/rotation axis (possibly translation axis)
            //     }
            // })

            this.mv.sandwich(_e0, center)
            let isLine = Math.abs(center[3] - center[4]) < .001
            
            if (!isLine) {

                this.circle.visible = true
                this.line.visible = false

                center.inner(_e20, horizontalLine)
                horizontalLine.wedge(this.mv, leftAndRightPp)
                leftAndRightPp.inner(_e12pm, mv0).pointPairToVecs(leftAndRightVecs)
                let diameter = leftAndRightVecs[0].distanceTo(leftAndRightVecs[1])

                this.circle.scale.setScalar(diameter / 2.)
                this.mv.circlePosToVec(this.circle.position)

                //might want to be clever and have an arc instead of a circle
            }
            else {
                this.line.visible = true
                this.circle.visible = false

                // if (frameCount == 100)
                //     debugger
                _e12.projectOn(this.mv, mv0).flatPpToVec(this.line.position)
                let onOrigin = this.mv.projectOn(_e12, mv0)
                let quatMv31 = onOrigin.mulReverse(_e1, mv1).cheapSqrt(mv2)
                this.line.quaternion.w = quatMv31[0]
                this.line.quaternion.z = quatMv31[5]
            }
        }
    }
    window.CircleViz = CircleViz
    for (let i = 0; i < 6; ++i)
        connectingArcs.push(new CircleViz(0x000000))

    let ptGeo = new THREE.SphereGeometry(.04)
    let myCol = new THREE.Color()
    let ppVizes = []
    class PtPairViz extends THREE.Object3D {

        constructor( haveCircles = false, col, gaussian ) {

            super()
            ppVizes.push(this)
            beliefSpaceScene.add(this)

            this.mv = new Mv31()

            if (col === undefined)
                col = myCol.setRGB(Math.random(), Math.random(), Math.random()).getHex()
            let pt1Mat = new THREE.MeshBasicMaterial({ color: col * 0.8 })
            let pt2Mat = new THREE.MeshBasicMaterial({ color: col })

            this.pt1 = new THREE.Mesh(ptGeo, pt1Mat)
            this.pt2 = new THREE.Mesh(ptGeo, pt2Mat)
            this.add(this.pt1)
            this.add(this.pt2)

            this.positions = [this.pt1.position, this.pt2.position]

            if(haveCircles)
                this.circles = [new CircleViz(), new CircleViz()]

            //and two circles for a gauging

            obj3dsWithOnBeforeRenders.push(this)

            this.gaussian = gaussian || null
        }

        onBeforeRender() {
            let mySq = this.mv.sqScalar()
            if (mySq !== 0.) {
                this.mv.pointPairToVecs(this.positions)
                this.pt1.visible = this.pt1.position.y < bg.scale.y / 2. && this.pt1.position.x < bg.scale.x / 2. && this.pt1.position.x > -bg.scale.x / 2.
                this.pt2.visible = this.pt2.position.y < bg.scale.y / 2. && this.pt2.position.x < bg.scale.x / 2. && this.pt2.position.x > -bg.scale.x / 2.
            }
            else {
                //push them apart a little. conformalDance did.
            }

            if(this.circles) {
                if(this.mv.sqScalar() >= 0.) {
                    this.circles[0].visible = false
                    this.circles[1].visible = false
                }
                else {
                    this.circles[0].visible = true
                    this.circles[1].visible = true
                    
                    this.mv.inner(_e0, this.circles[0].mv)
                    this.circles[0].mv.cheapNormalize(this.circles[0].mv)
                    this.mv.inner(this.circles[0].mv, this.circles[1].mv)
    
                    let r = this.mv.multiplyScalar(.004 * frameCount, mv0).exp(mv1)
                    r.sandwich(this.circles[0].mv, this.circles[0].mv)
                    r.sandwich(this.circles[1].mv, this.circles[1].mv)
                }
            }
        }
    }
    window.PtPairViz = PtPairViz
}