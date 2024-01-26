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
            snappables[msg.i] = new Snappable()
            snappables[msg.i].sclptable = new Sclptable()
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
                snappables[msg.i] = new DqViz(0xFF0000, false, true)

            for (let i = 0; i < 8; ++i) {
                snappables[msg.i].dq[i] = msg.dq[i]
                snappables[msg.i].markupPos[i] = msg.markupPos[i]
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
        comfortablePos(0., fl0, 0.).pointToGibbsVec(spectatorCamera.position)
        spectatorCamera.position.z -= 1.2
        spectatorCamera.near = .8
        spectatorCamera.lookAt(comfortablePos(0., fl0, 0.).pointToGibbsVec(v1))

        spectatorCamera.updateMatrixWorld()
        spectatorCamera.updateProjectionMatrix() //and need to do frustum things too

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
                        new THREE.MeshPhongMaterial({ color: 0x333333, side: THREE.DoubleSide, }) ),
                    new THREE.Mesh(
                        new THREE.PlaneGeometry(1., 1., 1, 1),
                        new THREE.MeshPhongMaterial({ color: 0x555555, side: THREE.DoubleSide, }) ),
                    new THREE.Mesh(
                        new THREE.PlaneGeometry(1., 1., 1, 1),
                        new THREE.MeshPhongMaterial({ color: 0x555555, side: THREE.DoubleSide, }) ) ]

                cameraHelper.add(surfaces[0], surfaces[1], surfaces[2])
                
                let pyramidTop = v3.fromArray(cameraHelper.geometry.attributes.position.array, 24*3)

                function surfaceVerts(stageIndex, helperIndex, surfaceIndex) {
                    let arr = surfaces[surfaceIndex].geometry.attributes.position.array
                    let corner = v1.fromArray(cameraHelper.geometry.attributes.position.array, helperIndex * 3)
                    corner.toArray(arr, stageIndex * 3)

                    v4.subVectors(pyramidTop, corner).multiplyScalar(-1.).add(corner)
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
}