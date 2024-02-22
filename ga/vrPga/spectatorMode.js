/*
    Maybe should be closer to the pupeteer's view
    Fog maybe? So that you can have them go away
*/

function initPotentialSpectatorReception() {

    socket.on(`disposeSnappable`, msg=>{

        let s = snappables[msg.i]
        snappables[msg.i] = null

        s.dispose()

    })
    
    socket.on("sclptable", msg => {
        turnOnSpectatorMode()

        if (snappables[msg.i] === undefined) {
            snappables[msg.i] = new DqViz(0xFF0000, true, false) //TODO bug this thing must be showing up
            snappables[msg.i].sclptable = new Sclptable(snappables[msg.i])
            snappables[msg.i].visible = false
        }

        // sclptables[msg.i].brushStroke(fl0.point(0., 1.2, 0., 1.))

        let cs = snappables[msg.i].sclptable.children[msg.color]
        cs.vAttr.needsUpdate = true
        cs.vAttr.updateRange.offset = 0
        cs.vAttr.updateRange.count = 0
        cs.geometry.drawRange.count = 0
        cs.lowestUnusedCube = 0

        //it's coming in as a literal object, not even an array. Really no good
        let newCount = Object.keys(msg.arr).length / 3
        for (let i = 0, il = newCount; i < il; ++i)
            cs.fillCubePosition(v1.set(msg.arr[i * 3 + 0], msg.arr[i * 3 + 1], msg.arr[i * 3 + 2]))
    })

    let backedUpMsgs = []
    socket.on( "snappable", msg => {
        backedUpMsgs.push(msg)
    })
    handleDqMsgs = () => {
        
        backedUpMsgs.forEach((msg) => {
            if (snappables[msg.i] === undefined)
                snappables[msg.i] = new DqViz(0xFF0000, true, false)

            for (let j = 0; j < 8; ++j) {
                snappables[msg.i].dq[j] = msg.dqCoefficientsArray[j]
            }
            
        })
        
        for (let i = 0; i < backedUpMsgs.length; ++i)
            delete backedUpMsgs[i]
        backedUpMsgs.length = 0
    }

    function turnOnSpectatorMode() {

        if (spectatorMode)
            return
        spectatorMode = true

        // let indicator = new THREE.Mesh(new THREE.BoxGeometry(.02, .02, .02), new THREE.MeshBasicMaterial({ color: 0x000000 }))
        // comfortablePos(0., fl0, 0.).pointToGibbsVec(indicator.position)
        // scene.add(indicator)

        makeSpectatorCamera(true)

        removeMouseEventListeners()

        handRight.dq.translator(0., 0., -999.)
        handLeft.dq.translator(0., 0., -999.)
        scene.remove(handRight)
        scene.remove(handLeft)

        removeSurroundings()
    }
    
    makeSpectatorCamera = (weAreSpectator) => {

        let spectatorCamera = null
        if (weAreSpectator)
            spectatorCamera = camera
        else
            spectatorCamera = defaultCamera()

        spectatorCamera.fov = 12.
        comfortableHandPos(fl0).pointToGibbsVec(spectatorCamera.position)
        spectatorCamera.position.z -= 2.4
        spectatorCamera.near = .8
        spectatorCamera.lookAt(comfortableHandPos(fl0).pointToGibbsVec(v1))

        spectatorCamera.updateMatrixWorld()
        spectatorCamera.updateProjectionMatrix() //and need to do frustum things too

        addStage(spectatorCamera, weAreSpectator)

        if (!weAreSpectator) {

            let cameraHelper = new THREE.CameraHelper(spectatorCamera)
            scene.add(spectatorCamera)
            scene.add(cameraHelper)

            cameraHelper.update()
            cameraHelper.updateMatrixWorld()
            
            {
                let surfaces = [
                    new THREE.Mesh(
                        new THREE.PlaneGeometry(1., 1., 1, 1),
                        new THREE.MeshPhongMaterial({ color: 0x333333, side: THREE.DoubleSide, transparent: true, opacity: .8 }) ),
                    new THREE.Mesh(
                        new THREE.PlaneGeometry(1., 1., 1, 1),
                        new THREE.MeshPhongMaterial({ color: 0x555555, side: THREE.DoubleSide, transparent: true, opacity: .8 }) ),
                    new THREE.Mesh(
                        new THREE.PlaneGeometry(1., 1., 1, 1),
                        new THREE.MeshPhongMaterial({ color: 0x555555, side: THREE.DoubleSide, transparent: true, opacity: .8 }) ) ]

                cameraHelper.add(surfaces[0], surfaces[1], surfaces[2])
                
                let pyramidTop = v3.fromArray(cameraHelper.geometry.attributes.position.array, 24*3)

                function surfaceVerts(stageIndex, helperIndex, surfaceIndex) {
                    let arr = surfaces[surfaceIndex].geometry.attributes.position.array
                    let corner = v1.fromArray(cameraHelper.geometry.attributes.position.array, helperIndex * 3)
                    corner.toArray(arr, stageIndex * 3)

                    v4.subVectors(pyramidTop, corner).multiplyScalar(-1.3).add(corner)
                    v4.toArray(arr, (stageIndex + 2) * 3)
                }

                surfaceVerts(0, 42, 1)
                surfaceVerts(1, 0, 1)
                surfaceVerts(0, 0, 0)
                surfaceVerts(1, 1, 0)
                surfaceVerts(0, 1, 2)
                surfaceVerts(1, 43, 2)
            }


            // let index = 0
            // debugUpdates.push(() => {
            //     v1.fromArray(cameraHelper.geometry.attributes.position.array, index * 3)
            //     cameraHelper.localToWorld(v1)
            //     debugSphere.position.copy(v1)

            //     log(index)

            //     if (frameCount % 100 === 0) {
            //         index++
            //         if (index > cameraHelper.geometry.attributes.position.count)
            //             index = 0
            //     }
            // })
        }

        return spectatorCamera
    }

    function addStage( cameraToAddTo, haveMiddle ) {

        let stage = new THREE.Group()
        if (cameraToAddTo.parent !== scene)
            scene.add(cameraToAddTo)
        cameraToAddTo.add(stage)
        
        stage.position.z = -1.1 * cameraToAddTo.near
        stage.scale.multiplyScalar(1. / 6.5)

        let imageAspect = 620. / 384.
        // let middleAspect = 253. / 384.

        if (haveMiddle) {
            textureLoader.load('data/stageBack.png', (texture) => {
                const mat = new THREE.MeshBasicMaterial({
                    transparent: true,
                    map: texture,
                    side: THREE.DoubleSide
                })
                const middle = new THREE.Mesh(new THREE.PlaneGeometry(1., 1.), mat)
                middle.scale.x = cameraToAddTo.aspect * 1.23 //eyeballed
                stage.add(middle)
            })
        }
        textureLoader.load('data/curtainRight.png', (texture) => {
            const mat = new THREE.MeshBasicMaterial({
                transparent: true,
                map: texture,
                side: THREE.DoubleSide
            })
            const curtain = new THREE.Mesh(new THREE.PlaneGeometry(1., 1.), mat)
            curtain.scale.x = imageAspect
            curtain.position.x = cameraToAddTo.aspect / 2. - curtain.scale.x / 2.
            curtain.position.z = -.001
            stage.add(curtain)
        })
        textureLoader.load('data/curtainLeft.png', (texture) => {
            const mat = new THREE.MeshBasicMaterial({
                transparent: true,
                map: texture,
                side: THREE.DoubleSide
            })
            const curtain = new THREE.Mesh(new THREE.PlaneGeometry(1., 1.), mat)
            curtain.scale.x = imageAspect
            curtain.position.x = -(cameraToAddTo.aspect / 2. - curtain.scale.x / 2.)
            curtain.position.z = .001
            stage.add(curtain)
        })
    }
    // addStage(camera, true)
}