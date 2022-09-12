let animationStates = {}

BOOG = false

let clientXOld = 0
let clientYOld = 0
let caretPositionOld = -1

const FULL_SCREEN_QUAD_MATRIX = new THREE.Matrix4()

const variables = []
const appearanceTypes = []
const dws = {}

const INFINITY_RADIUS = 1.
const pointGeo = new THREE.SphereBufferGeometry(.1, 32, 16)

let generalShaderPrefix = `
uniform float[16] overrideFloats;
uniform int overrideMentionIndex;
`

const basicVertex = `
varying vec4 coord;
varying vec2 frameCoord;

void main()
{
	coord = modelMatrix * vec4(position, 1.);
	frameCoord = position.xy + .5;

    gl_Position = projectionMatrix * modelViewMatrix * vec4(position, 1.);
}`

const noiseFragment = `
//this you can paste into shadertoy
void mainImage( out vec4 fragColor, in vec2 fragCoord )
{
    vec2 p = fragCoord/iResolution.x;
    vec2 uv = p*0.1;	
	
	float textureResolution = iChannelResolution[0].x;
	uv = uv*textureResolution + 0.5;
	vec2 iuv = floor( uv );
	vec2 fuv = fract( uv );
	uv = iuv + fuv*fuv*(3.0-2.0*fuv);
	uv = (uv - 0.5)/textureResolution;
	vec3 colB = texture( iChannel0, uv ).xyz;
	
	
    fragColor = vec4( vec3(colB.r < .5 ? 1. : 0.), 1.0 );
}

//possibly needs to be 4D because different planes
//voronoise might be better
float nrand( vec3 n )
{
	return fract(sin(dot(n.xy + n.z, vec2(12.9898, 78.233)))* 43758.5453);
}
`