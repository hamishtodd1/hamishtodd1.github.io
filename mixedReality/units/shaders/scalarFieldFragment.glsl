/*
	TODO
		MRI
		Arbitrary extra cylinders, spheres and cones
		Combine with your simulator, for andrew
		Make it editable
		Tricubic thing
			You put the coefficients in a texture (or two) and then nearest neighbour within each voxel
			But it's really probably not noticeable
				It's only intended for the volume data, so check with that
		ultrasound-esque slicing
		Ask George about
			removing branchings
			reading a teeny bit out, eg the normalization redness
		Control color mapping
			Any color mapping is a line throught the RGB cube

	Need your cone outside the sphere, therefore we have to go beyond the sphere

	Other ideas
		constructive/destructive interference in many dimensions
		Three overlapping scalar fields with all values > 0?
			Direction. It's enclosed by your rainbow-banded sphere, color is what it's attracted to
			Concentrations of three chemicals
		Tensor fields
			"The visualization of 3D stress and strain tensor fields"
			Interactive tensor field design and visualization on surfaces
			"Tensor field design in volumes" Two versions with different pictures at least
				probably better: https://web.engr.oregonstate.edu/~zhange/images/3Dtensor_design.pdf
				https://www.researchgate.net/publication/311097782_Tensor_field_design_in_volumes

	"Top 7 scalar fields / algebraic varieties"
		wavefunctions
		Reaction diffusion
		MRI
		Diffusion tensor
		ask folks at ICERM
		Florian stuff
		What's the equivalent of a 3D contour map that you'd use lots of contour lines to indicate?
			lots of saddle points. What's a 3D saddle point?
			A pathologically bad-for-contour-surfaces example. Something where all contour surfaces are tiny?
		Evelyn Lamb's multiplying surfaces thing (union)

	Presentation
		Blending?
			Disadvantage
				Black background makes it easier to think about what you're seeing, nothing to try to remove
			Need to know exactly what threejs does
			Need to know exactly how smoke affects color
		You know it definitely needs SOME limitations
		Could blend with background
		Spheres look nice and make it so you aren't distracted by the shape of the thing
		Can have sphere without it affecting complexity of course
		Better might be a pair of planes
		Is it a region you're moving shit around in, or objects you're picking up?
		Objects you pick up dude, this is not cootVR
		Yet you do want to move them around inside that ball
	
	http://www.shaderific.com/glsl-functions
	https://mrob.com/pub/comp/xmorphia/ - ideal colorings for reaction diffusion
*/

precision highp float;
precision mediump sampler3D;
uniform sampler3D data;
uniform float dataDimension;

varying vec4 worldSpacePixelPosition;

uniform mat4 matrixWorldInverse;

uniform vec3 scalarFieldPointLightPosition;
uniform float renderRadius;
uniform float renderRadiusSquared;

const bool doIsosurface = true;
const bool doGas = true;

uniform float isolevel;




//------------GENERIC

float lengthSq(vec3 v)
{
	return dot(v,v);
}

float sq(float a)
{
	return a*a;
}

// float tanh(float x)
// {
// 	float exp2x = exp(2. * x); // sure you wanna do this so much?
// 	return (exp2x - 1.) / (exp2x + 1.);
// }

float levelOfEllipticCurveSpace(vec3 p)
{
	vec3 scaledP = p * 20.;
	float val = scaledP.y*scaledP.y - scaledP.x*scaledP.x*scaledP.x - scaledP.z*scaledP.x;
	return isolevel - val;
}
vec3 gradientOfEllipticCurveSpace(vec3 p)
{
	vec3 scaledP = p * 20.;
	return -vec3(3.*scaledP.x*scaledP.x+scaledP.z,2.*scaledP.y,scaledP.x);
}

float fourDConeThatIsZeroAtRadius(vec3 p)
{
	float radius = 0.03;
	return radius - length(p);
}

//working on this
float differenceAccentuator(float value)//,float expectedMin,float expectedMax)
{
	return ( tanh( value ) + 1. ) / 2.;
}
float zeroAccentuator(float value)//,float expectedMin,float expectedMax)
{
	return 1. / value;
}

