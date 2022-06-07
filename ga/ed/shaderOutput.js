/* 
    Suppose you wanted to generalize to fields
    Well, sort of already there!
    But, point might be: For any given 
 */

async function initShaderOutput() {
    let fullScreenQuadGeo = new THREE.PlaneGeometry(1., 1.)
    fullScreenQuadGeo.translate(0., 0., -1.)

    let overrideMentionIndex = { value: -1 }
    let overrideFloats = { value: new Float32Array(16) }
    let outputMentionIndex = { value: -1 }
    updateOverride = (mention, getFloatsForOverride) => {
        if(mention === null)
            overrideMentionIndex.value = -1
        else {
            overrideMentionIndex.value = mention.mentionIndex
            getFloatsForOverride(overrideFloats.value)
        }

        for (let i = 0, il = materials.length; i < il; ++i)
            materials[i].needsUpdate = true
    }

    let materials = []

    FullScreenQuad = () => {
        let mat = new THREE.ShaderMaterial({
            uniforms: {
                overrideMentionIndex,
                overrideFloats,
                outputMentionIndex
            }
        })
        materials.push(mat)

        mat.vertexShader = basicVertex

        let fsq = new THREE.Mesh(fullScreenQuadGeo, mat)
        fsq.matrixAutoUpdate = false
        fsq.matrix = FULL_SCREEN_QUAD_MATRIX

        fsq.updateFragmentShader = (text) => {
            fsq.material.fragmentShader = text
            fsq.material.needsUpdate = true
        }

        return fsq
    }

    let rtScene = new THREE.Scene()

    let outputFsq = FullScreenQuad()
    rtScene.add(outputFsq)

    let pixelsWide = 8
    let renderTarget = new THREE.WebGLRenderTarget(pixelsWide, 1)
    let outputsArray = new Uint8Array(pixelsWide * 4)
    let outputterPrefix = await getTextFile('floatOutputter.glsl')

    let readoutSuffix = `
varying vec2 frameCoord;

void main() {
    vec4 myCol = vec4(0.,0.,0.,1.); //do nothing with this, just making sure outputFloats gets filled
    mainImage(myCol);

    int pixelIndex = int(round(frameCoord.x * 8. - .5));
    float pixelFloat = 0.;
    for (int k = 0; k < 8; ++k)
        pixelFloat += pixelIndex == k ? outputFloats[k] : 0.;

    gl_FragColor = encodeFloat(pixelFloat);
}`

    updateOutputterFragmentShader = (fragmentShader) => {
        outputFsq.updateFragmentShader(generalShaderPrefix + outputterPrefix + fragmentShader + readoutSuffix)        
    }

    //potential optimization if shader compilation is a bottleneck:
    //  a single shader, with a little thing added under every mention,
    //  and an integer uniform that just says "run the shader making sure this is the output"
    getOutput = (mentionIndex,target) => {

        outputMentionIndex.value = mentionIndex
        outputFsq.material.needsUpdate = true
        
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
        let ret = "\n"
        for (let i = 0; i < len; ++i)
            ret += `    outputFloats[` + i + `] = ` + variableName + `[` + i + `];\n`
        return ret
    }
}