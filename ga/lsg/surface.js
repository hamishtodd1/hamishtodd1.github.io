/*
    So you could 
 */

updateSurface = () => {}
function initSurface() {

    // let vertMeshes = []
    // {
    //     let vertGeo = new THREE.SphereGeometry(.05)
    //     for (let i = 0; i < 6; ++i) {
    //         let vertViz = new THREE.Mesh(vertGeo, new THREE.MeshBasicMaterial({ color: 0xff0000 }))
    //         vertViz.position.set(Math.random() - .5, Math.random() - .5, Math.random() - .5).multiplyScalar(3.)
    //         scene.add(vertViz)

    //         vertMeshes.push(vertViz)
    //     }
    // }

    // //the first three are the edges
    // let segments = [
    //     0, 1, 1, 2, 2, 0,
    //     0, 3, 3, 1,
    //     1, 4, 4, 2,
    //     2, 5, 5, 0
    // ]
    // {
    //     let geo = new THREE.BufferGeometry()
    //     let numEdges = 9
    //     geo.setAttribute('position', new THREE.BufferAttribute(new Float32Array(numEdges * 6), 3))
    //     let arr = geo.attributes.position.array
    //     for (let i = 0; i < numEdges; ++i) {
    //         vertMeshes[segments[i * 2]].position.toArray(arr, i * 6)
    //         vertMeshes[segments[i * 2 + 1]].position.toArray(arr, i * 6 + 3)
    //     }
    //     let wireframe = new THREE.LineSegments(geo, new THREE.LineBasicMaterial({ color: 0x000000 }))
    //     scene.add(wireframe)
    // }

    /*
        For each central edge, you get the sphere
        For each point in the triangle, you get barycentric coords
    */
    let surfGeo = new THREE.WireframeGeometry(new THREE.PlaneGeometry(1., 1., 4, 4)) 
    surfGeo.translate(.5,.5,0.)
    let surfGeoInitial = surfGeo.clone()
    let vertsInitial = [
        new Fl().point(0.,0.,0.), 
        new Fl().point(1.,0.,0.), 
        new Fl().point(1.,1.,0.)]
    let edgesInitial = [new Dq(), new Dq(), new Dq()]
    for(let i = 0; i < 3; ++i)
        vertsInitial[i].joinPt(vertsInitial[(i+1)%3], edgesInitial[i])
    let totalTriInitial = vertsInitial[0].joinPt(vertsInitial[1], dq0).joinPt(vertsInitial[2], new Fl())
    let totalTriMagnitude = Math.sqrt(totalTriInitial.eNormSq())
    let numVerts = surfGeo.attributes.position.array.length / 3
    // for(let i = 0; i < numVerts; ++i) {
    //     v1.fromArray(surfGeo.attributes.position.array, i*3)
    //     if(v1.y > v1.x)
    //         v1.set(0.,0.,0.)
    //     v1.toArray(surfGeo.attributes.position.array, i*3)
    // }
    let surf = new THREE.LineSegments(surfGeo)
    scene.add(surf)

    // let edgeLines = [new Dq(), new Dq(), new Dq()] //normalize?
    // let totalTri = new Fl()
    // let verts = [new Fl(), new Fl(), new Fl()]
    let final = new Fl()
    let initial = new Fl()
    updateSurface = () => {

        // for (let i = 0; i < 3; ++i)
        //     verts[i].pointFromVec3(vertMeshes[i].position)
        // for(let i = 0; i < 3; ++i)
        //     verts[i].joinPt(verts[(i+1)%3], edgeLines[i])

        // edgeLines[0].joinPt(fl0, totalTri)
        
        for (let i = 0; i < numVerts; ++i) {
            v1.fromArray(surfGeoInitial.attributes.position.array, i * 3)
            initial.pointFromVec3(v1)
            final.zero()
            
            if (v1.y > v1.x) {
                v1.set(0., 0., 0.)
                v1.toArray(surfGeo.attributes.position.array, i * 3)
                continue
            }

            for(let j = 0; j < 3; ++j) {
                let tri = edgesInitial[j].joinPt(initial, fl1)
                let baryCoord = tri.inner(totalTriInitial) / totalTriMagnitude
                final.addScaled(vertsInitial[j], baryCoord, final)
            }
            if (frameCount % 120 < 60)
                final.pointToVec3(v1)
            else
                initial.pointToVec3(v1)

            v1.toArray(surfGeo.attributes.position.array, i * 3)
        }
        surfGeo.attributes.position.needsUpdate = true
    }
}