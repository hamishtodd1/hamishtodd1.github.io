/*
    Scalar could be half circle

    TODO
        colors for 0
*/

function initMultivectorAppearances(characterMeshHeight)
{
    let maxInstances = 256
    
    let vecMaterial = new THREE.MeshPhongMaterial({ vertexColors: THREE.FaceColors })

    let bivMaterial = new THREE.MeshPhongMaterial({ vertexColors: THREE.FaceColors, side: THREE.DoubleSide })
    let negativeUnitPseudoScalar = MathematicalMultivector(0., 0., 0., 0., 0., 0., 0., -1.)

    let triMaterial = new THREE.MeshPhongMaterial({ vertexColors: THREE.FaceColors, side:THREE.DoubleSide})

    let scaMaterial = new THREE.MeshBasicMaterial({ vertexColors: THREE.FaceColors, side:THREE.DoubleSide })
    let pointMaterial = new THREE.MeshLambertMaterial({ vertexColors: THREE.FaceColors })
    let lineMaterial = new THREE.LineBasicMaterial({ vertexColors: true })
    let zeroMaterial = text("0", true) //something with a slashed 0 would be nice
    let zeroGeometry = new THREE.PlaneBufferGeometry(zeroMaterial.getAspect(), 1.)

    //bug in threejs seems to stick together the matrices of instanced meshes and non instanced
    scaMaterial.im = scaMaterial.clone(); scaMaterial.transparent = true; scaMaterial.opacity = .6
    vecMaterial.im = vecMaterial.clone(); vecMaterial.transparent = true; vecMaterial.opacity = .6
    bivMaterial.im = bivMaterial.clone(); bivMaterial.transparent = true; bivMaterial.opacity = .6
    triMaterial.im = triMaterial.clone(); triMaterial.transparent = true; triMaterial.opacity = .6
    zeroMaterial.im = zeroMaterial.clone();

    //not yet integrated
    {
        let name = "wbo"

        // let p = new THREE.Mesh(new THREE.SphereGeometry(1., 18), pointMaterial)
        // p.geometry.rotateX(TAU/4.)
        // let il = p.geometry.faces.length
        // p.geometry.faces.forEach((f, i) =>
        // {
        //     if (name.length === 1)
        //         f.color.copy(colors[name[0]])
        //     else if (name.length === 2)
        //         f.color.copy(colors[name[Math.floor(i / 2)]])
        //     else if (name.length === 3)
        //     {
        //         if(i<18)
        //             f.color.copy(colors[name[(Math.floor(i / 6)) % 3]])
        //         else if(i >= il - 18)
        //             f.color.copy(colors[name[(Math.floor(i / 6)) % 3]])
        //         else
        //             f.color.copy(colors[name[(Math.floor((i+18) / 12)) % 3]])
        //     }
        //     else
        //         console.error("too many letters for a point")
        // })
        // let outline = new THREE.Mesh(p.geometry, new THREE.MeshBasicMaterial({ color: 0x000000,side:THREE.BackSide }))
        // outline.scale.setScalar(1.45)
        // p.add(outline)
        // scene.add(p)
        // p.scale.setScalar(.16)
    }

    MultivectorAppearance = (name) =>
    {
        let mv = {}
        mv.name = name
        mv.elements = MathematicalMultivector()
        copyMultivector(zeroMultivector, mv.elements)

        let scalarDirection = new THREE.Vector3(1.,0.,0.)
        let contextMatrix = new THREE.Matrix4().identity()

        function applyContext(mesh,columnAffectedByMagnitude,magnitude) {
            mesh.matrix.copy(contextMatrix)
            mesh.matrix.premultiply(m1.makeRotationFromQuaternion(displayRotation.q))
            mesh.matrix.elements[columnAffectedByMagnitude*4 + 0] *= magnitude
            mesh.matrix.elements[columnAffectedByMagnitude*4 + 1] *= magnitude
            mesh.matrix.elements[columnAffectedByMagnitude*4 + 2] *= magnitude
        }

        mv.getScalarDirection = (target) =>{return target.copy(scalarDirection).normalize()} //fuck you, don't touch it
        mv.getImaginaryDirection = (target) => {
            if (biv.visible) {
                //we assume scalarDirection is in bivector plane. We could project it onto that
                setVector(scalarDirection, mm1)

                copyMultivector(mv.elements, mm2)
                mm2[0] = 0.; mm2[1] = 0.; mm2[2] = 0.; mm2[3] = 0.; mm2[7] = 0.; //"select grade"
                getVector(gProduct(mm1, mm2, mm), target).normalize()
            }
            else {
                if (scalarDirection.x !== 0. || scalarDirection.y !== 0.)
                    target.crossVectors(zUnit, scalarDirection).normalize() //because camera
                else
                    target.crossVectors(scalarDirection, yUnit).normalize()
            }

            return target
        }
        mv.setScalarDirection = (newSd) => {
            scalarDirection.copy(newSd)

            //you probably shouldn't kid yourself that this communicates no information
            scalarDirection.normalize()
            mv.getImaginaryDirection(v2)
            v3.crossVectors(scalarDirection, v2).normalize()
            //I dunno, you might want setTrivectorDirection. Surely you only want that if you have scalar and bivector
            contextMatrix.makeBasis(scalarDirection, v2, v3)
        }
        
        let sca = new THREE.Mesh(ScaGeometry(name), scaMaterial)
        sca.matrixAutoUpdate = false
        let vec = new THREE.Mesh(VecGeometry(name), vecMaterial)
        vec.matrixAutoUpdate = false
        let biv = new THREE.Mesh(BivGeometry(name), bivMaterial)
        biv.matrixAutoUpdate = false
        let tri = new THREE.Mesh(TriGeometry(name), triMaterial)
        tri.matrixAutoUpdate = false
        let zero = new THREE.Mesh(zeroGeometry, zeroMaterial)
        
        mv.dw = new THREE.Group().add(sca, vec, biv, tri)

        //bivectors need to move to aligning with vectors
        //hmm, maybe a positioned bivector is a bivector curried with something?
        
        let scaPad = new THREE.InstancedMesh(sca.geometry, scaMaterial.im, maxInstances)
        let vecPad = new THREE.InstancedMesh(vec.geometry, vecMaterial.im, maxInstances)
        let bivPad = new THREE.InstancedMesh(biv.geometry, bivMaterial.im, maxInstances)
        let triPad = new THREE.InstancedMesh(tri.geometry, triMaterial.im, maxInstances)
        let zeroPad = new THREE.InstancedMesh(zeroGeometry, zeroMaterial.im, maxInstances)
        mv.padGroup = new THREE.Group().add(scaPad, vecPad, bivPad, triPad, zeroPad)
        pad.add(mv.padGroup)

        mv.boundingSphereRadius = .0000001
        //you are probably modifying the elements partway through the frame so this is too stateful
        mv.beginFrame = () => {
            mv.padGroup.children.forEach((child) => { child.count = 0 })

            let eps = .00001
            sca.visible = Math.abs( mv.elements[0] ) > eps
            vec.visible = !getVector(mv.elements, v1).equals(zeroVector)
            biv.visible = !getBivec(mv.elements, v1).equals(zeroVector)
            tri.visible = Math.abs( mv.elements[7] ) > eps
            zero.visible = !(sca.visible || vec.visible || biv.visible || tri.visible)

            mv.boundingSphereRadius = .0000001
            if (sca.visible)
                mv.boundingSphereRadius = Math.max(mv.boundingSphereRadius, Math.abs(mv.elements[0]), 1.)
            if (vec.visible)
                mv.boundingSphereRadius = Math.max(mv.boundingSphereRadius, getVector(mv.elements, v1).length())
            if (tri.visible) {
                let originToCorner = Math.sqrt(sq(mv.elements[7]) + 2.)
                mv.boundingSphereRadius = Math.max(mv.boundingSphereRadius, originToCorner)
            }
            if (biv.visible) {
                let bivMagnitude = bivectorMagnitude(mv.elements)
                let originToCorner = Math.sqrt(sq(bivMagnitude) + 1.)
                mv.boundingSphereRadius = Math.max(mv.boundingSphereRadius, originToCorner < 1. ? 1. : originToCorner)
            }

            mv.setScalarDirection(scalarDirection)

            halfInverseBoundingSphereRadius = .5 / mv.boundingSphereRadius
        }

        //but how to know which one you want to see? maybe you're always best off seeing the line!
        // let line = new THREE.InstancedMesh(LineGeometry(name), lineMaterial, maxInstances)
        // mv.padGroup.add(line)
        // line.count = 1
        // m1.identity()
        // line.setMatrixAt(0, m1)

        mv.drawInPlace = function(x,y)
        {
            mv.padGroup.children.forEach((child) => { if (child.count >= maxInstances) console.error("too many") })

            if ( zero.visible ) {
                zeroPad.instanceMatrix.needsUpdate = true

                m1.identity()
                m1.scale(v1.setScalar(characterMeshHeight))
                m1.setPosition(x,y,0.)
                zeroPad.setMatrixAt(zeroPad.count, m1)
                ++zeroPad.count
            }

            if( sca.visible ) {
                if (scaPad.count === 0) {
                    // m1.identity()
                    // sca.matrix.identity()
                    applyContext(sca, 0, mv.elements[0])

                    // if (biv.visible) {
                    //     v1.set(0., 1., 0.)
                    //     v1.applyMatrix4(biv.matrix)
                    //     sca.matrix.setPosition(v1)
                    // }
                }

                boxDraw(scaPad, x, y, sca.matrix, mv.boundingSphereRadius)
            }

            if (vec.visible) {
                if(vecPad.count === 0) {
                    vec.matrix.identity()
                    getVector(mv.elements, v1)
                    v1.applyQuaternion(displayRotation.q)
                    randomPerpVector(v1, v2)
                    v3.crossVectors(v1, v2).negate()
                    v2.setLength(v1.length())
                    v3.setLength(v1.length())
                    vec.matrix.makeBasis(v2, v1, v3)
                    //scaling the arrows so the heads are right should wait until you have proper colors
                }

                boxDraw(vecPad, x, y, vec.matrix, mv.boundingSphereRadius)
            }

            if(biv.visible) {
                if(bivPad.count === 0)
                    applyContext(biv, 1, bivectorMagnitude(mv.elements) )

                boxDraw(bivPad, x, y, biv.matrix, mv.boundingSphereRadius)
            }

            if(tri.visible) {
                if(triPad.count === 0)
                    applyContext(tri, 2, mv.elements[7])

                boxDraw(triPad, x, y, tri.matrix, mv.boundingSphereRadius)
            }
        }
     
        return mv
    }

    function BivGeometry(name)
    {
        //perhaps it should be a right angled triangle with twice the height. There's a factor of two in there...

        let bivGeometry = new THREE.PlaneGeometry(1., 1., 1, 2)
        bivGeometry.vertices.forEach((v) => {
            v.x += .5
            v.y += .5

            v.x -= v.y
        })
        bivGeometry.faces.forEach((f, i) => {
            if (name.length === 1)
                f.color.copy(colors[name[0]])
            else if (name.length === 2)
                f.color.copy(colors[name[Math.floor(i / 2)]])
            else if (name.length === 3)
            {
                if (i === 0)
                    f.color.copy(colors[name[0]])
                else if (i === bivGeometry.faces.length - 1)
                    f.color.copy(colors[name[2]])
                else
                    f.color.copy(colors[name[1]])
            }
            else
                console.error("too many letters for a bivector")
        })

        return bivGeometry
    }
}

