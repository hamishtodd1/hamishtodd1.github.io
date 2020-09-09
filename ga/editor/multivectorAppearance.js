/*
    A vector that's not coming from the origin is: a vector field evaluated at a single point

    velocity/differential space is a reason to have auto zoom/scale

    Need to disentangle what's in the boxes

    Make the background close so you see the shadows

    To make them more different from one another for the colorblind, maybe vary order more? Not always black first?

    Scale them such that the biggest one on screen is a certain thickness and the smallest one on screen is a certain thickness

    Shader
        Checkerboard?
*/

function initMultivectorAppearances(characterMeshHeight)
{
    let maxInstances = 256
    
    let vecMaterial = new THREE.MeshPhongMaterial({ vertexColors: THREE.FaceColors })

    let bivMaterial = new THREE.MeshPhongMaterial({ vertexColors: THREE.FaceColors, side: THREE.DoubleSide })
    let negativeUnitPseudoScalar = MathematicalMultivector(0., 0., 0., 0., 0., 0., 0., -1.)

    let triMaterial = new THREE.MeshPhongMaterial({ vertexColors: THREE.FaceColors })

    let scaMaterial = new THREE.MeshBasicMaterial({ vertexColors: THREE.FaceColors })
    let pointMaterial = new THREE.MeshLambertMaterial({ vertexColors: THREE.FaceColors })
    let lineMaterial = new THREE.LineBasicMaterial({ vertexColors: true })
    let zeroMaterial = text("0", true) //something with a slashed 0 would be nice
    let zeroGeometry = new THREE.PlaneBufferGeometry(zeroMaterial.getAspect(), 1.)

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

        // let heightSegments = 32
        // let scalarGeometry = new THREE.CylinderGeometry(.5, .5, 1., 18, heightSegments)
        // scalarGeometry.vertices.forEach((v)=>{
        //     if(v.y > 0.)
        //     {
        //         let y = v.y
        //         v.y = 0.
        //         v.setLength(Math.sqrt(.25 - sq(y)))
        //         v.y = y
        //     }
        // })
        // log((scalarGeometry.faces.length-36)/32)
        // scalarGeometry.faces.forEach((f,i)=>{ //strips of 64
        //     let index = Math.floor(i / 128) % 3
        //     f.color.copy(colors[name[index]])
        // })
        // let m = new THREE.Mesh(scalarGeometry, scaMaterial)
        // scene.add(m)
    }

    let idNum = 0
    function generateName()
    {
        ++idNum

        let digitNum = 0
        let correctlyBasedNumberString = ""
        let digit = Infinity

        while (true)
        {
            ++digitNum
            let newDigit = digitGivenBase(idNum, colorCharacters.length + 1, digitNum)
            if (newDigit === 0 || newDigit >= digit)
            {
                return generateName()
                //you could figure out what to add to idNum such that you get a valid thing next
            }

            digit = newDigit
            correctlyBasedNumberString = digit + correctlyBasedNumberString

            if (Math.pow(colorCharacters.length + 1, digitNum) > idNum) //-1?
                break
        }
        let name = ""
        for (let i = 0; i < correctlyBasedNumberString.length; i++)
            name += correctlyBasedNumberString[i] === "0" ? "" : colorCharacters[correctlyBasedNumberString[i] - 1]
        // log("str: ", correctlyBasedNumberString, " name: ", name)

        return name
    }

    MultivectorAppearance = () =>
    {
        let mv = {}
        let name = generateName()
        mv.name = name
        mv.elements = MathematicalMultivector()
        copyMultivector(zeroMultivector, mv.elements)
        
        let vec = new THREE.InstancedMesh(VecGeometry(name), vecMaterial)
        let biv = new THREE.InstancedMesh(BivGeometry(name), bivMaterial)
        let tri = new THREE.InstancedMesh(TriGeometry(name), triMaterial)
        mv.dwGroup = new THREE.Group().add(vec, biv, tri)
        scene.add(mv.dwGroup)
        
        let vecPad = new THREE.InstancedMesh(vec.geometry, vecMaterial, maxInstances)
        let bivPad = new THREE.InstancedMesh(biv.geometry, bivMaterial, maxInstances)
        let triPad = new THREE.InstancedMesh(tri.geometry, triMaterial, maxInstances)
        let zeroPad = new THREE.InstancedMesh(zeroGeometry, zeroMaterial, maxInstances)
        mv.padGroup = new THREE.Group().add(vecPad, bivPad, triPad, zeroPad)

        let halfInverseBoundingSphereRadius = 1.

        function boxDraw(im,dwMatrix,x,y) {
            m1.copy(dwMatrix)
            m1.scale(v1.setScalar(halfInverseBoundingSphereRadius))
            m1.setPosition(x, y, 0.)

            im.setMatrixAt(im.count, m1)
            ++im.count
        }

        //but how to know which one you want to see? maybe you're always best off seeing the line!
        // let line = new THREE.InstancedMesh(LineGeometry(mv.name), lineMaterial, maxInstances)
        // mv.padGroup.add(line)
        // line.count = 1
        // m1.identity()
        // line.setMatrixAt(0, m1)

        //yeah too stateful, of coooooourse you are modifying the elements partway through the frame
        let sca = {visible: false}
        mv.resetCount = () => {
            mv.padGroup.children.forEach((child)=>{child.count = 0})
            
            sca.visible = mv.elements[0] ? true : false
            vec.visible = !getVector(mv.elements, v1).equals(zeroVector)
            biv.visible = !getBivec(mv.elements, v1).equals(zeroVector)
            tri.visible = mv.elements[7] ? true : false

            let boundingSphereRadius = .0000001
            if(vec.visible)
                boundingSphereRadius = Math.max(boundingSphereRadius, getVector(mv.elements, v1).length())
            if(tri.visible)
                boundingSphereRadius = Math.max(boundingSphereRadius, mv.elements[7])
            if(biv.visible) {
                let bivectorMagnitude = Math.sqrt(sq(mv.elements[4]) + sq(mv.elements[5]) + sq(mv.elements[6]))
                boundingSphereRadius = Math.max(boundingSphereRadius, bivectorMagnitude < 1. ? 1. : bivectorMagnitude)
            }

            halfInverseBoundingSphereRadius = .5 / boundingSphereRadius
        }

        mv.drawInPlace = function(x,y)
        {
            mv.padGroup.children.forEach((child) => { if (child.count >= maxInstances) console.error("too many") })

            if (!sca.visible && !vec.visible && !biv.visible && !tri.visible)
            {
                m1.identity()
                m1.scale(v1.setScalar(characterMeshHeight))
                m1.setPosition(x,y,0.)
                zeroPad.setMatrixAt(zeroPad.count, m1)
                ++zeroPad.count
                zeroPad.instanceMatrix.needsUpdate = true
            }
            
            if (vec.visible)
            {
                if(vecPad.count === 0)
                {
                    vecPad.instanceMatrix.needsUpdate = true

                    getVector(mv.elements, v1)
                    v1.applyQuaternion(displayRotation.q)
                    randomPerpVector(v1, v2)
                    v3.crossVectors(v1, v2).negate()
                    v2.setLength(v1.length())
                    v3.setLength(v1.length())
                    vec.matrix.makeBasis(v2, v1, v3)
                    //scaling the arrows so the heads are right should wait until you have proper colors
                }

                boxDraw(vecPad, vec.matrix, x, y)
            }

            if(biv.visible)
            {
                if(bivPad.count === 0)
                {
                    bivPad.instanceMatrix.needsUpdate = true

                    let bivectorMagnitude = Math.sqrt(sq(mv.elements[4]) + sq(mv.elements[5]) + sq(mv.elements[6]))
                    biv.matrix.identity()
                    biv.matrix.elements[0] = 1.
                    biv.matrix.elements[5] = bivectorMagnitude
                    biv.matrix.elements[10] = 1.

                    // geometricProduct(negativeUnitPseudoScalar, mv.elements, mm)
                    // getVector(mm, v1)

                    // randomPerpVector(v1,v2)
                    // v3.crossVectors(v1,v2) //possibly this is inconsistent wrt chirality
                    // v2.setLength(.5)
                    // v3.setLength(.5/v1.length())

                    // v1.applyQuaternion(displayRotation.q)
                    // v2.applyQuaternion(displayRotation.q)
                    // v3.applyQuaternion(displayRotation.q)


                    //don't scale it by the length of the thing, scale it uniformly using either the side or the length such that it stays in unit sphere

                    
                }

                boxDraw(bivPad, biv.matrix, x, y)
            }

            if(tri.visible)
            {
                if(triPad.count === 0)
                {
                    triPad.instanceMatrix.needsUpdate = true

                    //corner on
                    // q1.setFromAxisAngle(xUnit, TAU / 8.)
                    // q2.setFromAxisAngle(yUnit, TAU / 8.)
                    // q1.multiply(q2)

                    tri.matrix.makeRotationFromQuaternion(displayRotation.q)
                    tri.matrix.elements[4] *= mv.elements[7]
                    tri.matrix.elements[5] *= mv.elements[7]
                    tri.matrix.elements[6] *= mv.elements[7]
                }

                boxDraw(triPad,tri.matrix,x,y)
            }
        }
     
        return mv
    }

    function BivGeometry(name)
    {
        let bivGeometry = new THREE.PlaneGeometry(1., 1., 1, 2)
        bivGeometry.vertices.forEach((v) =>
        {
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
    let shaftRadius = .04
    let headRadius = shaftRadius * 3.
    let shaftLength = .67

    let vecGeometry = new THREE.Geometry()

    let radialSegments = 15
    let heightSegments = 20
    vecGeometry.vertices = Array((radialSegments + 1) * (heightSegments + 1))
    vecGeometry.faces = Array(radialSegments * heightSegments)
    for (let j = 0; j <= heightSegments; j++)
    {
        for (let i = 0; i <= radialSegments; i++)
        {
            v1.y = j / heightSegments
            v1.z = 0.

            v1.x = shaftRadius
            if (v1.y >= shaftLength)
            {
                let proportionAlongHead = 1. - (v1.y - shaftLength) / (1. - shaftLength)
                v1.x = headRadius * proportionAlongHead
            }

            v1.applyAxisAngle(yUnit, i / radialSegments * TAU)
            vecGeometry.vertices[j * (radialSegments + 1) + i] = v1.clone()

            if (i < radialSegments && j < heightSegments) // there are one fewer triangles along both axes
            {
                let color = colors[name[Math.floor(v1.y * name.length)]]
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
        false)

    let il = triGeometry.vertices.length
    let nonCornerLength = Math.sin(TAU / 8) * radius / Math.sin(Math.PI - TAU / 8. - TAU / 12.)
    let ratio = nonCornerLength / radius
    triGeometry.vertices.forEach((v, i) =>
    {
        let rotationAngle = v.y * TAU / 4.
        v.applyAxisAngle(yUnit, rotationAngle)

        if (i < il - 2 && i % 3 !== 0)
        {
            let y = v.y
            v.y = 0.
            v.multiplyScalar(ratio)
            v.y = y
        }
        // v.y += .5
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