vec2 sphereIntersectionDistances( vec3 origin, vec3 direction, vec3 center, float rSquared )
{
	vec3 centerToOrigin = origin - center;

	float a = lengthSq(direction);
	float b = 2. * dot(direction,centerToOrigin);
	float c = lengthSq(center) + lengthSq(origin) - 2. * dot(center,origin) - rSquared;

	float squareRootedPart = b*b - 4. * a * c;
	if( squareRootedPart > 0. )
	{
		float t1 = (-b+sqrt(squareRootedPart)) / (2.*a);
		float t2 = (-b-sqrt(squareRootedPart)) / (2.*a);
		if(t1 < t2)
		{
			return vec2(t1,t2);
		}
		else if(t2 < t1)
		{
			return vec2(t2,t1);
		}
	}

	return vec2(0.,0.);
}








//------------------Texture

float getTextureLevel(vec3 p)
{
	// if(p.z < 0.)
	// {
	// 	return 1.;
	// }
	// else
	// {
	// 	return 0.;
	// }

	//the corners of the texture are 0s and 1s
	//a bit better:
		//each voxel is an integer
		//cut off the half-pixels at the edges. Means there's an odd number!

	//p.x = renderRadius -> 1 - 0.5 / dataDimension
	//p.x =-renderRadius -> 0 + 0.5 / dataDimension
	float radiusInTexture = 0.5 - 0.5 / dataDimension;
	vec3 textureSpaceP = p / renderRadius * radiusInTexture + 0.5;

	float textureSample = texture( data, textureSpaceP.xyz ).r;
	return textureSample - isolevel;
}

vec2 renderCubeIntersectionDistances( vec3 origin, vec3 direction )
{ 
	vec2 intersectionDistances = vec2(0.,0.);
	int insertionIndex = 0;
	int i = 0; //got a warning saying this makes things slow?
	vec3 intersection;
	float planeCoord, planeIntersectionDistance, j;

	for(i; i < 3; i++)
	{
		for(j = 0.; j <= 1.; j++)
		{
			planeCoord = (j * 2. - 1.) * renderRadius;
			planeIntersectionDistance = (planeCoord - origin[i]) / direction[i];

			intersection = origin + direction * planeIntersectionDistance;
			if( -renderRadius < intersection[(i+1)%3] && intersection[(i+1)%3] < renderRadius &&
				-renderRadius < intersection[(i+2)%3] && intersection[(i+2)%3] < renderRadius )
			{
				intersectionDistances[insertionIndex] = max( planeIntersectionDistance, 0. );
				insertionIndex = 1-insertionIndex;
			}
		}
	}

	int lowerIndex = intersectionDistances[0] < intersectionDistances[1] ? 0:1;
	vec2 orderedIntersectionDistances = vec2(intersectionDistances[lowerIndex],intersectionDistances[1-lowerIndex]);

	return orderedIntersectionDistances;
}

/*
Two weeks!

Make Andrew thing
	-> Andrew can sign off on topology and geometry
	-> Hotel booking
Get starting date -> Rent out flat
	->have money, can book plane
	->can get reimbursed

Release
Case study
Tests
Thesis chapters
Proof read
Publication


Group meeting:
	Planning a video
	And a basic idea of the history
	Imagine that you've got to communicate everything the next generation will know about reaction diffusion systems
		1000 words
		As many videos as you want
		300 words on history
	I want you to give me examples, AS MANY AS POSSIBLE
	The best examples are videos
		Paul Sutcliffe had a fitzhugh nagumo from heart
		jellyfish
		That little experiment
		The zebrafish thing
*/





//------------------------------FUNDAMENTAL
float getLevel( vec3 p )
{
	// return getTextureLevel(p);
	return levelOfEllipticCurveSpace(p);
}

vec3 numericalGradient(vec3 p) //very easy to work out for polynomials, y does not depend on x
{
	float valueHere = getLevel(p);
	float eps = 0.01;
	float x = ( valueHere - getLevel(p+vec3(eps,0.,0.)) ) / eps;
	float y = ( valueHere - getLevel(p+vec3(0.,eps,0.)) ) / eps;
	float z = ( valueHere - getLevel(p+vec3(0.,0.,eps)) ) / eps;

	return vec3(x,y,z);
}

vec3 getNormal(vec3 p)
{
	// float textureSample = texture3D(data, vec3(0.,0.,0.)).r;
	// return normalize( numericalGradient(p) );
	return gradientOfEllipticCurveSpace(p);
	// return vec3(1.,0.,0.);
}

