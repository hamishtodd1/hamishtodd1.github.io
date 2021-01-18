precision highp float;

varying vec2 vUV;
uniform sampler2D oldState;

uniform float deltaTime;

uniform vec2 brush;
uniform vec2 dimensions;

const float d=1./512.,dth2=.2;

void main (void)
{
	float valueOneTimestepAgo=texture2D(oldState,vUV).g;
	float currentValue=texture2D(oldState,vUV).r;
	float newValue = 2.*currentValue-valueOneTimestepAgo+
		(texture2D(oldState,vec2(vUV.x,vUV.y+d)).r+
		 texture2D(oldState,vec2(vUV.x,vUV.y-d)).r+
		 texture2D(oldState,vec2(vUV.x+d,vUV.y)).r+
		 texture2D(oldState,vec2(vUV.x-d,vUV.y)).r+
		-4.*currentValue)*dth2;
	newValue *= .999; //gross
	gl_FragColor = vec4(newValue,currentValue,0.,0.);

	if( 0. < brush.x && brush.x < 1. &&
		0. < brush.y && brush.y < 1. )
	{
		gl_FragColor.r += .005*exp(-1000.*length(brush-vUV)*length(brush-vUV));
	}
}