//better would be generating the vertices first then using them
//but that is barely any better. Really you want a different way of re-using the different arrays in drawing
function VecGeometry(name)
{
    //ah no no, you want the end to always be the same size
    let headRadius = SHAFT_RADIUS * 2.5
    let shaftLength = .75
    let wholeLength = 1. + SHAFT_RADIUS //bobble at end

    let vecGeometry = new THREE.Geometry()

    let radialSegments = 15
    let heightSegments = 30 //we want two between y = 0 and y = -SHAFT_RADIUS
    vecGeometry.vertices = Array((radialSegments + 1) * (heightSegments + 1))
    vecGeometry.faces = Array(radialSegments * heightSegments)

    for (let j = 0; j <= heightSegments; j++) {
        for (let i = 0; i <= radialSegments; i++) {
            v1.y = j <= 8 ?
                SHAFT_RADIUS * (-1.+j/8.) :
                j / heightSegments

            v1.x = SHAFT_RADIUS
            if (v1.y >= shaftLength) {
                let proportionAlongHead = 1. - (v1.y - shaftLength) / (1. - shaftLength)
                v1.x = headRadius * proportionAlongHead
            }
            else if (v1.y <= 0.)
                v1.x = Math.sqrt(sq(SHAFT_RADIUS) - sq(v1.y))

            v1.z = 0.
            v1.applyAxisAngle(yUnit, i / radialSegments * TAU)
            vecGeometry.vertices[j * (radialSegments + 1) + i] = v1.clone()

            if (i < radialSegments && j < heightSegments) // there are one fewer triangles along both axes
            {
                let letterIndex = Math.floor((v1.y + SHAFT_RADIUS) / wholeLength * name.length)
                let color = colors[name[letterIndex]]

                vecGeometry.faces[(j * radialSegments + i) * 2 + 0] = new THREE.Face3(
                    (j + 0) * (radialSegments + 1) + (i + 0),
                    (j + 0) * (radialSegments + 1) + (i + 1),
                    (j + 1) * (radialSegments + 1) + (i + 1),
                    new THREE.Vector3(),
                    color
                )
                vecGeometry.faces[(j * radialSegments + i) * 2 + 1] = new THREE.Face3(
                    (j + 0) * (radialSegments + 1) + (i + 0),
                    (j + 1) * (radialSegments + 1) + (i + 1),
                    (j + 1) * (radialSegments + 1) + (i + 0),
                    new THREE.Vector3(),
                    color
                )
            }
        }
    }

    vecGeometry.computeFaceNormals()
    vecGeometry.computeVertexNormals()

    return vecGeometry
}

