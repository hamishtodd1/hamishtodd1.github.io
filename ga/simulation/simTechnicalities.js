
/*
    we visualize it as running horizontally, with x and y but x is long
    tSpace is x in [0.,1.], y in [0.,1.]
    so: if you have xt, yt in the texture, and the texture is "stacks" high
    that corresponds to y = yt, x = xt / stacks, z = floor((xt-x)/stacks)

    we assume coordinates are as usual. Far bottom left corner is 0,0,0
    update your wireframe box to reflect that

    eSpace in [0,1],[0,1],[0,1], tSpace is [0,1],[0,1]
    */



function assignShader(fileName, materialToReceiveAssignment, vertexOrFragment) {
    var propt = vertexOrFragment + "Shader"
    var fullFileName = "shaders/" + fileName + ".glsl"

    return new Promise(resolve => {
        var xhr = new XMLHttpRequest();
        xhr.open("GET", fullFileName, true);
        xhr.onload = function (e) {
            materialToReceiveAssignment[propt] = xhr.response
            resolve();
        };
        xhr.onerror = function () {
            console.error(fullFileName, "didn't load");
        };
        xhr.send();
    })
}

async function Simulation(
    dimensions, simulationShaderFilename,
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

    let initialStateTexture = new THREE.DataTexture(stateArray, dimensions.x, dimensions.y, THREE.RGBAFormat)
    initialStateTexture.wrapS = wrap
    initialStateTexture.wrapT = wrap
    initialStateTexture.type = params.type
    initialStateTexture.needsUpdate = true

    let simulationMaterial = new THREE.ShaderMaterial({ //not raw coz you need position
        uniforms:
        {
            "oldState": { value: null },
            "deltaTime": { value: null },
            "dimensions": { value: dimensions }
        },
        vertexShader: [
            'varying vec2 vUV;',

            'void main (void) {',
            'vUV = position.xy * 0.5 + 0.5;',
            'gl_Position = vec4(position, 1.0 );',
            '}'
        ].join('\n'),
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

    let simulation = {
        // simulationTexture: null,
        speed: 10.,
        paused: false,
        stateArray,
        updateStateArray: function () {
            renderer.readRenderTargetPixels(renderTarget, 0, 0, 64, 64, stateArray)
        }
    }

    let initial = true;
    updateSim = () => {
        let numStepsPerFrame = typeof numStepsPerFrameSpecification === "number" ? numStepsPerFrameSpecification : numStepsPerFrameSpecification.value;

        if (simulation.paused || numStepsPerFrame === 0)
            return;

        let nonSimulationRenderTarget = renderer.getRenderTarget();
        {
            for (let i = 0; i < numStepsPerFrame; i++) {
                if (initial) {
                    simulationMaterial.uniforms.oldState.value = initialStateTexture;
                    initial = false;
                }
                else {
                    simulationMaterial.uniforms.oldState.value = ping ? pingFramebuffer.texture : pongFramebuffer.texture;
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

    return simulation
}