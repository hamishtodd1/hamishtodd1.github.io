async function initShaderOutputAndFinalDw() {
    //////////////////////////
    // Override sensetivity //
    //////////////////////////
    {
        let overrideMentionIndex = { value: -1 }
        let overrideFloatsUniform = { value: overrideFloats }
        function conferOverrideSensetivityToUniforms(uniforms) {
            uniforms.overrideMentionIndex = overrideMentionIndex
            uniforms.overrideFloats = overrideFloatsUniform
        }

        updateOverride = (indicatedMention) => {
            if (indicatedMention === null)
                overrideMentionIndex.value = -1
            else {
                indicatedMention.appearance.stateToFloatArray(overrideFloats)
                overrideMentionIndex.value = indicatedMention.mentionIndex
            }
        }
    }

    function conferBaseUniforms(uniforms) {
        conferOverrideSensetivityToUniforms(uniforms)
    }

    /////////////////////
    // Fullscreen quad //
    /////////////////////
    let fullScreenQuadGeo = new THREE.PlaneGeometry(1., 1.)
    fullScreenQuadGeo.translate(0., 0., -1.)
    function FullScreenQuadMesh(vertexShader,fragmentShader,uniforms) {
        let mat = new THREE.ShaderMaterial({
            vertexShader,
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

        //when you hover initialVertex, it connects to one of the vertices in the point cloud/cow
        //and it ends up copying one of them to this
        let outputterFragmentPosition = {value: new THREE.Vector4(0.,0.,0.,1.)}

        let outputterVertexShader = `
        varying vec2 frameCoord;

        void main() {
            frameCoord = position.xy + .5;
            gl_Position = projectionMatrix * modelViewMatrix * vec4(position, 1.);
        }`
    
        //hmmm, to use varyings... what, you have to interpolate it yourself?
        //so there are the attributes that are actually at the vertices
        updateOutputter = (partialFragmentShader, outputterUniforms, vertexMode) => {
            if(outputFsq !== null) {
                renderTextureScene.remove(outputFsq)
                outputFsq.material.dispose()
            }

            outputterUniforms.outputMentionIndex = outputMentionIndex
            conferBaseUniforms(outputterUniforms)

            let shaderRunner = ``
            if(vertexMode) {

                shaderRunner = `
                void main() {
                    vec4 outputterVertex = getChangedVertex(initialVertexOutputter);
                `
            }
            else {
                outputterUniforms.outputterFragmentPosition = outputterFragmentPosition
                shaderRunner = `
                uniform vec4 outputterFragmentPosition;
                void main() {
                    vec3 outputterCol = getColor(outputterFragmentPosition);
                `
            }

            let fullFragmentShader = generalShaderPrefix + readoutPrefix + partialFragmentShader + shaderRunner + `
                gl_FragColor = encodeRgbaOfOutputFloatForOurPixel();
            }`
            outputFsq = FullScreenQuadMesh(outputterVertexShader,fullFragmentShader, outputterUniforms)

            renderTextureScene.add(outputFsq)
        }
        
        let pixelsWide = 8
        let renderTarget = new THREE.WebGLRenderTarget(pixelsWide, 1)
        let outputIntArray = new Uint8Array(pixelsWide * 4)
        let floatArray = new Float32Array(16)
    
        getShaderOutput = (mentionIndex,doTheLog) => {
    
            outputMentionIndex.value = mentionIndex

            // log(outputFsq.material.uniforms.time.value)
            
            renderer.render(renderTextureScene, camera) //might be easier with orthographic, but it ain't broke
            renderer.readRenderTargetPixels(renderTarget, 0, 0, pixelsWide, 1, outputIntArray)
            
            //only seem to be able to use this Uint8->Float32 conversion at creation time
            let floatArrayAnew = new Float32Array(outputIntArray.buffer)
    
            for (let i = 0; i < floatArray.length; ++i)
                floatArray[i] = floatArrayAnew[i]
    
            delete floatArrayAnew
    
            return floatArray
        }

        updateMentionStatesFromRun = () => {

            //in theory, could you all variables in a single run?
            //the height of the render target in pixels would be the number of variables

            renderer.setRenderTarget(renderTarget)
            forEachUsedMention((m) => {
                //sort of hoping that visible has been set, either by carat or indication
                if (m.appearance.visible && !m.variable.isUniform && !m.variable.isIn) {
                    getShaderOutput(m.mentionIndex, m.variable.name === `control2`)
                    // if(m.variable.name === `control2`)
                    //     log(frameCount,floatArray)
                    m.appearance.updateStateFromRunResult(floatArray)
                    m.appearance.updateFromState()
                }
            })
            renderer.setRenderTarget(null)
        }
    }

    //////////////
    // Final dw //
    //////////////

    let dw = new Dw("final", false, camera, false)
    // dw.elem.style.display = 'none'

    //////////////
    // Fragment //
    //////////////
    
    let oldFragFsq = null
    let defaultVertexShader = `
    varying vec4 fragmentPosition;
    void main() {
        fragmentPosition = modelViewMatrix * vec4(position, 1.);
        gl_Position = projectionMatrix * fragmentPosition;
    }`
    updateFinalDwFragment = (text, uniforms) => {
        if (oldFragFsq !== null) {
            dw.removeNonMentionChild(oldFragFsq)
            oldFragFsq.material.dispose()
        }

        const toFragColorSuffix = `
        varying vec4 fragmentPosition;
        void main() {
            vec3 myCol = getColor(fragmentPosition);
            gl_FragColor = vec4( myCol, 1. );
        }`
        
        let fullFragmentShader = generalShaderPrefix + text + toFragColorSuffix
        conferBaseUniforms(uniforms)
        
        oldFragFsq = FullScreenQuadMesh(defaultVertexShader,fullFragmentShader, uniforms)
        dw.addNonMentionChild(oldFragFsq)
    }

    ////////////
    // Vertex //
    ////////////

    let oldMesh = null
    updateFinalDwVertex = (text, uniforms, geo) => {
        
        const toVertexSuffix = `
        uniform mat4 viewMatrix;
        uniform mat4 projectionMatrix;
        in vec3 position;
        void main() {
            gl_PointSize = 2.0;
            vec4 initialVertex = vec4(position,1.);
            gl_Position = projectionMatrix * viewMatrix * getChangedVertex(initialVertex);
        }`

        uniforms.projectionMatrix = { value: camera.projectionMatrix }
        uniforms.viewMatrix = { value: camera.matrixWorldInverse }
        conferBaseUniforms(uniforms)

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
        
        oldMesh = new THREE.Points(geo, mat)
        dw.addNonMentionChild(oldMesh)
    }
}