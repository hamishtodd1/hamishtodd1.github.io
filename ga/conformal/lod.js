function initLod() {
    new THREE.OBJLoader().load(`data/spot.obj`,(obj)=>{
        let geo = obj.children[0].geometry
        geo.scale(1.5, 1.5, 1.5)
        new THREE.TextureLoader().load(`data/spot.png`,(texture)=>{
            
            /*
                a vertex and normal together are an OPoint

                The mesh is an exp function S: uv -> OPoint
                    For any point on the uv, you take the three nearest points on the uv
                    Take the log of 

                -On the texture, choose two uvPoints
                -Still on the texture, interpolate those to get the midpoint, which will be useful later
                -Your two uvPoints have associated OPoints, A and B
                -Take A/B, log, halve, exp, *B

                Should the edge be affected by the vertices to the left and right of it?
                    Imagine rotating around the line connecting the two OPoints
                    But, that would rotate the normal vectors as well

                Yes, this is different from linearly interpolating the vertex and normal,
                    Because that would be inattentive to the uv
             */
            
            // let planeEga = new Ega()
            // let vEga = new Ega()
            // function vnToOPoint() {
            //     //vertex -> zero radius sphere
            //     //
            //     planeEga.plane(0., v1.x, v1.y, v1.z)
            //     planeEga.projectOn()
            // }

            let att = geo.attributes
            log(geo.attributes)
            let nTris = geo.attributes.position.count / 3
            let uv1 = new THREE.Vector2()
            let n1 = new THREE.Vector3()
            let uv2 = new THREE.Vector2()
            let n2 = new THREE.Vector3()

            for(let i = 0; i < nTris; ++i) {
                //for each edge of the triangle
                for(let j = 0; j < 3; ++j) {
                    let index1 = i * 3 + j
                    let index2 = i * 3 + (j+1)%3
                    //three vertices per tri, 3 coords per vert
                    v1.fromArray(att.position.array,index1*3)
                    v1.fromArray(att.position.array,index2*3)
                    n1.fromArray(att.normal.array,index1*3)
                    n1.fromArray(att.normal.array,index2*3)
                    uv1.fromArray(att.uv.array,index1*3)
                    uv2.fromArray(att.uv.array,index2*3)

                    
                }
            }
            // log(geo)

            let spotMat = new THREE.MeshPhongMaterial({ map: texture })
            let spot = new THREE.Mesh(geo, spotMat)
            scene.add(spot)
            spot.position.y += 1.6
        })
    })
}