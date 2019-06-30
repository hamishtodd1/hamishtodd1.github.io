/*
	TODO
		Combine with your simulator, for andrew
		Make it editable
		Blending? if you know
		Tricubic thing
			You put the coefficients in a texture (or two) and then nearest neighbour within each voxel
		ultrasound-esque slicing
		Ask George about removing branchings and reading a teeny bit out, eg the normalization redness

	"Top 7 scalar fields", ask folks at ICERM!
		What's the equivalent of a 3D contour map that you'd use lots of contour lines to indicate?
			lots of saddle points. What's a 3D saddle point?
			A pathologically bad-for-contour-surfaces example. Something where all contour surfaces are tiny?
		Features:
			squarish
		Evelyn Lamb's multiplying surfaces thing (union)

	Allowed to assume a black background, because it's hard to put eg the hands behind it

	http://www.shaderific.com/glsl-functions

	Adding based on density assumes that you can clock:
		a part might be very red because the light way went through one very red place
		OR multiple slightly-red places
	but maybe it'd be better to add iff isolevel

	red +0, blue -0, larger numbers closer to black
	Is there anything interesting doable with three overlapping scalar fields with all values > 0?
		//fuck yes, direction. It's enclosed by your rainbow-banded sphere, color is what it's attracted to
	//Any color mapping is a line throught the RGB cube
	//concentrations of three chemicals mofo!

	to get actual line number, subtract ~130

	Presentation
		Could blend with background
		Spheres look nice and make it so you
		Can have sphere without it affecting complexity of course
		Better might be a pair of planes
		Is it a region you're moving shit around in, or objects you're picking up?
		Objects you pick up dude, this is not cootVR
		Yet you do want to move them around inside that ball
	

	https://mrob.com/pub/comp/xmorphia/ - ideal colorings!
*/

varying vec3 pointOnFace;

uniform mat4 matrixWorldInverse;

uniform vec3 scalarFieldPointLightPosition;
uniform float renderRadiusSquared;

const float smokeNormalizer = 10.; //wanna do at runtime

const float isolevel = 0.;

const bool doIsosurface = true;
const bool doSmoke = true;

float lengthSq(vec3 v)
{
	return dot(v,v);
}

//it's a cone: lousodrome.net/blog/light/2017/01/03/intersection-of-a-ray-and-a-cone/
float getScalarToHandCone( vec3 origin, vec3 direction )
{
	vec3 tip = vec3(0.019,-0.03,-0.17);
	vec3 downSpindle = vec3(0.,0.,1.);
	float cosSquaredTipAngle = 0.88; //1/8 of an angle

	vec3 tipToOrigin = origin - tip;
	float tipToOriginDotDownSpindle = dot(tipToOrigin,downSpindle);
	float directionDotDownSpindle = dot(direction,downSpindle);

	float a = directionDotDownSpindle*directionDotDownSpindle - cosSquaredTipAngle;
	float b = 2. * ( directionDotDownSpindle * tipToOriginDotDownSpindle - dot(direction,tipToOrigin) * cosSquaredTipAngle );
	float c = tipToOriginDotDownSpindle * tipToOriginDotDownSpindle - dot(tipToOrigin,tipToOrigin) * cosSquaredTipAngle;

	float determinant = b*b - 4. * a * c;
	if( determinant > 0. )
	{
		float t = (-b+sqrt(determinant)) / (2.*a); //bit surprising that it's + not - since you want the closer one
		if( t > 0. )
		{
			vec3 tipToPoint = origin + t * direction - tip;
			if( lengthSq(tipToPoint) < 0.038 && dot(downSpindle,tipToPoint) > 0. )
			{
				return t;
			}
		}
	}

	return 99999999.;
}

// float tanh(float x)
// {
// 	float exp2x = exp(2. * x); // sure you wanna do this so much?
// 	return (exp2x - 1.) / (exp2x + 1.);
// }

