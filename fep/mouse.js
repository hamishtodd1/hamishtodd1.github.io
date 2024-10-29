function initMouse() {

    mousePos = new THREE.Vector3()
    raycaster = new THREE.Raycaster()
    
    let mouse2d = new THREE.Vector2()
        
    //strictly decoupled from hand! That is updated each frame!
    function updateMouseRay(event) {
        mouse2d.x = (event.clientX / window.innerWidth) * 2 - 1;
        mouse2d.y = -(event.clientY / window.innerHeight) * 2 + 1;
        raycaster.setFromCamera(mouse2d, camera)
    }
    function onMouseMove(event) {
        updateMouseRay(event)

        event.preventDefault()
    }
    document.addEventListener('pointermove', onMouseMove)
}