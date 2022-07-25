async function initShaderOutputAndFinalDw() {
    //////////////////////////
    // Override sensetivity //
    //////////////////////////
    {
        let overrideAffectedMaterials = []

        let overrideMentionIndex = { value: -1 }
        let overrideFloats = { value: new Float32Array(16) }
        function conferOverrideSensetivityToUniforms(uniforms) {
            uniforms.overrideMentionIndex = overrideMentionIndex
            uniforms.overrideFloats = overrideFloats
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
    function FullScreenQuadMesh(fragmentShader,uniforms) {
        let mat = new THREE.ShaderMaterial({
            vertexShader: basicVertex,
            fragmentShader,
            uniforms
        })

        let fsq = new THREE.Mesh(fullScreenQuadGeo, mat)
        fsq.matrixAutoUpdate = false
        fsq.matrix = FULL_SCREEN_QUAD_MATRIX

        return fsq
    }


    ////////////
    // Output //
    ////////////
    {
        let outputFsq = null
        let outputMentionIndex = { value: -1 }

        let readoutPrefix = await getTextFile('shaders/floatOutputterPrefix.glsl')
        
        let renderTextureScene = new THREE.Scene()
    
        //hmmm, to use varyings... what, you have to interpolate it yourself?
        //so there are the attributes that are actually at the vertices
        updateOutputter = (partialFragmentShader, uniforms, insertion) => {
            if(outputFsq !== null) {
                renderTextureScene.remove(outputFsq)
                outputFsq.material.dispose()
            }

            uniforms.outputMentionIndex = outputMentionIndex
            conferOverrideSensetivityToUniforms(uniforms)

            let readoutSuffix = `
void main() {
    `+ insertion + `();
    gl_FragColor = encodeRgbaOfOutputFloatForOurPixel();
}`

            let fullFragmentShader = generalShaderPrefix + readoutPrefix + partialFragmentShader + readoutSuffix
            outputFsq = FullScreenQuadMesh(fullFragmentShader, uniforms)

            renderTextureScene.add(outputFsq)
        }
        
        let pixelsWide = 8
        let renderTarget = new THREE.WebGLRenderTarget(pixelsWide, 1)
        let outputsArray = new Uint8Array(pixelsWide * 4)
    
        getShaderOutput = (mentionIndex,target) => {
    
            outputMentionIndex.value = mentionIndex
            outputFsq.material.needsUpdate = true
            
            renderer.render(renderTextureScene, camera) //might be easier with orthographic, but it ain't broke
            renderer.readRenderTargetPixels(renderTarget, 0, 0, pixelsWide, 1, outputsArray)
            
            //only seem to be able to use this Uint8->Float32 conversion at creation time
            let floatArray = new Float32Array(outputsArray.buffer)
    
            for (let i = 0; i < target.length; ++i)
                target[i] = floatArray[i]
    
            delete floatArray
    
            return target
        }

        updateMentionsFromShader = (condition) => {

            renderer.setRenderTarget(renderTarget)
            forEachUsedMention((m,i) => {
                if(condition(m))
                    m.updateFromShader()
            })
            renderer.setRenderTarget(null)
        }
    }

    //////////////
    // Final dw //
    //////////////

    let dw = new Dw("final", false, false, camera, false)
    // dw.elem.style.display = 'none'
    
    // FRAGMENT
    
    let oldFragFsq = null
    updateFinalDwFragment = (text, uniforms) => {
        if (oldFragFsq !== null) {
            dw.removeNonMentionChild(oldFragFsq)
            oldFragFsq.material.dispose()
        }

        const toFragColorSuffix = `
        void main() {
            gl_FragColor = vec4( getColor(), 1. );
        }`
        
        let fullFragmentShader = generalShaderPrefix + text + toFragColorSuffix
        conferOverrideSensetivityToUniforms(uniforms)
        
        oldFragFsq = FullScreenQuadMesh(fullFragmentShader, uniforms)
        dw.addNonMentionChild(oldFragFsq)
    }

    // VERTEX

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
        conferOverrideSensetivityToUniforms(uniforms)

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

        if(oldMesh!==null) {
            oldMesh.parent.remove(oldMesh)
            oldMesh.geometry.dispose()
            oldMesh.material.dispose()
        }
        
        let mesh = new THREE.Points(geo, mat)
        dw.addNonMentionChild(mesh)
        oldMesh = mesh
    }
}