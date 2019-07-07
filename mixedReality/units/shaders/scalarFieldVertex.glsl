varying vec4 worldSpacePixelPosition;
uniform vec3 scalarFieldCameraPosition;

void main() 
{
	worldSpacePixelPosition = modelMatrix * vec4( position, 1. );
	gl_Position = projectionMatrix * modelViewMatrix * vec4(position, 1.0);
}