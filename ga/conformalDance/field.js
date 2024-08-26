updateField = ()=> {}
function initField() {

    let loaded = false
    let modelCoords = null
    new THREE.OBJLoader().load(`data/glove.obj`, (file) => {

        let geo = file.children[1].geometry
        geo.translate( 240.73354181009755,  167.64152499336552,  202.51852688860572)
        geo.rotateX(-TAU / 4)
        geo.rotateZ(TAU / 4)
        geo.rotateX(.5)
        geo.translate(105., 0., 0.)

        v2.set(0.,0.,0.)
        for(let i = 0; i < geo.attributes.position.count; ++i){
            v1.set(geo.attributes.position.array[i * 3 + 0], geo.attributes.position.array[i * 3 + 1],geo.attributes.position.array[i*3+2])
            v1.multiplyScalar(1. / geo.attributes.position.count)
            v2.add(v1)
        }

        let scale = .013
        geo.scale(scale, scale, scale)

        // scene.add(file.children[1])
        loaded = true
        modelCoords = geo.attributes.position.array
    })

    function randomizeInSphere(v,radius) {
        v.set(999., 999., 999.)
        while (v.lengthSq() > 1.)
            v.random().subScalar(.5).multiplyScalar(2.)
        v.multiplyScalar(v.lengthSq()) //push towards center

        v.multiplyScalar(radius)
    }
    
    let numPoints = 3216
    let randomCoords = new Float32Array(3 * numPoints)
    // for(let i = 0.; i < 10.; ++i)
    // for(let j = 0.; j < 10.; ++j)
    // for(let k = 0.; k < 10.; ++k) {
    //     v1.set(i / 10., j / 10., k / 10.).subScalar(.5).multiplyScalar(6.)
    //     let index = i*100+j*10+k
    //     v1.toArray(randomCoords, index*3)
    // }
    for(let i = 0; i < numPoints * 3; ++i) {

        randomizeInSphere(v1, 10.)
        v1.toArray(randomCoords,i*3)

        // randomCoords[i] = 2.*(Math.random() * 2. - 1.)
    }
    // for(let i = 0; i < numPoints; ++i) {
    //     let a = Math.random() * TAU
    //     v1.set(Math.cos(a), Math.sin(a),0.)
    //     v1.toArray(randomCoords, i*3)
    // }

    let geo = new THREE.SphereGeometry(.05)
    let instanceMesh = new THREE.InstancedMesh(
        geo,
        new THREE.MeshPhongMaterial({ color: 0xBD8ED2 }), numPoints);
    instanceMesh.instanceMatrix.setUsage(THREE.DynamicDrawUsage); // will be updated every frame
    instanceMesh.castShadow = true
    scene.add(instanceMesh);

    let instanceMeshInitial = new THREE.InstancedMesh(
        geo,
        new THREE.MeshPhongMaterial({ color: 0xEAB63C }), numPoints);
    instanceMeshInitial.instanceMatrix.setUsage(THREE.DynamicDrawUsage);
    instanceMeshInitial.castShadow = true
    scene.add(instanceMeshInitial)

    let fullTransform = null
    let fullTransformEven = new Even()
    let fullTransformOdd = new Odd()

    updateField = (transform) => {

        let isOdd = transform.constructor === Odd
        fullTransform = isOdd ? fullTransformOdd : fullTransformEven
        instanceMeshInitial.visible = isOdd

        let startCoords = isOdd && loaded ? modelCoords : randomCoords
        for(let i = 0; i < numPoints; ++i) {

            // debugger

            v1.fromArray(startCoords, 3 * i)
            if(isOdd) {

                m1.identity().setPosition(v1)
                instanceMeshInitial.setMatrixAt(i, m1);
            }
            even0.translationFromVec3(v1)
            transform.mul(even0, fullTransform)
            
            let zrs = fullTransform.sandwich(_eo, odd0)
            zrs.zrsToVec3(v2)

            // v2.toArray(coords, 3 * i)
            // m1.makeScale(sphereScale, sphereScale, sphereScale)
            m1.identity().setPosition(v2)
            instanceMesh.setMatrixAt(i, m1);
        }

        instanceMesh.instanceMatrix.needsUpdate = true;
        instanceMeshInitial.instanceMatrix.needsUpdate = true;
        // geo.attributes.position.needsUpdate = true
    }
}