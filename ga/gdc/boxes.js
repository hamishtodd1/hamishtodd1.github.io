//maybe there should be dotted lines connecting them to the center?
//Sigh. The whole point is to be more coordinate free, is this reintroducing coords?
//Well, it surely make sense to have the groups
//Alright, the groups are organize by COLOR

//Yes, you might rip up all of this shit because you get a better idea. This is "just" structural stuff
//your goal is to see what puzzle solving feels like
//once that is set up you can have a much better way to test structure ideas

function initPuzzles() {
    
    let boxDimension = .6
    let boxGeo = new THREE.BoxGeometry(1.,1.,1.)

    for(let i = 8; i < 10; ++i) {
        for(let j = 0; j < 3; ++j)
            boxGeo.index.array[i * 3 + j] = 0
    }
    let goalBoxMat = new THREE.MeshPhongMaterial({color:0xFFD700, side:THREE.DoubleSide})

    let largerBoxMat = new THREE.MeshPhongMaterial({color:0xFFFFFF, side:THREE.DoubleSide})
    let largerBoxGeo = boxGeo.clone().scale(boxDimension * 2.2, boxDimension * 1.1, boxDimension * 1.001)
    let largerBox = new THREE.Mesh(largerBoxGeo, largerBoxMat)
    // largerBox.castShadow = true
    largerBox.position.y = 1.6
    largerBox.position.z = -1.1 * boxDimension
    scene.add(largerBox)
    
    let goalBox = new THREE.Mesh(boxGeo, goalBoxMat)
    // goalBox.castShadow = true
    // goalBox.receiveShadow = true
    goalBox.scale.setScalar(boxDimension)
    goalBox.position.x = boxDimension * .55
    largerBox.add(goalBox)

    let workBoxMat = new THREE.MeshPhongMaterial({ color: 0xCD7F32, side: THREE.DoubleSide })
    workBox = new THREE.Mesh(boxGeo, workBoxMat)
    // workBox.castShadow = true
    // goalBox.receiveShadow = true
    workBox.scale.setScalar(boxDimension)
    scene.add(workBox)

    let example = new THREE.Mesh(new THREE.SphereGeometry(.03), new THREE.MeshPhongMaterial({color:0xFF0000}))
    // example.castShadow = true
    goalBox.add(example)

    window.getGoalBoxPlace = (target) => {
        target.copy(goalBox.position)
        target.x *= -1.
        largerBox.localToWorld(target)
        return target
    }

    let sign = text("Level complete!", false, 0x000000)
    sign.material.transparent = true
    scene.add(sign)
    sign.visible = false

    let checkTime = 0
    window.updateCheckAnimation = () => {
        workBox.groupOrigin.toVec(workBox.position)

        if (workBox.groupOrigin[13] < 0.) {
            ++checkTime
            if (checkTime > 80) {
                workBox.groupOrigin.copy(workBox.groupOriginInitial)
                checkTime = 0

                sounds.levelComplete.play()
                sign.visible = true
                sign.material.opacity = 17.
                sign.position.y = 2.3
                sign.scale.multiplyScalar(.4 / sign.scale.y)
            }
        }

        sign.position.y += .004
        sign.scale.multiplyScalar(1.002)
        sign.material.opacity = clamp(sign.material.opacity - .01, 0., 1.)
    }
}