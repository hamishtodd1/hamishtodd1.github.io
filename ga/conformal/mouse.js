function initMouse() {

    let mouseRay = new Ega()
    let mouseRayOld = new Ega()

    let raycaster = new THREE.Raycaster()
    let mouse2d = new THREE.Vector2()

    let grabbed = null

    let mouseOrigin = new Ega()
    let mouseDirection = new Ega()

    function updateRay(event) {
        mouse2d.x = (event.clientX / window.innerWidth) * 2 - 1;
        mouse2d.y = -(event.clientY / window.innerHeight) * 2 + 1;
        raycaster.setFromCamera(mouse2d, camera)

        //would prefer to do this ourselves, using camera GA
        mouseOrigin.pointFromVec3(raycaster.ray.origin)
        mouseDirection.pointFromNormalVec3(raycaster.ray.direction)
        mouseRayOld.copy(mouseRay)
        mouseOrigin.join(mouseDirection, mouseRay)

        workingPlaneIntersectionOld.copy(workingPlaneIntersection)
        workingPlane.meet(mouseRay, workingPlaneIntersection)
        workingPlaneIntersection.normalize()
    }
    
    document.addEventListener('mousedown', function (event) {

        updateRay(event)
        workingPlaneIntersectionOld.copy(workingPlaneIntersection) //because we've just started

        let intersects = raycaster.intersectObjects(grabbables)
        if(intersects.length !== 0) {
            grabbed = intersects[0].object
            grabbed.onClick()
        }

        event.preventDefault()
    }, false)

    let mouseMvmt = new Dq()
    let workingPlane = new Ega().copy(e3e)
    let workingPlaneIntersection = new Ega()
    let workingPlaneIntersectionOld = new Ega()
    function onMouseMove(event) {
        updateRay(event)

        if (grabbed !== null) {
            mouseMvmt.fromEga(workingPlaneIntersection.mul(workingPlaneIntersectionOld, ega0)).sqrtSelf()
            
            grabbed.onMouseMove(mouseMvmt)
        }

        event.preventDefault()
    }

    document.addEventListener('mousemove', onMouseMove, false)

    document.addEventListener('mouseup', function (event) {
        grabbed = null
    })

    // updateMouseIntersections = () => {
    //     grabbables.forEach((grabbable)=>{
    //         if(grabbable)
    //     })
    // } 
}