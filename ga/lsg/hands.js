async function initHands() {

    handPosition = new Fl().copy(e123) //less fundamental
    handPositionOld = new Fl().copy(e123)

    let standinHandGeo = new THREE.BoxGeometry(.3,.3,.3)
    hand1 = new DqMesh(standinHandGeo, new THREE.MeshPhongMaterial({ color: 0x00FF00 }))
    scene.add(hand1)
    hand2 = new DqMesh(standinHandGeo, new THREE.MeshPhongMaterial({ color: 0x0000FF }))
    scene.add(hand2)

    //Mouse stuff
    {
        function mouseControlKeyEvents(event) {
            if (event.key === ` `)
                simulatingPaintingHand = !simulatingPaintingHand
            if (event.key === "5" && event.ctrlKey)
                document.dispatchEvent(new Event(`mouseRewind`))
            if (event.key === "6" && event.ctrlKey)
                document.dispatchEvent(new Event(`mouseFastForward`))
        }
        document.addEventListener(`keydown`, mouseControlKeyEvents)

        let mouseWheelTransform = new Dq().copy(oneDq)
        let mouseWheelTransformOld = new Dq().copy(oneDq)

        let workingPlane = new Fl()
        let center = new Fl().point(0., 1.6, 0., 1.)
        let rayToMouse = new Dq().copy(e12)
        updateHandMvs = () => {

            handPositionOld.copy(handPosition)
            mouseWheelTransformOld.copy(mouseWheelTransform)

            camera.frustum.near.projectOn(center, workingPlane)
            workingPlane.meet(rayToMouse, handPosition)
            handPosition.normalize()

            if (simulatingPaintingHand)
                getHandDq(hand1.dq, false)
            else
                getHandDq(hand2.dq, false)

        }

        //mouse movement/ray
        {
            let mouseOrigin = new Fl()
            let mouseDirection = new Fl()

            let raycaster = new THREE.Raycaster()
            let mouse2d = new THREE.Vector2()

            //strictly decoupled from hand! That is updated each frame!
            function updateMouseRay(event) {
                mouse2d.x = (event.clientX / window.innerWidth) * 2 - 1;
                mouse2d.y = -(event.clientY / window.innerHeight) * 2 + 1;
                raycaster.setFromCamera(mouse2d, camera)

                //would prefer to do this ourselves, using camera GA
                mouseOrigin.pointFromGibbsVec(raycaster.ray.origin)
                mouseDirection.pointFromNormal(raycaster.ray.direction)
                mouseOrigin.joinPt(mouseDirection, rayToMouse)
            }

            function onMouseMove(event) {
                updateMouseRay(event)

                event.preventDefault()
            }
        }

        {
            resetMouseWheelTransform = () => {
                mouseWheelTransform.copy(oneDq)
            }

            let angle = .0125 * TAU
            let turnRight = new Dq().set(Math.cos(angle), 0., 0., 0., Math.sin(angle), 0., 0., 0.)
            let turnLeft = new Dq().set(Math.cos(-angle), 0., 0., 0., Math.sin(-angle), 0., 0., 0.)
            function onMouseWheel(event) {
                let mouseTurn = event.deltaY < 0 ? turnLeft : turnRight
                mouseWheelTransform.append(mouseTurn)
                // if (Math.abs( 1. - mouseWheelTransform[0]) < .003)
                //     mouseWheelTransform.copy(oneDq)
                // if (Math.abs(-1. - mouseWheelTransform[0]) < .003)
                //     oneDq.multiplyScalar(-1, mouseWheelTransform)

            }

            document.addEventListener('pointermove', onMouseMove)
            document.addEventListener('wheel', onMouseWheel)
        }
        
        //Actually it is problematic for your philosophy to speak of a "handDq"
        //There is no "current position of your hand", there is only a movement of your hand
        getHandDq = (dq, old = false) => {
            e123.ptToPt(old ? handPositionOld : handPosition, dq)
            dq.append(old ? mouseWheelTransformOld : mouseWheelTransform)
            //yes, append, because algebra
            return dq
        }

        // function onMouseButtonDown(event) {
        //     let isLeftButton = event.button === 0
        //     let isRightButton = event.button === 2
        //     onHandButtonDown(isLeftButton, isRightButton, simulatingPaintingHand)
        // }
        // function onMouseButtonUp(event) {
        //     let isLeftButton = event.button === 0
        //     let isRightButton = event.button === 2
        //     onHandButtonUp(isLeftButton, isRightButton, simulatingPaintingHand)
        // }
        // document.addEventListener("pointerdown", onMouseButtonDown )
        // document.addEventListener("pointerup", onMouseButtonUp )

        removeMouseEventListeners = () => {

            document.removeEventListener('pointermove', onMouseMove)
            document.removeEventListener('wheel', onMouseWheel)
            document.removeEventListener('keydown', mouseControlKeyEvents)
            document.removeEventListener('pointerdown', onMouseButtonDown)
            document.removeEventListener('pointerup', onMouseButtonUp)

        }
    }

    {
        const laserPointerGeo = new THREE.BufferGeometry().setFromPoints([new THREE.Vector3(0, 0, 0), new THREE.Vector3(0, 0, - 1)])
        const line = new THREE.Line(laserPointerGeo)
        line.name = 'line'
        line.scale.z = 5

        //yes, you need these, and you add objects to them. The transforms for the "grips" are weird.
        let controller1 = renderer.xr.getController(0)
        let controller2 = renderer.xr.getController(1)
        controller1.add(line.clone())
        controller2.add(line.clone())

        const controllerModelFactory = new XRControllerModelFactory()
        let controllerGrip1 = renderer.xr.getControllerGrip(0)
        let controllerGrip2 = renderer.xr.getControllerGrip(1)
        controllerGrip1.add(controllerModelFactory.createControllerModel(controllerGrip1))
        controllerGrip2.add(controllerModelFactory.createControllerModel(controllerGrip2))

        // let mrh = controllerModelFactory.createControllerModel()
        // mrh.position.y = 1.
        // scene.add(mrh)

        //Responds a bit weirdly
        controller1.addEventListener('selectstart',  () => { onHandButtonDown ( true, false, true  ) } )
        controller1.addEventListener('selectend',    () => { onHandButtonUp   ( true, false, true  ) } )
        controller2.addEventListener('selectstart',  () => { onHandButtonDown ( true, false, false ) } )
        controller2.addEventListener('selectend',    () => { onHandButtonUp   ( true, false, false ) } )
        controller1.addEventListener('squeezestart', () => { onHandButtonDown ( false, true, true  ) } )
        controller1.addEventListener('squeezeend',   () => { onHandButtonUp   ( false, true, true  ) } )
        controller2.addEventListener('squeezestart', () => { onHandButtonDown ( false, true, false ) } )
        controller2.addEventListener('squeezeend',   () => { onHandButtonUp   ( false, true, false ) } )

        onEnterVrFirstTime = () => {

            removeMouseEventListeners()

            let controller1MatrixWorldOld = new THREE.Matrix4()

            getHandDq = (dq, old = false) => {
                dq.fromMat4(old ? controller1MatrixWorldOld : controller1.matrixWorld)
                return dq
            }

            updateHandMvs = () => {

                handPositionOld.copy(handPosition)
                controller1MatrixWorldOld.copy(controller1.matrixWorld)

                getHandDq(dq0, false)
                dq0.sandwich(e123, handPosition)

            }

            scene.add(controller1)
            scene.add(controller2)
            scene.add(controllerGrip1)
            scene.add(controllerGrip2)
        }
    }

    objLoader.load(`/data/standinController.obj`, (obj) => {
        
        let geo = obj.children[0].geometry
        geo.scale(.1, .1, .1)
        geo.rotateX(-TAU / 8. * 3.)
        geo.rotateY(TAU / 2.)

        hand1.geometry = geo
        hand2.geometry = geo
        
    })
}