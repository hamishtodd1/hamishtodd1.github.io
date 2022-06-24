/* 
    want number line
    but this thing about having the coefficient of e0123

    well even if it is 3D it should have an independent camera

    there's a circle marked, and perhaps you always see the projection onto there

    For the time being, gonna make a "slider" with this, just the real part
    Thereby to find out the impact of this shit
*/
function initStudyDw() {

    let ourDw = dws.study
    // ourDw.elem.style.display = 'none'

    const axisMat = new THREE.LineBasicMaterial({
        color: 0x964B00
    })
    ourDw.addNonMentionChild(new THREE.Line(new THREE.BufferGeometry().setFromPoints([
        new THREE.Vector3(-10.,  0., 0.),
        new THREE.Vector3( 10.,  0., 0.)]), axisMat))
    ourDw.addNonMentionChild(new THREE.Line(new THREE.BufferGeometry().setFromPoints([
        new THREE.Vector3(  0., 10., 0.),
        new THREE.Vector3(  0.,-10., 0.)]), axisMat))
    let circlePoints = []
    for(let i = 0; i < 32; ++i) {
        let v = new THREE.Vector3(1., 0., 0.)
        v.applyAxisAngle(zUnit,TAU/32.*i)
        circlePoints.push(v)
    }
    ourDw.addNonMentionChild(new THREE.LineLoop(new THREE.BufferGeometry().setFromPoints(circlePoints), axisMat))

    let bg = new THREE.Mesh(unchangingUnitSquareGeometry,new THREE.MeshBasicMaterial({color:0xFFFDD0}))
    bg.position.z = -1.
    bg.scale.setScalar(999.)
    ourDw.addNonMentionChild(bg)

    // MOBIUS STRIP
    {
        // BUTTON
        let buttonBoxes = []
        {
            //alternative
            // var x = document.createElement("INPUT")
            // x.setAttribute("type", "checkbox")

            let buttonWidth = .7
            let tl = new THREE.TextureLoader()
            buttonBoxes.push(
                new THREE.Mesh(unchangingUnitSquareGeometry, new THREE.MeshBasicMaterial({ transparent: true })),
                new THREE.Mesh(unchangingUnitSquareGeometry, new THREE.MeshBasicMaterial({ transparent: true }))
            )
            let filenames = ['boxUnticked.png', 'boxTicked.png']
            filenames.forEach((filename, i) => {
                tl.load('data/' + filename, (texture) => {
                    let m = buttonBoxes[i]
                    m.material.map = texture
                    m.material.needsUpdate = true
                    m.position.x = orthCamera.left + buttonWidth / 2. * 1.4
                    m.position.y = orthCamera.bottom + buttonWidth / 2. * 1.4
                    m.scale.set(buttonWidth, buttonWidth, 1.)

                    ourDw.addNonMentionChild(m)
                })
            })

            function ptInSquareMesh(x, y, mesh) {
                let relativeX = (x - mesh.position.x) / mesh.scale.x
                let relativeY = (y - mesh.position.y) / mesh.scale.y
                return -.5 <= relativeX && relativeX <= .5 &&
                    -.5 <= relativeY && relativeY <= .5
            }

            buttonBoxes[1].visible = !buttonBoxes[0].visible
            ourDw.elem.addEventListener('mousedown', () => {
                let [x, y] = orthCamera.oldClientToPosition(ourDw)
                let b = buttonBoxes[0]
                if (ptInSquareMesh(x, y, b)) {
                    buttonBoxes[0].visible = !buttonBoxes[0].visible
                    buttonBoxes[1].visible = !buttonBoxes[0].visible

                    animationStates.mobius = true
                    renderAll()
                }
            })
        }
        
        animationStates.mobius = false

        let n = 40
        const geo = new THREE.PlaneGeometry(2., 2., 2, n)

        function ptToVecArr(pt,arr,index) {
            arr[index*3+0] = pt[13] / pt[14]
            arr[index*3+1] = pt[12] / pt[14]
            arr[index*3+2] = pt[11] / pt[14]
        }

        let pts = Array((n + 1) * 3)
        for(let i = 0; i <= n; ++i ) {
            for(let j = -1; j <= 1; ++j) {
                let index  = i * 3 + (j+1)
                pts[index] = new Mv().point(-j * .6, i * .15, 0., 1.)
            }
        }
        let stripWidth = .5
        let start = new Mv()
        let twister = new Mv()
        let outer = new Mv()
        let arounder = new Mv()
        let finalMotor = new Mv()
        let end = new Mv()
        function updateMobius() {
            if(animationStates.mobius === false)
                return

            geo.attributes.position.needsUpdate = true

            let shouldBeTwisted = buttonBoxes[0].visible
            if( shouldBeTwisted)
                wholeTwistedness = Math.min(wholeTwistedness + .01, 1.)
            else
                wholeTwistedness = Math.max(wholeTwistedness - .01, 0.)
            log(wholeTwistedness)

            for (let i = 0; i <= n; ++i) {
                for (let j = -1; j <= 1; ++j) {
                    let outness = 1.
                    let aroundness = i / n
                    let twistedness = TAU / 2. * aroundness * wholeTwistedness
                    twister.fromAxisAngle(e31, twistedness)
                    outer.fromAxisDistance(e01, -outness)
                    arounder.fromAxisAngle(e12, -aroundness * TAU)

                    mul(outer, twister, mv0)
                    mul(arounder, mv0, finalMotor)

                    start.point(j * stripWidth * .5, 0., 0., 1.)
                    finalMotor.sandwich(start, end)
                    
                    let index = i * 3 + (j + 1)
                    ptToVecArr(end, geo.attributes.position.array, index)
                }
            }

            if (wholeTwistedness === 1. || wholeTwistedness === 0.)
                animationStates.mobius = false
        }

        let wholeTwistedness = 1.
        animationStates.mobius = true //briefly
        updateMobius()
        updateFunctions.push(updateMobius)
        
        let strip = new THREE.Mesh(geo,new THREE.MeshBasicMaterial({color:0x00FDFF, side:THREE.DoubleSide}))
        ourDw.addNonMentionChild(strip)
    }
}

