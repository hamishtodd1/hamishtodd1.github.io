

function assignShader(fileName, materialToReceiveAssignment, vertexOrFragment) {
    var propt = vertexOrFragment + "Shader"
    var fullFileName = "shaders/" + fileName + ".glsl"

    return new Promise(resolve => {
        var xhr = new XMLHttpRequest();
        xhr.open("GET", fullFileName, true);
        xhr.onload = function (e) {
            materialToReceiveAssignment[propt] = tSpaceESpaceConversion + xhr.response //hacked in! Get this string out!
            resolve();
        };
        xhr.onerror = function () {
            console.error(fullFileName, "didn't load");
        };
        xhr.send();
    })
}

async function GpuSim(
    simulationShaderFilename,
    boundaryConditions,
    stateArray,
    numStepsPerFrameSpecification,
    objectToAssignSimulationTexture,
    extraUniforms,
    filter) {
        
    let wrap = boundaryConditions === "periodic" ? THREE.RepeatWrapping : THREE.ClampToEdgeWrapping

    //would be good to make it always nearest in simulation, always linear in viz
    if (filter === undefined)
        filter = THREE.NearestFilter

    let params = {
        minFilter: filter,
        magFilter: filter,
        wrapS: wrap,
        wrapT: wrap,
        format: THREE.RGBAFormat,
        stencilBuffer: false,
        depthBuffer: false,
        premultiplyAlpha: false,
        type: THREE.FloatType // THREE.HalfFloat for speed
    }
    let pingFramebuffer = new THREE.WebGLRenderTarget(dimensions.x, dimensions.y, params)
    let pongFramebuffer = new THREE.WebGLRenderTarget(dimensions.x, dimensions.y, params)

    let userDefinedTexture = new THREE.DataTexture( stateArray, dimensions.x, dimensions.y, THREE.RGBAFormat)
    userDefinedTexture.wrapS = wrap
    userDefinedTexture.wrapT = wrap
    userDefinedTexture.type = params.type
    userDefinedTexture.needsUpdate = true

    let simulationMaterial = new THREE.ShaderMaterial({ //not raw coz you need position
        uniforms:
        {
            "oldState": { value: null },
            "deltaTime": { value: null },
            "dimensions": { value: dimensions },
            "handPosition": { value: new THREE.Vector3() },
        },
        vertexShader: `
            varying vec2 vUV;

            void main (void) {
                vUV = position.xy * 0.5 + 0.5;
                gl_Position = vec4(position, 1.0 );
            }`,
        blending: 0, //prevent default premultiplied alpha values
        depthTest: false
    });

    if (extraUniforms !== undefined) {
        Object.assign(simulationMaterial.uniforms, extraUniforms)
        log(simulationMaterial.uniforms)
    }

    await assignShader(simulationShaderFilename, simulationMaterial, "fragment")

    let ping = true
    let simScene = new THREE.Scene()
    let simCamera = new THREE.OrthographicCamera()
    simCamera.position.z = 1
    renderer.clearColor(0xffffff) //hmm
    let simulationMesh = new THREE.Mesh(new THREE.PlaneGeometry(2, 2), simulationMaterial)
    simScene.add(simulationMesh)

    let renderTarget = null

    let updateFromStateArray = true;
    let simulation = {
        // simulationTexture: null,
        speed: 10.,
        paused: false,
        stateArray,
        updateStateArray: function () {
            renderer.readRenderTargetPixels(renderTarget, 0, 0, dimensions.x, dimensions.y, stateArray)
        },
        updateFromStateArray:()=>{
            userDefinedTexture.needsUpdate = true
            updateFromStateArray = true
        },
        update: (painting) => {
            let numStepsPerFrame = typeof numStepsPerFrameSpecification === "number" ? numStepsPerFrameSpecification : numStepsPerFrameSpecification.value;

            if (simulation.paused || numStepsPerFrame === 0)
                return;

            let nonSimulationRenderTarget = renderer.getRenderTarget();
            {
                for (let i = 0; i < numStepsPerFrame; i++) {
                    if (updateFromStateArray) {
                        simulationMaterial.uniforms.oldState.value = userDefinedTexture;
                        updateFromStateArray = false;
                    }
                    else {
                        simulationMaterial.uniforms.oldState.value = ping ? pingFramebuffer.texture : pongFramebuffer.texture;
                    }

                    if(!painting)
                        simulationMaterial.uniforms.handPosition.value.set(-.5,-.5,-.5)
                    else {
                        handPosition.pointToVertex(v3)
                        simBox.worldToLocal(v3)
                        simulationMaterial.uniforms.handPosition.value.copy(v3)
                    }
                    simulationMaterial.uniforms.deltaTime.value = clamp(frameDelta, 0., 1. / 30) * simulation.speed;

                    renderTarget = ping ? pongFramebuffer : pingFramebuffer
                    renderer.setRenderTarget(renderTarget);
                    renderer.render(simScene, simCamera);
                    simulationMaterial.uniforms.oldState.value = renderTarget.texture;

                    ping = !ping;
                }

                objectToAssignSimulationTexture.value = renderTarget.texture;
            }
            renderer.setRenderTarget(nonSimulationRenderTarget);
        }
    }

    return simulation
}