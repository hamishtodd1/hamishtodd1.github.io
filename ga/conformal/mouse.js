
function initMouse() {

    mouseRay = new Ega().copy(e12e)
    mousePlanePosition = new Ega().copy(e123e)
    mousePlanePositionOld = new Ega().copy(e123e)
    
    let mouseRayOld = new Ega()

    let mouseWheelTransform = new Dq().copy(oneDq)
    selectorRay = new Dq()
    // let selectorRayViz = new DqViz()
    // scene.add(selectorRayViz)

    {
        let arrowLength = .4
        let geo = new THREE.ConeGeometry(.025, arrowLength,7,1,true)
        geo.translate(0., arrowLength/2.,0.)
        let mat = new THREE.MeshPhongMaterial({ color: 0xFF0000 })
        var selectorRayCone = new DqMesh(geo,mat)
        scene.add(selectorRayCone)
        selectorRayCone.castShadow = true
    }

    let raycaster = new THREE.Raycaster()
    let mouse2d = new THREE.Vector2()

    let grabbed = null

    let mouseOrigin = new Ega()
    let mouseDirection = new Ega()

    function updateMouseRay(event) {
        mouse2d.x = (event.clientX / window.innerWidth) * 2 - 1;
        mouse2d.y = -(event.clientY / window.innerHeight) * 2 + 1;
        raycaster.setFromCamera(mouse2d, camera)

        //would prefer to do this ourselves, using camera GA
        mouseOrigin.pointFromVec3(raycaster.ray.origin)
        mouseDirection.pointFromNormalVec3(raycaster.ray.direction)
        mouseRayOld.copy(mouseRay)
        mouseOrigin.join(mouseDirection, mouseRay)

        mousePlanePositionOld.copy(mousePlanePosition)
        workingPlane.meet(mouseRay, mousePlanePosition)
        mousePlanePosition.normalize()

        updateSelectorMvs()
    }
    
    function onMouseDown(event) {
        if(event.button !== 0)
            return

        updateMouseRay(event)
        mousePlanePositionOld.copy(mousePlanePosition) //because we've just started

        let intersects = raycaster.intersectObjects(grabbables)
        if(intersects.length !== 0) {
            grabbed = intersects[0].object
        }

        event.preventDefault()
    }
    document.addEventListener('pointerdown', onMouseDown, false)
    document.addEventListener('pointerdown', onMouseDown, false)

    let angle = .3
    let turnRight = new Dq().set(Math.cos( angle), 0., 0., 0., Math.sin( angle), 0., 0., 0.)
    let turnLeft  = new Dq().set(Math.cos(-angle), 0., 0., 0., Math.sin(-angle), 0., 0., 0.)
    document.addEventListener('wheel',function(event){
        if (grabbed !== null) {
            let mouseTurn = event.deltaY < 0 ? turnLeft : turnRight
            //actually it's more like you're appending it in the place where its position is
            //but it gets converted to a matrix so etc
            grabbed.dq.append(mouseTurn)
        }
    })

    let workingPlane = new Ega().copy(e3e)
    function onMouseMove(event) {
        updateMouseRay(event)

        event.preventDefault()
    }

    document.addEventListener('pointermove', onMouseMove, false)
    document.addEventListener('pointerdown', onMouseMove, false)
    document.addEventListener('pointermove', onMouseMove, false)

    // updateMouseIntersections = () => {
    //     grabbables.forEach((grabbable)=>{
    //         if(grabbable)
    //     })
    // } 

    function updateSelectorMvs() {

        let mouseTransform = getMousePositionAndWheelDq(dq0)
        mouseTransform.sandwich(e13e, ega0).cast(selectorRay)
        // selectorRayViz.dq.copy(selectorRay)

        selectorRayCone.dq.copy(dq0)
    }
    
    {
        getMousePositionAndWheelDq = (dq) => {
            e123e.transformToSquared(mousePlanePosition, ega0).cast(dq).sqrtSelf().append(mouseWheelTransform)
            return dq
        }

        resetMouseWheelTransform = () => {
            mouseWheelTransform.copy(oneDq)
        }

        let angle = .15
        let turnRight = new Dq().set(Math.cos(angle), 0., 0., 0., Math.sin(angle), 0., 0., 0.)
        let turnLeft = new Dq().set(Math.cos(-angle), 0., 0., 0., Math.sin(-angle), 0., 0., 0.)
        document.addEventListener('wheel', function (event) {
            let mouseTurn = event.deltaY < 0 ? turnLeft : turnRight
            mouseWheelTransform.append(mouseTurn)

            updateSelectorMvs()
        })
    }
}