float getLightIntensityAtPoint(vec3 p, vec3 viewerDirection, vec3 normal )
{
	float ks = .3;
	float kd = .3;
	float ka = .6;
	float shininess = 1.;
	float ambientIntensity = 1.;
	float pointLightDiffuse = 1.;
	float pointLightSpecular = 1.;

	float intensity = ka * ambientIntensity;
	// for(lights)
	{
		vec3 pointLightDirection = normalize(scalarFieldPointLightPosition - p);
		intensity += kd * dot( pointLightDirection, normal ) * pointLightDiffuse;

		vec3 perfectlyReflectedDirection = 2. * dot(pointLightDirection, normal) * normal - pointLightDirection;
		intensity += ks * pow( dot( perfectlyReflectedDirection, viewerDirection ), shininess ) * pointLightSpecular;
	}
	return intensity;
}






//---------------------HAND

//lousodrome.net/blog/light/2017/01/03/intersection-of-a-ray-and-a-cone/
const float cosSquaredTipAngle = 0.88; //1/8 of an angle
const vec3 downSpindle = vec3(0.,0.,1.);
const vec3 tip = vec3(0.019,-0.03,-0.17);
const float coneSizeSq = 0.0001;//0.038;
float distanceToHandCone( vec3 origin, vec3 direction )
{
	vec3 tipToOrigin = origin - tip;
	float tipToOriginDotDownSpindle = dot(tipToOrigin,downSpindle);
	float directionDotDownSpindle = dot(direction,downSpindle);

	float a = directionDotDownSpindle*directionDotDownSpindle - cosSquaredTipAngle;
	float b = 2. * ( directionDotDownSpindle * tipToOriginDotDownSpindle - dot(direction,tipToOrigin) * cosSquaredTipAngle );
	float c = tipToOriginDotDownSpindle * tipToOriginDotDownSpindle - dot(tipToOrigin,tipToOrigin) * cosSquaredTipAngle;

	float squareRootedPart = b*b - 4. * a * c;
	if( squareRootedPart > 0. )
	{
		float t1 = (-b+sqrt(squareRootedPart)) / (2.*a);
		float t2 = (-b-sqrt(squareRootedPart)) / (2.*a);
		float lesserT = t1<t2 ? t1:t2;
		if( lesserT > 0. )
		{
			vec3 tipToPoint = (origin + lesserT * direction) - tip;
			if( dot( downSpindle, tipToPoint ) > 0. && //not the top cone
				lengthSq(tipToPoint) < coneSizeSq //0.038 //within the length
				//maybe also don't show the underside
				)
			{
				return lesserT;
			}
		}
	}

	return 99999999.;
}
vec3 handConeSurfaceNormal(vec3 p) //assumed
{
	vec3 tipToPoint = p - tip;
	return normalize( cross( cross(downSpindle,tipToPoint), tipToPoint) );
}
void renderHand(vec3 p, vec3 viewerDirection)
{
	float intensity = getLightIntensityAtPoint( p, viewerDirection, handConeSurfaceNormal(p) );
	gl_FragColor.g += 0.6 * intensity;
	gl_FragColor.r += 0.6 * intensity;
	gl_FragColor.b += 0.6 * intensity;

	return;
}

// A(x^4+y^4+z^4+1)+Bxyz+C(x^2y^2+z^2)+D(x^2z^2+y^2)+E(z^2y^2+x^2).
// Run it with A,B,C,D,E = 
// [1,0,0,0,0]
// [1,0,5,0,0]
// [1,2,3,4,5]
// [425,0,-1025,-1025,1207]
// const float florianArray[5] = [0.,0.,0.,0.,0.];

// float florianPolynomial(vec3 p)
// {
// 	A*(p.x*p.x*p.x*p.x+p.y*p.y*p.y*p.y+p.z*p.z*p.z*p.z+1) + 
// 	B*p.x*p.y*p.z + 
// 	C*(p.x*p.x*p.y*p.y + p.z*p.z) + 
// 	D*(p.x*p.x*p.z*p.z + p.y*p.y) + 
// 	E*(p.z*p.z*p.y*p.y + p.x*p.x);
// }

//you're going to put your arm behind these things, so the "back" might be quite close












//-------------------------loop

