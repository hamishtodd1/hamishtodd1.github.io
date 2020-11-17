const unchangingUnitSquareVertices = []
const quadBuffer = new Float32Array(6 * 4)
const vertBufferFunctions = {}

function initPremadeBuffers()
{
    vertBufferFunctions.disc = (radius, radialDivisions) =>
    {
        let circumferencePoints = []
        for (let i = 0; i < radialDivisions; ++i)
        {
            let angle = TAU * i / radialDivisions
            circumferencePoints.push([Math.cos(angle) * radius, Math.sin(angle) * radius])
        }

        var vertBuffer = new Float32Array(3 * 4 * radialDivisions)
        for (let i = 0; i < radialDivisions; ++i)
        {
            vertBuffer[i * 3 * 4 + 0] = 0.
            vertBuffer[i * 3 * 4 + 1] = 0.
            vertBuffer[i * 3 * 4 + 2] = 0.
            vertBuffer[i * 3 * 4 + 3] = 1.

            vertBuffer[i * 3 * 4 + 4] = circumferencePoints[i][0]
            vertBuffer[i * 3 * 4 + 5] = circumferencePoints[i][1]
            vertBuffer[i * 3 * 4 + 6] = 0.
            vertBuffer[i * 3 * 4 + 7] = 1.

            vertBuffer[i * 3 * 4 + 8] = circumferencePoints[(i + 1) % radialDivisions][0]
            vertBuffer[i * 3 * 4 + 9] = circumferencePoints[(i + 1) % radialDivisions][1]
            vertBuffer[i * 3 * 4 + 10] = 0.
            vertBuffer[i * 3 * 4 + 11] = 1.
        }

        return vertBuffer;
    }

    for (let i = 0; i < 4; ++i)
    {
        let p = new Float32Array(16)
        pointX(p, .5)
        pointY(p, .5)
        pointZ(p, 0.)
        pointW(p, 1.)

        if (i % 2) pointX(p, -.5)
        if (i < 2) pointY(p, -.5)

        unchangingUnitSquareVertices.push(p)
    }


    let orderedIndices = [0, 2, 1, 3, 1, 2]
    for (let i = 0; i < orderedIndices.length; ++i)
    {
        quadBuffer[i * 4 + 0] = pointX(unchangingUnitSquareVertices[orderedIndices[i]])
        quadBuffer[i * 4 + 1] = pointY(unchangingUnitSquareVertices[orderedIndices[i]])
        quadBuffer[i * 4 + 2] = pointZ(unchangingUnitSquareVertices[orderedIndices[i]])
        quadBuffer[i * 4 + 3] = pointW(unchangingUnitSquareVertices[orderedIndices[i]])
    }
}

function generateDividedUnitSquareBuffer(numDivisions, eps) {
    const uvBuffer = []
    function pushUv(i, j) {
        uvBuffer.push(i / numDivisions)
        uvBuffer.push(j / numDivisions)
    }
    //you don't want anything on any precise lines like x = .5
    for (let i = 0.; i < numDivisions; ++i) {
        for (let j = 0.; j < numDivisions; ++j) {
            pushUv(i + eps, j + eps)
            pushUv(i + 1. - eps, j + 1. - eps)
            pushUv(i + eps, j + 1. - eps)

            pushUv(i + eps, j + eps)
            pushUv(i + 1. - eps, j + eps)
            pushUv(i + 1. - eps, j + 1. - eps)
        }
    }
    return uvBuffer
}