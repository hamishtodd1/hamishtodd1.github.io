async function initShaderOutputAndFinalDw() {

    {
        let overrideAffectedMaterials = []

        let overrideMentionIndex = { value: -1 }
        let overrideFloats = { value: new Float32Array(16) }
        updateOverride = (mention, getFloatsForOverride) => {
            if (mention === null)
                overrideMentionIndex.value = -1
            else {
                overrideMentionIndex.value = mention.mentionIndex
                getFloatsForOverride(overrideFloats.value)
            }

            for (let i = 0, il = overrideAffectedMaterials.length; i < il; ++i)
                overrideAffectedMaterials[i].needsUpdate = true
        }

        let fullScreenQuadGeo = new THREE.PlaneGeometry(1., 1.)
        fullScreenQuadGeo.translate(0., 0., -1.)
        function OverrideSensetiveFullScreenQuad() {
            let mat = new THREE.ShaderMaterial({
                vertexShader: basicVertex
            })
    
            let fsq = new THREE.Mesh(fullScreenQuadGeo, mat)
            fsq.matrixAutoUpdate = false
            fsq.matrix = FULL_SCREEN_QUAD_MATRIX
    
            fsq.updateFromCompilation = (text, uniforms) => {
                fsq.material.uniforms = uniforms
                fsq.material.uniforms.overrideMentionIndex = overrideMentionIndex
                fsq.material.uniforms.overrideFloats = overrideFloats
                fsq.material.fragmentShader = text
                fsq.material.needsUpdate = true
            }
    
            return fsq
        }
    }


    ////////////
    // Output //
    ////////////
    let outputFsq = OverrideSensetiveFullScreenQuad()
    let outputMentionIndex = { value: -1 }

    {
        let readoutPrefix = await getTextFile('shaders/floatOutputterPrefix.glsl')
        let insertion = VERTEX_MODE ? `vec4 myVertex = getVertex` : `vec3 myCol = getColor`
        let readoutSuffix = `
    void main() {
        `+ insertion +`();
        gl_FragColor = encodeRgbaOfOutputFloatForOurPixel();
    }`
    
        //hmmm, to use varyings... what, you have to interpolate it yourself?
        //so there are the attributes that are actually at the vertices
        updateOutputterFragmentShader = (fragmentShader, uniforms) => {
            uniforms.outputMentionIndex = outputMentionIndex
            outputFsq.updateFromCompilation(readoutPrefix + fragmentShader + readoutSuffix, uniforms)
        }
    }

    {
        let pixelsWide = 8
        let renderTarget = new THREE.WebGLRenderTarget(pixelsWide, 1)
        let outputsArray = new Uint8Array(pixelsWide * 4)

        let renderTextureScene = new THREE.Scene()
        renderTextureScene.add(outputFsq)
    
        getOutput = (mentionIndex,target) => {
    
            outputMentionIndex.value = mentionIndex
            outputFsq.material.needsUpdate = true
            
            renderer.setRenderTarget(renderTarget)
            renderer.render(renderTextureScene, camera)        
            renderer.readRenderTargetPixels(renderTarget, 0, 0, pixelsWide, 1, outputsArray)
            renderer.setRenderTarget(null)
            
            //only seem to be able to use this Uint8->Float32 conversion at creation time
            let floatArray = new Float32Array(outputsArray.buffer)
    
            for (let i = 0; i < target.length; ++i)
                target[i] = floatArray[i]
    
            delete floatArray
    
            return target
        }
    }

    //////////////
    // final dw //
    //////////////

    let dw = new Dw("final", false, false, camera, false)
    // dw.elem.style.display = 'none'

    if (VERTEX_MODE) {

        let mat = new THREE.ShaderMaterial({
            uniforms: {
            },
            fragmentShader: `
void main() {
    gl_FragColor = vec4(1., 0., 0., 1.);
}`
        })

        let toVertexSuffix = `
void main() {
    gl_PointSize = 2.0;
	gl_Position = projectionMatrix * modelViewMatrix * getVertex();
}`

        //getColor needs a vec2 input, the fragCoord
        //this one gets a uv from a 1x1 rect
        //and they are a special kind of manipulation
        //their windows go at the top

        //we will temporarily assume that you have only one vertex going on!

        let geo = new THREE.BufferGeometry().setFromPoints([new THREE.Vector3(0., 1., 0.)])
        let a = new THREE.PointsMaterial({ size: .5 })
        // dw.addNonMentionChild(new THREE.Points(geo, mat))

        updateFinalDw = (text) => {
            // mat.vertexShader = text + toVertexSuffix
            // mat.needsUpdate = true
        }
    }

    if (!VERTEX_MODE) {

        let finalFsq = OverrideSensetiveFullScreenQuad()
        dw.addNonMentionChild(finalFsq)

        let toFragColorSuffix = `
void main() {
    gl_FragColor = vec4( getColor(), 1. );
}`
        updateFinalDw = (text, uniforms) => {
            finalFsq.updateFromCompilation(text + toFragColorSuffix, uniforms)
        }
    }
}