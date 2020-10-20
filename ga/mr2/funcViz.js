/*
    Features to have:
        change a scalar and you see a point move, but change that scalar to an interval and you see the locus of points
        if your input dimension is 2 or 1 and output is 1 or 2, can trace your finger along and see what's going on

    But what distinguishes your line segment from a series of points?
    It is shown as a series of points
        
    your texture: I2 -> hue
    your function: I2 -> I2
    You're mapping points in I2 to I2
    You then use the texture to get the hue for those points

    but you want to be able to show single points or lines (meridians!) from I2

    so you write the code worldMap(...) where ... is your bunch of points
    earth(0.,0.) = blue, the ocean
    earth(.4,0.) = green, the UK or whatever
    earth([0.,1],0.) = greenwich meridian colors, i.e.
        earth([0.,1],0.)(0.) = blue, the ocean
*/

function initFuncViz() {

    

    return
    
    //world map: these are both 2
    let inputDimension = 1
    let outputDimension = 1

    let representations = [
        ["space","space"],
        ["space","hue"]
    ]
    let representation = 0
    mouseResponses.push({
        z:()=>1.,
        start:()=>{
            ++representation
            if (representation > representations.length )
                representation = 0
        }
    })

    let numDivisions = 2
    let numSamples = numDivisions+1

    let iValues = new Float32Array(numSamples*2)
    for(let i = 0; i < numSamples; ++i) {
        iValues[i] = i / numDivisions
        // iValues[i] = Math.random()
    }

    let i2Values = new Float32Array(numSamples*numSamples*2)
    for(let i = 0; i < numSamples; ++i) {
        for (let j = 0; j < numSamples; ++j) {
            let pointIndex = i * numSamples + j
            i2Values[pointIndex*2+0] = i/numDivisions
            i2Values[pointIndex*2+1] = j/numDivisions
        }
    }

    let domainValueBuffer = quadBuffer

    const vsSource = shaderHeader + cameraAndFrameCountShaderStuff.header + `
        attribute vec4 domainValueA; //"uv"

        void main(void) {
            gl_Position = domainValueA;
        `
        + cameraAndFrameCountShaderStuff.footer
    const fsSource = shaderHeader + cameraAndFrameCountShaderStuff.header + `
        void main(void) {
            gl_FragColor = vec4(0.,0.,0.,1.);
        }
        `

    const program = Program(vsSource, fsSource)
    cameraAndFrameCountShaderStuff.locateUniforms(program)
    program.addVertexAttribute("domainValue", domainValueBuffer, 4, true)
    addRenderFunction(() => {
        gl.useProgram(program.glProgram);
        cameraAndFrameCountShaderStuff.transfer(program)
        program.doSomethingWithVertexAttribute("domainValue", domainValueBuffer)
        gl.drawArrays(gl.TRIANGLES, 0, domainValueBuffer.length / 4);
    })
}