/*
	So we choose a vanishing point

	We can then tear and attach the whole lot. Problem: with movement, previous frames will be off
	Could try to keep track of that

	Could try to make, not a rectangle, but that one-layer-spiral shape
	Coooooould try to do it with a mesh
	Then the next one-layer-spiral goes on top

	For the sake of your sanity, imagine making a slightly-broken frame to go in a normal world
		It goes in a rectangular frame
		Don't think about the next layer, that's in there, you needn't worry about it

	send to douglas hofstadter
	Try training a resnet on this shit

	Do you haaaave to do it on all at once?

	There IS a "furthest out" frame, you just hide that fact

	Juuuuuust tear the whole lot. Vertex shader!
		You're not allowed to tear and move simultaneously, and can only move hand slowly
	An alternative is to try to think of the layers as annuli in which you draw stuff. Leave off the frame within a frame

	Maybe you can close it up?

	You are drawing something to be imposed on a background
		Don't worry about the background, it could be blackness, "the beginning of time"
*/

uniform sampler2D lastFrame;
varying vec2 ndc; //centered, real-space coordinates

//with this and ndc, center is origin
//positions on the camera near plane
uniform vec2 framePosition;
uniform vec2 bottom;
uniform vec2 side;

uniform vec2 exponent;

#define TAU 6.28318530718
const vec2 tauI = vec2(0.,TAU);

// // https://github.com/anvaka/pplay/blob/master/src/util/shaders/complex.glsl many nice things
float sq(float a)
{
	return a*a;
}

float lengthSq(vec2 a) //haha there again length() is probably hardware accelerated
{
	return sq(a.x) + sq(a.y);
}

vec2 complexToPolar(vec2 c)
{
	return vec2(length(c), atan(c.y, c.x));
}

vec2 polarToComplex(vec2 a) //r,theta
{
	return vec2(a.x * cos(a.y), a.x * sin(a.y));
}

vec2 divideComplex(vec2 a, vec2 b)
{
	return vec2(
		a.x * b.x + a.y * b.y,
		a.y * b.x - a.x * b.y) / lengthSq(b);
}

vec2 powComplex(vec2 a, vec2 b)
{
	vec2 polar = complexToPolar(a);
	return polarToComplex( vec2(
		pow(polar.x, b.x) * exp(-b.y * polar.y),
		b.x * polar.y + b.y * log(polar.x)
	) );
}

// //branching mofo
vec2 lnComplex( vec2 c )
{
	vec2 polar = complexToPolar(c);
	return vec2(log(polar.x), polar.y);
}

vec2 logComplex(vec2 a, vec2 base)
{
	return divideComplex( lnComplex(a), lnComplex(base) );
}

vec2 escherToDroste(vec2 escher)
{
	return powComplex(escher,exponent);
}

vec2 drosteToEscher(vec2 droste)
{
	return logComplex(droste,exponent);
}

void main()
{
	vec2 c = ndc;

	// c = drosteToEscher(c);

	// vec2 pRelative = ndc - framePosition;
	// vec2 frameP = vec2(
	// 	dot(pRelative,bottom) / sq( length(bottom) ),
	// 	dot(pRelative,side)   / sq( length(side) ) ); //could be uniforms

	// vec2 polar = complexToPolar(ndc);
	// float l = log(polar.x);
	// vec2 t = polarToComplex( vec2(l, polar.y) );

	vec2 p = ndc;
	vec2 nextLayerP;
	float bottomInverseLengthSq = 1. / sq( length(bottom) );
	float sideInverseLengthSq = 1. / sq( length(side) );
	for(int i = 0; i < 5; i++)
	{
		nextLayerP.x = dot(p-framePosition,bottom) * bottomInverseLengthSq;
		nextLayerP.y = dot(p-framePosition,side)   * sideInverseLengthSq;
		if( nextLayerP.x < 0. || 1. < nextLayerP.x ||
			nextLayerP.y < 0. || 1. < nextLayerP.y )
		{
			gl_FragColor = vec4( 0.,1.,0., 1. );
		}
		else
		{
			gl_FragColor = vec4( 1.,0.,0., 1. );
		}

		// return;
	}

	vec2 t = p;// * .5 + vec2(.5,.5);
	// if( t.x < 0. || 1. < t.x ||
	// 	t.y < 0. || 1. < t.y )
	// {
	// 	//because apparently clamping is being ignored!
	// 	gl_FragColor = vec4( 1.,0.,0.,1. );
	// }
	// else
	{
		// gl_FragColor = vec4( texture2D(lastFrame,t).rgb, 1. );
	}
}