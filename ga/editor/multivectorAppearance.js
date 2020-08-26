/*
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
    let vecMaterial = new THREE.MeshStandardMaterial({ vertexColors: THREE.FaceColors })
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
        
        //thickness might be good, tell you where it is
        // let a = new THREE.LineSegments(new THREE.BufferGeometry(), lineMaterial )
        // let coords = [0.,0.,0.,1./3.,0.,0.,1./3.,0.,0.,2./3.,0.,0.,2./3.,0.,0.,1.,0.,0.]
        // a.geometry.setAttribute('position', new THREE.Float32BufferAttribute(coords, 3));
        // let lineColors = []
        // for (let i = 0; i < 3; ++i) {
        //     let c = colors[name[i]]
        //     lineColors.push(c.r, c.g, c.b, c.r, c.g, c.b)
        // }
        // a.geometry.setAttribute('color', new THREE.Float32BufferAttribute(lineColors, 3));
        // scene.add(a)

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

    let maxInstances = 256
    MultivectorAppearance = () =>
    {
        let components = [false, false, false, false]
        let mv = new THREE.Group()
        mv.name = generateName()
        mv.elements = MathematicalMultivector()

        let zero = new THREE.InstancedMesh(zeroGeometry, zeroMaterial, maxInstances)
        mv.add(zero)

        //TODO should be in material. Can have one geometry for all when you've sorted a shader
        let vec = new THREE.InstancedMesh(VecGeometry(mv.name), vecMaterial, maxInstances)
        vec.name = mv.name
        vec.elements = mv.elements
        copyMultivector(zeroMultivector, vec.elements)
        mv.add(vec)

        mv.resetCount = () => {
            mv.children.forEach((child)=>{child.count = 0})
            
            getVector(vec.elements, v1)
            if(v1.equals(zeroVector))
                components[1] = false
            else {
                components[1] = true
                randomPerpVector(v1, v2)
                v2.setLength(v1.length())
                v3.crossVectors(v1, v2).normalize().negate().setLength(v1.length())
                uniformMatrixWithYOnVector.makeBasis(v2, v1, v3);
                vec.instanceMatrix.needsUpdate = true
                //properly scaling the things will have to wait until you have proper colors
            }
        }

        let uniformMatrixWithYOnVector = new THREE.Matrix4()
        mv.drawInPlace = function(x,y)
        {
            mv.children.forEach((child) => { if (child.count >= maxInstances) console.error("too many") })

            if (!components[0] && !components[1] && !components[2] && !components[3])
            {
                m1.identity()
                m1.scale(v1.setScalar(characterMeshHeight))
                m1.setPosition(x,y,0.)
                zero.setMatrixAt(zero.count, m1)
                ++zero.count
                zero.instanceMatrix.needsUpdate = true
            }

            if (components[1])
            {
                let uniformScale = .5 / getVector(vec.elements, v1).length()
                v1.setScalar(uniformScale)
                q1.copy(displayCamera.quaternion)
                q1.inverse()
                m1.compose(zeroVector, q1, v1)

                m2.multiplyMatrices(m1, uniformMatrixWithYOnVector)
                m2.setPosition(x, y, 0.)
                vec.setMatrixAt(vec.count, m2)
                ++vec.count
            }
        }
     
        return mv
    }

    function BivectorGroup(name)
    {
        let bivGeometry = new THREE.PlaneGeometry(1., 1., 1, 2)
        bivGeometry.vertices.forEach((v) =>
        {
            v.x += .5
            v.y += .5

            v.x -= v.y
        })
        bivGeometry.faces.forEach((f, i) =>
        {
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

        let bivMaterialClockwise = new THREE.MeshBasicMaterial({ vertexColors: THREE.FaceColors, transparent: true, opacity: 1., side: THREE.FrontSide })
        let bivMaterialCounter = new THREE.MeshBasicMaterial({ vertexColors: THREE.FaceColors, transparent: true, opacity: 1., side: THREE.BackSide })
        let bivAppearance = new THREE.Group()
        scene.add(bivAppearance)
        bivAppearance.add(
            new THREE.Mesh(bivGeometry, bivMaterialClockwise),
            new THREE.Mesh(bivGeometry, bivMaterialCounter),
        )

        return bivAppearance
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
    if (name === "bgo") logged = 1
    vecGeometry.computeFaceNormals()
    vecGeometry.computeVertexNormals()

    return vecGeometry
}