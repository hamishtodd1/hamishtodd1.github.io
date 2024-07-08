/*
    We want to visualize "transformation fields"
        Because, for one thing, wanna check if we can make them line up at the faces
        We're taking a simple approach to interpolating the field so far as moving the wind goes
        Question is, what are the axes then?

    One claim is: each simplicial volume has a single, interpolated bivector/motor

    2D pairs up circles and)
    3D pairs up
    
*/

function initFilaments() {

    let apparatus = new THREE.Group()
    scene.add(apparatus)
    apparatus.position.y = 1.6
    apparatus.scale.multiplyScalar(0.5)

    let corners = Array(8)
    let cornerGeo = new THREE.SphereGeometry(0.06, 32, 32)
    let cornerMat = new THREE.MeshBasicMaterial({color: 0x000000})
    for(let i = 0; i < 8; i++) {
        corners[i] = new THREE.Mesh(cornerGeo, cornerMat)
        corners[i].position.x = (i & 1) ? 0. : 1.
        corners[i].position.y = (i & 2) ? 0. : 1.
        corners[i].position.z = (i & 4) ? 0. : 1.
        apparatus.add(corners[i])
    }

    //the derivatives
    let atCorners = Array(8)
    for(let i = 0; i < 8; i++) {
        atCorners[i] = new Dq()
        e12.multiplyScalar(.01, atCorners[i])
        // for(let j = 0; j < 6; ++j) {
        //     atCorners[i][j+1] = Math.random() - 0.5
        // }
    }

    let numPts = 31
    const ptsAttr = new THREE.Float32BufferAttribute(new Float32Array(numPts * 3), 3)
    let pts = ptsAttr.array
    function randomizePt(index) {
        pts[index * 3 + 0] = Math.random()
        pts[index * 3 + 1] = Math.random()
        pts[index * 3 + 2] = Math.random()
    }
    for (let i = 0; i < numPts; i++) {
        randomizePt(i)
    }
    updateFilaments = () => {

        if(frameCount % 100 === 0) {
        }

        for(let i = 0; i < numPts; i++) {
            let x = pts[i * 3 + 0]
            let y = pts[i * 3 + 1]
            let z = pts[i * 3 + 2]
            
            dq0.zero()
            for(let i = 0; i < 8; ++i) {
                let factor = 1.
                factor *= (i & 1) ? 1.-x : x
                factor *= (i & 2) ? 1.-y : y
                factor *= (i & 4) ? 1.-z : z
                log(factor)
                dq0.addScaled(atCorners[i],factor,dq0)
            }
            debugger

            let pt = fl0.point(pts[i * 3 + 0], pts[i * 3 + 1], pts[i * 3 + 2])
        }

        ptsAttr.needsUpdate = true
    }
    let ptsGeo = new THREE.BufferGeometry()
    let ptsMat = new THREE.PointsMaterial({ color: 0xFF0000, size: 0.04})
    let ptsObj3d = new THREE.Points(ptsGeo, ptsMat)
    apparatus.add(ptsObj3d)
    ptsGeo.setAttribute('position', ptsAttr)
}