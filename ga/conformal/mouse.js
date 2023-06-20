function initMouse() {

    mouseRay = new Ega()
    mouseRay.copy(e12e)
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

        mousePlanePositionOld.copy(mousePlanePosition)
        workingPlane.meet(mouseRay, mousePlanePosition)
        mousePlanePosition.normalize()
    }
    
    document.addEventListener('mousedown', function (event) {
        if(event.button !== 0)
            return

        updateRay(event)
        mousePlanePositionOld.copy(mousePlanePosition) //because we've just started

        let intersects = raycaster.intersectObjects(grabbables)
        if(intersects.length !== 0) {
            grabbed = intersects[0].object
        }

        event.preventDefault()
    }, false)

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

    let scaleMode = false
    document.addEventListener(`mousedown`,function(event) {
        if(event.button !== 1)
            return

        scaleMode = !scaleMode

        event.preventDefault()
    })

    let mouseMvmt = new Dq()
    let workingPlane = new Ega().copy(e3e)
    mousePlanePosition = new Ega()
    mousePlanePositionOld = new Ega()
    function onMouseMove(event) {
        updateRay(event)

        if (grabbed !== null) {
            if (scaleMode) {
                log("scaaaaale")
            }
            else {
                mousePlanePosition.mul(mousePlanePositionOld, ega0).cast(mouseMvmt).sqrtSelf()
                mouseMvmt.multiplyScalar(-1.) //because negative scalar part causes bizarre alternation! So, hack!
                grabbed.dq.prepend(mouseMvmt)
            }
        }

        event.preventDefault()
    }

    document.addEventListener('mousemove', onMouseMove, false)

    document.addEventListener('mouseup', function (event) {
        if (event.button !== 0)
            return

        grabbed = null

        event.preventDefault()
    })

    // updateMouseIntersections = () => {
    //     grabbables.forEach((grabbable)=>{
    //         if(grabbable)
    //     })
    // } 
}