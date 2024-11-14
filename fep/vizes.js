function initVizes() {

    let center = new Mv()

    let circlePoints = []
    for (let i = 0; i < 100; ++i) {
        let angle = i / 100 * Math.PI * 2.
        circlePoints.push(new THREE.Vector3(Math.cos(angle), Math.sin(angle), 0))
    }
    let circleGeo = new THREE.BufferGeometry(1., 100).setFromPoints(circlePoints)
    let lineGeo = new THREE.BufferGeometry(1., 100).setFromPoints([new THREE.Vector3(0., 999., 0.), new THREE.Vector3(0., -999., 0.)])

    let horizontalLine = new Mv() // guaranteed to always be e2 for the actual thing. Whatever.
    let leftAndRightPp = new Mv()
    let leftAndRightVecs = [ new THREE.Vector3(), new THREE.Vector3() ]
    let defaultMat = new THREE.LineBasicMaterial({ color: 0x00ff00 })
    class CircleViz extends THREE.Object3D {

        constructor(color) {

            //if you want orientation for this, i.e. spikes,
            //one option for the sake of consistencey is for it to be stateful
            //eg there is a "starting point" on the circle being dragged around
            //jesus it is way easier with center-and-radius

            super()

            let mat = color === undefined ? defaultMat : new THREE.LineBasicMaterial({ color })
            this.circle = new THREE.LineLoop(circleGeo, mat)
            this.line = new THREE.LineLoop(lineGeo, mat)
            this.add(this.circle)
            this.add(this.line)

            this.mv = new Mv()

            scene.add(this)

            obj3dsWithOnBeforeRenders.push(this)
        }

        onBeforeRender() {

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
                let quatMv = onOrigin.mulReverse(_e1, mv1).cheapSqrt(mv2)
                this.line.quaternion.w = quatMv[0]
                this.line.quaternion.z = quatMv[5]
            }
        }
    }
    window.CircleViz = CircleViz

    let ptGeo = new THREE.SphereGeometry(.04)
    let pt1Mat = new THREE.MeshBasicMaterial({ color: 0x0000ff })
    let pt2Mat = new THREE.MeshBasicMaterial({ color: 0x00ffff })
    class PtPairViz extends THREE.Object3D {

        constructor(haveCircles = false) {

            super()
            scene.add(this)

            this.mv = new Mv()

            this.pt1 = new THREE.Mesh(ptGeo, pt1Mat)
            this.pt2 = new THREE.Mesh(ptGeo, pt2Mat)
            this.add(this.pt1)
            this.add(this.pt2)

            this.positions = [this.pt1.position, this.pt2.position]

            if(haveCircles)
                this.circles = [new CircleViz(), new CircleViz()]

            //and two circles for a gauging

            obj3dsWithOnBeforeRenders.push(this)
        }

        onBeforeRender() {
            let mySq = this.mv.sqScalar()
            if (mySq !== 0.)
                this.mv.pointPairToVecs(this.positions)
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