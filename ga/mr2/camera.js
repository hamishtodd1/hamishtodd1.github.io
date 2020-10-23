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
        gl.uniform1f(program.uniformLocations.rightAtZZero, mainCamera.rightAtZZero);
        gl.uniform1f(program.uniformLocations.topAtZZero, mainCamera.topAtZZero);
        gl.uniform1f(program.uniformLocations.frontAndBackZ, mainCamera.frontAndBackZ);
        gl.uniform1f(program.uniformLocations.frameCount, frameCount);
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