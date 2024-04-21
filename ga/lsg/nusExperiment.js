function initNusExperiment() {
    let numPts = 16
    let pts = Array(numPts)
    let ptsGeo = new THREE.SphereGeometry(.03)
    let ptsMat = new THREE.MeshPhongMaterial({color:0xFF0000})
    for(let i = 0; i < numPts; ++i) {
        pts[i] = new THREE.Mesh(ptsGeo, ptsMat)
        scene.add(pts[i])
        pts[i].position.x = Math.random() - .5
        pts[i].position.z = Math.random() - .5
        pts[i].position.multiplyScalar(1.9)
    }

    let initialTws = Array(numPts)
    for(let i = 0; i < numPts; ++i) {
        initialTws[i] = new Tw()
        initialTws[i].addScaled(_e10, pts[i].position.x, initialTws[i])
        initialTws[i].addScaled(_e20, pts[i].position.z, initialTws[i])
        initialTws[i].addScaled(_e12, 1., initialTws[i])
    }
    let tv = new Trivec()
    let transform = new Tw()
    transform[0] = 1.
    let transformLog = new Tw()
    
    debugUpdates.push(()=>{

        let axis = _e12.addScaled(_e1t, 1., tw2 )
        axis.multiplyScalar( frameCount*.008, transformLog)
        // debugger
        staExp(transformLog,transform)
        // transform.log()

        for (let i = 0; i < numPts; ++i) {
            let transformed = transform.sandwich(initialTws[i], tw1)
            let barePoint = transformed.meet(_et, tw0)
            basis1t2.ppToGibbsVecs(barePoint.cast(tv), pts[i].position, v2)
        }
    })
}