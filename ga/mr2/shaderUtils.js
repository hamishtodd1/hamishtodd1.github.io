const mainCamera = {
    topAtZZero: 0.,
    rightAtZZero: 0.,
    frontAndBackZ: 0.,
}

const cameraAndFrameCountShaderStuff = {
    header: `
        uniform float frontAndBackZ;
        uniform float rightAtZZero;
        uniform float topAtZZero;
        uniform float frameCount;
    `,
    locateUniforms: function (program) {
        program.locateUniform("rightAtZZero")
        program.locateUniform("topAtZZero")
        program.locateUniform("frontAndBackZ")
        program.locateUniform("frameCount")
    },
    transfer: function (program) {
        gl.uniform1f(program.getUniformLocation("rightAtZZero"), mainCamera.rightAtZZero);
        gl.uniform1f(program.getUniformLocation("topAtZZero"), mainCamera.topAtZZero);
        gl.uniform1f(program.getUniformLocation("frontAndBackZ"), mainCamera.frontAndBackZ);
        gl.uniform1f(program.getUniformLocation("frameCount"), frameCount);
    },
    footer: `
            gl_Position.x /= rightAtZZero;
            gl_Position.y /= topAtZZero;
            gl_Position.z /= frontAndBackZ;
        }
    `
}

const shaderHeader = `
precision mediump float;
#define PI 3.14159265359
#define TAU 6.28318530718
#define TETRAHEDRAL_ANGLE 1.9106332362490186
`
const shaderHeaderWithCameraAndFrameCount = shaderHeader + cameraAndFrameCountShaderStuff.header

let hueToFragColorChunk = `
    hue = fract(hue);

    gl_FragColor = vec4(0., 0., 0., 1.);
    float hexagonalPart = floor(hue * 6.);
    float factor = hue * 6. - hexagonalPart;

    gl_FragColor.r = 
        hexagonalPart == 2. || hexagonalPart == 3. ? 0. :
        hexagonalPart == 0. || hexagonalPart == 5. ? 1. :
        hexagonalPart == 4. ? factor : 1.-factor;
    gl_FragColor.g = 
        hexagonalPart == 4. || hexagonalPart == 5. ? 0. :
        hexagonalPart == 1. || hexagonalPart == 2. ? 1. :
        hexagonalPart == 0. ? factor : 1.-factor;
    gl_FragColor.b = 
        hexagonalPart == 0. || hexagonalPart == 1. ? 0. :
        hexagonalPart == 3. || hexagonalPart == 4. ? 1. :
        hexagonalPart == 2. ? factor : 1.-factor;
`
//project the faces of the cube onto the sphere at infinity