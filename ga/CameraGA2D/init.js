async function init() {
    if(camera.isPerspectiveCamera)
        console.error("Meant to be an orthographic camera here")

    let motor = oneMv.clone()
    let zolly = oneMv.clone()

    {
        const verts = [];
        verts.push(new THREE.Vector3(0, 0, 0))
        verts.push(new THREE.Vector3(.3, .3, 0))
        verts.push(new THREE.Vector3(0, 0, 0))
        verts.push(new THREE.Vector3(.3,-.3, 0))

        const geo = new THREE.BufferGeometry().setFromPoints(verts);
        let cameraThing = new THREE.LineSegments(geo, new THREE.LineBasicMaterial({color:0xFF0000}))
        cameraThing.matrixAutoUpdate = false
        scene.add(cameraThing)

        cameraThingTransformLog = zeroMv.clone()

        function toMatrixColumn(xAndY, col) {
            cameraThing.matrix.elements[col * 4 + 0] = xAndY[0]
            cameraThing.matrix.elements[col * 4 + 1] = xAndY[1]
            cameraThing.matrix.elements[col * 4 + 2] = 0
        }
        updateFunctions.push(()=>{
            cameraThingTransformLog.exp(mv0)
            
            mv0.sandwich(e01, mv1)
            toMatrixColumn(mv1.bivAtInfinityToDir2D(), col)

            mv0.sandwich(e02, mv1)
            mv1.bivAtInfinityToDir2D()
            toMatrixColumn(mv1.bivAtInfinityToDir2D(), col)

            mv0.sandwich(e12, mv1)
            let [posX, posY] = mv1.bivToEuclideanPoint
            cameraThing.matrix.setPosition(posX,posY,0.)
        })

        bindButton("ArrowUp", () => { }, ``, () => {
            cameraThingTransformLog.exp(mv0)
            mv0.sandwich(e01, mv1)
            cameraThingTransformLog.addScaled(mv1, 0.01)
        })

        // bindButton("ArrowLeft", () => { }, ``, () => {
        //     cameraThingTransformLog.addScaled(e12, -0.01)
        // })
        // bindButton("ArrowRight", () => { }, ``, () => {
        //     cameraThingTransformLog.addScaled(e12, 0.01)
        // })
    }

    // debugger
    // xDir.exp()

    function composeWithScaledBivectorExp(toChange, bivector, t) {
        mv0.copy(zeroMv).addScaled(bivector, t)
        mv0.exp(mv1)
        mv1.normalize()
        
        mv2.copy(toChange)
        mv2.mul(mv1, toChange)
    }

    bindButton("a",()=>{},``,()=>{
        composeWithScaledBivectorExp(motor,  e12, 0.015)
    })
    bindButton("d", () => { }, ``, () => {
        composeWithScaledBivectorExp(motor, e12, -0.015)
    })
    bindButton("w", () => { }, ``, () => {
        composeWithScaledBivectorExp(motor, ePlusMinus, 0.015)
    })
    bindButton("s", () => { }, ``, () => {
        composeWithScaledBivectorExp(motor, ePlusMinus, -0.015)
    })

    //translation
    bindButton("j", () => { }, ``, () => {
        composeWithScaledBivectorExp(motor, xDir, 0.005)
    })
    bindButton("l", () => { }, ``, () => {
        composeWithScaledBivectorExp(motor, xDir, -0.005)
    }) 
    let zollyAxis = em.meet(e2)
    zollyAxis.log()
    bindButton("i", () => { }, ``, () => {
        composeWithScaledBivectorExp(zolly, zollyAxis, 0.015)
    })
    bindButton("k", () => { }, ``, () => {
        composeWithScaledBivectorExp(zolly, zollyAxis, -0.015)
    })

    let initialCoords = []
    for (let i = 0;     i < 29; ++i) {
        for (let j = 0; j < 29; ++j) {
            initialCoords.push(
                .05 * (i - 14), 
                .05 * (j - 14) )
        }
    }

    let spinor = new Mv()
    updateFunctions.push( () => {
        zolly.mul(motor, spinor)

        for (let i = 0, il = coords.length / 2; i < il; ++i) {
            mv0.fromPoint2D(
                initialCoords[i * 2 + 0],
                initialCoords[i * 2 + 1])

            // motor.sandwich(mv0,mv1)

            //cut with thingy THEN apply
            {
                em.meet(mv0,mv2)
                spinor.sandwich(mv2, mv3)
                e012.join(mv3, mv1)
            }

            let [x,y] = mv1.bivToEuclideanPoint()
            coords[i*3 + 0] = x
            coords[i*3 + 1] = y
            coords[i*3 + 2] = 0. //z
        }

        geo.attributes.position.needsUpdate = true
    })
    let geo = new THREE.BufferGeometry()
    geo.setAttribute('position', new THREE.Float32BufferAttribute(new Float32Array(Array(initialCoords.length / 2 * 3)), 3));
    let coords = geo.attributes.position.array
    let mesh = new THREE.Points(geo, new THREE.PointsMaterial({color:0xFF0000,size:3}))
    scene.add(mesh)
}