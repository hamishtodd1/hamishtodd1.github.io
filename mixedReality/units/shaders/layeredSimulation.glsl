precision highp float;

varying vec2 vUV;
uniform sampler2D oldState;

uniform vec2 dimensions;
uniform float deltaTime;
uniform vec3 threeDDimensions;

//NEED TO DO BOUNDARY CONDITIONS YOURSELF
vec4 laplacian()
{
	vec4 uv  = texture2D( oldState, vUV );
	vec4 uv0 = texture2D( oldState, vUV + vec2( 1./threeDDimensions.x,0.));
	vec4 uv1 = texture2D( oldState, vUV + vec2(-1./threeDDimensions.x,0.));
	vec4 uv2 = texture2D( oldState, vUV + vec2( 0., 1./dimensions.y ) );
	vec4 uv3 = texture2D( oldState, vUV + vec2( 0.,-1./dimensions.y ) );
	vec4 uv4 = texture2D( oldState, vUV + vec2( 0., 1./threeDDimensions.y) );
	vec4 uv5 = texture2D( oldState, vUV + vec2( 0.,-1./threeDDimensions.y) );
	vec4 laplacian = ( uv0 + uv1 + uv2 + uv3 + uv4 + uv5 - 6. * uv );

	return laplacian;
}

const float a = .8, b = .001, dt = .05* .02, eps = .007, h = .2* .607,
			dte = dt/eps, ba = b/a, dtOverHSq = dt/(h*h);

void main (void)
{
	vec2 uv = texture2D(oldState,vUV).rg;
	float u = uv.r;
	float v = uv.g;

	// float unew = u + laplacian().r * 0.1;
	// float vnew = v;

	float vnew = v + (u - v)*dt;
	float uth = v/a + ba;
	float unew;
	float tmp = dte*(u - uth);
	if( u <= uth)
	{
		unew = u/(1. - tmp*(1. - u));
	}
	else
	{
		tmp *= u;
		unew = (tmp + u)/(tmp + 1.);
	}
	unew += laplacian().r * dtOverHSq;

	gl_FragColor = vec4(unew,vnew, 0.0, 1.0);
}



// void main(void)
// {
//    vec4 t = texture(uTS, vec3(vTC, TCz));
//    float u = t.r,  v = t.g;

//    float vnew = v + (u - v)*dt,  uth = v/a + ba,  unew;
//    float tmp = dte*(u - uth);
//    if ( u <= uth)  unew = u/(1. - tmp*(1. - u));
//    else{
//       tmp *= u;
//       unew = (tmp + u)/(tmp + 1.);
//    }
//    unew += 
//      (texture(uTS, vec3(vTC.x, vTC.y + d, TCz) ).r +
//       texture(uTS, vec3(vTC.x, vTC.y - d, TCz) ).r +
//       texture(uTS, vec3(vTC, TCz + d) ).r +
//       texture(uTS, vec3(vTC, TCz - d) ).r +
//       texture(uTS, vec3(vTC.x + d, vTC.y, TCz) ).r +
//       texture(uTS, vec3(vTC.x - d, vTC.y, TCz) ).r
//       - 6.*u)*dth2;
//    FragColor = vec2(unew, vnew );
// }