/*
    New mouse idea
        Your controllers stay in place, corners of screen
        moving mouse around changes where they are pointing
 */

function initHands(buttonDqVizes) {

    let standinHandGeo = new THREE.BoxGeometry(.075,.075,.075)
    hands[RIGHT] = new THREE.Mesh(standinHandGeo, new THREE.MeshPhongMaterial({ color: 0x00FF00 }))
    hands[LEFT] = new THREE.Mesh(standinHandGeo, new THREE.MeshPhongMaterial({ color: 0x0000FF }))
    hands[RIGHT].dq = new Dq()
    hands[LEFT].dq = new Dq()
    scene.add(hands[RIGHT])
    scene.add(hands[LEFT])
    // e123.dqTo(comfortableLookPos(fl0, 0., -.42), hands[RIGHT].dq)

    let discreteSticks = [new THREE.Vector2(), new THREE.Vector2()]
    let discreteSticksOld = [new THREE.Vector2(), new THREE.Vector2()]

    const laserPointerGeo = new THREE.BufferGeometry().setFromPoints([
        new THREE.Vector3(0, 0, 0), 
        new THREE.Vector3(0, 0, -1)
    ])
    let laserMat = new THREE.LineBasicMaterial({ color: 0xFFFFFF })
    function bestowHandProperties() {
        hands[RIGHT].laserDq = new Dq().copy(e12)
        hands[LEFT].laserDq  = new Dq().copy(e12)
        hands[RIGHT].laser = new THREE.Line( laserPointerGeo, laserMat )
        hands[RIGHT].add( hands[RIGHT].laser )
        hands[LEFT].laser  = new THREE.Line( laserPointerGeo, laserMat )
        hands[LEFT].add(hands[LEFT].laser)
        hands[RIGHT] = hands[RIGHT]
        hands[LEFT]  = hands[LEFT]
    }
    bestowHandProperties()
    //because apparently VR controllers go the opposite way than you might expect
    hands[LEFT].laser.rotation.x = TAU / 2.
    hands[RIGHT].laser.rotation.x = TAU / 2.

    let analogueButtonValues = [0., 0.]
    debugUpdates.push(() => {
        buttonDqVizes[ LEFT].dq.translator(0., .11 * analogueButtonValues[ LEFT], 0.)
        getIndicatedHandPosition( LEFT, buttonDqVizes[ LEFT].markupPos)
        buttonDqVizes[RIGHT].dq.translator(0., .11 * analogueButtonValues[RIGHT], 0.)
        getIndicatedHandPosition(RIGHT, buttonDqVizes[RIGHT].markupPos)
    })

    ///////////
    // Mouse //
    ///////////
    let focusHand = 0
    {
        getPalletteInput = () => {
            if (!discreteSticksOld[focusHand].equals(discreteSticks[focusHand]))
                updatePaletteFromDiscreteStick(discreteSticksOld[focusHand], focusHand)
        }

        function onMouseButtonDown(event) {
            if (event.button === 0)
                onGrabButtonDown(focusHand)
            if (event.button === 2)
                onPaintButtonDown(focusHand)
        }
        function onMouseButtonUp(event) {
            if (event.button === 0)
                onGrabButtonUp(focusHand)
            if (event.button === 2)
                onPaintButtonUp(focusHand)
        }

        let snapMode = true
        function nonVrKeyDowns(event) { //forget about holding, just use toggles, too much hassle

            if (event.key === ` `)
                focusHand = 1-focusHand
            if (event.key === `6`)
                analogueButtonValues[ focusHand] = 1. - analogueButtonValues[focusHand]

            //mouse fast forward and rewind
            //IF THIS ISN'T WORKING CHECK SCRIPT, MAY NEED TO CHANGE WINDOW NAME
            if (event.key === "5" ) {
                if(!snapMode)
                    onSnapButtonDown()
                else
                    onSnapButtonUp()
                snapMode = !snapMode
            }

            keyToDiscreteStick(event.key, discreteSticks[focusHand])
        }

        document.addEventListener(`keydown`, nonVrKeyDowns)
        document.addEventListener("mousedown", onMouseButtonDown)
        document.addEventListener("mouseup", onMouseButtonUp)
    }
    
    //mouse movement/ray
    {
        let mouseWheelTransform = new Dq().copy(oneDq)
        let mouseWheelTransformOld = new Dq().copy(oneDq)

        let mouseOrigin = new Fl()
        let mouseDirection = new Fl()

        let raycaster = new THREE.Raycaster()
        let mouse2d = new THREE.Vector2()

        let workingPlane = new Fl()
        let rayToMouse = new Dq().copy(e12)

        getIndicatedHandPosition = (handIndex, target) => {
            return workingPlane.meet(hands[handIndex].laserDq, target)
        }

        var posIndicator = new THREE.Mesh(new THREE.SphereGeometry(.01), new THREE.MeshPhongMaterial({ color: 0x00FF00 }))
        scene.add(posIndicator)

        let lazyHandPosRight = new Fl()
        let lazyHandPosLeft = new Fl()
        {
            comfortableHandPos(lazyHandPosRight)
            lazyHandPosRight.copy(dq0.translator(0.55, -.03, 0.2).sandwich(lazyHandPosRight, fl0))
            lazyHandPosLeft.copy(lazyHandPosRight)
            lazyHandPosLeft[6] *= -1.

            e123.dqTo(lazyHandPosRight, hands[RIGHT].dq)
            e123.dqTo(lazyHandPosLeft, hands[LEFT].dq)

            hands[RIGHT].dq.toPosQuat(hands[RIGHT].position, hands[RIGHT].quaternion)
            hands[LEFT].dq.toPosQuat(hands[LEFT].position, hands[LEFT].quaternion)
        }
        
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

            discreteSticksOld[focusHand].copy(discreteSticks[focusHand])
            discreteSticks[focusHand].set(0.,0.)

            hand.dq.toPosQuat(hand.position, hand.quaternion)
        }
            
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

        document.addEventListener('mousemove', onMouseMove)
        document.addEventListener('wheel', onMouseWheel)
    }

    removeMouseEventListeners = () => {
        console.log(`Removing mouse event listeners`)

        document.removeEventListener('mousemove', onMouseMove)
        document.removeEventListener('wheel', onMouseWheel)
        document.removeEventListener('keydown', nonVrKeyDowns)
        document.removeEventListener('mousedown', onMouseButtonDown)
        document.removeEventListener('mouseup', onMouseButtonUp)
        orbitControls.enabled = false

        scene.remove(posIndicator)

    }

    ////////////////////
    // VR Controllers //
    ////////////////////
    {
        //yes, you need these, and you add objects to them
        let vrRight = renderer.xr.getController(LEFT)
        let vrLeft = renderer.xr.getController(RIGHT)
        let quatsOld = [new THREE.Quaternion(), new THREE.Quaternion() ]
        vrRight.dq = new Dq()
        vrLeft.dq = new Dq()

        let buttonStateses = [
            [false, false, false, false, false, false],
            [false, false, false, false, false, false]
        ]

        //"grips" are needed for the appearance, but their transforms are weird, do not use them
        const controllerModelFactory = new XRControllerModelFactory()
        let gripLeft  = renderer.xr.getControllerGrip(LEFT)
        let gripRight = renderer.xr.getControllerGrip(RIGHT)
        gripLeft.add(controllerModelFactory.createControllerModel(gripLeft))
        gripRight.add(controllerModelFactory.createControllerModel(gripRight))

        vrLeft .addEventListener('selectstart',  () => { onGrabButtonDown ( LEFT  ) } ) //log(`0`) })
        vrLeft .addEventListener('selectend',    () => { onGrabButtonUp   ( LEFT  ) } ) //log(`1`) })
        vrRight.addEventListener('selectstart',  () => { onGrabButtonDown ( RIGHT ) } ) //log(`2`) })
        vrRight.addEventListener('selectend',    () => { onGrabButtonUp   ( RIGHT ) } ) //log(`3`) })
        // vrLeft .addEventListener('squeezestart', () => { onGrabButtonDown    ( LEFT  ) } ) //log(`4`) })
        // vrLeft .addEventListener('squeezeend',   () => { onGrabButtonUp      ( LEFT  ) } ) //log(`5`) })
        // vrRight.addEventListener('squeezestart', () => { onGrabButtonDown    ( RIGHT ) } ) //log(`6`) })
        // vrRight.addEventListener('squeezeend',   () => { onGrabButtonUp      ( RIGHT ) } ) //log(`7`) })

        socket.on('reload', window.location.reload )

        onEnterVrFirstTime = (session) => {

            vrSession = session

            let buttonOnDowns = [
                () => {},
                () => {},
                () => {}, //dunno how to get this to fire!
                (focusHand) => {
                    if(!focusHand) {
                        socket.send(`reload`)
                        vrSession.end()
                        window.location.reload()
                    }
                    else {
                        debuggerTrigger = true
                    }
                    log(debuggerTrigger)
                },
                onPaintButtonDown, //face button 2
                onSnapButtonDown,  //face button 1
            ]
            let buttonOnUps = [
                () => { },
                () => { },
                () => { },
                () => { },
                onPaintButtonUp,
                onSnapButtonUp,
            ]

            scene.remove(hands[RIGHT])
            scene.remove(hands[LEFT])
            hands[RIGHT] = vrRight
            hands[LEFT]  = vrLeft
            bestowHandProperties()

            putButtonLabelsOnVrControllers()

            getPalletteInput = () => {
                let i = 0
                for (const source of session.inputSources) {
                    if (!source.gamepad)
                        continue

                    // if there's a problem with which hand is which, it might be because both controllers weren't connected
                    if (!discreteSticksOld[i].equals(discreteSticks[i]))
                        updatePaletteFromDiscreteStick(discreteSticks[i], session.inputSources[i].handedness === `left` ? LEFT : RIGHT)

                    ++i
                }
            }

            getIndicatedHandPosition = (handIndex, target) => {
                return target.pointFromGibbsVec(hands[handIndex].position)
            }

            updateHandMvs = () => {

                // log(datas[0].axes)

                //there's something sad going on here, which is that we appear to be losing double cover info
                //one way to avoid this might be to store the old one,
                //then compare the diff to the new with the diff to the new*-1

                hands.forEach((hand,i)=>{

                    // if(frameCount > 100 &&
                    //     (vrRightQuatOld.x > 0.) !== (vrRight.quaternion.x > 0.) &&
                    //     (vrRightQuatOld.y > 0.) !== (vrRight.quaternion.y > 0.) &&
                    //     (vrRightQuatOld.z > 0.) !== (vrRight.quaternion.z > 0.) &&
                    //     (vrRightQuatOld.w > 0.) !== (vrRight.quaternion.w > 0.) )
                    //     debugger

                    let handQuat = q1
                    handQuat.copy(hand.quaternion)

                    //because you will pry the double cover from my cold dead fingers
                    {
                        let handQuatNeg = q2
                        handQuatNeg.copy(handQuat)
                        handQuatNeg.x *= -1.; handQuatNeg.y *= -1.; handQuatNeg.z *= -1.; handQuatNeg.w *= -1.;

                        if (handQuat.dot(quatsOld[i]) < handQuatNeg.dot(quatsOld[i]))
                            handQuat.copy(handQuatNeg)

                        quatsOld[i].copy(handQuat)
                    }

                    hand.dq.fromPosQuat(hand.position, handQuat)

                    hand.dq.sandwich(e12, hand.laserDq)
                    hand.dq.sandwich(e3, hand.laserPlane)
                })

                let i = 0
                if (typeof session.inputSources[Symbol.iterator] === 'function') {
                    for (const source of session.inputSources) {
                        if (!source.gamepad)
                            continue
    
                        let focusHand = source.handedness === `left` ? LEFT : RIGHT
    
                        discreteSticksOld[i].copy(discreteSticks[i])
                        vrControllerAxesToDiscreteStick(source.gamepad.axes, discreteSticks[i])
    
                        let buttonStates = buttonStateses[focusHand]
                        for(let i = 0, il = buttonStates.length; i < il; ++i) {
                            if (source.gamepad.buttons[i] === undefined)
                                continue
                            if(source.gamepad.buttons[i].pressed && !buttonStates[i] )
                                buttonOnDowns[i](focusHand)
                            if(!source.gamepad.buttons[i].pressed && buttonStates[i] )
                                buttonOnUps[i](focusHand)
                            if(i===1)
                                analogueButtonValues[focusHand] = 4./3. * Math.max(0.,source.gamepad.buttons[i].value - .25)
    
                            buttonStates[i] = source.gamepad.buttons[i].pressed
                        }
    
                        //THIS LETS YOU SEE WHICH BUTTONS ARE WHICH
                        //A and B are 4 and 5
                        // source.gamepad.buttons.forEach((button, j) => {
                        //     if(button.pressed)
                        //         log(j, source.handedness, button)
                        // })
    
                        ++i
                    }
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
        geo.rotateZ(TAU / 2.)

        hands[RIGHT].geometry = geo
        hands[LEFT].geometry = geo
        
    })
}