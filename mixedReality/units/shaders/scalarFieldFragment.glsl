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
*/

varying vec3 pointOnFace;

uniform vec3 scalarFieldCameraPosition;
uniform vec3 scalarFieldPointLightPosition;
uniform float renderRadiusSquared;

const float stepLength = 0.0003;
const float colorNormalizer = .000006; //wanna do at runtime

const float isolevel = -1000.;

const bool doIsosurface = true;
const bool doSmoke = !doIsosurface;

// float tanh(float x)
// {
// 	float exp2x = exp(2 * x); // sure you wanna do this so much?
// 	return (exp2x - 1) / (exp2x + 1);
// }

float sampleEllipticCurveSpace(vec3 p)
{
	vec3 scaledP = p;
	return scaledP.y*scaledP.y - scaledP.x*scaledP.x*scaledP.x - scaledP.z*scaledP.x;
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
vec3 shittyGradient(vec3 p)
{
	//y*y - x*x*x - z*x
	//
	float valueHere = sampleField(p);
	float eps = 0.0000001;
	float x = ( valueHere - sampleField(p+vec3(eps,0.,0.)) ) / eps;
	float y = ( valueHere - sampleField(p+vec3(0.,eps,0.)) ) / eps;
	float z = ( valueHere - sampleField(p+vec3(0.,0.,eps)) ) / eps;

	return vec3(x,y,z);
}

float relationshipToIsosurface(vec3 p)
{
	float val = sampleField(p) - isolevel;
	float zeroOrOneOrMinusOne = sign(val);
	return zeroOrOneOrMinusOne;
}

void main()
{
	gl_FragColor = vec4(0.,0.,0., 1.0);
	vec3 direction = normalize( pointOnFace - scalarFieldCameraPosition );

	vec3 pointInScalarField = pointOnFace;
	float oldRelationshipToSurface = relationshipToIsosurface(pointInScalarField);

	while( true )
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
			float val = sampleField( pointInScalarField );
			if( val > 0.)
			{
				gl_FragColor.b += val * colorNormalizer;
			}
			else if( val < 0.)
			{
				gl_FragColor.g += -val * colorNormalizer;
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
				// gl_FragDepth = pointInScalarField.z - 500.; //would be nice

				//could take a half step back

				if( newRelationshipToSurface == 1. )
				{
					gl_FragColor.r = 1.0;
				}
				else //if(newRelationshipToSurface == -1.)
				{
					gl_FragColor.g = 1.0;
				}

				//ultrasound dude

				{
					float ks = 1.;
					float kd = 1.;
					float ka = 1.;
					float shininess = 1.;
					float ambientIntensity = 1.;
					float pointLightDiffuse = 1.;
					float pointLightSpecular = 1.;

					vec3 normal = normalize( shittyGradient(pointInScalarField) );
					vec3 viewerDirection = -1. * direction;

					float intensity = ka * ambientIntensity;
					// for(lights)
					{
						vec3 pointLightDirection = normalize(scalarFieldPointLightPosition - pointInScalarField);
						intensity += kd * dot( pointLightDirection, normal ) * pointLightDiffuse;

						vec3 perfectlyReflectedDirection = 2. * dot(pointLightDirection, normal) * normal - pointLightDirection;
						intensity += ks * pow( dot( perfectlyReflectedDirection, viewerDirection ), shininess ) * pointLightSpecular;
					}
					gl_FragColor.r *= intensity;
					gl_FragColor.g *= intensity;
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

	if( doIsosurface )
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