async function initPad() {
    initCarat()
    let columnBackground = initColumnBackground()

    let typeableCharacters = initTypeableCharacters()
    let displayableCharacters = typeableCharacters + "=/" + freeVariableCharacters
    initCharacterTexture(displayableCharacters)

    initCompileViewer(displayableCharacters, columnBackground)
    initDebugCompileViewer(displayableCharacters, columnBackground)

    let justDebugView = false
    updateFunctions.splice(0, 0, () =>{
        if (justDebugView)
            debugCompileView()
        else
            compileView()
    })

    bindButton("6",()=>{
        justDebugView = !justDebugView
    })

    await initTextureSampler()
    initFrames()

    initDisplayWindows()

    // initFuncViz()

    // initDrawing()
}

const freeVariableCharacters = "0123456789.,-e"
const freeVariableStartCharacters = "0123456789.-"
function getLiteralLength(literalStart) { //doesn't include "color"
    let literalLength = 0
    let numCommasSoFar = 0
    for (literalLength;
        literalStart + literalLength < backgroundString.length &&
        freeVariableCharacters.indexOf(backgroundString[literalStart + literalLength]) !== -1 &&
        numCommasSoFar < 16;
        ++literalLength) {
        if (backgroundString[literalStart + literalLength] === "," )
            ++numCommasSoFar
    }

    return literalLength
}

function initColumnBackground() {
    let vertsBuffer = new Float32Array(quadBuffer.length)
    for (let i = 0; i < quadBuffer.length; ++i) {
        vertsBuffer[i] = quadBuffer[i]
        if (i % 4 === 0)
            vertsBuffer[i] -= .5
        if (i % 4 === 1 && vertsBuffer[i] < 0.)
            vertsBuffer[i] = -999999.
        if (i % 4 === 2)
            vertsBuffer[i] = mainCamera.frontAndBackZ //positive number to move it backwards, so weird
    }
    let columnBackground = verticesDisplayWithPosition(vertsBuffer, gl.TRIANGLES, .22, .22, .22)
    addRenderFunction(columnBackground.renderFunction)
    return columnBackground
}