//want these outside really
void main()
{
	vec3 scalarFieldPixelPosition = vec3( matrixWorldInverse * worldSpacePixelPosition );
	vec3 scalarFieldCameraPosition = vec3( matrixWorldInverse * vec4(cameraPosition,1.) );
	vec3 direction = normalize( scalarFieldPixelPosition - scalarFieldCameraPosition );

	float handDistance = distanceToHandCone( scalarFieldPixelPosition, direction );

	float nearestDistanceOfNonVolumeObject = handDistance; //could be cylinders and balls in there

	vec2 volumeIntersectionDistances = renderCubeIntersectionDistances( scalarFieldPixelPosition, direction );
	// vec2 volumeIntersectionDistances = sphereIntersectionDistances( scalarFieldPixelPosition, direction, vec3(0.,0.,0.), renderRadiusSquared );

	if( !(volumeIntersectionDistances[0] == 0. && volumeIntersectionDistances[1] == 0.) &&
		volumeIntersectionDistances[0] < nearestDistanceOfNonVolumeObject )
	{
		gl_FragColor = vec4( 0.,0.,0., 1.0 );

		float stepLength = (volumeIntersectionDistances[1] - volumeIntersectionDistances[0]) / 80.;

		float stoppingDistance = min(
			nearestDistanceOfNonVolumeObject - volumeIntersectionDistances[0],
			volumeIntersectionDistances[1]   - volumeIntersectionDistances[0] );

		vec3 probeStart = scalarFieldPixelPosition + direction * volumeIntersectionDistances[0];
		float probeDistance = 0.;
		float oldLevel = getLevel( probeStart );
		float newLevel;

		float solutionProportionThroughThisStepAssumingLinearity;

		for(float i = 1.; probeDistance < stoppingDistance; i++)
		{
			probeDistance = i * stepLength;
			newLevel = getLevel( probeStart + probeDistance * direction );

			//not missing a hump means some crazy analysis
			//you could MAYBE try to solve in the case of that degree-10 interpolation polynomial
			//still better than marchingcubes
			solutionProportionThroughThisStepAssumingLinearity = -oldLevel / (newLevel-oldLevel);

			if( doIsosurface && 
				0. < solutionProportionThroughThisStepAssumingLinearity &&
				solutionProportionThroughThisStepAssumingLinearity <= 1. )
			{
				float isosurfaceProbeDistance = stepLength * (i-1. + solutionProportionThroughThisStepAssumingLinearity);

				if( sign(oldLevel) != -1. )
				{
					probeDistance = isosurfaceProbeDistance;
					newLevel = getLevel( probeStart + probeDistance * direction );
				}
				else
				{
					float gridThickness = 0.0009;
					float gridSpacing = gridThickness * 15.;

					vec3 p = probeStart + isosurfaceProbeDistance * direction;
					vec3 normal = getNormal(p);
					float minDist = 99999.;
					for(int i = 0; i < 3; i++)
					{
						float pointToRoundingPlane = round(p[i]/gridSpacing)*gridSpacing - p[i];

						vec3 roundingPlaneNormal = vec3(0.,0.,0.);
						roundingPlaneNormal[i] = sign(pointToRoundingPlane);

						float cosTheta = dot(roundingPlaneNormal,normal);
						float cosAlpha = sqrt(1.-sq(cosTheta)); // = sinTheta

						float distToRoundingPlaneOnPlanarApproximationToSurface = abs(pointToRoundingPlane) / cosAlpha;

						minDist = min(minDist, distToRoundingPlaneOnPlanarApproximationToSurface);
					}

					if( minDist < gridThickness )
					{
						probeDistance = isosurfaceProbeDistance;
						newLevel = getLevel( probeStart + probeDistance * direction );
					}
				}
			}

			if( stoppingDistance < probeDistance )
			{
				probeDistance = stoppingDistance ;
				newLevel = getLevel( probeStart + probeDistance * direction );
			}

			//"layers of colored glass"
			if(doGas)
			{
				float positiveContribution = 0.;
				float negativeContribution = 0.;
				float thisStepLength = probeDistance - stepLength * (i-1.);

				if(oldLevel > 0. && newLevel > 0.)
				{
					positiveContribution = .5 * abs(oldLevel - newLevel) + min(oldLevel,newLevel);
				}
				// else if(oldLevel < 0. && newLevel < 0.)
				// {
				// 	negativeContribution = .5 * abs(oldLevel - newLevel) + max(oldLevel,newLevel);
				// }
				else
				{
					if(oldLevel > newLevel)
					{
						positiveContribution = .5 * oldLevel *    solutionProportionThroughThisStepAssumingLinearity;
						negativeContribution = .5 * newLevel *(1.-solutionProportionThroughThisStepAssumingLinearity);
					}
					else
					{
						// negativeContribution = .5 * oldLevel *    solutionProportionThroughThisStepAssumingLinearity;
						// positiveContribution = .5 * newLevel *(1.-solutionProportionThroughThisStepAssumingLinearity);
					}
				}

				//ideally there is one pixel for which it reaches 1
				float dropoffAmountBoost = .1;
				float sizeBoost = 10.;

				if(positiveContribution != 0.)
				{
					gl_FragColor.b += (1. - abs(positiveContribution) * dropoffAmountBoost) * sizeBoost * thisStepLength;
				}
				// gl_FragColor.g += (1. - abs( negativeContribution ) * effectBoost) * 10.;
			}

			if(probeDistance == stoppingDistance )
			{
				break;
			}

			if( probeDistance < i * stepLength )
			{
				vec3 p = probeStart + probeDistance * direction;
				float intensity = getLightIntensityAtPoint( p, -direction, getNormal(p) );

				if( sign( oldLevel ) == 1. )
				{
					gl_FragColor.r += intensity;
				}
				else
				{
					gl_FragColor.g += intensity;
				}
				return;
			}

			oldLevel = newLevel;
		}
		
		//to help normalization
		// {
		// 	if( gl_FragColor.g > 1. )
		// 	{
		// 		gl_FragColor.r = 1.;// / gl_FragColor.g; //wanna read from this really
		// 		gl_FragColor.g = 0.;
		// 		gl_FragColor.b = 0.;
		// 	}
		// 	if( gl_FragColor.b > 1. )
		// 	{
		// 		gl_FragColor.r = 1.;// / gl_FragColor.b;
		// 		gl_FragColor.g = 0.;
		// 		gl_FragColor.b = 0.;
		// 	}
		// }
	}

	if( doIsosurface && !doGas )
	{
		if(nearestDistanceOfNonVolumeObject < 9999.)
		{
			renderHand( scalarFieldPixelPosition + nearestDistanceOfNonVolumeObject * direction, -direction );
		}
		else
		{
			discard;
		}
	}
}