float sampleEllipticCurveSpace(vec3 p)
{
	vec3 scaledP = p * 10.;
	return scaledP.y*scaledP.y - scaledP.x*scaledP.x*scaledP.x - scaledP.z*scaledP.x;
}
vec3 gradientOfEllipticCurveSpace(vec3 p)
{
	vec3 scaledP = p * 10.;
	return vec3(3.*scaledP.x*scaledP.x+scaledP.z,2.*scaledP.y,scaledP.x);
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

float getLevel( vec3 p )
{
	return sampleEllipticCurveSpace(p) - isolevel;
}
vec3 numericalGradient(vec3 p) //very easy to work out for polynomials, y does not depend on x
{
	float valueHere = getLevel(p);
	float eps = 0.001;
	float x = ( valueHere - getLevel(p+vec3(eps,0.,0.)) ) / eps;
	float y = ( valueHere - getLevel(p+vec3(0.,eps,0.)) ) / eps;
	float z = ( valueHere - getLevel(p+vec3(0.,0.,eps)) ) / eps;

	return vec3(x,y,z);
}
float getLightIntensityAtPoint(vec3 p, vec3 scalarFieldCameraPosition)
{
	float ks = 1.;
	float kd = 1.;
	float ka = 1.;
	float shininess = 1.;
	float ambientIntensity = 1.;
	float pointLightDiffuse = 1.;
	float pointLightSpecular = 1.;

	vec3 normal = normalize( gradientOfEllipticCurveSpace(p) );
	vec3 viewerDirection = normalize( scalarFieldCameraPosition - pointOnFace );

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

// A(x^4+y^4+z^4+1)+Bxyz+C(x^2y^2+z^2)+D(x^2z^2+y^2)+E(z^2y^2+x^2).
// Run it with A,B,C,D,E = [1,0,0,0,0]
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

//want these outside really
void main()
{
	vec3 scalarFieldCameraPosition = vec3( matrixWorldInverse * vec4(cameraPosition,1.) );
	vec3 direction = normalize( pointOnFace - scalarFieldCameraPosition );

	float handDistance = getScalarToHandCone(pointOnFace, direction);

	float totalDistanceToGo = 2. * -dot( pointOnFace, direction );
	float numSteps = 128.;
	float defaultStepLength = totalDistanceToGo / numSteps;
	float thisStepLength = defaultStepLength;
	float distanceAlong = 0.;

	float oldLevel = getLevel( pointOnFace );
	float newLevel;

	bool isoSurfaceToBeDrawn = false;

	gl_FragColor = vec4( 0.,0.,0., 1.0 );
	for(float i = 1.; i <= numSteps; i++)
	{
		//precise voxel jump lengths
		//probably unnecessary, the function along the length is piecewise continuous
		// if(voxels)
		// {
		// 	vec3 currentPosition;
		// 	float smallestMultiplier = 9999999.;
		// 	for(int j = 0; j < 3; j++)
		// 	{
		// 		float thisCoordJumpLength = ceil( currentPosition[j] ) - currentPosition[j];
		// 		if( thisCoordJumpLength == 0.0 )
		// 		{
		// 			thisCoordJumpLength = 1.;
		// 		}
		// 		float multiplierForJump = thisCoordJumpLength / direction[j];
		// 		if( multiplierForJump < smallestMultiplier )
		// 		{
		// 			smallestMultiplier = multiplierForJump;
		// 		}
		// 	}
		// 	currentPosition += direction * smallestMultiplier;
		// 	//and then you look directly between it and the previous position to get your sampling point?
		// }

		distanceAlong = i * defaultStepLength;
		newLevel = getLevel( pointOnFace + distanceAlong * direction );

		if( doIsosurface )
		{
			//not missing a hump probably means some crazy analysis
			//you could MAYBE try to solve in the case of that degree-10 interpolation polynomial
			//still better than marchingcubes

			isoSurfaceToBeDrawn = sign( oldLevel) != sign( newLevel );

			if( isoSurfaceToBeDrawn )
			{
				thisStepLength = -oldLevel / (newLevel-oldLevel) * defaultStepLength;
				distanceAlong = defaultStepLength * (i-1.) + thisStepLength;
				newLevel = getLevel( pointOnFace + distanceAlong * direction );
			}
		}

		if( handDistance < distanceAlong )
		{
			distanceAlong = handDistance;
			thisStepLength = handDistance - defaultStepLength * (i-1.);
			newLevel = getLevel( pointOnFace + distanceAlong * direction );
		}

		if(doSmoke)
		{
			//"layers of colored glass"
			float average = ( oldLevel + newLevel ) * .5;
			float contribution = (1. - abs(average) * 1.)  * 10. * thisStepLength;
			if( average > 0. )
			{
				gl_FragColor.b += contribution;
			}
			else
			{
				gl_FragColor.b += contribution;
			}
		}

		if( distanceAlong == handDistance )
		{
			//that's not the intensity
			float intensity = getLightIntensityAtPoint( pointOnFace + distanceAlong * direction, scalarFieldCameraPosition );
			gl_FragColor.r += intensity * 0.6;
			gl_FragColor.g += intensity * 0.6;
			gl_FragColor.b += intensity * 0.6;
			return;
		}
		else if( isoSurfaceToBeDrawn )
		{
			float intensity = getLightIntensityAtPoint( pointOnFace + distanceAlong * direction, scalarFieldCameraPosition );

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

	if( doIsosurface && !doSmoke )
	{
		discard;
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