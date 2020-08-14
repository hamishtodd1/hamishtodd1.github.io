/*
    To make them more different from one another for the colorblind, maybe vary order more? Not always black first?
*/

//better would be generating the vertices first then using them
//but this is barely any better. Really you want a different way of re-using the different arrays in drawing
//separate function anyway because you probably want to change it
function VectorGeometry(name)
{
    //ah no no, you want the end to always be the same size
    let shaftRadius = .04
    let headRadius = shaftRadius*3.
    let shaftLength = .67
    
    let vectorGeometry = new THREE.Geometry()
    
    let radialSegments = 15
    let heightSegments = 20
    vectorGeometry.vertices = Array((radialSegments + 1) * (heightSegments + 1))
    vectorGeometry.faces = Array(radialSegments * heightSegments)
    for (let j = 0; j <= heightSegments; j++)
    {
        for (let i = 0; i <= radialSegments; i++)
        {
            v1.y = j / heightSegments
            v1.z = 0.

            v1.x = shaftRadius
            if (v1.y >= shaftLength )
            {
                let proportionAlongHead = 1. - (v1.y - shaftLength) / (1. - shaftLength)
                v1.x = headRadius * proportionAlongHead
            }

            v1.applyAxisAngle(yUnit, i / radialSegments * TAU)
            vectorGeometry.vertices[j * (radialSegments + 1) + i] = v1.clone()

            if (i < radialSegments && j < heightSegments) // there are one fewer triangles along both axes
            {
                let color = colors[name[Math.floor(v1.y * name.length) ]]
                vectorGeometry.faces[(j * radialSegments + i) * 2 + 0] = new THREE.Face3(
                    (j + 0) * (radialSegments + 1) + (i + 0),
                    (j + 0) * (radialSegments + 1) + (i + 1),
                    (j + 1) * (radialSegments + 1) + (i + 1),
                    new THREE.Vector3(),
                    color
                )
                vectorGeometry.faces[(j * radialSegments + i) * 2 + 1] = new THREE.Face3(
                    (j + 0) * (radialSegments + 1) + (i + 0),
                    (j + 1) * (radialSegments + 1) + (i + 1),
                    (j + 1) * (radialSegments + 1) + (i + 0),
                    new THREE.Vector3(),
                    color
                )
            }
        }
    }
    if (name === "bgo")logged = 1
    vectorGeometry.computeFaceNormals()
    vectorGeometry.computeVertexNormals()

    return vectorGeometry
}

function initMultivectorAppearances()
{
    let idNum = 0
    
    let vectorMaterial = new THREE.MeshStandardMaterial({ vertexColors: THREE.FaceColors })
    
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
        let name = generateName()
        let vectorGeometry = VectorGeometry(name) //TODO should be in material. Can have one geometry for all when you've sorted a shader

        let vectorValue = new THREE.Vector3(Math.random()-.5,Math.random()-.5,Math.random()-.5)
        randomPerpVector(vectorValue, v2)
        v2.setLength(vectorValue.length())
        v3.crossVectors(vectorValue, v2).normalize().negate().setLength(vectorValue.length())
        let uniformMatrixWithYOnVector = new THREE.Matrix4().makeBasis(v2, vectorValue, v3);
        //properly scaling the things will have to wait until you have proper colors

        let instancedMesh = new THREE.InstancedMesh(vectorGeometry, vectorMaterial, 256)
        // instancedMesh.count = 0
        instancedMesh.name = name

        instancedMesh.drawInPlace = function(position)
        {
            let uniformScale = .5 / vectorValue.length()
            v1.setScalar(uniformScale)
            
            q1.copy(displayCamera.quaternion)
            q1.inverse()
            m1.compose(position,q1,v1)
            m2.multiplyMatrices(m1, uniformMatrixWithYOnVector)
            instancedMesh.setMatrixAt(instancedMesh.count, m2)
            instancedMesh.instanceMatrix.needsUpdate = true

            ++instancedMesh.count
        }
     
        return instancedMesh
    }

    // let questionMarkMaterial = text("?",true) //can be colored with vertex attributes
}