// from stackoverflow.com/questions/4078401/trying-to-optimize-line-vs-cylinder-intersection
vec4 distanceToCylinderWithNormal(vec3 origin, vec3 direction, float cylinderRadius, float cylinderLength, vec3 cylinderPosition, vec3 cylinderDirection )
{
	vec3 n = cross(direction,cylinderDirection);
	float ln = length(n);
	normalize(n);

	float epsilon = 0.001;
	// Parallel?
	if( abs(ln) < epsilon )
	{
		return vec4(0.,0.,0.,0.);
	}

	vec3 cylinderPositionToOrigin = origin - cylinderPosition;
	float d = abs( dot( cylinderPositionToOrigin, n ) );

	if( d <= cylinderRadius )
	{
		vec3 O = cross(cylinderPositionToOrigin,cylinderDirection);
		float t = -dot(O,n)/ln;

		O = cross(n,cylinderDirection);
		normalize(O);
		float s = abs( sqrt(cylinderRadius*cylinderRadius-d*d) / dot(direction,O) );
		float lambda;

		if( t-s < -epsilon )
		{
			if(t+s < -epsilon)
			{
				return vec4(0.,0.,0.,0.);
			}
			else
			{
				lambda = t+s;
			}
		}
		else if(t+s < -epsilon)
		{
			lambda = t-s;
		}
		else if(t-s<t+s)
		{
			lambda = t-s;
		}
		else
		{
			lambda = t+s;
		}

		vec3 localIntersection = origin + direction * lambda - cylinderPosition;
		float distanceAlongAxis = dot( localIntersection, cylinderDirection );
		if( 0. < distanceAlongAxis && distanceAlongAxis < cylinderLength )
		{
			vec3 normal = normalize(localIntersection - cylinderDirection * distanceAlongAxis);
			return vec4(lambda,normal.xyz);
		}
	}

	return vec4(0.,0.,0.,0.);
}

