function initMultivectorAppearances()
{
    let idNum = 0
    
    let vectorMaterial = new THREE.MeshStandardMaterial({ vertexColors: THREE.FaceColors })
    let vectorRadius = .2
    let radialSegments = 15

    let colors = {
        "b": new THREE.Color(0., 0., 0.),
        "g": new THREE.Color(.5, .5, .5),
        "o": new THREE.Color(1., .5, 0.),
        "p": new THREE.Color(.5, 0., .5),
        "r": new THREE.Color(1., 0., 0.),
        "w": new THREE.Color(1., 1., 1.),
        "y": new THREE.Color(1., 1., 0.)
    }
    let colorCharacters = ""
    for (let color in colors) colorCharacters += color

    //better would be generating the vertices first then using them
    //but this is barely any better. Really you want a different way of re-using the different arrays in drawing
    function VectorGeometry(name)
    {
        let vectorGeometry = new THREE.Geometry()

        let heightSegments = name.length
        vectorGeometry.vertices = Array((radialSegments + 1) * (heightSegments + 1))
        vectorGeometry.faces = Array(radialSegments * heightSegments)
        for (let j = 0; j <= heightSegments; j++)
        {
            for (let i = 0; i <= radialSegments; i++)
            {
                vectorGeometry.vertices[j * (radialSegments + 1) + i] = new THREE.Vector3()
                vectorGeometry.vertices[j * (radialSegments + 1) + i].x = vectorRadius * (1. - (j / heightSegments))
                vectorGeometry.vertices[j * (radialSegments + 1) + i].applyAxisAngle(yUnit, i / radialSegments * TAU)

                vectorGeometry.vertices[j * (radialSegments + 1) + i].y = j / heightSegments

                if (i < radialSegments && j < heightSegments)
                {
                    vectorGeometry.faces[(j * radialSegments + i) * 2 + 0] = new THREE.Face3(
                        (j + 0) * (radialSegments + 1) + (i + 0),
                        (j + 0) * (radialSegments + 1) + (i + 1),
                        (j + 1) * (radialSegments + 1) + (i + 1),
                        new THREE.Vector3(),
                        colors[name[j]]
                    )
                    vectorGeometry.faces[(j * radialSegments + i) * 2 + 1] = new THREE.Face3(
                        (j + 0) * (radialSegments + 1) + (i + 0),
                        (j + 1) * (radialSegments + 1) + (i + 1),
                        (j + 1) * (radialSegments + 1) + (i + 0),
                        new THREE.Vector3(),
                        colors[name[j]]
                    )
                }
            }
        }
        vectorGeometry.computeFaceNormals()

        return vectorGeometry
    }
    
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

    generateNewVector = () =>
    {
        let name = generateName()
        let vectorGeometry = VectorGeometry(name)
        //need separate geometries

        let vectorMesh = new THREE.Mesh(vectorGeometry, vectorMaterial)
        vectorMesh.name = name

        return vectorMesh
    }

    for(let i = 0; i < 98; i++)
    {
        let v = generateNewVector()
        scene.add(v)
        v.position.x = ((i % 10.)/10.-.5) * camera.rightAtZZero * 1.6
        v.position.y = (Math.floor(i / 10.) / 10. - .5) * camera.topAtZZero * 1.6
    }
}