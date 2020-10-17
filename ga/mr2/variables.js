const canvas = document.createElement("CANVAS")
document.body.appendChild(canvas)
const gl = canvas.getContext("webgl2")
if (!gl)
    console.error("Failed to get WebGL context, browser or device may not support WebGL.")

const mainCamera = {
    topAtZZero:0.,
    rightAtZZero:0.,
    frontAndBackZ: 0.,
}

const renderFunctions = []

const shaderHeader = `
precision mediump float;
#define PI 3.14159265359
#define TAU 6.28318530718
#define TETRAHEDRAL_ANGLE 1.9106332362490186

uniform float frontAndBackZ;
uniform float rightAtZZero;
uniform float topAtZZero;
uniform float frameCount;
`

let unchangingUnitSquareVertices = Array()
let quadBuffer = new Float32Array(6 * 4)

let backgroundString = "      \n \n      "

let backgroundColor = [127, 127, 127];