function turnOnSpectatorMode() {

    if (spectatorMode)
        return
    spectatorMode = true

    // let indicator = new THREE.Mesh(new THREE.BoxGeometry(.02, .02, .02), new THREE.MeshBasicMaterial({ color: 0x000000 }))
    // comfortablePos(0., fl0, 0.).pointToGibbsVec(indicator.position)
    // scene.add(indicator)

    makeSpectatorCamera(true)

    removeMouseEventListeners()

    hand1.dq.translator(0., 0., -999.)
    hand2.dq.translator(0., 0., -999.)
    scene.remove(hand1)
    scene.remove(hand2)

    removeSurroundings()
}

function makeSpectatorCamera(weAreSpectator) {

    let ret = null
    if(weAreSpectator)
        ret = camera
    else
        ret = defaultCamera()

    ret.fov = 12.
    comfortablePos(0., fl0, 0.).pointToGibbsVec(ret.position)
    ret.position.z -= 1.2
    ret.near = .8
    ret.lookAt(comfortablePos(0., fl0, 0.).pointToGibbsVec(v1))

    ret.updateProjectionMatrix() //and need to do frustum things too

    if(!weAreSpectator) {
        
        let cameraHelper = new THREE.CameraHelper(ret)
        scene.add(ret)
        scene.add(cameraHelper)
    }

    //fog or something?

    return ret
}