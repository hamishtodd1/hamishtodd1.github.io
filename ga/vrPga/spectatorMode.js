/*
    Maybe should be closer to the pupeteer's view
    Fog maybe? So that you can have them go away
*/

function initPotentialSpectatorReception() {

    let spectatorCameraNear = 1.6

    emitPotentialSclptableSnappable = (snappable) => {
        if (snappable.sclptable !== null) {
            socket.emit(`snappable`, {
                snappableIndex: snappables.indexOf(snappable),
                sclptableIndex: sclptables.indexOf(snappable.sclptable),
                dqCoefficientsArray: snappable.dq,
            })
        }
    }

    socket.on(`disposeSnappable`, msg => {
        snappables[msg.i].dispose()
    })
    
    let backedUpMsgs = []
    socket.on( `snappable`, msg => {
        backedUpMsgs.push(msg)
    })
    handleDqMsgs = () => {
        
        backedUpMsgs.forEach((msg) => {

            pairAndPotentiallyCreateSnappableSclptable(msg.snappableIndex, msg.sclptableIndex)

            for (let j = 0; j < 8; ++j)
                snappables[msg.snappableIndex].mv[j] = msg.dqCoefficientsArray[j]
            
        })
        
        for (let i = 0; i < backedUpMsgs.length; ++i)
            delete backedUpMsgs[i]
        backedUpMsgs.length = 0
    }

    turnOnSpectatorMode = () => {

        if (spectatorMode)
            return
        spectatorMode = true

        // let indicator = new THREE.Mesh(new THREE.BoxGeometry(.02, .02, .02), new THREE.MeshBasicMaterial({ color: 0x000000 }))
        // comfortablePos(0., fl0, 0.).pointToGibbsVec(indicator.position)
        // scene.add(indicator)

        removeMouseEventListeners()
        
        makeSpectatorCamera()

        hands[RIGHT].dq.translator(0., 0., -999.)
        hands[LEFT].dq.translator(0., 0., -999.)
        scene.remove(hands[RIGHT])
        scene.remove(hands[LEFT])

        removeSurroundings()
    }

    turnOnPresenterMode = () => {

        spectatorMode = false
        let spectatorCamera = null
        let camBox = new THREE.Mesh(new THREE.PlaneGeometry(.2, .1, .1), new THREE.MeshBasicMaterial({ color: 0x00FF00 }))
        
        socket.on(`spectatorCamera`, msg => {

            if (spectatorCamera === null)
                spectatorCamera = defaultCamera()
            
            spectatorCamera.near = spectatorCameraNear
            spectatorCamera.position.copy(msg.position)
            spectatorCamera.rotation.copy(msg.rotation)
            
            spectatorCamera.fov = msg.fov
            spectatorCamera.aspect = msg.aspect
            spectatorCamera.updateProjectionMatrix()

            scene.add(spectatorCamera)
            spectatorCamera.add(camBox)
            // let cameraHelper = new THREE.CameraHelper(spectatorCamera)
            // scene.add(cameraHelper)

            // cameraHelper.update()
            // cameraHelper.updateMatrixWorld()

            addStage(spectatorCamera, false)
        })

        socket.emit(`cameraWanted`)
    }
    
    makeSpectatorCamera = () => {

        camera.fov = 12.
        camera.near = spectatorCameraNear
        comfortableHandPos(fl0).pointToGibbsVec(v1)
        camera.position.x = 0.
        camera.position.z = -2.4 //2.4m, pretty likely irl tbf
        camera.position.y = v1.y + 6./32.
        camera.rotation.set(0., Math.PI,0.)

        camera.updateMatrixWorld()
        camera.updateProjectionMatrix() //and need to do frustum things too

        addStage(camera, true)

        // let test = new THREE.Mesh(new THREE.BoxGeometry(.2,.2,.2), new THREE.MeshBasicMaterial({ color: 0x00FF00 }))
        // scene.add(test)
        // debugUpdates.push(() => {
        //     test.position.y = Math.sin(frameCount * .04) * .3 + .75
        // })

        function emitCamera() {
            socket.emit(`spectatorCamera`, {
                position: camera.position,
                rotation: camera.rotation,
                fov: camera.fov,
                aspect: camera.aspect
            })
        }

        let angle = .05 * Math.PI
        let leftQuat  = new THREE.Quaternion().setFromAxisAngle(v1.set(0., 1., 0.),  angle)
        let rightQuat = new THREE.Quaternion().setFromAxisAngle(v1.set(0., 1., 0.), -angle)
        document.addEventListener('keydown', event => {
            if( event.key === `ArrowLeft`) {
                camera.position.applyQuaternion(leftQuat)
                camera.rotation.y += angle
            }
            else if ( event.key === `ArrowRight`) {
                camera.position.applyQuaternion(rightQuat)
                camera.rotation.y += -angle
            }
            else if( event.key === `ArrowUp`) {
                camera.position.y -= 1./32.
            }
            else if( event.key === `ArrowDown`) {
                camera.position.y += 1./32.
            }
            emitCamera()
        })
        emitCamera()

        socket.on(`cameraWanted`, () => {
            //could refresh whole window...
            emitCamera()
        })
    }

    //feel free to rewrite
    function addStage( cameraToAddTo, haveMiddle ) {

        let stage = new THREE.Group()
        if (cameraToAddTo.parent !== scene)
            scene.add(cameraToAddTo)
        cameraToAddTo.add(stage)
        
        stage.position.z = -1.1 * cameraToAddTo.near
        stage.scale.multiplyScalar(1. / 2.7)

        let imageAspect = 620. / 384.
        // let middleAspect = 253. / 384.

        let generalWidth = cameraToAddTo.aspect * 1.23 //eyeballed
        if (haveMiddle) {
            textureLoader.load('data/stageBack.png', (texture) => {
                const mat = new THREE.MeshBasicMaterial({
                    transparent: true,
                    map: texture,
                    side: THREE.DoubleSide
                })
                const middle = new THREE.Mesh(new THREE.PlaneGeometry(1., 1.), mat)
                middle.scale.x = generalWidth
                stage.add(middle)
            })
        }

        const curtainRight = new THREE.Mesh(new THREE.PlaneGeometry(1., 1.), new THREE.MeshBasicMaterial({
            transparent: true,
            side: THREE.DoubleSide
        }))
        curtainRight.scale.x = imageAspect
        curtainRight.position.x = cameraToAddTo.aspect / 2. - curtainRight.scale.x / 2.
        curtainRight.position.z = -.001
        stage.add(curtainRight)
        const curtainLeft = new THREE.Mesh(new THREE.PlaneGeometry(1., 1.), new THREE.MeshBasicMaterial({
            transparent: true,
            side: THREE.DoubleSide
        }))
        curtainLeft.scale.x = imageAspect
        curtainLeft.position.x = -(cameraToAddTo.aspect / 2. - curtainLeft.scale.x / 2.)
        curtainLeft.position.z = .001
        stage.add(curtainLeft)

        textureLoader.load('data/curtainLeft.png', (texture) => {
            curtainLeft.material.map = texture
            curtainLeft.material.needsUpdate = true
        })
        textureLoader.load('data/curtainRight.png', (texture) => {
            curtainRight.material.map = texture
            curtainRight.material.needsUpdate = true
        })

        textureLoader.load('data/stageBackground.png', (texture) => {
            const mat = new THREE.MeshBasicMaterial({
                transparent: true,
                map: texture,
                side: THREE.DoubleSide
            })
            const bg = new THREE.Mesh(new THREE.PlaneGeometry(1., 1.), mat)
            bg.scale.x = generalWidth
            bg.scale.multiplyScalar(9.3)
            stage.add(bg)
            bg.position.z -= 40.
        })

        {
            let floor = new THREE.Mesh(
                new THREE.PlaneGeometry(1., 1., 1, 1),
                new THREE.MeshPhongMaterial({ color: 0x938572, side: THREE.DoubleSide, transparent: true }))
            stage.add(floor)
            floor.rotation.x = TAU / 4.
            floor.position.y = curtainLeft.scale.y * -.5
            floor.scale.x = 2. * (Math.abs(curtainLeft.position.x) + Math.abs(curtainLeft.scale.x / 2.))  //why is this not correct?
            floor.scale.y = generalWidth * .9
            floor.position.z = -floor.scale.y / 2.

            let wallRight = new THREE.Mesh(
                new THREE.PlaneGeometry(1., 1., 1, 1),
                new THREE.MeshBasicMaterial({ color: 0x736552, side: THREE.DoubleSide }))
            stage.add(wallRight)
            wallRight.rotation.y = TAU / 4.
            wallRight.scale.y = Math.abs(curtainLeft.scale.y)
            wallRight.scale.x = floor.scale.y
            wallRight.position.z = floor.position.z
            wallRight.position.x = Math.abs(floor.scale.x / 2.)

            let wallLeft = new THREE.Mesh(
                new THREE.PlaneGeometry(1., 1., 1, 1),
                new THREE.MeshBasicMaterial({ color: 0x736552, side: THREE.DoubleSide }))
            stage.add(wallLeft)
            wallLeft.rotation.y = TAU / 4.
            wallLeft.scale.y = Math.abs(curtainLeft.scale.y)
            wallLeft.scale.x = floor.scale.y
            wallLeft.position.z = floor.position.z
            wallLeft.position.x = -Math.abs(floor.scale.x / 2.)
        }
    }
    // addStage(camera, true)
}