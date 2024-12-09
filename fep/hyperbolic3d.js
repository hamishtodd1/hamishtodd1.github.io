/*
    
 */

updateHyperbolic3d = () => { }
function initHyperbolic3d() {

    let gr = new THREE.Group()
    scene.add(gr)

    initVizes3d(gr)

    let mySphere = new SphereViz(0x00ff00)
    mySphere.mv.copy(ep)

    updateHyperbolic3d = () => {
    }
}