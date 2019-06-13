attribute vec2 aTexCoord;
varying vec2 vUv; //where you are in world (screen?) coordinates? clip space?

void main(void)
{
	gl_Position = projectionMatrix * modelViewMatrix * vec4(position, 1.0);
	vUv = vec2(gl_Position);
}