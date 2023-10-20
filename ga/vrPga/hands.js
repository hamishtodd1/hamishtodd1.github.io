async function initHands() {

    selectorRay = new Dq()

    handPosition = new Fl().copy(e123)
    handPositionOld = new Fl().copy(e123)
    handDq = new Dq()
    handDqDiff = new Dq()

    let standinHandGeo = new THREE.BoxGeometry(.3,.3,.3)
    let hand1 = new DqMesh(standinHandGeo, new THREE.MeshPhongMaterial({ color: 0x00FF00 }))
    scene.add(hand1)
    let hand2 = new DqMesh(standinHandGeo, new THREE.MeshPhongMaterial({ color: 0x0000FF }))
    scene.add(hand2)

    let handDqOld = new Dq()
    let workingPlane = new Fl()
    let center = new Fl().point(0.,1.6,0.,1.)
    let rayToMouse = new Dq().copy(e12)
    updateHandMvs = () => {

        updateOlds()

        camera.frustum.near.projectOn( center, workingPlane )
        workingPlane.meet(rayToMouse, handPosition)
        handPosition.normalize()

        getHandDq(handDq, false)
        getHandDq(handDqOld, true)
        handDq.mulReverse(handDqOld,handDqDiff)

        if (simulatingPaintingHand)
            hand1.dq.copy( selectorRayCone.dq )
        else
            hand2.dq.copy( selectorRayCone.dq )

        updateSelectorMvs()
    }

    //selector ray
    {
        let arrowLength = .4
        let geo = new THREE.ConeGeometry(.025, arrowLength, 7, 1, true)
        geo.translate(0., arrowLength / 2., 0.)
        let mat = new THREE.MeshPhongMaterial({ color: 0xFF0000 })
        selectorRayCone = new DqMesh(geo, mat)
        scene.add(selectorRayCone)
        selectorRayCone.castShadow = true
    }

    //Mouse stuff
    {
        function updateSelectorMvs() {
            handDq.sandwich(e13, selectorRay)

            selectorRayCone.dq.copy(handDq)
        }

        document.addEventListener('keydown', event => {
            if (event.key === "5" && event.ctrlKey)
                document.dispatchEvent(new Event(`mouseRewind`))
            if (event.key === "6" && event.ctrlKey)
                document.dispatchEvent(new Event(`mouseFastForward`))
        })

        updateOlds = () => {
            handPositionOld.copy(handPosition)
            mouseWheelTransformOld.copy(mouseWheelTransform)
        }

        let mouseWheelTransform = new Dq().copy(oneDq)
        let mouseWheelTransformOld = new Dq().copy(oneDq)

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
            mouseOrigin.pointFromVertex(raycaster.ray.origin)
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

        let angle = .15
        let turnRight = new Dq().set(Math.cos( angle), 0., 0., 0., Math.sin(angle), 0., 0., 0.)
        let turnLeft  = new Dq().set(Math.cos(-angle), 0., 0., 0., Math.sin(-angle), 0., 0., 0.)
        function onMouseWheel(event) {
            let mouseTurn = event.deltaY < 0 ? turnLeft : turnRight
            mouseWheelTransform.append(mouseTurn)

            updateSelectorMvs()
        }

        document.addEventListener('pointermove', onMouseMove)
        document.addEventListener('wheel', onMouseWheel)
        
        getHandDq = (dq, old) => {
            dq.ptToPt(e123, old ? handPositionOld : handPosition)
                .append(old ? mouseWheelTransformOld : mouseWheelTransform)
                //yes, append, because algebra
            return dq
        }
    }

    document.addEventListener(`keydown`, event => {
        if (event.key === ` `) {
            simulatingPaintingHand = !simulatingPaintingHand
        }
    })

    objLoader.load(`/data/standinController.obj`, (obj) => {
        
        let geo = obj.children[0].geometry
        geo.scale(.1, .1, .1)
        geo.rotateX(-TAU / 8. * 3.)
        geo.rotateY(TAU / 2.)

        hand1.geometry = geo
        hand2.geometry = geo
        
    })

    setUpVr = () => {
        document.removeEventListener('pointerdown', onMouseDown)
        document.removeEventListener('pointermove', onMouseMove)
        document.removeEventListener('wheel', onMouseWheel)

        let hand1 = renderer.xr.getHand(0)

        getControllerInput = () => {
            handPositionOld.copy(handPosition)
            mouseWheelTransformOld.copy(mouseWheelTransform)

            handPosition.pointFromVertex(hand1.position)
        }

        updateOlds = () => {
            handPositionOld.copy(handPosition)
        }
    }
}