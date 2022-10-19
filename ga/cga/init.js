/*
    Have buttons for showing:
        Number of dimensions of each window
        "Helper/Fake" shapes:
            Cone, circle, sphere, cross on 1,1 ambient space
            "Floor" planes
        "Show underside" - you usually don't need the lower cone
        Grids, maybe alternating black and white
        Labels of the names of each thing
        Showable as planes, points, or lines in 3D

    Show to Roice, Arsenovich, Albert Chern, Keenan Crane
    Message: I want to make a bunch of materials so that people can very easily use PGA
        Maybe Conformal DDG too - but I'll need to cash it out in terms of CGA

    Possibly worth having the complex window too?

    Script
        It's like a book opened at a right angle. Maybe the book of sand with an infinite number of pages
        Projective geo has a sophisticated view of infinity. Conformal is even more sophisticated
        Conformal transformations are very beautiful
        The timeglobe from minutephysics
        
        Computer graphics practitioners will have a rigorous foundation for
            Join formulae (but you could just ignore orientations)
            The rigorous way to extract distances from transformations (but you could just copypaste our iNorm)
            Camera projections (but it's only a bit of code, which you can get from the internet)
            Sphere intersections for collision detection (but you could do it analytically)
            Understanding Keenan Crane's crap? Maybe contact him to see if you could drop any remarks in
        Physicists will understand
            Special relativity
            Conformal transformations for magnetic fields
            Cyclic conformal cosmology
            AdS/CFT (and conformal field theory generally? Well maybe, maybe not)
        Engineers
            Dyamics/Classical mechanics (force lines dual to axis lines)
            karman trefftz airfoil / Jodorowsky transform
            Kelvin transform (what Albert Chern did)
            Going between polar and euclidean coords
        Mathematics
            Double cover of SL(2,R) (and SL(2,C)? H?)
            Connections between hyperbolic, elliptic, euclidean and associated groups
            Conformal group
            Lagrangian/Symplectic stuff because 2x2 matrix of quaternions?
            Is this a way to visualize covectors?

        Each window:
            Ambient 1,1
                The vertical line behaves in an ordinary way, like an ordinary reflection line (click it to reflect)
                Show the orientation of the lines. Reflection in down plane does not cause the orientation change you'd expect
*/

