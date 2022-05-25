async function initShaderOutput() {
    let rtScene = new THREE.Scene()

    let rtFsq = FullScreenQuad()
    rtScene.add(rtFsq)

    let pixelsWide = 8
    let renderTarget = new THREE.WebGLRenderTarget(pixelsWide, 1)
    let outputsArray = new Uint8Array(pixelsWide * 4)
    let outputterPrefix = await getTextFile('floatOutputter.glsl')

    //potential optimization if shader compilation is a bottleneck:
    //  a single shader, with a little thing added under every mention,
    //  and an integer uniform that just says "run the shader making sure this is the output"
    getShaderOutput = (fragmentShader, target) => {

        rtFsq.updateFragmentShader(generalShaderPrefix + outputterPrefix + fragmentShader)

        renderer.setRenderTarget(renderTarget)
        renderer.render(rtScene, camera)

        renderer.readRenderTargetPixels(renderTarget, 0, 0, pixelsWide, 1, outputsArray)
        renderer.setRenderTarget(null)

        let floatArray = new Float32Array(outputsArray.buffer)

        for (let i = 0; i < target.length; ++i)
            target[i] = floatArray[i]

        delete floatArray

        return target
    }

    getFloatArrayAssignmentString = (variableName, len) => {
        let ret = ""
        for (let i = 0; i < len; ++i)
            ret += `     outputFloats[` + i + `] = ` + variableName + `[` + i + `];\n`
        return ret
    }
}