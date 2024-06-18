function initField() {

    // camera.position.z += .9
    
    let numPoints = 300
    let geo = new THREE.BufferGeometry()
    let startCoords = new Float32Array(3 * numPoints)
    let limit = .6
    function randomCoord() {
        return limit * (Math.random() * 2. - 1.)
    }
    for(let i = 0; i < numPoints * 3; ++i)
        startCoords[i] = randomCoord()
    geo.setAttribute('position', new THREE.Float32BufferAttribute( startCoords, 3 ))
    let coords = geo.attributes.position.array
    let a = new THREE.Points(geo, new THREE.PointsMaterial({color:0x000000, size:.03}))
    scene.add(a)

    let vizes = [
        new DqViz(0x00FF00, true, false),
        new DqViz(0x00FF00, true, false)
    ]
    
    let bivecs = []
    vizes.forEach(viz=>bivecs.push(viz.dq))
    let bivecsNormalized = Array(bivecs.length).fill().map(() => new Dq())
    let oldPt = new Fl()
    let newPt = new Fl()
    let derivative = new Fl()
    let totalLog = new Dq()

    updateField = () => {

        camera.position.applyAxisAngle(yUnit, .005)
        camera.lookAt(0.,0.,0.)

        {
            let stime = 0.//frameCount * .002
            e12.addScaled(e01, -.25*Math.cos(stime), dq0).multiplyScalar(.001, bivecs[0]),
            e23.addScaled(e03, -.25*Math.cos(stime), dq0).multiplyScalar(.001, bivecs[1])
            vizes.forEach(viz => {
                e123.projectOn(viz.dq, viz.markupPos)
                viz.setAxisRadius(5.)
                viz.rotAxisMesh.scale.y = 4.
            })

            bivecsNormalized.forEach((bivecNormalized, bivecIndex) => {
                bivecsNormalized[bivecIndex].copy(bivecs[bivecIndex]).normalize()
            })
        }

        for(let i = 0; i < numPoints; ++i) {

            v1.fromArray(coords, 3 * i)
            oldPt.pointFromGibbsVec(v1)
            
            // derivative.zero()
            // bivecs.forEach((bivec, bivecIndex) => {
            //     let distSq = bivecsNormalized[bivecIndex].joinPt(oldPt, fl0).eNormSq()
            //     oldPt.commutator(bivec, fl0)
            //     derivative.addScaled(fl0, 1./Math.sqrt(distSq), derivative)
            // })
            // oldPt.add(derivative, newPt)
            
            totalLog.zero()
            bivecs.forEach((bivec, bivecIndex) => {
                let distSq = bivecsNormalized[bivecIndex].joinPt(oldPt, fl0).eNormSq()
                totalLog.addScaled(bivec, 1./Math.sqrt(distSq), totalLog)
            })
            totalLog.exp(dq0).sandwich(oldPt, newPt)
            
            newPt.pointToGibbsVec(v1)
            while (v1.length() > limit) {
                v1.x = randomCoord()
                v1.y = randomCoord()
                v1.z = randomCoord()
            }
            v1.toArray(coords, 3 * i)

        }
        geo.attributes.position.needsUpdate = true
    }
}