async function init() {
    
    initButtons()
    let [overlayScene, overlayCamera] = initMouse()
    init41()

    canvas3d.width = window.innerWidth
    canvas3d.height = window.innerHeight

    renderer.localClippingEnabled = true
    
    let rendererSize = new THREE.Vector2()
    function onWindowResize() {
        renderer.setSize(window.innerWidth, window.innerHeight)
        renderer.setPixelRatio(window.devicePixelRatio)
        renderer.getSize(rendererSize)

        let centerToTop = (spacing*5.+dwDimension*4.)/(spacing*4.+dwDimension*3.)
        overlayCamera.top = centerToTop * .5
        let height = window.innerHeight / window.innerWidth
        overlayCamera.bottom = overlayCamera.top - height * 2.
        overlayCamera.updateProjectionMatrix()

        dwDimension = (window.innerWidth - spacing * 5) / 4.
    }
    window.addEventListener(`resize`, onWindowResize)
    onWindowResize()

    {
        let eyeMat = new THREE.MeshBasicMaterial()
        new THREE.TextureLoader().load(`data/eyeTexture.png`, (texture) => {
            eyeMat.map = texture
            eyeMat.needsUpdate = true
        }, () => { }, (err) => { log(err) })
        let eyeGeo = new THREE.SphereGeometry(.3)
        eyeGeo.rotateX(TAU / 4.)
        createEye = () => {
            let ret = new THREE.Mesh(eyeGeo, eyeMat)
            return ret
        }
    }

    moveCamera = (pos, horizontally, amt) => {
        if (horizontally) {
            q1.set(0., 1., 0., 0.)
        }
        else {
            mv0.plane(pos.x, pos.y, pos.z)
            meet(e2, mv0, mv1)
            mv1.toQuaternion(q1)
            q1.normalize()
        }
        q1.multiplyScalar(.03 * amt)
        q1.w = 1.
        q1.normalize()

        pos.applyQuaternion(q1)
    }

    class Dw {
        scene = new THREE.Scene()
        elem
        camera
        haveChildrenOfLowerWindow
        onClick = () => { }
        onDrag = () => { }
        onRightClick = () => { }
        onRightDrag = () => { }

        constructor(horizontalIndex, verticalIndex, haveCameraMode) {
            this.horizontalIndex = horizontalIndex
            this.verticalIndex = verticalIndex

            // this.camera = new THREE.OrthographicCamera(-2.,2.,2.,-2., .1, 100.)
            this.camera = new THREE.PerspectiveCamera( getFov(4.), 1., .1, 100.)
            this.camera.position.z = 2.

            let ambientLight = new THREE.AmbientLight()
            this.scene.add(ambientLight)
            

            // let box = new THREE.Mesh(new THREE.BoxGeometry(1., 1., 1.), new THREE.MeshBasicMaterial({ color: 0xFF0000 }))
            // this.scene.add(box)

            if(dwColumns[horizontalIndex] === undefined)
                dwColumns[horizontalIndex] = []
            dwColumns[horizontalIndex][verticalIndex] = this

            this.unusualCameraMode = false
            this.cameraUnusualness = 0.
            this.updateCamera = () => {}
            updateFunctions.push(()=>{
                this.updateCamera()
            })

            if (haveCameraMode) {
                let btn = createButton(this)
                btn.onClick = () => {
                    this.unusualCameraMode = !this.unusualCameraMode
                }
                updateFunctions.push(() => {
                    if (this.unusualCameraMode)
                        this.cameraUnusualness += frameDelta
                    else
                        this.cameraUnusualness -= frameDelta
                    this.cameraUnusualness = clamp(this.cameraUnusualness, 0., 1.)

                    this.scene.children.forEach((child) => {
                        if (child.material !== undefined)
                            child.material.opacity = 1. - this.cameraUnusualness
                    })
                })
            }
        }
    }
    window.Dw = Dw

    getDwXy = (dw) => {
        return [
            dw.horizontalIndex * (dwDimension + spacing) + spacing,
            rendererSize.y - (dw.verticalIndex + 1) * (dwDimension + spacing)
        ]
    }

    renderToDw = (dw) => {
        let [x,y] = getDwXy(dw)

        renderer.setScissor( x, y, dwDimension, dwDimension )
        renderer.setViewport(x, y, dwDimension, dwDimension )
        renderer.clear(true, true)

        renderer.render(dw.scene, dw.camera)

        let ourDimension = 2 + dw.horizontalIndex - dw.verticalIndex
        if(ourDimension < 4) {
            let col = dwColumns[dw.horizontalIndex]
            for(let i = 1; i < 3; ++i) {
                // if(dw.horizontalIndex === 1 && dw.verticalIndex === 0 && frameCount === 3)
                //     log(col[dw.verticalIndex + i])
                if (col[dw.verticalIndex + i] !== undefined)
                    renderer.render(col[dw.verticalIndex + i].scene, dw.camera)
            }
        }
        // if (dw.haveChildrenOfLowerWindow) {
        //     let col = dwColumns[dw.horizontalIndex]
        //     let justBelow = dwColumns[dw.horizontalIndex][dw.verticalIndex+1]
        //     renderer.render(justBelow.scene, dw.camera)
        //     if(col[dw.verticalIndex+2] !== undefined)
        //         renderer.render(col[dw.verticalIndex + 1].scene, dw.camera)
        // }
    }

    initColumn0d()
    initColumn1d()
    initColumn2d()
    initColumn3d()

    function render() {

        let clockDelta = clock.getDelta()
        frameDelta = clockDelta < .1 ? clockDelta : .1 //clamped because debugger pauses create weirdness
        ++frameCount

        const width = canvas3d.clientWidth
        const height = canvas3d.clientHeight
        if (canvas3d.width !== width || canvas3d.height !== height)
            renderer.setSize(width, height, false)
        renderer.setScissorTest(false)
        renderer.setClearColor(0xFFFFFF, 0)
        renderer.clear(true, true)
        renderer.setScissorTest(true)
        
        renderer.setScissor(0, 0, window.innerWidth, window.innerHeight)
        renderer.setViewport(0, 0, window.innerWidth, window.innerHeight)
        renderer.render(overlayScene, overlayCamera)
        
        renderer.setClearColor(0xCCCCCC, 1)
        dwColumns.forEach((dwColumn) => {
            dwColumn.forEach((dw) => {
                renderToDw(dw)
            })
        })

        updateFunctions.forEach((f)=>f())

        requestAnimationFrame(render)
    }

    render()
}