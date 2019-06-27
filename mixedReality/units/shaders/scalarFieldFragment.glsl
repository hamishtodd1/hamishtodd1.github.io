/*
	So we want the position that we're drawing on in world space and the camera position
	We march backwards until, well, until the scalar field ends! It may be a portal ya know

	Allowed to assume a black background, because it's hard to put eg the hands behind it

	http://www.shaderific.com/glsl-functions

	Alright so there's the modelMatrix. You might say it affects

	you're thinking about adding based on density.
	This assumes that you can clock that a part might be very red because the light way went through one very red place or multiple slightly-red places
	but maybe it'd be better to add iff isolevel

	//red +0, blue -0, larger numbers closer to black
	//Is there anything interesting doable with three overlapping scalar fields with all values > 0?
		//fuck yes, direction. It's enclosed by your rainbow-banded sphere, color is what it's attracted to
	//Any color mapping is a line throught the RGB cube
	//concentrations of three chemicals mofo!

	to get actual line number, subtract ~130

	ultrasound! It's a clear analogy

	https://mrob.com/pub/comp/xmorphia/ - ideal colorings!
*/

varying vec3 pointOnFace;

uniform mat4 matrixWorldInverse;

uniform vec3 scalarFieldPointLightPosition;
uniform float renderRadiusSquared;

const float stepLength = 0.0003;
const float colorNormalizer = .0001; //wanna do at runtime

const float isolevel = 10.;

const bool doIsosurface = true;
const bool doSmoke = false;


float tanh(float x)
{
	float exp2x = exp(2. * x); // sure you wanna do this so much?
	return (exp2x - 1.) / (exp2x + 1.);
}

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

float sampleField( vec3 p )
{
	return zeroAccentuator(sampleEllipticCurveSpace(p) );
}
vec3 numericalGradient(vec3 p) //very easy to work out for polynomials, y does not depend on x
{
	float valueHere = sampleField(p);
	float eps = 0.001;
	float x = ( valueHere - sampleField(p+vec3(eps,0.,0.)) ) / eps;
	float y = ( valueHere - sampleField(p+vec3(0.,eps,0.)) ) / eps;
	float z = ( valueHere - sampleField(p+vec3(0.,0.,eps)) ) / eps;

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

float relationshipToIsosurface(vec3 p)
{
	float val = sampleField(p) - isolevel;
	float zeroOrOneOrMinusOne = sign(val);
	return zeroOrOneOrMinusOne;
}

void main()
{
	vec3 scalarFieldCameraPosition = vec3( matrixWorldInverse * vec4(cameraPosition,1.) );

	gl_FragColor = vec4(0.,0.,0., 1.0);
	vec3 direction = normalize( pointOnFace - scalarFieldCameraPosition );

	vec3 pointInScalarField = pointOnFace;
	float oldRelationshipToSurface = relationshipToIsosurface(pointInScalarField);

	for(int i = 0; i < 4095; i++)
	{
		pointInScalarField += stepLength * direction;
		float lengthSquared = dot(pointInScalarField,pointInScalarField);
		if( lengthSquared > renderRadiusSquared )
		{
			break;
		}
		
		// vec3 currentPosition;
		// float smallestMultiplier = 9999999.;
		// for(int i = 0; i < 3; i++)
		// {
		// 	float thisCoordJumpLength = ceil( currentPosition[i] ) - currentPosition[i];
		// 	if( thisCoordJumpLength == 0.0 )
		// 	{
		// 		thisCoordJumpLength = 1.;
		// 	}
		// 	float multiplierForJump = thisCoordJumpLength / direction[i];
		// 	if( multiplierForJump < smallestMultiplier )
		// 	{
		// 		smallestMultiplier = multiplierForJump;
		// 	}
		// }
		// currentPosition += direction * smallestMultiplier;
		// //and then you look directly between it and the previous position to get your sampling point?

		if(doSmoke)
		{
			float val = clamp( sampleField( pointInScalarField ), -800.,800.);
			gl_FragColor.b += abs(val) * colorNormalizer;
			if( val > 0.)
			{
				gl_FragColor.b += val * colorNormalizer;
			}
			else if( val < 0.)
			{
				gl_FragColor.r += -val * colorNormalizer;
			}
		}

		// vec3 poin = pointLights[0];

		if(doIsosurface)
		{
			//so there's the "you might miss a hump" aspect. But it's still pretty good and that may never be avoidable

			//bit rubbish without lighting
			float newRelationshipToSurface = relationshipToIsosurface(pointInScalarField);
			if( oldRelationshipToSurface != newRelationshipToSurface )
			{
				pointInScalarField -= stepLength * direction * .5;

				// gl_FragDepth = pointInScalarField.z - 500.; //would be nice

				float intensity = getLightIntensityAtPoint(pointInScalarField, scalarFieldCameraPosition);

				if( newRelationshipToSurface == 1. )
				{
					gl_FragColor.r = intensity;
				}
				else //if(newRelationshipToSurface == -1.)
				{
					gl_FragColor.g = intensity;
				}

				// {
				// 	vec4 sumLights = vec4(0.0, 0.0, 0.0, 1.0);
					 
				// 	//point lights
				// 	vec4 sumPointLights = vec4(0.0, 0.0, 0.0, 1.0);
				// 	for(int i = 0; i &lt; MAX_POINT_LIGHTS; i++) { vec3 dir = normalize(vWorldPos - pointLightPosition[i]); sumPointLights.rgb += clamp(dot(-dir, vWorldNormal), 0.0, 1.0) * pointLightColor[i]; }
				// 	for(int i = 0; i &lt; MAX_DIR_LIGHTS; i++)
				// 	{
				// 		vec3 dir = directionalLightDirection[i];
				// 		sumDirLights.rgb += clamp(dot(-dir, vWorldNormal), 0.0, 1.0) * directionalLightColor[i];
				// 	}
				// 	#endif
					 
				// 	//take ambient light, add highlight if point sum big enough
				// 	sumLights = sumPointLights + sumDirLights;
				// 	//sumLights = vec4(ambientLightColor, 1.0) + floor( sumLights * vec4(5, 5, 5, 1)) * vec4(0.2, 0.2, 0.2, 1);
				// 	sumLights = vec4(ambientLightColor, 1.0) + sumLights;
					 
				// 	gl_FragColor *= sumLights;
				// }

				//https://github.com/mrdoob/three.js/blob/dev/src/renderers/shaders/ShaderLib/meshphong_frag.glsl.js ?
				return;
			}
		}
	}

	if( doIsosurface && !doSmoke )
	{
		discard;
	}
	
	if(doSmoke)
	{
		//to help normalization
		//better would be something to let you
		// if( gl_FragColor.g > 1. )
		// {
		// 	gl_FragColor.r = 1.;// / gl_FragColor.g; //wanna read from this really
		// 	gl_FragColor.g = 0.;
		// 	gl_FragColor.b = 0.;
		// }
		// if( gl_FragColor.b > 1. )
		// {
		// 	gl_FragColor.r = 1.;// / gl_FragColor.b;
		// 	gl_FragColor.g = 0.;
		// 	gl_FragColor.b = 0.;
		// }
	}
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

// double tricubic_eval(double a[64], double x, double y, double z)
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
// 				ret+=a[ijk2n(i,j,k)]*pow(x,i)*pow(y,j)*pow(z,k);
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