//better would be generating the vertices first then using them
//but that is barely any better. Really you want a different way of re-using the different arrays in drawing
function LineGeometry(name)
{
    let radius = .04

    let lineGeometry = new THREE.Geometry()

    let radialSegments = 15
    let heightSegments = 20
    lineGeometry.vertices = Array((radialSegments + 1) * (heightSegments + 1))
    lineGeometry.faces = Array(radialSegments * heightSegments)
    for (let j = 0; j <= heightSegments; j++)
    {
        for (let i = 0; i <= radialSegments; i++)
        {
            v1.y = j / heightSegments
            v1.z = 0.
            v1.x = radius

            v1.applyAxisAngle(yUnit, i / radialSegments * TAU)
            lineGeometry.vertices[j * (radialSegments + 1) + i] = v1.clone()

            if (i < radialSegments && j < heightSegments) // there are one fewer squares than vertices along both axes
            {
                let color = colors[name[Math.floor(v1.y * name.length)]]
                lineGeometry.faces[(j * radialSegments + i) * 2 + 0] = new THREE.Face3(
                    (j + 0) * (radialSegments + 1) + (i + 0),
                    (j + 0) * (radialSegments + 1) + (i + 1),
                    (j + 1) * (radialSegments + 1) + (i + 1),
                    new THREE.Vector3().set(v1.x,v1.z,0.).normalize(),
                    color
                )
                lineGeometry.faces[(j * radialSegments + i) * 2 + 1] = new THREE.Face3(
                    (j + 0) * (radialSegments + 1) + (i + 0),
                    (j + 1) * (radialSegments + 1) + (i + 1),
                    (j + 1) * (radialSegments + 1) + (i + 0),
                    new THREE.Vector3().set(v1.x,v1.z,0.).normalize(),
                    color
                )
            }
        }
    }

    return lineGeometry
}