function initStudyNumbers() {

    let geo = new THREE.CircleBufferGeometry(.1, 32)

    let ourDw = dws.study

    let newValues = Array(2)
    class Vec2 extends Mention {
        #mesh;
        textareaManipulationDw = ourDw;

        constructor(variable) {
            super(variable)

            let mat = new THREE.MeshBasicMaterial({ color: variable.col })
            this.#mesh = ourDw.NewMesh(geo, mat)
        }

        updateFromShader() {
            this.getShaderOutput(newValues)
            this.#mesh.position.x = newValues[0]
            this.#mesh.position.y = newValues[1]
        }

        overrideFromDrag(dw) {
            if (dw === ourDw) {
                let [x, y] = orthCamera.oldClientToPosition(dw)
                this.#mesh.position.x = x
                this.#mesh.position.y = y
                
                updateOverride(this, (overrideFloats) => {
                    overrideFloats[0] = this.#mesh.position.x
                    overrideFloats[1] = this.#mesh.position.y
                })
            }
            else console.error("not in that dw")
        }

        getCanvasPosition(dw) {
            let ndcX = (this.#mesh.position.x-orthCamera.left  ) / (orthCamera.right - orthCamera.left)
            let ndcY = (this.#mesh.position.y-orthCamera.bottom) / (orthCamera.top - orthCamera.bottom)

            return ndcToWindow(ndcX,ndcY,dw)
        }

        getShaderOutputFloatString() {
            return getFloatArrayAssignmentString(this.variable.name, 2)
        }

        getReassignmentPostEquals(useOverrideFloats) {
            if (useOverrideFloats)
                return generateReassignmentText("vec2", true, 2)
            else {
                return generateReassignmentText("vec2", this.#mesh.position.x, this.#mesh.position.y )
            }
        }

        setVisibility(newVisibility) {
            this.#mesh.visible = newVisibility
        }

        isVisibleInDw(dw) {
            if (dw !== ourDw )
                return false
            return this.#mesh.visible
        }
    }
    types.vec2 = Vec2
}