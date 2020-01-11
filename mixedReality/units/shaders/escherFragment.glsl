/*
	Idea for translation:
		The  homogeneous matrix. Want n such that M^n a = b
		Need to think more thoroughly about final goal, but diagonalization may let you take the log correctly

	


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

uniform sampler2D unmolestedFrame;
varying vec2 texturePosition;

//bottom left is origin, top right is 1,1, like on a texture
uniform vec2 framePosition;
uniform vec2 bottom;
uniform vec2 side;

uniform float escherness;

// uniform vec2 exponent;

#define TAU 6.28318530718
#define PI 3.14159265359
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
	float betweenMinusPiAndPi = atan(c.y, c.x);
	return vec2(length(c), betweenMinusPiAndPi > 0. ? betweenMinusPiAndPi : betweenMinusPiAndPi + TAU );
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

// vec2 escherToDroste(vec2 escher)
// {
// 	return powComplex(escher,exponent);
// }

// vec2 drosteToEscher(vec2 droste)
// {
// 	return logComplex(droste,exponent);
// }

vec2 ndcToTexture(vec2 ndc)
{
	return ndc * .5 + vec2(.5,.5);
}
vec2 textureCoordsToNormalizedDeviceCoords(vec2 t)
{
	return t * 2. - vec2(1.,1.);
}

//just do it in log space, which is translationally symmetric!
vec2 textureToDroste(vec2 originalP)
{
	float bottomInverseLengthSq = 1. / sq( length(bottom) );
	float sideInverseLengthSq = 1. / sq( length(side) );

	//we go one layer out
	vec2 p = originalP.x * bottom + originalP.y * side + framePosition;

	vec2 pNextLayer;
	for(int i = 0; i < 24; i++)
	{
		pNextLayer.x = dot(p-framePosition,bottom) * bottomInverseLengthSq;
		pNextLayer.y = dot(p-framePosition,side)   * sideInverseLengthSq;
		if( pNextLayer.x < 0. || 1. < pNextLayer.x ||
			pNextLayer.y < 0. || 1. < pNextLayer.y )
		{
			break;
		}
		else
		{
			p.x = pNextLayer.x;
			p.y = pNextLayer.y;
		}
	}
	return p;
}
// incomplete alternative to the above
//that also allows for infinity
//come back once you understand translation
// vec2 positionInFundamentalDomain = vec2(
// 	mod(pLogSpace.x,logScaleFactor),
// 	mod(pLogSpace.y,1.)
// );
// float frameEdgeForThisAngle = exp( positionInFundamentalDomain.y / 4. );
// if( positionInFundamentalDomain.x < frameEdgeForThisAngle )
// {
// 	positionInFundamentalDomain.x += logScaleFactor
// }

void main()
{
	//put monitor in front of you and put your arms around it and join them

	//the split must be in the right place
	//twist might be good first

	//a^b r*e^i*t ^ b = r^b * e ^ it
	//a single iteration is a multiplication by a complex number z. So it's multiplication by z ^ magnitude
	//so... "shift it back to being aligned"!

	//4 degrees of freedom

	// {
		float scaleFactor = length(bottom);
		float logScaleFactor = log(scaleFactor); //could optimize this away, but need to work on everything first

		// vec2 placeToArcLeftwardToFromOriginTextureCoord = framePosition + bottom + .5 * side;
		// vec2 placeToArcLeftwardToFromOrigin = textureCoordsToNormalizedDeviceCoords(placeToArcToFromOrigin);
		// vec2 leftwardArcLogSpace = logComplex(placeToArcLeftwardToFromOrigin);
		// leftwardArcLogSpace.y /= TAU;

		vec2 leftwardArcLogSpace = vec2(-1.,0.);
		
		vec2 upwardArcLogSpace = vec2(-escherness*.5,1.);

		//things line up so long as these are on lattice points?
	// }

	vec2 ndc = textureCoordsToNormalizedDeviceCoords(texturePosition);
	vec2 polar = complexToPolar(ndc);

	//strip has height / vertical period 1, horizontal period logScaleFactor
	vec2 pLogSpace = vec2( log(polar.x), polar.y / TAU );
	//want to incorporate placeToArcToFromOrigin.y, 

	vec2 newStripPosition = -pLogSpace.x * leftwardArcLogSpace + pLogSpace.y * upwardArcLogSpace;

	


	vec2 newPolar = vec2(exp(newStripPosition.x), newStripPosition.y * TAU );
	vec2 newC = polarToComplex(newPolar);
	vec2 t = ndcToTexture(newC);

	vec2 finalT = textureToDroste(t);

	gl_FragColor = vec4( texture2D(unmolestedFrame,finalT).rgb, 1. );
	return;
}