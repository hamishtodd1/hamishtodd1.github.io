function initRenderer() {
    const canvas = document.createElement("CANVAS")
    document.body.appendChild(canvas)

    canvas.width = window.innerWidth
    canvas.height = window.innerHeight
    let gl = canvas.getContext("webgl")
    if (!gl)
        console.error("Failed to get WebGL context, browser or device may not support WebGL.")

    
        

    {
        // will set to true when video can be copied to texture
        var copyVideo = false;

        {
            const vsSource = `
                attribute vec4 aVertexPosition;
                attribute vec2 aTextureCoord;
                varying highp vec2 vTextureCoord;

                void main(void) {
                    gl_Position = aVertexPosition;
                    vTextureCoord = aTextureCoord;
                }
                `;
            const fsSource = `
                varying highp vec2 vTextureCoord;

                uniform sampler2D uSampler;

                void main(void) {
                    highp vec4 texelColor = texture2D(uSampler, vTextureCoord);

                    gl_FragColor = vec4(texelColor.rgb, texelColor.a);
                }
                `;

            const shaderProgram = initShaderProgram(gl, vsSource, fsSource);

            const programInfo = {
                program: shaderProgram,
                attribLocations: {
                    vertexPosition: gl.getAttribLocation(shaderProgram, 'aVertexPosition'),
                    textureCoord: gl.getAttribLocation(shaderProgram, 'aTextureCoord'),
                },
                uniformLocations: {
                    uSampler: gl.getUniformLocation(shaderProgram, 'uSampler'),
                }
            };

            // Here's where we call the routine that builds all the
            // objects we'll be drawing.
            const buffers = initBuffers();

            const texture = initTexture();

            const video = initVideo("../common/data/videos/hoberman.mp4");

            var then = 0;

            // Draw the scene repeatedly
            function render(now) {
                now *= 0.001;  // convert to seconds
                const deltaTime = now - then;
                then = now;

                if (copyVideo)
                    updateVideoTexture(gl, texture, video);

                drawScene(gl, programInfo, buffers, texture, deltaTime);

                requestAnimationFrame(render);
            }
            requestAnimationFrame(render);
        }

        function initVideo(url) {
            const video = document.createElement('video');

            var playing = false;
            var timeupdate = false;

            video.autoplay = true;
            video.muted = true;
            video.loop = true;

            // Waiting for these 2 events ensures
            // there is data in the video

            video.addEventListener('playing', function () {
                playing = true;
                checkReady();
            }, true);

            video.addEventListener('timeupdate', function () {
                timeupdate = true;
                checkReady();
            }, true);

            video.src = url;
            video.play();

            function checkReady() {
                if (playing && timeupdate) {
                    copyVideo = true;
                }
            }

            return video;
        }

        function initBuffers() {
            const positionBuffer = gl.createBuffer();

            gl.bindBuffer(gl.ARRAY_BUFFER, positionBuffer);

            const positions = [
                // Front face
                -1.0, -1.0, 1.0,
                1.0, -1.0, 1.0,
                1.0, 1.0, 1.0,
                -1.0, 1.0, 1.0,

                // Back face
                -1.0, -1.0, -1.0,
                -1.0, 1.0, -1.0,
                1.0, 1.0, -1.0,
                1.0, -1.0, -1.0,

                // Top face
                -1.0, 1.0, -1.0,
                -1.0, 1.0, 1.0,
                1.0, 1.0, 1.0,
                1.0, 1.0, -1.0,

                // Bottom face
                -1.0, -1.0, -1.0,
                1.0, -1.0, -1.0,
                1.0, -1.0, 1.0,
                -1.0, -1.0, 1.0,

                // Right face
                1.0, -1.0, -1.0,
                1.0, 1.0, -1.0,
                1.0, 1.0, 1.0,
                1.0, -1.0, 1.0,

                // Left face
                -1.0, -1.0, -1.0,
                -1.0, -1.0, 1.0,
                -1.0, 1.0, 1.0,
                -1.0, 1.0, -1.0,
            ];
            for(let i = 0; i < positions.length; i++)
                positions[i] *= .4

            gl.bufferData(gl.ARRAY_BUFFER, new Float32Array(positions), gl.STATIC_DRAW);

            const textureCoordBuffer = gl.createBuffer();
            gl.bindBuffer(gl.ARRAY_BUFFER, textureCoordBuffer);

            const textureCoordinates = [
                // Front
                0.0, 0.0,
                1.0, 0.0,
                1.0, 1.0,
                0.0, 1.0,
                // Back
                0.0, 0.0,
                1.0, 0.0,
                1.0, 1.0,
                0.0, 1.0,
                // Top
                0.0, 0.0,
                1.0, 0.0,
                1.0, 1.0,
                0.0, 1.0,
                // Bottom
                0.0, 0.0,
                1.0, 0.0,
                1.0, 1.0,
                0.0, 1.0,
                // Right
                0.0, 0.0,
                1.0, 0.0,
                1.0, 1.0,
                0.0, 1.0,
                // Left
                0.0, 0.0,
                1.0, 0.0,
                1.0, 1.0,
                0.0, 1.0,
            ];

            gl.bufferData(gl.ARRAY_BUFFER, new Float32Array(textureCoordinates),
                gl.STATIC_DRAW);

            // Build the element array buffer; this specifies the indices
            // into the vertex arrays for each face's vertices.

            const indexBuffer = gl.createBuffer();
            gl.bindBuffer(gl.ELEMENT_ARRAY_BUFFER, indexBuffer);

            // This array defines each face as two triangles, using the
            // indices into the vertex array to specify each triangle's
            // position.

            const indices = [
                0, 1, 2, 0, 2, 3,    // front
                4, 5, 6, 4, 6, 7,    // back
                8, 9, 10, 8, 10, 11,   // top
                12, 13, 14, 12, 14, 15,   // bottom
                16, 17, 18, 16, 18, 19,   // right
                20, 21, 22, 20, 22, 23,   // left
            ];

            gl.bufferData(gl.ELEMENT_ARRAY_BUFFER,
                new Uint16Array(indices), gl.STATIC_DRAW);

            return {
                position: positionBuffer,
                textureCoord: textureCoordBuffer,
                indices: indexBuffer,
            };
        }

        function initTexture() {
            const texture = gl.createTexture();
            gl.bindTexture(gl.TEXTURE_2D, texture);

            // might take a moment until it's ready so
            // put a single pixel in the texture so we can
            // use it immediately.
            const level = 0;
            const internalFormat = gl.RGBA;
            const width = 1;
            const height = 1;
            const border = 0;
            const srcFormat = gl.RGBA;
            const srcType = gl.UNSIGNED_BYTE;
            const pixel = new Uint8Array([0, 0, 255, 255]);  // opaque blue
            gl.texImage2D(gl.TEXTURE_2D, level, internalFormat,
                width, height, border, srcFormat, srcType,
                pixel);

            // Turn off mips and set wrapping to clamp to edge so it
            // will work regardless of the dimensions of the video.
            gl.texParameteri(gl.TEXTURE_2D, gl.TEXTURE_WRAP_S, gl.CLAMP_TO_EDGE);
            gl.texParameteri(gl.TEXTURE_2D, gl.TEXTURE_WRAP_T, gl.CLAMP_TO_EDGE);
            gl.texParameteri(gl.TEXTURE_2D, gl.TEXTURE_MIN_FILTER, gl.LINEAR);

            return texture;
        }

        function updateVideoTexture(gl, texture, video) {
            const level = 0;
            const internalFormat = gl.RGBA;
            const srcFormat = gl.RGBA;
            const srcType = gl.UNSIGNED_BYTE;
            gl.bindTexture(gl.TEXTURE_2D, texture);
            gl.texImage2D(gl.TEXTURE_2D, level, internalFormat,
                srcFormat, srcType, video);
        }

        function drawScene(gl, programInfo, buffers, texture, deltaTime) {
            gl.clearColor(0.0, 0.0, 0.0, 1.0);  // Clear to black, fully opaque
            gl.clearDepth(1.0);                 // Clear everything
            gl.enable(gl.DEPTH_TEST);           // Enable depth testing
            gl.depthFunc(gl.LEQUAL);            // Near things obscure far things

            gl.clear(gl.COLOR_BUFFER_BIT | gl.DEPTH_BUFFER_BIT);

            {
                const numComponents = 3;
                const type = gl.FLOAT;
                const normalize = false;
                const stride = 0;
                const offset = 0;
                gl.bindBuffer(gl.ARRAY_BUFFER, buffers.position);
                gl.vertexAttribPointer(
                    programInfo.attribLocations.vertexPosition,
                    numComponents,
                    type,
                    normalize,
                    stride,
                    offset);
                gl.enableVertexAttribArray(
                    programInfo.attribLocations.vertexPosition);
            }

            {
                const numComponents = 2;
                const type = gl.FLOAT;
                const normalize = false;
                const stride = 0;
                const offset = 0;
                gl.bindBuffer(gl.ARRAY_BUFFER, buffers.textureCoord);
                gl.vertexAttribPointer(
                    programInfo.attribLocations.textureCoord,
                    numComponents,
                    type,
                    normalize,
                    stride,
                    offset);
                gl.enableVertexAttribArray(
                    programInfo.attribLocations.textureCoord);
            }

            // Tell WebGL which indices to use to index the vertices
            gl.bindBuffer(gl.ELEMENT_ARRAY_BUFFER, buffers.indices);

            // Tell WebGL to use our program when drawing

            gl.useProgram(programInfo.program);

            // Specify the texture to map onto the faces.

            // Tell WebGL we want to affect texture unit 0
            gl.activeTexture(gl.TEXTURE0);

            // Bind the texture to texture unit 0
            gl.bindTexture(gl.TEXTURE_2D, texture);

            // Tell the shader we bound the texture to texture unit 0
            gl.uniform1i(programInfo.uniformLocations.uSampler, 0);

            {
                const vertexCount = 36;
                const type = gl.UNSIGNED_SHORT;
                const offset = 0;
                gl.drawElements(gl.TRIANGLES, vertexCount, type, offset);
            }
        }

        function initShaderProgram(gl, vsSource, fsSource)
        {
            const vertexShader = loadShader(gl.VERTEX_SHADER, vsSource);
            const fragmentShader = loadShader(gl.FRAGMENT_SHADER, fsSource);

            const shaderProgram = gl.createProgram();
            gl.attachShader(shaderProgram, vertexShader);
            gl.attachShader(shaderProgram, fragmentShader);
            gl.linkProgram(shaderProgram);

            if (!gl.getProgramParameter(shaderProgram, gl.LINK_STATUS))
            {
                alert('Unable to initialize the shader program: ' + gl.getProgramInfoLog(shaderProgram));
                return null;
            }

            return shaderProgram;
        }

        function loadShader(type, source) {
            const shader = gl.createShader(type);
            gl.shaderSource(shader, source);
            gl.compileShader(shader);
            if (!gl.getShaderParameter(shader, gl.COMPILE_STATUS)) {
                alert('An error occurred compiling the shaders: ' + gl.getShaderInfoLog(shader));
                gl.deleteShader(shader);
                return null;
            }

            return shader;
        }
    }





    return () =>{}
}