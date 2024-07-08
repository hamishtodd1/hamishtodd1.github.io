async function initHands() {

    handPosition = new Ega().copy(e123e)
    handPositionOld = new Ega().copy(e123e)
    selectorRay = new Dq()
    handDq = new Dq()
    handDqDiff = new Dq()

    let handDqOldReverse = new Dq()
    updateHandMvs = () => {
        getHandDq(handDq, false)
        getHandDq(handDqOldReverse, true).reverse(handDqOldReverse)
        handDqOldReverse.mul(handDq, handDqDiff)
        updateOlds()
    }

    {
        let arrowLength = .4
        let geo = new THREE.ConeGeometry(.025, arrowLength, 7, 1, true)
        geo.translate(0., arrowLength / 2., 0.)
        let mat = new THREE.MeshPhongMaterial({ color: 0xFF0000 })
        var selectorRayCone = new DqMesh(geo, mat)
        if (isSketch)
            selectorRayCone.visible = false
        scene.add(selectorRayCone)
        selectorRayCone.castShadow = true
    }

    //Mouse stuff
    {
        function updateSelectorMvs() {
            let handDq = getHandDq(dq0)
            handDq.sandwich(e13e, ega0).cast(selectorRay)

            selectorRayCone.dq.copy(dq0)
        }

        var updateOlds = () => {
            handPositionOld.copy(handPosition)
            mouseWheelTransformOld.copy(mouseWheelTransform)
        }

        let rayToMouse = new Ega().copy(e12e)
        let mouseWheelTransform = new Dq().copy(oneDq)
        let mouseWheelTransformOld = new Dq().copy(oneDq)

        let mouseOrigin = new Ega()
        let mouseDirection = new Ega()

        let raycaster = new THREE.Raycaster()
        let mouse2d = new THREE.Vector2()

        let workingPlane = new Ega().copy(e3e)

        function getHandDq(dq, old) {
            e123e.transformToSquared(old?handPositionOld:handPosition, ega0).cast(dq).sqrtSelf()
            dq.append(old? mouseWheelTransformOld:mouseWheelTransform)
            return dq
        }

        function updateMouseRay(event) {
            // debugger
            mouse2d.x = (event.clientX / window.innerWidth) * 2 - 1;
            mouse2d.y = -(event.clientY / window.innerHeight) * 2 + 1;
            raycaster.setFromCamera(mouse2d, camera)

            //would prefer to do this ourselves, using camera GA
            mouseOrigin.pointFromVec3(raycaster.ray.origin)
            mouseDirection.pointFromNormalVec3(raycaster.ray.direction)
            mouseOrigin.join(mouseDirection, rayToMouse)

            workingPlane.meet(rayToMouse, handPosition)
            handPosition.normalize()
            // log(handPosition)

            if (!isSketch)
                updateSelectorMvs()
        }

        function onMouseMove(event) {
            updateMouseRay(event)

            event.preventDefault()
        }
        function onMouseDown(event) {
            if (event.button !== 0)
                return

            updateMouseRay(event)
            handPositionOld.copy(handPosition) //because we've just started

            event.preventDefault()
        }

        resetMouseWheelTransform = () => {
            mouseWheelTransform.copy(oneDq)
        }

        let angle = .15
        let turnRight = new Dq().set(Math.cos(angle), 0., 0., 0., Math.sin(angle), 0., 0., 0.)
        let turnLeft = new Dq().set(Math.cos(-angle), 0., 0., 0., Math.sin(-angle), 0., 0., 0.)
        function onMouseWheel(event) {
            let mouseTurn = event.deltaY < 0 ? turnLeft : turnRight
            mouseWheelTransform.append(mouseTurn)

            updateSelectorMvs()
        }

        document.addEventListener('pointerdown', onMouseDown)
        document.addEventListener('pointermove', onMouseMove)
        document.addEventListener('wheel', onMouseWheel)
    }

    objLoader.load(`/data/standinController.obj`, (obj) => {
        let geo = obj.children[0].geometry
        geo.scale(.1, .1, .1)
        geo.rotateX(-TAU / 8. * 3.)
        geo.rotateY(TAU / 2.)
        let mesh = new THREE.Mesh(geo, new THREE.MeshPhongMaterial({ color: 0xFFFFFF }))
        selectorRayCone.add(mesh)
        if(isSketch)
            mesh.visible = false
    })

    setUpVr = () => {
        document.removeEventListener('pointerdown', onMouseDown)
        document.removeEventListener('pointermove', onMouseMove)
        document.removeEventListener('wheel', onMouseWheel)

        let hand1 = renderer.xr.getHand(0)

        scene.add(debugSphere)
        debugSphere.position.set(0., 1.6, 0.)

        getHandDq = (dq) => {
            ega1.pointFromVec3(hand1.position)
            e123e.transformToSquared(handPosition, ega0).cast(dq).sqrtSelf().append(mouseWheelTransform)
            return dq
        }

        getControllerInput = () => {
            handPositionOld.copy(handPosition)
            mouseWheelTransformOld.copy(mouseWheelTransform)

            handPosition.pointFromVec3(hand1.position)
        }

        updateOlds = () => {
            handPositionOld.copy(handPosition)
        }
    }
}