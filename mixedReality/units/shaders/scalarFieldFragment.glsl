/*
	So we want the position that we're drawing on in world space and the camera position
	We march backwards until, well, until the scalar field ends! It may be a portal ya know

	Allowed to assume a black background, because it's hard to put eg the hands behind it

	http://www.shaderific.com/glsl-functions
*/

varying vec3 pointOnFace;
float isolevel = 0.96;

//to get actual line number, subtract 128
float sampleField(vec3 p)
{
	vec3 origin = vec3(0.,0.,0.03);
	float val = 1. - distance(p, origin);
	return val;
}

int relationshipToSurface(vec3 p)
{
	float val = sampleField(p);
	if( val == isolevel )
	{
		return 0;
	}
	if( val < isolevel )
	{
		return -1;
	}
	return 1;
}

void main()
{
	gl_FragColor = vec4(0.,0.,0., 1.0);
	// float direction = cameraPosition; //setLength or whatever, to get the direction we're going in

	bool doIsosurface = false;

	if(doIsosurface)
	{
		int numSamples = 200;
		vec3 pointInScalarField = pointOnFace;
		int currentRelationshipToSurface = relationshipToSurface(pointInScalarField);
		for(int i = 0; i < numSamples; i++)
		{
			pointInScalarField.z += 0.0005;

			if( currentRelationshipToSurface != relationshipToSurface(pointInScalarField) )
			{
				bool justPenetratedOrFoundOurselvesOnIt = (currentRelationshipToSurface == -1);
				if( justPenetratedOrFoundOurselvesOnIt )
				{
					gl_FragColor.r = 1.0;
				}
				else
				{
					gl_FragColor.g = 1.0;
				}
				//nice would be if you could get the threejs-ish texture
				return;
			}
		}
	}
	else
	{
		int numSamples = 200;
		vec3 pointInScalarField = pointOnFace;
		for(int i = 0; i < numSamples; i++)
		{
			if(sampleField(pointInScalarField) > isolevel)
			{
				gl_FragColor.r += 0.01;
				gl_FragColor.g += 0.01;
				gl_FragColor.b += 0.01;
			}
			pointInScalarField.z += 0.001;
		}
	}
}