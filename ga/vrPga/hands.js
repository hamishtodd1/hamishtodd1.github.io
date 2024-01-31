/*
    New mouse idea
        Your controllers stay in place, corners of screen
        moving mouse around changes where they are pointing
 */

function initHands() {

    let standinHandGeo = new THREE.BoxGeometry(.075,.075,.075)
    handRight = new DqMesh(standinHandGeo, new THREE.MeshPhongMaterial({ color: 0x00FF00 }))
    handLeft = new DqMesh(standinHandGeo, new THREE.MeshPhongMaterial({ color: 0x0000FF }))
    scene.add(handRight)
    scene.add(handLeft)
    // e123.dqTo(comfortableLookPos(0., fl0, -.42), handRight.dq)

    const laserPointerGeo = new THREE.BufferGeometry().setFromPoints([new THREE.Vector3(0, 0, 0), new THREE.Vector3(0, 0, 1)])
    const laserObject3D = new THREE.Line(laserPointerGeo)
    handRight.add(laserObject3D.clone())
    handRight.laserDq = new Dq().copy(e12)
    handLeft.add(laserObject3D.clone())
    handLeft.laserDq = new Dq().copy(e12)

    ///////////
    // Mouse //
    ///////////
    {
        let simulatingRightHand = false

        let discreteStickNew = new THREE.Vector2()
        let discreteStick = new THREE.Vector2()
        getPalletteInput = () => {
            if (!discreteStick.equals(discreteStickNew))
                updatePaletteFromDiscreteStick(discreteStick, simulatingRightHand)
        }

        let lazyHandPosRight = new Fl()
        comfortableHandPos(lazyHandPosRight)
        lazyHandPosRight.copy(dq0.translator(0.55, -.03, 0.2).sandwich(lazyHandPosRight, fl0))
        let lazyHandPosLeft = new Fl().copy(lazyHandPosRight)
        lazyHandPosLeft[6] *= -1.
        
        e123.dqTo(lazyHandPosRight, handRight.dq)
        e123.dqTo(lazyHandPosLeft, handLeft.dq)

        function mouseControlKeyEvents(event) {
            if (event.key === ` `) {
                
                onHandButtonUp(true, false, simulatingRightHand)
                onHandButtonUp(false, true, simulatingRightHand)

                simulatingRightHand = !simulatingRightHand
            }

            if (event.key === "6" && event.ctrlKey) //mouse rewind
                deleteHeld()
            // if (event.key === "5" && event.ctrlKey) //mouse fast forward
            //     document.dispatchEvent(new Event(`mouseFastForward`))

            keyToDiscreteStick(event.key, discreteStickNew)
        }
        document.addEventListener(`keydown`, mouseControlKeyEvents)

        let mouseWheelTransform = new Dq().copy(oneDq)
        let mouseWheelTransformOld = new Dq().copy(oneDq)

        getIndicatedHandPosition = (isRight, target) => {
            let hand = isRight ? handRight : handLeft
            return workingPlane.meet(hand.laserDq, target)
        }

        let posIndicator = new THREE.Mesh(new THREE.SphereGeometry(.01), new THREE.MeshPhongMaterial({color:0xFF0000}))
        scene.add(posIndicator)

        let workingPlane = new Fl()
        let rayToMouse = new Dq().copy(e12)
        updateHandMvs = () => {

            mouseWheelTransformOld.copy(mouseWheelTransform)

            camera.frustum.near.projectOn(comfortableLookPos(0.,fl0,0.), workingPlane)

            let activeHand = simulatingRightHand ? handRight : handLeft
            let lazyPos = simulatingRightHand ? lazyHandPosRight : lazyHandPosLeft

            let placeToPointAt = workingPlane.meet(rayToMouse, fl0)
            fl0.pointToGibbsVec(posIndicator.position)

            lazyPos.joinPt(placeToPointAt, activeHand.laserDq)
            let laserUnMoved = e12.projectOn(lazyPos, dq3).negate(dq3)
            let pointAtRotation = activeHand.laserDq.mulReverse(laserUnMoved, dq2).sqrtSelf()

            let toLazyPos = e123.dqTo(lazyPos, dq5)
            pointAtRotation.mul(toLazyPos, dq1).mul(mouseWheelTransform,activeHand.dq)

            discreteStick.copy(discreteStickNew)
            discreteStickNew.set(0.,0.)

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

        function onMouseButtonDown(event) {
            let isLeftButton = event.button === 0
            let isRightButton = event.button === 2
            onHandButtonDown(isLeftButton, isRightButton, simulatingRightHand)
        }
        function onMouseButtonUp(event) {
            let isLeftButton = event.button === 0
            let isRightButton = event.button === 2
            onHandButtonUp(isLeftButton, isRightButton, simulatingRightHand)
        }
        document.addEventListener("pointerdown", onMouseButtonDown )
        document.addEventListener("pointerup", onMouseButtonUp )

        removeMouseEventListeners = () => {

            document.removeEventListener('pointermove', onMouseMove)
            document.removeEventListener('wheel', onMouseWheel)
            document.removeEventListener('keydown', mouseControlKeyEvents)
            document.removeEventListener('pointerdown', onMouseButtonDown)
            document.removeEventListener('pointerup', onMouseButtonUp)
            orbitControls.enabled = false

            scene.remove(posIndicator)

        }
    }

    ////////////////////
    // VR Controllers //
    ////////////////////
    {
        //yes, you need these, and you add objects to them
        let vrControllerRight = renderer.xr.getController(0)
        let vrControllerLeft = renderer.xr.getController(1)
        vrControllerRight.dq = new Dq()
        vrControllerLeft.dq = new Dq()
        vrControllerRight.add(laserObject3D.clone())
        vrControllerLeft.add(laserObject3D.clone())

        //"grips" are needed for the appearance, but their transforms are weird, do not use them
        const controllerModelFactory = new XRControllerModelFactory()
        let controllerGrip1 = renderer.xr.getControllerGrip(0)
        let controllerGrip2 = renderer.xr.getControllerGrip(1)
        controllerGrip1.add(controllerModelFactory.createControllerModel(controllerGrip1))
        controllerGrip2.add(controllerModelFactory.createControllerModel(controllerGrip2))

        //Responds a bit weirdly
        vrControllerLeft .addEventListener('selectstart',  () => { onHandButtonDown ( true, false, false  ) } ) //log(`0`) })
        vrControllerLeft .addEventListener('selectend',    () => { onHandButtonUp   ( true, false, false  ) } ) //log(`1`) })
        vrControllerRight.addEventListener('selectstart',  () => { onHandButtonDown ( true, false, true   ) } ) //log(`2`) })
        vrControllerRight.addEventListener('selectend',    () => { onHandButtonUp   ( true, false, true   ) } ) //log(`3`) })
        vrControllerLeft .addEventListener('squeezestart', () => { onHandButtonDown ( false, true, false  ) } ) //log(`4`) })
        vrControllerLeft .addEventListener('squeezeend',   () => { onHandButtonUp   ( false, true, false  ) } ) //log(`5`) })
        vrControllerRight.addEventListener('squeezestart', () => { onHandButtonDown ( false, true, true   ) } ) //log(`6`) })
        vrControllerRight.addEventListener('squeezeend',   () => { onHandButtonUp   ( false, true, true   ) } ) //log(`7`) })

        let discreteSticks = [new THREE.Vector2(),new THREE.Vector2()]
        let discreteSticksOld = [new THREE.Vector2(),new THREE.Vector2()]
        
        onEnterVrFirstTime = (session) => {

            getPalletteInput = () => {
                let i = 0
                for (const source of session.inputSources) {
                    if (!source.gamepad)
                        continue

                    if (!discreteSticksOld[i].equals(discreteSticks[i]))
                        updatePaletteFromDiscreteStick(discreteStick[i], i ? true : false)

                    ++i
                }
            }

            scene.remove(handRight)
            scene.remove(handLeft)
            handRight = vrControllerRight
            handLeft = vrControllerLeft

            putButtonLabelsOnVrControllers()

            getIndicatedHandPosition = (isRight, target) => {
                let hand = isRight ? handRight : handLeft
                return target.pointFromGibbsVec(hand.position)
            }

            updateHandMvs = () => {

                // log(datas[0].axes)

                vrControllerRight.dq.fromPosQuat(vrControllerRight.position, vrControllerRight.quaternion)
                vrControllerLeft.dq.fromPosQuat(vrControllerLeft.position, vrControllerLeft.quaternion)

                let i = 0
                for (const source of session.inputSources) {
                    if (!source.gamepad)
                        continue

                    discreteSticksOld[i].copy(discreteSticks[i])
                    vrControllerAxesToDiscreteStick(source.gamepad.axes, discreteSticks[i])
                    ++i
                }

            }

            scene.add(vrControllerRight)
            scene.add(vrControllerLeft)
            scene.add(controllerGrip1)
            scene.add(controllerGrip2)
        }
    }

    objLoader.load(`/data/standinController.obj`, (obj) => {
        
        let geo = obj.children[0].geometry
        geo.scale(.024, .024, .024)
        geo.rotateX(-TAU / 8. * 3.)
        geo.rotateY(TAU / 2.)

        handRight.geometry = geo
        handLeft.geometry = geo
        
    })
}