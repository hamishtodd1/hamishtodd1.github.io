/*
    New mouse idea
        Your controllers stay in place, corners of screen
        moving mouse around changes where they are pointing
 */

function initHands() {

    handPosition = new Fl().copy(e123) //less fundamental
    handPositionOld = new Fl().copy(e123)

    let standinHandGeo = new THREE.BoxGeometry(.075,.075,.075)
    handRight = new DqMesh(standinHandGeo, new THREE.MeshPhongMaterial({ color: 0x00FF00 }))
    handLeft = new DqMesh(standinHandGeo, new THREE.MeshPhongMaterial({ color: 0x0000FF }))
    scene.add(handRight)
    scene.add(handLeft)
    e123.dqTo(comfortableLookPos(0., fl0, -.42), handRight.dq)

    let joystickMovement = new THREE.Vector2()

    ///////////
    // Mouse //
    ///////////
    {
        let simulatingRightHand = false

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

            let isJoystickMovement = keyToAxes(event.key, joystickMovement)
            if (isJoystickMovement )
                updatePaletteFromJoystickMovement( joystickMovement, simulatingRightHand ? handRight : handLeft )
        }
        document.addEventListener(`keydown`, mouseControlKeyEvents)

        let mouseWheelTransform = new Dq().copy(oneDq)
        let mouseWheelTransformOld = new Dq().copy(oneDq)

        let workingPlane = new Fl()
        let center = new Fl().point(0., 1.2, 0., 1.)
        let rayToMouse = new Dq().copy(e12)
        updateHandMvs = () => {

            handPositionOld.copy(handPosition)
            mouseWheelTransformOld.copy(mouseWheelTransform)

            camera.frustum.near.projectOn(center, workingPlane)
            workingPlane.meet(rayToMouse, handPosition)
            handPosition.normalize()

            if (simulatingRightHand)
                getHandDq(handRight.dq, false)
            else
                getHandDq(handLeft.dq, false)

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

        }
    }

    ////////////////////
    // VR Controllers //
    ////////////////////
    {
        const laserPointerGeo = new THREE.BufferGeometry().setFromPoints([new THREE.Vector3(0, 0, 0), new THREE.Vector3(0, 0, - 1)])
        const line = new THREE.Line(laserPointerGeo)
        line.name = 'line'
        line.scale.z = 5

        //yes, you need these, and you add objects to them
        let vrControllerRight = renderer.xr.getController(0)
        let vrControllerLeft = renderer.xr.getController(1)
        vrControllerRight.dq = new Dq()
        vrControllerLeft.dq = new Dq()
        vrControllerRight.add(line.clone())
        vrControllerLeft.add(line.clone())

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

        onEnterVrFirstTime = (session) => {

            scene.remove(handRight)
            scene.remove(handLeft)
            handRight = vrControllerRight
            handLeft = vrControllerLeft

            putButtonLabelsOnVrControllers()

            getHandDq = (dq, old = false) => {
                dq.copy(vrControllerLeft.dq)
                return dq
            }

            updateHandMvs = () => {

                // log(datas[0].axes)

                for (const source of session.inputSources) {
                    if (!source.gamepad)
                        continue
                    log(source.gamepad.axes)
                }

                vrControllerRight.dq.fromPosQuat(vrControllerRight.position, vrControllerRight.quaternion)
                vrControllerLeft.dq.fromPosQuat(vrControllerLeft.position, vrControllerLeft.quaternion)

                handPositionOld.copy(handPosition)

                getHandDq(dq0, false)
                // dq0.sandwich(e123, handPosition)
                handPosition.pointFromGibbsVec(vrControllerLeft.position)

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