async function initShaderOutput() {
    //////////////////////////
    // Override sensetivity //
    //////////////////////////
    {
        const overrideFloats = new Float32Array(16)
        
        let overrideMentionIndex = { value: -1 }
        let overrideFloatsUniform = { value: overrideFloats }
        conferOverrideSensetivityToUniforms = (uniforms) => {
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
        
        let renderTextureScene = new THREE.Scene()

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
        updateOutputter = (partialFragmentShader, outputterUniforms, mode) => {
            if(outputFsq !== null) {
                renderTextureScene.remove(outputFsq)
                outputFsq.material.dispose()
            }

            outputterUniforms.outputMentionIndex = outputMentionIndex
            conferOverrideSensetivityToUniforms(outputterUniforms)

            let shaderRunner = ``
            if(mode === VERTEX_MODE) {
                shaderRunner = `
                void main() {
                    vec4 outputterVertex = getChangedVertex(initialVertexOutputter);
                `
            }
            else if (mode === FRAGMENT_MODE) {
                outputterUniforms.outputterFragmentPosition = outputterFragmentPosition
                shaderRunner = `
                uniform vec4 outputterFragmentPosition;
                void main() {
                    vec3 outputterCol = getColor(outputterFragmentPosition);
                `
            }
            else {
                partialFragmentShader = `\nvoid bareFunction() {\n` + partialFragmentShader + `\n}\n`
                shaderRunner = `
                void main() {
                    bareFunction();
                `
            }

            let fullFragmentShader = generalShaderPrefix + floatOutputterPrefix + partialFragmentShader + shaderRunner + `
                gl_FragColor = encodeRgbaOfOutputFloatForOurPixel();
            }`
            outputFsq = FullScreenQuadMesh(outputterVertexShader,fullFragmentShader, outputterUniforms)

            renderTextureScene.add(outputFsq)
        }
        
        let pixelsWide = 16
        let renderTarget = new THREE.WebGLRenderTarget(pixelsWide, 1)
        let outputIntArray = new Uint8Array(pixelsWide * 4)
        let floatArray = new Float32Array(16)
    
        getShaderOutput = (mentionIndex) => {
    
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

        let threejsIsCheckingForShaderErrors = false
        webglErrorThrower = (errorLine) => {

            if (!threejsIsCheckingForShaderErrors)
                return

            //haven't thought about this in a while, need to rethink
            return

            let errorParts = errorLine.split(":")
            //this could be a crazy number because who knows what's been prefixed for the first call
            const haphazardlyChosenNumber = 71
            let lineNumber = parseInt(errorParts[2]) - haphazardlyChosenNumber

            let errorContent = errorParts.slice(3).join(":")
            errorBox.textContent = errorContent
            errorBox.style.top = (lineToScreenY(.4 + lineNumber)).toString() + "px"
            errorBoxHidden = false

            threejsIsCheckingForShaderErrors = false
        }

        //used by three.js
        let errorBoxHidden = true
        hideErrorBoxIfNeeded = () => {
            if (!errorBoxHidden) {
                errorBox.style.top = "-200px" //TODO this is more for when you recompile
                errorBoxHidden = true
            }
        }

        updateMentionStatesFromRun = () => {

            //in theory, could do all the variables in a single run
            //the height of the render target in pixels would be the number of variables

            threejsIsCheckingForShaderErrors = true
            renderer.setRenderTarget(renderTarget)
            forEachUsedMention((m) => {
                if (m.appearance.visible && !m.variable.isUniform && !m.variable.isIn) {
                    getShaderOutput(m.mentionIndex)
                    m.appearance.floatArrayToState(floatArray)
                    m.appearance.updateFromState()
                }
            })
            renderer.setRenderTarget(null)
            threejsIsCheckingForShaderErrors = false
        }
    }
}