// {
// 	solids = Array()
// 	function getFront(o,d, solid)
// 	{	
// 	}

// 	float currentClosest = 99999.;
// 	int indexOfClosestSolid = -1;
// 	for(solids)
// 	{
// 		float front = 
// 		switch(solid)
// 		{
// 			case 0: 
// 		}
// 		getFront(o,d,solid)
// 		if( front < currentClosest )
// 		{
// 			indexOfClosestSolid = i;
// 			currentClosest = front;
// 		}
// 	}

// 	struct Gas
// 	{
// 		bool isTexture;
// 		mat4 matrixWorldInverse;
// 	};

// 	gases = Array()
// 	closestGasFront
// 	closestGasBack
// 	for(gases)
// 	{
// 		vec2 dists = sphereIntersectionDistances;

// 		switch( gas )
// 		{

// 		}
// 		//combined with cuboids if it's a texture
// 	}
// 	if(closestGasDist < closestSolidDist)
// 	{
// 		maxMarchingDistance = min(closestGasBack, closestSolidDist)

// 		//raymarch
// 	}

// 	if(closestSolidDist < 99999.)
// 	{
// 		draw(indexOfClosestSolid)
// 	}
// }


// int ijk2n(int i, int j, int k)
// {
// 	return(i+4*j+16*k);
// }
// void point2xyz(int p, int *x, int *y, int *z)
// {
// 	switch (p)
// 	{
// 		case 0: *x=0; *y=0; *z=0; break;
// 		case 1: *x=1; *y=0; *z=0; break;
// 		case 2: *x=0; *y=1; *z=0; break;
// 		case 3: *x=1; *y=1; *z=0; break;
// 		case 4: *x=0; *y=0; *z=1; break;
// 		case 5: *x=1; *y=0; *z=1; break;
// 		case 6: *x=0; *y=1; *z=1; break;
// 		case 7: *x=1; *y=1; *z=1; break;
// 		default:*x=0; *y=0; *z=0;
// 	}
// }

// double tricubic_eval(double a[64], vec3 p )
// {
// 	int i,j,k;
// 	double ret=(double)(0.0);
// 	/* TRICUBIC EVAL
// 		 This is the short version of tricubic_eval. It is used to compute
// 		 the value of the function at a given point (x,y,z). To compute
// 		 partial derivatives of f, use the full version with the extra args.
// 	*/
// 	for (i=0;i<4;i++)
// 	{
// 		for (j=0;j<4;j++)
// 		{
// 			for (k=0;k<4;k++)
// 			{
// 				ret+=a[ijk2n(i,j,k)]*pow(p.x,i)*pow(p.y,j)*pow(p.z,k);
// 			}
// 		}
// 	}
// 	return(ret);
// }

// double tricubic_eval(double a[64], double x, double y, double z, int derx, int dery, int derz)
// {
// 	int i,j,k;
// 	double ret=(double)(0.0);
// 	double cont;
// 	int w;
// 	/* TRICUBIC_EVAL 
// 		 The full version takes 3 extra integers args that allows to evaluate
// 		 any partial derivative of f at the point
// 		 derx=dery=derz=0 => f
// 		 derx=2 dery=derz=0 => d2f/dx2
// 		 derx=dery=derz=1 =? d3f/dxdydz
// 		 NOTICE that (derx>3)||(dery>3)||(derz>3) => returns 0.0
// 		 this computes   \frac{\partial ^{derx+dery+derz} d}{\partial x ^{derx} \partial y ^{dery} \partial z ^{derz}}
// 	*/
// 	for (i=derx;i<4;i++)
// 	{
// 		for (j=dery;j<4;j++)
// 		{
// 			for (k=derz;k<4;k++)
// 			{
// 				cont=a[ijk2n(i,j,k)]*pow(x,i-derx)*pow(y,j-dery)*pow(z,k-derz);
// 				for (w=0;w<derx;w++)
// 				{
// 					cont*=(i-w);
// 				}
// 				for (w=0;w<dery;w++)
// 				{
// 					cont*=(j-w);
// 				}
// 				for (w=0;w<derz;w++)
// 				{
// 					cont*=(k-w);
// 				}
// 				ret+=cont;
// 			}
// 		}
// 	}
// 	return(ret);
// }