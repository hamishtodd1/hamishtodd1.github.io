// The landmasses could be an implicit surface defined over S2 or equivalently the directions in 3D, eg trivectors without e123

async function initWorldMap() {
    const vsSource = `
        precision mediump float;

        uniform vec2 uScreenPosition;
        uniform float uCameraAspect;

        attribute vec4 aPosition;
        varying vec3 vVertexPosition;
        
        attribute vec2 aUv;
        varying vec2 vUv;

        void main(void) {
            gl_Position = aPosition;
            gl_Position.xy += uScreenPosition;

            gl_Position.y *= uCameraAspect;
            vUv = aUv;

            vVertexPosition = aPosition.xyz;
        }
        `
    const fsSource = `
        precision mediump float;

        #define PI 3.14159265359
        #define TAU 6.28318530718

        varying vec2 vUv;
        varying vec3 vVertexPosition;

        uniform sampler2D uSampler;

        void main(void) {
            vec4 texelColor = texture2D(uSampler, vUv);

            gl_FragColor = vec4(texelColor.rgb, texelColor.a);
        }
        `

    const shaderProgram = Program(vsSource, fsSource)
    const texture = await Texture("data/earthColor.png")

    const programInfo = {
        program: shaderProgram,
        vertexAttributes: {},
        uniformLocations: {
            uSampler: gl.getUniformLocation(shaderProgram, 'uSampler'),
            uCameraAspect: gl.getUniformLocation(shaderProgram, 'uCameraAspect'),
            uScreenPosition: gl.getUniformLocation(shaderProgram, 'uScreenPosition'),
        }
    };

    function addVertexAttribute(name,arr,itemSize) {
        const buffer = gl.createBuffer();
        gl.bindBuffer(gl.ARRAY_BUFFER, buffer);
        gl.bufferData(gl.ARRAY_BUFFER, new Float32Array(arr), gl.STATIC_DRAW)

        programInfo.vertexAttributes[name] = {
            buffer, itemSize,
            location: gl.getAttribLocation(shaderProgram, "a"+name)
        }
    }
    function enableVertexBuffer(name) {
        const type = gl.FLOAT;
        const normalize = false;
        const stride = 0;
        const offset = 0;

        let va = programInfo.vertexAttributes[name]
        gl.enableVertexAttribArray(va.location); //weird since you use the location below as well
        gl.bindBuffer(gl.ARRAY_BUFFER, va.buffer);
        gl.vertexAttribPointer(
            va.location,
            va.itemSize,
            type,
            normalize,
            stride,
            offset);
    }

    const positionBuffer = [
        -.3, .3, 0.,
        -.3, -.3, 0.,
        .3, .3, 0.,

        -.3, -.3, 0.,
        .3, -.3, 0.,
        .3, .3, 0.,
    ];
    addVertexAttribute("Position", positionBuffer, 3)

    const uvBuffer = [
        0.0, 0.0,
        0.0, 1.0,
        1.0, 0.0,

        0.0, 1.0,
        1.0, 1.0,
        1.0, 0.0,
    ];
    addVertexAttribute("Uv", uvBuffer, 2)

    renderFunctions.push( () => {
        gl.useProgram(programInfo.program);

        enableVertexBuffer("Position")
        enableVertexBuffer("Uv")

        gl.activeTexture(gl.TEXTURE0);
        gl.bindTexture(gl.TEXTURE_2D, texture);
        gl.uniform1i(programInfo.uniformLocations.uSampler, 0);

        gl.uniform1f(programInfo.uniformLocations.uCameraAspect, mainCamera.aspect);
        gl.uniform2f(programInfo.uniformLocations.uScreenPosition, screenPosition.x, screenPosition.y );

        const vertexCount = 6;
        gl.drawArrays(gl.TRIANGLES, 0, vertexCount);
    })

    const screenPosition = { x: 0., y: 0. }
    updateFunctions.push(() => {
        screenPosition.y = .05*Math.sin(frameCount * .01)
    })
}