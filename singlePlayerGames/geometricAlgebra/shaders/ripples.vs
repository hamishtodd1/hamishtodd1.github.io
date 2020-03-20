uniform float time;
uniform float cornerToCornerDistance;

vec3 worldBottomRightToTopLeftNormalized;

void main() 
{
	vec4 worldPosition = modelMatrix * vec4(position,1.);
	float howFarAlongDiagonal = dot( worldPosition, worldBottomRightToTopLeftNormalized );
	#define amplitude .3;
	worldPosition.z = amplitude * sin( howFarAlongDiagonal * time );

	gl_Position = projectionMatrix * viewMatrix * worldPosition;
}