function TriGeometry(name)
{
    let heightSegments = 15
    let radius = .5 * Math.sqrt(2.)
    let radialSegments = 12
    let triGeometry = new THREE.CylinderGeometry(
        radius, radius,
        1.,
        radialSegments,
        heightSegments,
        false,TAU/8.)
    triGeometry.rotateX(TAU / 4.)

    let il = triGeometry.vertices.length
    let nonCornerLength = Math.sin(TAU / 8) * radius / Math.sin(Math.PI - TAU / 8. - TAU / 12.)
    let ratio = nonCornerLength / radius
    triGeometry.vertices.forEach((v, i) =>
    {
        if (i < il - 2 && i % 3 !== 0) //making it a square
        {
            let z = v.z
            v.z = 0.
            v.multiplyScalar(ratio)
            v.z = z
        }
        v.z += .5 //grow out of z plane
        let rotationAngle = v.z * TAU / 4.
        v.applyAxisAngle(zUnit, rotationAngle)
        v.x -= v.y //parallelogram
        v.y += .5 //sit on x axis
    })

    il = triGeometry.faces.length
    let nameLength = name.length
    if(nameLength <= 3) triGeometry.faces.forEach((f, i) =>{
        if (i >= il - 2 * radialSegments)
            f.color.copy(colors[name[i % nameLength]])
        else
            f.color.copy(colors[name[(Math.floor(i / heightSegments / 2)) % nameLength]])
    })
    else
        console.error("too many letters for a triPad")
    triGeometry.computeFaceNormals()
    triGeometry.computeVertexNormals()

    return triGeometry
}

function ScaGeometry(name) {
    let heightSegments = 15
    let radius = SHAFT_RADIUS
    let radialSegments = 6
    let scaGeometry = new THREE.CylinderGeometry(
        radius, radius,
        1.,
        radialSegments,
        heightSegments,
        false)

    let il = scaGeometry.vertices.length
    scaGeometry.vertices.forEach((v, i) => {
        let rotationAngle = v.y * TAU / 2.
        v.applyAxisAngle(yUnit, rotationAngle)
        //might be nice to know orientation when looking from top, need triskelion thing
    })
    scaGeometry.translate(0., .5, 0.)
    scaGeometry.rotateZ(-TAU/4.)

    il = scaGeometry.faces.length
    let nameLength = name.length
    if (nameLength <= 3) scaGeometry.faces.forEach((f, i) => {
        if (i >= il - 2 * radialSegments)
            f.color.copy(colors[name[i % nameLength]])
        else
            f.color.copy(colors[name[(Math.floor(i / heightSegments / 2)) % nameLength]])
    })
    else
        console.error("too many letters for a scaPad")
    scaGeometry.computeFaceNormals()
    scaGeometry.computeVertexNormals()

    return scaGeometry
}