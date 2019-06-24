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