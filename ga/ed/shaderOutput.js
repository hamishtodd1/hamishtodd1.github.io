async function initShaderOutputAndFinalDw() {
    //////////////////////////
    // Override sensetivity //
    //////////////////////////
    {
        let overrideAffectedMaterials = []

        let overrideMentionIndex = { value: -1 }
        let overrideFloats = { value: new Float32Array(16) }
        function generallyUpdateMaterial(mat,uniforms) {
            mat.uniforms = uniforms
            mat.uniforms.overrideMentionIndex = overrideMentionIndex
            mat.uniforms.overrideFloats = overrideFloats
            mat.needsUpdate = true
        }

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
    }


    /////////////////////
    // Fullscreen quad //
    /////////////////////
    let fullScreenQuadGeo = new THREE.PlaneGeometry(1., 1.)
    fullScreenQuadGeo.translate(0., 0., -1.)
    function FullScreenQuadMesh() {
        let mat = new THREE.ShaderMaterial({
            vertexShader: basicVertex
        })

        let fsq = new THREE.Mesh(fullScreenQuadGeo, mat)
        fsq.matrixAutoUpdate = false
        fsq.matrix = FULL_SCREEN_QUAD_MATRIX

        return fsq
    }


    ////////////
    // Output //
    ////////////
    let outputFsq = FullScreenQuadMesh()
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
        function updateOutputter(fragmentShader, uniforms) {
            uniforms.outputMentionIndex = outputMentionIndex
            outputFsq.material.fragmentShader = generalShaderPrefix + readoutPrefix + fragmentShader + readoutSuffix
            generallyUpdateMaterial(outputFsq.material,uniforms)
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
    // Final dw //
    //////////////

    let dw = new Dw("final", false, false, camera, false)
    // dw.elem.style.display = 'none'

    let oldMesh = null
    updateFinalDwVertex = (text, uniforms, geo) => {
        const toVertexSuffix = `
        uniform mat4 viewMatrix;
        uniform mat4 projectionMatrix;
        void main() {
            gl_PointSize = 2.0;
            gl_Position = projectionMatrix * viewMatrix * getVertex();
        }`

        //possibly getColor should take a vec2 input, the fragCoord

        uniforms.projectionMatrix = { value: camera.projectionMatrix }
        uniforms.viewMatrix = { value: camera.matrixWorldInverse }
        let mat = new THREE.RawShaderMaterial({
            uniforms,
            vertexShader: `#version 300 es\n` + generalShaderPrefix + text + toVertexSuffix,
            fragmentShader: `#version 300 es
            precision mediump float;
            out vec4 fragColor;
            void main() {
                fragColor = vec4(1., 0., 0., 1.);
            }`
        })

        generallyUpdateMaterial(mat, uniforms)

        if(oldMesh!==null) {
            oldMesh.parent.remove(oldMesh)
            oldMesh.geometry.dispose()
            oldMesh.material.dispose()
        }
        
        let mesh = new THREE.Points(geo, mat)
        dw.addNonMentionChild(mesh)
        oldMesh = mesh
    }

    let fragFsq = FullScreenQuadMesh()
    if(!VERTEX_MODE)
        dw.addNonMentionChild(fragFsq)
    updateFinalDwFragment = (text, uniforms) => {
        const toFragColorSuffix = `
        void main() {
            gl_FragColor = vec4( getColor(), 1. );
        }`
        fragFsq.material.fragmentShader = generalShaderPrefix + text + toFragColorSuffix
        generallyUpdateMaterial(fragFsq.material, uniforms)
    }

    updateOutputtingAndFinalDw = (outputterText, text, geo, uniforms, outputterUniforms) => {
        updateOutputter(outputterText, outputterUniforms)

        if(VERTEX_MODE)
            updateFinalDwVertex(text, uniforms, geo)
        else
            updateFinalDwFragment(text, uniforms)
    }
}