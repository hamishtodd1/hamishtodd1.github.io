/*
	
*/

uniform float theta1;
uniform float r1; //can be a negative number
uniform float theta2;
uniform float r2;

uniform bool positive;

varying vec2 modelPosition;

#define pi 3.1415926535897932384626433832795

void main()
{
	float theta = atan(modelPosition.y,modelPosition.x); // [-pi,pi], x axis is 0
	float r = length(modelPosition);

	float thetaRelative = 0.;
	thetaRelative = abs(theta1 - theta); //don't be surprised if there's weirdness at x = -1
	float projected1 = r * cos(thetaRelative);
	thetaRelative = abs(theta2 - theta);
	float projected2 = r * cos(thetaRelative);
	
	if( projected1 > r1 || projected2 > r2 )
		discard;

	if(positive)
		gl_FragColor = vec4(0.28515625,.7421875,.328125,1.);
	else
		gl_FragColor = vec4(0.203125,0.,.2578125,1.);
}