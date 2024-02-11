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
    // e123.dqTo(comfortableLookPos(fl0, 0., -.42), handRight.dq)

    const laserPointerGeo = new THREE.BufferGeometry().setFromPoints([new THREE.Vector3(0, 0, 1), new THREE.Vector3(0, 0, -1)])
    function bestowHandProperties() {
        handRight.laserDq = new Dq().copy(e12)
        handLeft.laserDq  = new Dq().copy(e12)
        handRight.laserPlane = new Fl().copy(e3)
        handLeft.laserPlane  = new Fl().copy(e3)
        handRight.add( new THREE.Line(laserPointerGeo) )
        handLeft.add(  new THREE.Line(laserPointerGeo) )
        hands[RIGHT] = handRight
        hands[LEFT]  = handLeft
    }
    bestowHandProperties()

    ///////////
    // Mouse //
    ///////////
    {
        let focusHand = 0

        let discreteStickNew = new THREE.Vector2()
        let discreteStick = new THREE.Vector2()
        getPalletteInput = () => {
            if (!discreteStick.equals(discreteStickNew))
                updatePaletteFromDiscreteStick(discreteStick, focusHand)
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
                
                // onHandButtonUp(true, false, focusHand)
                // onHandButtonUp(false, true, focusHand)

                focusHand = 1-focusHand
            }

            //mouse rewind IF THIS ISN'T WORKING CHECK SCRIPT, MAY NEED TO CHANGE WINDOW NAME
            if (event.key === "6" && event.ctrlKey)
                deleteHeld(focusHand)
            // if (event.key === "5" && event.ctrlKey) //mouse fast forward
            //     document.dispatchEvent(new Event(`mouseFastForward`))

            keyToDiscreteStick(event.key, discreteStickNew)
        }
        document.addEventListener(`keydown`, mouseControlKeyEvents)

        let mouseWheelTransform = new Dq().copy(oneDq)
        let mouseWheelTransformOld = new Dq().copy(oneDq)

        getIndicatedHandPosition = (isLeft, target) => {
            return workingPlane.meet(hands[isLeft].laserDq, target)
        }

        let posIndicator = new THREE.Mesh(new THREE.SphereGeometry(.01), new THREE.MeshPhongMaterial({color:0x00FF00}))
        scene.add(posIndicator)

        let workingPlane = new Fl()
        let rayToMouse = new Dq().copy(e12)
        updateHandMvs = () => {

            mouseWheelTransformOld.copy(mouseWheelTransform)

            camera.frustum.near.projectOn(comfortableLookPos(fl0), workingPlane)

            let hand = hands[focusHand]
            let lazyPos = focusHand ? lazyHandPosLeft : lazyHandPosRight

            let placeToPointAt = workingPlane.meet(rayToMouse, fl0)
            fl0.pointToGibbsVec(posIndicator.position)

            lazyPos.joinPt(placeToPointAt, hand.laserDq)
            let laserUnMoved = e12.projectOn(lazyPos, dq3).negate(dq3)
            let pointAtRotation = hand.laserDq.mulReverse(laserUnMoved, dq2).sqrtSelf()

            let toLazyPos = e123.dqTo(lazyPos, dq5)
            pointAtRotation.mul(toLazyPos, dq1).mul(mouseWheelTransform,hand.dq)

            hand.dq.sandwich(e3, hand.laserPlane)

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
            onHandButtonDown(isLeftButton, isRightButton, focusHand)
        }
        function onMouseButtonUp(event) {
            let isLeftButton = event.button === 0
            let isRightButton = event.button === 2
            onHandButtonUp(isLeftButton, isRightButton, focusHand)
        }
        document.addEventListener("pointerdown", onMouseButtonDown )
        document.addEventListener("pointerup", onMouseButtonUp )

        removeMouseEventListeners = () => {
            console.error("y")

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
        let vrRight = renderer.xr.getController(LEFT)
        let vrLeft = renderer.xr.getController(RIGHT)
        vrRight.dq = new Dq()
        vrLeft.dq = new Dq()

        //"grips" are needed for the appearance, but their transforms are weird, do not use them
        const controllerModelFactory = new XRControllerModelFactory()
        let gripLeft  = renderer.xr.getControllerGrip(LEFT)
        let gripRight = renderer.xr.getControllerGrip(RIGHT)
        gripLeft.add(controllerModelFactory.createControllerModel(gripLeft))
        gripRight.add(controllerModelFactory.createControllerModel(gripRight))

        //Responds a bit weirdly
        vrLeft .addEventListener('selectstart',  () => { onHandButtonDown ( true, false, LEFT  ) } ) //log(`0`) })
        vrLeft .addEventListener('selectend',    () => { onHandButtonUp   ( true, false, LEFT  ) } ) //log(`1`) })
        vrRight.addEventListener('selectstart',  () => { onHandButtonDown ( true, false, RIGHT   ) } ) //log(`2`) })
        vrRight.addEventListener('selectend',    () => { onHandButtonUp   ( true, false, RIGHT   ) } ) //log(`3`) })
        vrLeft .addEventListener('squeezestart', () => { onHandButtonDown ( false, true, LEFT  ) } ) //log(`4`) })
        vrLeft .addEventListener('squeezeend',   () => { onHandButtonUp   ( false, true, LEFT  ) } ) //log(`5`) })
        vrRight.addEventListener('squeezestart', () => { onHandButtonDown ( false, true, RIGHT   ) } ) //log(`6`) })
        vrRight.addEventListener('squeezeend',   () => { onHandButtonUp   ( false, true, RIGHT   ) } ) //log(`7`) })

        let discreteSticks    = [new THREE.Vector2(),new THREE.Vector2()]
        let discreteSticksOld = [new THREE.Vector2(),new THREE.Vector2()]
        
        onEnterVrFirstTime = (session) => {

            scene.remove(handRight)
            scene.remove(handLeft)
            handRight = vrRight
            handLeft  = vrLeft
            bestowHandProperties()

            putButtonLabelsOnVrControllers()

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

            getIndicatedHandPosition = (isLeft, target) => {
                return target.pointFromGibbsVec(hands[isLeft].position)
            }

            updateHandMvs = () => {

                // log(datas[0].axes)

                //there's something sad going on here, which is that we appear to be losing double cover info
                //one way to avoid this might be to store the old one,
                //then compare the diff to the new with the diff to the new*-1
                vrRight.dq.fromPosQuat(vrRight.position, vrRight.quaternion)
                vrLeft.dq.fromPosQuat(vrLeft.position, vrLeft.quaternion)

                vrRight.dq.sandwich(e12, vrRight.laserDq)
                vrLeft.dq.sandwich( e12, vrLeft.laserDq )
                vrRight.dq.sandwich(e3, vrRight.laserPlane)
                vrLeft.dq.sandwich( e3, vrLeft.laserPlane )

                let i = 0
                for (const source of session.inputSources) {
                    if (!source.gamepad)
                        continue

                    discreteSticksOld[i].copy(discreteSticks[i])
                    vrControllerAxesToDiscreteStick(source.gamepad.axes, discreteSticks[i])
                    // source.gamepad.buttons.forEach((button, j) => {
                    //     if(button.pressed)
                    //         log(j, button)
                    // })
                    // if(source.gamepad.buttons[0].pressed)
                    //     deleteHeld(i)
                    ++i
                }

            }

            scene.add(vrRight)
            scene.add(vrLeft)
            scene.add(gripLeft)
            scene.add(gripRight)
        }
    }

    objLoader.load(`/data/standinController.obj`, (obj) => {
        
        let geo = obj.children[0].geometry
        geo.scale(.024, .024, .024)
        // geo.rotateX(-TAU / 8. * 3.)
        geo.rotateY(TAU / 2.)

        handRight.geometry = geo
        handLeft.geometry = geo
        
    })
}