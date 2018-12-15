//jshint unused:false
var xwebgl = {};

/**
	 getExtension() is supposed to return null if the extension is not supported.
	 Safari 6.2.8 returns an object (not null).
	 Workaround: crosscheck against the list getSupportedExtensions()
*/
xwebgl.getExtension = function(gl, name) {
	'use strict';
	var ext = gl.getSupportedExtensions();
	if (ext.indexOf(name) !== -1) {
		console.log('extension supported:', name);
		return gl.getExtension(name);
	}
	else {
		console.log('extension not supported:', name);
		return null;
	}
};
/*global
	xwebgl
*/
//---------------------------------------------
// mat3
//---------------------------------------------
xwebgl.mat3 = {};

xwebgl.mat3.create_zero = function() {
	'use strict';
	return [
		0.0, 0.0, 0.0,
		0.0, 0.0, 0.0,
		0.0, 0.0, 0.0 ];
};

xwebgl.mat3.create_identity = function() {
	'use strict';
	return [
		1.0, 0.0, 0.0,
		0.0, 1.0, 0.0,
		0.0, 0.0, 1.0];
};

xwebgl.mat3.assign_zero = function(a) {
	'use strict';
	a[0] = 0.0;  a[1] = 0.0;  a[2] = 0.0;
	a[3] = 0.0;  a[4] = 0.0;  a[5] = 0.0;
	a[6] = 0.0;  a[7] = 0.0;  a[8] = 0.0;
};

xwebgl.mat3.assign_identity = function(a) {
	'use strict';
	a[0] = 1.0;  a[1] = 0.0;  a[2] = 0.0;
	a[3] = 0.0;  a[4] = 1.0;  a[5] = 0.0;
	a[6] = 0.0;  a[7] = 0.0;  a[8] = 1.0;
};

xwebgl.mat3.assign = function(out, in_) {
	'use strict';
	out[0] = in_[0];  out[1] = in_[1];  out[2] = in_[2];
	out[3] = in_[3];  out[4] = in_[4];  out[5] = in_[5];
	out[6] = in_[6];  out[7] = in_[7];  out[8] = in_[8];
};

xwebgl.mat3.pack = function(out, in_) {
	'use strict';
	var v = in_[0];
	out[0] = v[0]; out[3] = v[1]; out[6] = v[2];
	v = in_[1];
	out[1] = v[0]; out[4] = v[1]; out[7] = v[2];
	v = in_[2];
	out[2] = v[0]; out[5] = v[1]; out[8] = v[2];
};

xwebgl.mat3.unpack = function(a) {
	'use strict';
	return [
		[a[0],a[3],a[6]],
		[a[1],a[4],a[7]],
		[a[2],a[5],a[8]] ];
};

xwebgl.mat3.mulMV = function( c, a, b ) {
	'use strict';
	var b0 = b[0], b1 = b[1], b2 = b[2];
	c[0] = a[0]*b0 + a[3]*b1 + a[6]*b2;
	c[1] = a[1]*b0 + a[4]*b1 + a[7]*b2;
	c[2] = a[2]*b0 + a[5]*b1 + a[8]*b2;
};

xwebgl.mat3.mulMM = function( c, a, b ) {
	'use strict';
	var a00 = a[0], a01 = a[3], a02 = a[6],
			a10 = a[1], a11 = a[4], a12 = a[7],
			a20 = a[2], a21 = a[5], a22 = a[8];

	var b0 = b[0], b1 = b[1], b2 = b[2];
	c[0] = a00*b0 + a01*b1 + a02*b2;
	c[1] = a10*b0 + a11*b1 + a12*b2;
	c[2] = a20*b0 + a21*b1 + a22*b2;

	b0 = b[3]; b1 = b[4]; b2 = b[5];
	c[3] = a00*b0 + a01*b1 + a02*b2;
	c[4] = a10*b0 + a11*b1 + a12*b2;
	c[5] = a20*b0 + a21*b1 + a22*b2;

	b0 = b[6]; b1 = b[7]; b2 = b[8];
	c[6] = a00*b0 + a01*b1 + a02*b2;
	c[7] = a10*b0 + a11*b1 + a12*b2;
	c[8] = a20*b0 + a21*b1 + a22*b2;
};
/*global
	xwebgl
*/
//---------------------------------------------
// mat4
//---------------------------------------------
xwebgl.mat4 = {};

xwebgl.mat4.create_zero = function() {
	'use strict';
	return [
		0.0, 0.0, 0.0, 0.0,
		0.0, 0.0, 0.0, 0.0,
		0.0, 0.0, 0.0, 0.0,
		0.0, 0.0, 0.0, 0.0];
};

xwebgl.mat4.create_identity = function() {
	'use strict';
	return [
		1.0, 0.0, 0.0, 0.0,
		0.0, 1.0, 0.0, 0.0,
		0.0, 0.0, 1.0, 0.0,
		0.0, 0.0, 0.0, 1.0];
};

xwebgl.mat4.assign_zero = function(a) {
	'use strict';
	a[0] = 0.0;  a[1] = 0.0;  a[2] = 0.0;  a[3] = 0.0;
	a[4] = 0.0;  a[5] = 0.0;  a[6] = 0.0;  a[7] = 0.0;
	a[8] = 0.0;  a[9] = 0.0;  a[10] = 0.0; a[11] = 0.0;
	a[12] = 0.0; a[13] = 0.0; a[14] = 0.0; a[15] = 0.0;
};

xwebgl.mat4.assign_identity = function(a) {
	'use strict';
	a[0] = 1.0;  a[1] = 0.0;  a[2] = 0.0;  a[3] = 0.0;
	a[4] = 0.0;  a[5] = 1.0;  a[6] = 0.0;  a[7] = 0.0;
	a[8] = 0.0;  a[9] = 0.0;  a[10] = 1.0; a[11] = 0.0;
	a[12] = 0.0; a[13] = 0.0; a[14] = 0.0; a[15] = 1.0;
};

xwebgl.mat4.assign = function(out, in_) {
	'use strict';
	out[0] = in_[0];  out[1] = in_[1];  out[2] = in_[2];  out[3] = in_[3];
	out[4] = in_[4];  out[5] = in_[5];  out[6] = in_[6];  out[7] = in_[7];
	out[8] = in_[8];  out[9] = in_[9];  out[10] = in_[10];  out[11] = in_[11];
	out[12] = in_[12];  out[13] = in_[13];  out[14] = in_[14];  out[15] = in_[15];
};

xwebgl.mat4.pack = function(out, in_) {
	'use strict';
	var v = in_[0];
	out[0] = v[0]; out[4] = v[1]; out[8] = v[2]; out[12] = v[3];
	v = in_[1];
	out[1] = v[0]; out[5] = v[1]; out[9] = v[2]; out[13] = v[3];
	v = in_[2];
	out[2] = v[0]; out[6] = v[1]; out[10] = v[2]; out[14] = v[3];
	v = in_[3];
	out[3] = v[0]; out[7] = v[1]; out[11] = v[2]; out[15] = v[3];
};

xwebgl.mat4.unpack = function(a) {
	'use strict';
	return [
		[a[0],a[4],a[8],a[12]],
		[a[1],a[5],a[9],a[13]],
		[a[2],a[6],a[10],a[14]],
		[a[3],a[7],a[11],a[15]] ];
};

xwebgl.mat4.mulMV = function( c, a, b ) {
	'use strict';
	var b0 = b[0], b1 = b[1], b2 = b[2], b3 = b[3];
	c[0] = a[0]*b0 + a[4]*b1 + a[ 8]*b2 + a[12]*b3;
	c[1] = a[1]*b0 + a[5]*b1 + a[ 9]*b2 + a[13]*b3;
	c[2] = a[2]*b0 + a[6]*b1 + a[10]*b2 + a[14]*b3;
	c[3] = a[3]*b0 + a[7]*b1 + a[11]*b2 + a[15]*b3;
};

xwebgl.mat4.mulMM = function( c, a, b ) {
	'use strict';
	var a00 = a[0], a01 = a[4], a02 = a[8],  a03 = a[12],
			a10 = a[1], a11 = a[5], a12 = a[9],  a13 = a[13],
			a20 = a[2], a21 = a[6], a22 = a[10], a23 = a[14],
			a30 = a[3], a31 = a[7], a32 = a[11], a33 = a[15];

	var b0 = b[0], b1 = b[1], b2 = b[2], b3 = b[3];
	c[0] = a00*b0 + a01*b1 + a02*b2 + a03*b3;
	c[1] = a10*b0 + a11*b1 + a12*b2 + a13*b3;
	c[2] = a20*b0 + a21*b1 + a22*b2 + a23*b3;
	c[3] = a30*b0 + a31*b1 + a32*b2 + a33*b3;

	b0 = b[4]; b1 = b[5]; b2 = b[6]; b3 = b[7];
	c[4] = a00*b0 + a01*b1 + a02*b2 + a03*b3;
	c[5] = a10*b0 + a11*b1 + a12*b2 + a13*b3;
	c[6] = a20*b0 + a21*b1 + a22*b2 + a23*b3;
	c[7] = a30*b0 + a31*b1 + a32*b2 + a33*b3;

	b0 = b[8]; b1 = b[9]; b2 = b[10]; b3 = b[11];
	c[ 8] = a00*b0 + a01*b1 + a02*b2 + a03*b3;
	c[ 9] = a10*b0 + a11*b1 + a12*b2 + a13*b3;
	c[10] = a20*b0 + a21*b1 + a22*b2 + a23*b3;
	c[11] = a30*b0 + a31*b1 + a32*b2 + a33*b3;

	b0 = b[12]; b1 = b[13]; b2 = b[14]; b3 = b[15];
	c[12] = a00*b0 + a01*b1 + a02*b2 + a03*b3;
	c[13] = a10*b0 + a11*b1 + a12*b2 + a13*b3;
	c[14] = a20*b0 + a21*b1 + a22*b2 + a23*b3;
	c[15] = a30*b0 + a31*b1 + a32*b2 + a33*b3;
};

/**
	Euclidean rotation
	Computes MatrixExp[X], where
	X = {{0, -z, y, 0}, {z, 0, -x, 0}, {-y, x, 0, 0}, {0, 0, 0, 0}}.

	Algorithm:
	MatrixExp[X] = I + v X + u X.X, where
		t = Sqrt[x^2 + y^2 + z^2]
		u = (1 - Cos[t])/t^2
		v = Sin[t]/t
*/
xwebgl.mat4.rotation = function(m, w) {
	'use strict';
	var epsilon = 1e-8;
	var x = w[0];
	var y = w[1];
	var z = w[2];
	var t = x*x+y*y+z*z;
	if (t < epsilon) { xwebgl.mat4.assign_identity(m); return; }
	t = Math.sqrt(t);
	var u = (1.0 - Math.cos(t))/(t*t);
	var v = Math.sin(t)/t;

	m[0]=1.0-u*(y*y+z*z); m[4]=u*x*y-v*z;       m[ 8]=v*y+u*x*z;       m[12]=0.0;
	m[1]=u*x*y+v*z;       m[5]=1.0-u*(x*x+z*z); m[ 9]=u*y*z-v*x;       m[13]=0.0;
	m[2]=u*x*z-v*y;       m[6]=u*y*z+v*x;       m[10]=1.0-u*(x*x+y*y); m[14]=0.0;
	m[3]=0.0;             m[7]=0.0;             m[11]=0.0;             m[15]=1.0;
};

/**
	Translation in R^3

	Computes MatrixExp[X], where
	X = {{0, 0, 0, x}, {0, 0, 0, y}, {0, 0, 0, z}, {0, 0, 0, 0}}.
*/
xwebgl.mat4.translationR = function(m, w) {
	'use strict';
	m[0]=1.0; m[4]=0.0; m[ 8]=0.0; m[12]=w[0];
	m[1]=0.0; m[5]=1.0; m[ 9]=0.0; m[13]=w[1];
	m[2]=0.0; m[6]=0.0; m[10]=1.0; m[14]=w[2];
	m[3]=0.0; m[7]=0.0; m[11]=0.0; m[15]=1.0;
};

/**
	Translation in S^3

	Computes MatrixExp[X], where
	X = {{0, 0, 0, x}, {0, 0, 0, y}, {0, 0, 0, z}, {-x, -y, -z, 0}}.

	Algorithm:
	MatrixExp[X] = I + v X + u X.X, where
		t = Sqrt[x^2 + y^2 + z^2]
		u = (1 - Cos[t])/t^2
		v = Sin[t]/t
*/
xwebgl.mat4.translationS = function(m, w) {
	'use strict';
	var epsilon = 1e-8;
	var x = w[0];
	var y = w[1];
	var z = w[2];
	var t = x*x+y*y+z*z;
	if (t < epsilon) { xwebgl.mat4.assign_identity(m); return; }
	t = Math.sqrt(t);
	var u = (1.0 - Math.cos(t))/(t*t);
	var v = Math.sin(t)/t;

	m[0]=1.0-u*x*x; m[4]=-u*x*y;    m[ 8]=-u*x*z;    m[12]=v*x;
	m[1]=-u*x*y;    m[5]=1.0-u*y*y; m[ 9]=-u*y*z;    m[13]=v*y;
	m[2]=-u*x*z;    m[6]=-u*y*z;    m[10]=1.0-u*z*z; m[14]=v*z;
	m[3]=-v*x;      m[7]=-v*y;      m[11]=-v*z;      m[15]=1-u*t*t;
};

/**
	Translation in H^3

	Computes MatrixExp[X], where
	X = {{0, 0, 0, x}, {0, 0, 0, y}, {0, 0, 0, z}, {x, y, z, 0}}.

	Algorithm:
	MatrixExp[X] = I + v X + u X.X, where
		t = Sqrt[x^2 + y^2 + z^2]
		u = (Cosh[t] - 1)/t^2
		v = Sinh[t]/t
*/
xwebgl.mat4.translationH = function(m, w) {
	'use strict';
	var epsilon = 1e-8;
	var x = w[0];
	var y = w[1];
	var z = w[2];
	var t = x*x+y*y+z*z;
	if (t < epsilon) { xwebgl.mat4.assign_identity(m); return; }
	t = Math.sqrt(t);
	var u = (Math.cosh(t) - 1.0)/(t*t);
	var v = Math.sinh(t)/t;

	m[0]=1.0+u*x*x; m[4]=u*x*y;     m[ 8]=u*x*z;     m[12]=v*x;
	m[1]=u*x*y;     m[5]=1.0+u*y*y; m[ 9]=u*y*z;     m[13]=v*y;
	m[2]=u*x*z;     m[6]=u*y*z;     m[10]=1.0+u*z*z; m[14]=v*z;
	m[3]=v*x;       m[7]=v*y;       m[11]=v*z;       m[15]=1+u*t*t;
};

/**
	Camera transform.

	rectangle = [x0, x1, y0, y1, z]
	[x0, y0, z], [x0, y1, z], [x1, y0, z], [x0, y1, z] are four corners of a rectangle
	parallel to the bases of the frustrum with edges on the boundary of the frustrum.

	zplane = [z0, z1]
	z0 and z1 are the z-coordinates of the near and far clip planes.

	camera position = [px, py, pz, pw]
	the camera position is in homogeneous coordinates.
*/
xwebgl.mat4.camera = function(
	out,
	// rectangle at distance z
	rectangle,
	// near and far parallel planes
	zplane,
	camera )
{
	'use strict';

	var x0 = rectangle[0];
	var x1 = rectangle[1];
	var y0 = rectangle[2];
	var y1 = rectangle[3];
	var z  = rectangle[4];

	var z0 = zplane[0];
	var z1 = zplane[1];

	var px = camera[0];
	var py = camera[1];
	var pz = camera[2];
	var pw = camera[3];

	var dx = 0.5 * ( x1 - x0 );
	var dy = 0.5 * ( y1 - y0 );
	var dz = 0.5 * ( z1 - z0 );

	var sx = 0.5 * ( x1 + x0 );
	var sy = 0.5 * ( y1 + y0 );
	var sz = 0.5 * ( z1 + z0 );

	// row 0
	out[ 0] = -( z * pw - pz ) / dx;
	out[ 4] = 0.0;
	out[ 8] = ( sx * pw - px ) / dx;
	out[12] = -( sx * pz - z * px ) / dx;

	// row 1
	out[ 1] = 0.0;
	out[ 5] = -( z * pw - pz ) / dy;
	out[ 9] = ( sy * pw - py ) / dy;
	out[13] = -( sy * pz - z * py ) / dy;

	// row 2
	out[ 2] = 0.0;
	out[ 6] = 0.0;
	out[10] = -( sz * pw - pz ) / dz;
	out[14] = -( sz * pz - z0 * z1 * pw ) / dz;

	// row 3
	out[ 3] = 0.0;
	out[ 7] = 0.0;
	out[11] = -pw;
	out[15] = pz;
};
/*global
	xwebgl
*/
xwebgl.compile = function(gl, type, src) {
	'use strict';
	var shader = gl.createShader(type);
	if (!shader) {
		throw Error('failed to make shader');
	}
	gl.shaderSource(shader, src);
	gl.compileShader(shader);

	// check error
	if (!gl.getShaderParameter(shader, gl.COMPILE_STATUS)) {
		var t;
		switch (type) {
		case gl.VERTEX_SHADER:
			t = 'vertex';
			break;
		case gl.FRAGMENT_SHADER:
			t = 'fragment';
			break;
		}
		throw Error(': failed to compile ' + t + ' shader:' +
								gl.getShaderInfoLog(shader));
	}
	return shader;
};

//------------------------------------------------------
// Shader
//------------------------------------------------------
xwebgl.Shader = function(gl, type, initial_src) {
	'use strict';
	var shader = null;

	function dispose() {
		if (!shader) {
			return;
		}
		gl.deleteShader(shader);
		shader = null;
	}

	function compile(src) {
		dispose();
		shader = xwebgl.compile(gl, src, type);
	}

	if (initial_src) {
		compile(initial_src);
	}

	return {compile : compile, shader : function() { return shader; }};
};
/*global
	xwebgl
*/
xwebgl.link = function(gl, shaders) {
	'use strict';
	var program = gl.createProgram();
	if (!program) {
		throw Error('failed to create shader program');
	}

	// attach
	for (var i = 0; i !== shaders.length; ++i) {
		gl.attachShader(program, shaders[i]);
	}

	gl.linkProgram(program);

	// check error
	if (!gl.getProgramParameter(program, gl.LINK_STATUS)) {
		throw Error('failed to link shaders');
	}
	return program;
};

xwebgl.uniform_setter = function(gl, type, loc) {
	'use strict';

	function flatten(_) { return [].concat.apply([], _); }

	// safari does not support Array.from()
	function to_array(_) {
		var out = Array();
		for (var i = 0; i !== _.length; ++i) {
			out.push( _[i] );
		}
		return out;
	}

	var functions = {
		// bool
		0x8B56: function(_) { gl.uniform1b(loc, _); },
		// bvec2
		0x8B57: function(_) { gl.uniform2bv(loc, flatten(_)); },
		// bvec3
		0x8B58: function(_) { gl.uniform3bv(loc, flatten(_)); },
		// bvec4
		0x8B59: function(_) { gl.uniform4bv(loc, flatten(_)); },
		// int
		0x1404: function(_) { gl.uniform1i(loc, _); },
		// ivec2
		0x8B53: function(_) { gl.uniform2iv(loc, flatten(_)); },
		// ivec3
		0x8B54: function(_) { gl.uniform3iv(loc, flatten(_)); },
		// ivec4
		0x8B55: function(_) { gl.uniform4iv(loc, flatten(_)); },
		// float
		0x1406: function(_) { gl.uniform1f(loc, _); },
		// vec2
		0x8B50: function(_) { gl.uniform2fv(loc, flatten(_)); },
		// vec3
		0x8B51: function(_) { gl.uniform3fv(loc, flatten(_)); },
		// vec4
		0x8B52: function(_) { gl.uniform4fv(loc, flatten(_)); },
		// mat2
		0x8B5A: function(_) { gl.uniformMatrix2fv(loc, false, to_array(_)); },
		// mat3
		0x8B5B: function(_) { gl.uniformMatrix3fv(loc, false, to_array(_)); },
		// mat4
		0x8B5C: function(_) { gl.uniformMatrix4fv(loc, false, to_array(_)); },
		// sampler2D
		0x8B5E: function(_) { gl.uniform1i(loc, _); },
		// samplerCube
		0x8B60: function(_) { gl.uniform1i(loc, _); }
	};
	return functions[type];
};

xwebgl.introspect_NEW = function(gl, program) {
	'use strict';

	var i;
	var x;
	var name;

	// map attribute name -> attribute location
	var attribute = {};
	var attribute_count = gl.getProgramParameter(program, gl.ACTIVE_ATTRIBUTES);
	for (i = 0; i !== attribute_count; ++i) {
		x = gl.getActiveAttrib(program, i);
		name = x.name.replace(/\[\d+\]$/, '');
		attribute[name] = gl.getAttribLocation(program, name);
	}

	// map uniform name -> uniform setter
	var uniform = {};
	var uniform_count = gl.getProgramParameter(program, gl.ACTIVE_UNIFORMS);
	for (i = 0; i !== uniform_count; ++i) {
		x = gl.getActiveUniform(program, i);
		name = x.name.replace(/\[\d+\]$/, '');
		var loc = gl.getUniformLocation(program,name);

		uniform[name] = xwebgl.uniform_setter(gl,x.type, loc);
	}
	return { attributes : attribute, uniforms : uniform };
};


xwebgl.introspect_NEW = function(gl, program) {
	'use strict';

	var i;
	var x;
	var name;

	// map attribute name -> attribute location
	var attribute = {};
	var attribute_count = gl.getProgramParameter(program, gl.ACTIVE_ATTRIBUTES);
	for (i = 0; i !== attribute_count; ++i) {
		x = gl.getActiveAttrib(program, i);
		name = x.name.replace(/\[\d+\]$/, '');
		attribute[name] = gl.getAttribLocation(program, name);
	}

	// map uniform name -> uniform setter
	var uniform = {};
	var uniform_count = gl.getProgramParameter(program, gl.ACTIVE_UNIFORMS);
	for (i = 0; i !== uniform_count; ++i) {
		x = gl.getActiveUniform(program, i);
		name = x.name.replace(/\[\d+\]$/, '');
		var loc = gl.getUniformLocation(program, name);
		uniform[name] = xwebgl.uniform_setter(gl, x.type, loc);
	}
	return {attributes : attribute, uniforms : uniform};
};

/**
	Calls getAttributeLocation() and getUniformLocation() on
	explicitly provided list of attributes and uniforms.

	Safari 6.2.8:
		 WebGLActiveInfo.name returns an encoded name, not the real name,
		 making getActiveAttrib() / getUniformLocation() useless for introspection.
		 This workaround provides the attributes and uniforms explicitly.
*/
xwebgl.introspect = function(gl, program, attribute_list, uniform_list) {
	'use strict';

	var types = {
	'vec2' : 0x8B50,
	'vec3' : 0x8B51,
	'vec4' : 0x8B52,
	'ivec2' : 0x8B53,
	'ivec3' : 0x8B54,
	'ivec4' : 0x8B55,
	'bool' : 0x8B56,
	'bvec2' : 0x8B57,
	'bvec3' : 0x8B58,
	'bvec4' : 0x8B59,
	'mat2' : 0x8B5A,
	'mat3' : 0x8B5B,
	'mat4' : 0x8B5C,
	'sampler2D' : 0x8B5E,
	'samplerCube' : 0x8B60,
	'int8' : 0x1400,
	'uint8' : 0x1401,
	'int16' : 0x1402,
	'uint16' : 0x1403,
	'int32' : 0x1404,
	'uint32' : 0x1405,
	'float' : 0x1406
};

	var attribute = {};
	for (var i = 0; i !== attribute_list.length; ++i) {
		var name = attribute_list[i].name;
		var type = types[attribute_list[i].type];
		var loc = gl.getAttribLocation(program, name);
		if (loc !== -1) {
			attribute[name] = loc;
		}
	}

	var uniform = {};
	for (i = 0; i !== uniform_list.length; ++i) {
		var name = uniform_list[i].name;
		var type = types[uniform_list[i].type];
		var loc = gl.getUniformLocation(program, name);
		if (loc) {
			uniform[name] = xwebgl.uniform_setter(gl, type, loc);
		}
	}

	return {attributes : attribute, uniforms : uniform};
};



//------------------------------------------------------
// Program
//------------------------------------------------------
xwebgl.Program = function(gl, initial_shaders, attributes, uniforms) {
	'use strict';

	var program = null;
	var info;

	function dispose() {
		if (!program) {
			return;
		}
		gl.deleteProgram(program);
	}

	function link(shaders) {

		dispose();

		//var q = shaders.map(function(_) { return _.shader(); });
		program = xwebgl.link(gl, shaders);

		info = xwebgl.introspect(gl, program, attributes, uniforms);
	}

	if (initial_shaders) {
		link(initial_shaders);
	}

	function enable() { gl.useProgram(program); }
	function disable() { gl.useProgram(null); }

	function set_uniforms(values) {
		Object.keys(values).forEach(function(_) {
			var setter = info.uniforms[_];
			if (setter) {
	setter(values[_]);
			}
		});
	}

	return {
		link : link,
		enable : enable,
		disable : disable,
		attributes: info.attributes,
		uniforms: info.uniforms,
		set_uniforms: set_uniforms,
		dispose : dispose
	};
};
/*global
	xwebgl
*/
//----------------------------------------------------
// Texture
//----------------------------------------------------
xwebgl.Texture = function(gl, initial_image ) {
	'use strict';
	var TARGET = gl.TEXTURE_2D;
	var UNIT = gl.TEXTURE0;
	var texture;

	function dispose() {
		if (!texture) {
			return;
		}
		gl.deleteTexture(texture);
		texture = null;
	}

	function load(image) {
		dispose();
		texture = gl.createTexture();
		gl.bindTexture(TARGET, texture);
		gl.pixelStorei(gl.UNPACK_FLIP_Y_WEBGL, true);
		gl.texImage2D(TARGET, 0, gl.RGBA, gl.RGBA, gl.UNSIGNED_BYTE, image);
		gl.texParameteri(TARGET, gl.TEXTURE_MAG_FILTER, gl.LINEAR);
		gl.texParameteri(TARGET, gl.TEXTURE_MIN_FILTER, gl.LINEAR_MIPMAP_NEAREST);
		gl.generateMipmap(TARGET);
		gl.bindTexture(TARGET, null);
	}

	if (initial_image) { load(initial_image); }

	function enable() {
		if (!texture) {
			return;
		}
		gl.activeTexture(UNIT);
		gl.bindTexture(TARGET, texture);
		// callback(UNIT);
		// return true;
	}

	function disable() {
		gl.activeTexture(UNIT);
		gl.bindTexture(TARGET, null);
	}

	return {load : load, enable : enable, disable : disable, dispose : dispose};
};

//----------------------------------------------------
// Cubemap
//----------------------------------------------------
xwebgl.Cubemap = function(gl, initial_image ) {
	'use strict'
	;
	var TARGET = gl.TEXTURE_CUBE_MAP;
	var UNIT = gl.TEXTURE1;
	var texture;

	function dispose() {}

	function load(image) {
		dispose();
		// texture
		texture = gl.createTexture();

		gl.bindTexture(TARGET, texture);

		gl.texParameteri(TARGET, gl.TEXTURE_WRAP_S, gl.CLAMP_TO_EDGE);
		gl.texParameteri(TARGET, gl.TEXTURE_WRAP_T, gl.CLAMP_TO_EDGE);
		gl.texParameteri(TARGET, gl.TEXTURE_MIN_FILTER, gl.LINEAR);
		gl.texParameteri(TARGET, gl.TEXTURE_MAG_FILTER, gl.LINEAR);

		gl.pixelStorei(gl.UNPACK_FLIP_Y_WEBGL, false);
		for (var i = 0; i !== 6; ++i) {
			var face = gl.TEXTURE_CUBE_MAP_POSITIVE_X + i;
			gl.texImage2D(face, 0, gl.RGBA, gl.RGBA, gl.UNSIGNED_BYTE, image[i]);
		}

		gl.bindTexture(TARGET, null);
	}

	if (initial_image) {
		load(initial_image);
	}

	function enable() {
		if (!texture) {
			return false;
		}
		gl.activeTexture(UNIT);
		gl.bindTexture(TARGET, texture);
		return true;
	}

	function disable() { gl.bindTexture(TARGET, null); }

	function dispose() {
		if (!texture) {
			return;
		}
		gl.deleteTexture(texture);
		texture = null;
	}

	return {load : load, enable : enable, disable : disable, dispose : dispose};
};
/*global
	xwebgl
*/

//----------------------------------------------------
// VertexBuffer
//----------------------------------------------------
xwebgl.VertexBuffer = function(gl) {
	'use strict';
	var data;
	var ext = xwebgl.getExtension(gl,'ANGLE_instanced_arrays');

	function dispose() {
		if (data) {
			gl.deleteBuffer(data.buffer);
			data = null;
		}
	}

	function load(vertex, attribute) {
		var numbertype = {'float32': gl.FLOAT};

		dispose();
		// create a new buffer
		var buffer = gl.createBuffer();
		if (!buffer) {
			throw Error('failed to gl create buffer');
		}

		// upload the data
		gl.bindBuffer(gl.ARRAY_BUFFER, buffer);
		gl.bufferData(gl.ARRAY_BUFFER, vertex.data, gl.STATIC_DRAW);
		gl.bindBuffer(gl.ARRAY_BUFFER, null);

		// compute packing
		var total_blocksize = 0;
		var i;
		for (i = 0; i !== vertex.packing.length; ++i) {
			total_blocksize += vertex.packing[i].stride;
		}
		var SIZEOF_FLOAT32 = 4;

		var packing = [];
		var offset = 0;
		if ('divisor' in vertex) {
			var divisor = vertex.divisor; }
		else {
			divisor = 1;
		}

		for (i = 0; i !== vertex.packing.length; ++i) {
			var q;

			// skip if the shader does not have the attribute
			var key = vertex.packing[i].name;
			if ( !(key in attribute) || attribute[key] === -1 || attribute[key] === undefined) {
				continue;
			}

			var blocksize = vertex.packing[i].stride;
			if (blocksize > 4)
			{
	// pack blocks of 4
	for (var n = 0; n !== blocksize; n += 4) {
					q = {
						attribute : attribute[key] + n/4,
						blocksize : 4,
						numbertype : numbertype[vertex.packing[i].type],
						normalized : false,
						byte_blocksize : total_blocksize * SIZEOF_FLOAT32,
						byte_offset : offset * SIZEOF_FLOAT32,
			divisor : divisor
					};
					packing.push(q);
					offset += 4;
	}
			}
			else
			{
				q = {
					attribute : attribute[key],
					blocksize : blocksize,
					numbertype : gl.FLOAT,
					normalized : false,
					byte_blocksize : total_blocksize * SIZEOF_FLOAT32,
					byte_offset : offset * SIZEOF_FLOAT32,
		divisor : divisor
				};
				packing.push(q);
	offset += blocksize;
			}
		}
		data = {buffer : buffer, packing : packing};
	}

	function enable() {
		gl.bindBuffer(gl.ARRAY_BUFFER, data.buffer);

		for (var i = 0; i !== data.packing.length; ++i) {
			var v = data.packing[i];
			gl.enableVertexAttribArray(v.attribute);
			gl.vertexAttribPointer(v.attribute, v.blocksize, v.numbertype,
														 v.normalized, v.byte_blocksize, v.byte_offset);
		}

		gl.bindBuffer(gl.ARRAY_BUFFER, null);
	}

	function enable_instanced() {
		gl.bindBuffer(gl.ARRAY_BUFFER, data.buffer);

		for (var i = 0; i !== data.packing.length; ++i) {
			var v = data.packing[i];
			gl.enableVertexAttribArray(v.attribute);
			gl.vertexAttribPointer(v.attribute, v.blocksize, v.numbertype,
														 v.normalized, v.byte_blocksize, v.byte_offset);
			ext.vertexAttribDivisorANGLE(v.attribute, v.divisor);
		}

		gl.bindBuffer(gl.ARRAY_BUFFER, null);
	}

	function disable() {
		for (var i = 0; i !== data.packing.length; ++i) {
			var v = data.packing[i];
			gl.bindBuffer(gl.ARRAY_BUFFER, data.buffer);
			gl.disableVertexAttribArray(v.attribute);
			gl.bindBuffer(gl.ARRAY_BUFFER, null);
		}
	}

	return {
		load : load,
		enable : enable,
		enable_instanced : enable_instanced,
		disable : disable,
		dispose : dispose
	};
};

//----------------------------------------------------
// IndexBuffer
//----------------------------------------------------
xwebgl.IndexBuffer = function(gl) {
	'use strict';
	var data;
	var ext = xwebgl.getExtension(gl,'ANGLE_instanced_arrays');

	function dispose() {
		if (data) {
			gl.deleteBuffer(data.buffer);
			data = null;
		}
	}

	var mode = {
		'points': gl.POINTS,
		'line_strip': gl.LINE_STRIP,
		'line_loop':gl.LINE_LOOP,
		'lines':gl.LINES,
		'triangle_strip':gl.TRIANGLE_STRIP,
		'triangle_fan':gl.TRIANGLE_FAN,
		'triangles':gl.TRIANGLES };

	function load(x) {
		dispose();
		// create a new buffer
		var buffer = gl.createBuffer();
		if (!buffer) {
			throw Error('failed to gl create buffer');
		}

		// upload the data
		gl.bindBuffer(gl.ELEMENT_ARRAY_BUFFER, buffer);
		gl.bufferData(gl.ELEMENT_ARRAY_BUFFER, x.data, gl.STATIC_DRAW);
		gl.bindBuffer(gl.ELEMENT_ARRAY_BUFFER, null);

		var numbertype = {'uint8': gl.UNSIGNED_BYTE, 'uint16':gl.UNSIGNED_SHORT};

		data = {
			buffer : buffer,
			drawmode : mode[x.mode],
			index_count : x.data.length,
			numbertype : numbertype[x.type],
			offset : 0
		};
	}

	function draw() {
		gl.bindBuffer(gl.ELEMENT_ARRAY_BUFFER, data.buffer);
		gl.drawElements(data.drawmode, data.index_count, data.numbertype,
										data.offset);
		gl.bindBuffer(gl.ELEMENT_ARRAY_BUFFER, null);
	}

	function draw_instanced(instance_count) {
		gl.bindBuffer(gl.ELEMENT_ARRAY_BUFFER, data.buffer);
		ext.drawElementsInstancedANGLE(data.drawmode, data.index_count,
																	 data.numbertype, data.offset,
																	 instance_count);
		gl.bindBuffer(gl.ELEMENT_ARRAY_BUFFER, null);
	}

	return {
		load : load,
		draw : draw,
		draw_instanced : draw_instanced,
		dispose : dispose
	};
};
/*global
	xwebgl
*/

//----------------------------------------------------
// SurfaceDrawer
//----------------------------------------------------
xwebgl.SurfaceDrawer = function(gl, shader) {
	'use strict';

	var vertex_buffer = xwebgl.VertexBuffer(gl);
	var index_buffer = xwebgl.IndexBuffer(gl);

	function dispose() {
		vertex_buffer.dispose();
		index_buffer.dispose();
	}

	function load(surface) {
		vertex_buffer.load(surface.vertex, shader.attributes);
		index_buffer.load(surface.element);
	}

	function draw() {
		vertex_buffer.enable();
		index_buffer.draw();
		vertex_buffer.disable();
	}

	return {load : load, update : draw, dispose : dispose};
};

//----------------------------------------------------
// MultiSurfaceDrawer
//----------------------------------------------------
xwebgl.MultiSurfaceDrawer = function(gl, shader) {
	'use strict';
	var vertex_buffer = xwebgl.VertexBuffer(gl);
	var index_buffer = xwebgl.IndexBuffer(gl);
	var transform = [];

	function load_transforms(surface) {
		if (surface.transform.data.length % 18 !== 0) {
			throw Error('transform data length ' + surface.transform.data.length +
									' not divisible by stride 18');
		}
		for (var i = 0; i < surface.transform.data.length; i += 18) {
			transform.push({
				transform : surface.transform.data.subarray(i, i + 16),
				orientation : surface.transform.data.subarray(i + 16, i + 18)
			});
		}
	}

	function draw() {
		vertex_buffer.enable();
		for (var i = 0; i !== transform.length; ++i) {
			var t = transform[i];
			shader.uniforms.instance_transform(t.transform);
			shader.uniforms.instance_orientation(t.orientation);
			index_buffer.draw();
		}
		vertex_buffer.disable();
	}

	function load(surface) {
		vertex_buffer.load(surface.vertex, shader.attributes);
		index_buffer.load(surface.element);
		load_transforms(surface);
	}

	return {load : load, update : draw, dispose : function() {} };
};

//----------------------------------------------------
// InstancedSurfaceDrawer
//----------------------------------------------------
xwebgl.InstancedSurfaceDrawer = function(gl, shader) {
	'use strict';
	var vertex_buffer = xwebgl.VertexBuffer(gl);
	var transform_buffer = xwebgl.VertexBuffer(gl);
	var color_buffer = xwebgl.VertexBuffer(gl);
	var index_buffer = xwebgl.IndexBuffer(gl);
	var instance_count;

	function dispose() {
		vertex_buffer.dispose();
		transform_buffer.dispose();
		index_buffer.dispose();
	}

	function load(surface) {
		/*
		//------
		// FIX renaming
		surface.transform.instance_transform = surface.transform.transform;
		delete surface.transform.transform;

		surface.transform.instance_orientation = surface.transform.orientation;
		delete surface.transform.orientation;
		//----
*/
		//------
		// FIX renaming
		surface.transform.packing[0].name = 'instance_transform';
		surface.transform.packing[1].name = 'instance_orientation';
		surface.color.packing[0].name = 'instance_color';
		//------

		vertex_buffer.load(surface.vertex, shader.attributes);
		index_buffer.load(surface.element);
		transform_buffer.load(surface.transform, shader.attributes);
		color_buffer.load(surface.color, shader.attributes);

		// compute instance_count
		var n = 0;
		for (var i = 0; i !== surface.transform.packing.length; ++i) {
			n += surface.transform.packing[i].stride;
		}
		instance_count = surface.transform.data.length / n;
	}

	function draw() {
		vertex_buffer.enable();
		transform_buffer.enable_instanced();
		color_buffer.enable_instanced();

		index_buffer.draw_instanced(instance_count);

		//instance_color_buffer.disable();
		transform_buffer.disable();
		vertex_buffer.disable();
	}

	return {load : load, update : draw, dispose : dispose};
};

//----------------------------------------------------
// make_drawer
//----------------------------------------------------
xwebgl.make_drawer = function(gl, shader, surface) {
	'use strict';

	var drawer;
	if ('transform' in surface) {
		var instanced = Boolean(xwebgl.getExtension(gl,'ANGLE_instanced_arrays'));
		//instanced = false;

		if (instanced) {
			drawer = xwebgl.InstancedSurfaceDrawer(gl, shader);
		} else {
			drawer = xwebgl.MultiSurfaceDrawer(gl, shader);
		}
	} else {
		drawer = xwebgl.SurfaceDrawer(gl, shader);
	}
	drawer.load(surface);
	return drawer;
};

//----------------------------------------------------
// DrawerCache
//----------------------------------------------------
xwebgl.DrawerCache = function(gl) {
	'use strict';

	var surface = [];
	var drawer = [];

	function set_surface(i, s) {
		surface[i] = s;
	}

	function get_surface(i) {
		return surface[i];
	}

	function get_drawer(i, shader) {
		// note: locked to first shader
		if ( typeof drawer[i] === 'undefined' ) {
			drawer[i] = xwebgl.make_drawer(gl, shader, surface[i]);
		}
		return drawer[i];
	}

	return { set_surface: set_surface, get_surface : get_surface, get_drawer: get_drawer};
};
//jshint unused:false
var xlab = {};
/*global
	xlab
*/
xlab.util = {};

xlab.util.flatten = function(_) {
	'use strict';
	return [].concat.apply([], _);
};

/*
xlab.util.spaceform_signature = function(spaceform) {
	'use strict';
	var s = 0;
	switch (spaceform.geometry) {
	case 'euclidean':
		s = 0;
		break;
	case 'spherical':
		s = 1;
		break;
	case 'hyperbolic':
		s = -1;
		break;
	default:
		throw Error('unknown spaceform ' + spaceform.geometry);
	}
	return s;
};
*/

/*
xlab.util.hsv_to_rgb = function(h, s, v) {
	'use strict';
	var r, g, b, i, f, p, q, t;
	if (arguments.length === 1) {
		s = h.s, v = h.v, h = h.h;
	}
	i = Math.floor(h * 6);
	f = h * 6 - i;
	p = v * (1 - s);
	q = v * (1 - f * s);
	t = v * (1 - (1 - f) * s);
	switch (i % 6) {
	case 0:
		r = v, g = t, b = p;
		break;
	case 1:
		r = q, g = v, b = p;
		break;
	case 2:
		r = p, g = v, b = t;
		break;
	case 3:
		r = p, g = q, b = v;
		break;
	case 4:
		r = t, g = p, b = v;
		break;
	case 5:
		r = v, g = p, b = q;
		break;
	}
	//return [ Math.round(r * 255), Math.round(g * 255), Math.round(b * 255), 1.0 ];
	return [r, g, b, 1.0];
};
*/

xlab.util.hls_to_rgb = function(color) {
	'use strict';

	function _v(m1, m2, hue) {
		hue = hue % 1.0;
		if (hue < 0.0) {
			hue = hue + 1.0;
		}
		if (hue < (1.0/6.0)) {
			return m1 + (m2-m1)*hue*6.0;
		}
		if (hue < 0.5) {
			return m2;
		}
		if (hue < (2.0/3.0)) {
			return m1 + (m2-m1)*((2.0/3.0)-hue)*6.0;
		}
		return m1;
	}

	var h = color[0];
	var l = color[1];
	var s = color[2];

	if (s === 0.0) {
		return [l, l, l, 1.0];
	}

	var m2;
	if (l <= 0.5) {
		m2 = l * (1.0+s);
	}
	else {
		m2 = l+s-(l*s);
	}
	var m1 = 2.0*l - m2;
	return [_v(m1, m2, h+(1.0/3.0)), _v(m1, m2, h), _v(m1, m2, h-(1.0/3.0)), 1.0];
};

xlab.util.rgb_to_hls = function(color) {
	'use strict';

	var r = color[0];
	var g = color[1];
	var b = color[2];

	var maxc = Math.max(r, g, b);
	var minc = Math.min(r, g, b);

	var l = (minc+maxc)/2.0;
	if (minc === maxc) {
		return [0.0, l, 0.0, 1.0];
	}
	var s;
	if (l <= 0.5) {
		s = (maxc-minc) / (maxc+minc);
	}
	else {
		s = (maxc-minc) / (2.0-maxc-minc);
	}
	var rc = (maxc-r) / (maxc-minc);
	var gc = (maxc-g) / (maxc-minc);
	var bc = (maxc-b) / (maxc-minc);
	var h;
	if (r === maxc) {
		h = bc-gc;
	}
	else if (g === maxc) {
		h = 2.0+rc-bc;
	}
	else {
		h = 4.0+gc-rc;
	}
	h = (h/6.0) % 1.0;
	return [h, l, s, 1.0];
};


xlab.util.generate_colors = function(count, spec) {
	'use strict';

	function random_shuffle(a) {
		var count = a.length;
		var r;
		var tmp;
		while (count) {
			r = Math.random() * count-- | 0;
			tmp = a[count];
			a[count] = a[r];
			a[r] = tmp;
		}
	}

	// generate equally spaced hues

	// set up hue=[0,1,...,count-1]
	var hue = []
	for (i = 0; i != count; ++i) {
		hue.push(i);
	}
	random_shuffle(hue);

	var color = []
	for (var i = 0; i != count; ++i)
	{
		color.push(xlab.util.hls_to_rgb( [hue[i]/count + spec[0], spec[1], spec[2]] ))
	}

	return color;
};
/*global
	xlab
*/

xlab.math = {};

xlab.math.sign = function(x) {
	'use strict';
	return x > 0 ? 1 : (x < 0 ? -1 : 0);
};

xlab.math.normalize2 = function(x) {
	'use strict';
	var t = Math.sqrt(x[0] * x[0] + x[1] * x[1]);
	return [ x[0] / t, x[1] / t ];
};

xlab.math.normalize3 = function(x) {
	'use strict';
	var t = Math.sqrt(x[0] * x[0] + x[1] * x[1] + x[2] * x[2]);
	return [ x[0] / t, x[1] / t, x[2] / t ];
};
/*global
	xlab
*/

xlab.Key = function(element, callback) {
	'use strict';

	function on_key(event) {
		event.preventDefault();
		event.stopPropagation();
		if (callback.hasOwnProperty( ''+event.which ) ) {
			callback[''+event.which]();
		}
		// return false to prevent other key handlers
		return false;
	}

	// give the document keyboard focus
	//element.setAttribute('tabindex','0');
	//element.focus();
	document.addEventListener( 'keydown', on_key );

	return {};
};
/*global
	xlab
*/

//---------------------------------------------
// MouseFilter
//---------------------------------------------
xlab.MouseFilter = function() {
	'use strict';

	var client;

	// jshint unused:false

	function new_data() {
		return {
			type : null,
			time : 0,
			dtime : 0,
			buttons : [],
			button : 0,
			position : [ 0, 0 ],
			dposition : [ 0, 0 ]
		};
	}

	var data_stack = [ new_data(), new_data() ];
	function data() { return data_stack[1]; }

	function update(type, event, data) {
		// create a new event
		var time = Date.now();
		var d = {
			type : type,
			time : time,
			dtime : time - data.time,
			button : data.buttons[data.buttons.length - 1],
			buttons : data.buttons,
			position : [ event.clientX, event.clientY ],
			dposition : [
				event.clientX - data.position[0], event.clientY - data.position[1]
			]
		};
		// push the new event into the stack
		data_stack = [ data_stack[1], d ];
	}

	function on_mouse_down(event) {
		// return if button is not one of [0, 1, 2]
		if (event.button < 0 || event.button > 2) {
			return;
		}
		// return if event.button is already in button stack
		if (data().buttons.indexOf(event.button) !== -1) {
			return;
		}
		// insert the button into the button stack
		data().buttons.push(event.button);
		// update and fire the mouse event
		update('down', event, data());
		if (client) {
			client.on_mouse_down(data());
		}
	}
	function on_mouse_move(event) {
		// return if no buttons are pressed
		if (data().buttons.length === 0) {
			return;
		}
		// update and fire the mouse event
		update('move', event, data());
		if (client) {
			client.on_mouse_move(data());
		}
	}
	function on_mouse_up(event) {
		// return if button is not one of [0, 1, 2]
		if (event.button < 0 || event.button > 2) {
			return;
		}
		// return if event.button is not in the button stack
		if (data().buttons.indexOf(event.button) === -1) {
			return;
		}
		// remove the button from the button stack
		// update and fire the mouse event
		update('up', event, data_stack[0]);
		if (client) {
			client.on_mouse_up(data());
		}
		data().buttons.pop();
	}
	function on_mouse_enter(event) { data_stack = [ new_data(), new_data() ]; }
	function on_mouse_exit(event) { data_stack = [ new_data(), new_data() ]; }

	function connect(element) {
		element.addEventListener('mousedown', on_mouse_down);
		element.addEventListener('mousemove', on_mouse_move);
		element.addEventListener('mouseup', on_mouse_up);
		element.addEventListener('mouseover', on_mouse_enter);
		element.addEventListener('mouseout', on_mouse_exit);
	}

	function disconnect(element) {
		element.removeEventListener('mousedown', on_mouse_down);
		element.removeEventListener('mousemove', on_mouse_move);
		element.removeEventListener('mouseup', on_mouse_up);
		element.removeEventListener('mouseover', on_mouse_enter);
		element.removeEventListener('mouseout', on_mouse_exit);
	}

	function add(client_) { client = client_; }
	function remove(client_) { client = null; }

	return {
		connect : connect,
		disconnect : disconnect,
		add : add,
		remove : remove
	};
};

// ---------------------------------------------
// WheelFilter
// ---------------------------------------------

// jshint unused:false
xlab.WheelFilter = function(callback) {
	'use strict';

	var client;

	function on_wheel(event) {
		var delta = Math.max(-1, Math.min(1, (event.wheelDelta || -event.detail)));
		if (client) {
			client(delta);
		}
	}

	function connect(element) {
		// IE9, Chrome, Safari, Opera
		element.addEventListener('mousewheel', on_wheel);
		// Firefox
		element.addEventListener('DOMMouseScroll', on_wheel);
	}
	function disconnect(element) {
		// IE9, Chrome, Safari, Opera
		element.removeEventListener('mousewheel', on_wheel);
		// Firefox
		element.removeEventListener('DOMMouseScroll', on_wheel);
	}

	function add(client_) { client = client_; }
	function remove(client_) { client = null; }

	return {
		connect : connect,
		disconnect : disconnect,
		add : add,
		remove : remove
	};
};
/* global
	 xwebgl
	 ,xlab
	 ,Float64Array
*/

/*
---------------------------------------------
ToMatrix
---------------------------------------------
*/
xlab.ToMatrix = function() {
	'use strict';

	var m = new Float64Array(16);

	var _to_matrix = [
		// rotation
		function(w) { xwebgl.mat4.rotation(m, w); },
		// translation H3
		function(w) { xwebgl.mat4.translationH(m, w); },
		// translation R3
		function(w) { xwebgl.mat4.translationR(m, w); },
		// translation S3
		function(w) { xwebgl.mat4.translationS(m, w); }
	];

	return function(motion) {
		_to_matrix[motion[0]](motion[1]);
		return m;
	};
};

/*
---------------------------------------------
Interpreter
---------------------------------------------
*/

xlab.Interpreter = function(in_spaceform) {
	'use strict';

	// rotation-xy, rotation-z, translation-xy, translation-z
	var SPEED = [ 0.004, 0.005, 0.002, 0.005 ];
	var spaceform = in_spaceform;

	var interpret = [
		// button0
		function(position) {
			// rotate xy
			var s = SPEED[0];
			return [ 0, [ position[1] * s, position[0] * s, 0.0 ] ];
		},
		// button1
		function(position) {
			var x = position[0];
			var y = -position[1];
			return Math.abs(x) >= Math.abs(y) ?
				// translate z
				[ 2+spaceform, [ 0.0, 0.0, x * SPEED[3] ] ]
				:
				// rotate z
				[ 0, [ 0.0, 0.0, y * SPEED[1] ] ];
		},
		// button2
		function(position) {
			// translate xy
			var s = SPEED[2];
			return [ 2+spaceform, [ position[0] * s, -position[1] * s, 0.0 ] ];
		}
	];

	return function(button, position) { return interpret[button](position); };
};

/*
---------------------------------------------
Animator
---------------------------------------------
*/
xlab.Animator = function(callback) {
	'use strict';

	var SPEED = 0.02;
	var DECAY = 0.99;

	var to_matrix = xlab.ToMatrix();
	var _m = null;
	var _time = 0;

	function start(m) {
		_m = m;
		_time = Date.now();
	}
	function stop() { _m = null; }

	function update() {
		if (_m === null) {
			return;
		}
		var time = Date.now();
		var dt = (time - _time) * SPEED;
		var m = [ _m[0], [ _m[1][0] * dt, _m[1][1] * dt, _m[1][2] * dt ] ];
		callback(to_matrix(m));
		// decay
		if (DECAY !== 1.0) {
			_m = [ _m[0], [ _m[1][0] * DECAY, _m[1][1] * DECAY, _m[1][2] * DECAY ] ];
		}
		_time = time;
	}

	return {start : start, stop : stop, update : update};
};

/*
---------------------------------------------
Position
---------------------------------------------
*/
xlab.Position = function() {
	'use strict';
	var m = new Float64Array(16);
	xwebgl.mat4.assign_identity(m);
	var tmp = new Float64Array(16);

	function reset() { xwebgl.mat4.assign_identity(m); }
	function inject(a) {
		// FIX: don't need tmp

		xwebgl.mat4.mulMM(tmp, a, m);

		xwebgl.mat4.assign(m, tmp);
	}

	return {reset : reset, inject : inject, transform : function() { return m; }};
};

/*
---------------------------------------------
PositionR3

Accumulates translations and rotations separately
so that rotation is about the center of the object, not about the origin.

Assumes object center is at the origin.
---------------------------------------------
*/
xlab.PositionR3 = function(center) {
	'use strict';
	var R = new Float64Array(9);
	xwebgl.mat3.assign_identity(R);
	var T = [ 0.0, 0.0, 0.0 ];
	var tmp3 = new Float64Array(9);
	var tmp4 = new Float64Array(16);

	/**
		 Multiply (upper left 3x3 block of a 4x4 matrix) * (3x3 matrix) = (3x3
		 matrix).
	*/
	function mul43(c, a, b) {
		var a00 = a[0], a01 = a[4], a02 = a[8], a10 = a[1], a11 = a[5], a12 = a[9],
				a20 = a[2], a21 = a[6], a22 = a[10];

		var b0 = b[0], b1 = b[1], b2 = b[2];
		c[0] = a00 * b0 + a01 * b1 + a02 * b2;
		c[1] = a10 * b0 + a11 * b1 + a12 * b2;
		c[2] = a20 * b0 + a21 * b1 + a22 * b2;

		b0 = b[3];
		b1 = b[4];
		b2 = b[5];
		c[3] = a00 * b0 + a01 * b1 + a02 * b2;
		c[4] = a10 * b0 + a11 * b1 + a12 * b2;
		c[5] = a20 * b0 + a21 * b1 + a22 * b2;

		b0 = b[6];
		b1 = b[7];
		b2 = b[8];
		c[6] = a00 * b0 + a01 * b1 + a02 * b2;
		c[7] = a10 * b0 + a11 * b1 + a12 * b2;
		c[8] = a20 * b0 + a21 * b1 + a22 * b2;
	}

	/**
		Packs rotation part R and translation part T
		into a mat4.
	*/
	function pack(out, R, T) {
		out[0] = R[0];
		out[4] = R[3];
		out[8] = R[6];
		out[12] = T[0];

		out[1] = R[1];
		out[5] = R[4];
		out[9] = R[7];
		out[13] = T[1];

		out[2] = R[2];
		out[6] = R[5];
		out[10] = R[8];
		out[14] = T[2];

		out[3] = 0.0;
		out[7] = 0.0;
		out[11] = 0.0;
		out[15] = 1.0;
	}

	function reset() {
		xwebgl.mat3.assign_identity(R);
		xwebgl.mat4.assign_identity(T);
	}
	function inject(a) {
		var is_translation = a[12] !== 0.0 || a[13] !== 0.0 || a[14] !== 0.0;
		if (is_translation) {
			T[0] += a[12];
			T[1] += a[13];
			T[2] += a[14];
		} else {
			mul43(tmp3, a, R);
			xwebgl.mat3.assign(R, tmp3);
		}
	}

	/*
		Computes C * T * R * Inverse[C]
		with 4x4 matrices
			C = center translation matrix
			T = translation matrix
			R = rotation matrix
	*/
	function transform() {
		var K = [ 0.0, 0.0, 0.0 ];
		xwebgl.mat3.mulMV(K, R, center);
		K[0] = T[0] + center[0] - K[0];
		K[1] = T[1] + center[1] - K[1];
		K[2] = T[2] + center[2] - K[2];
		pack(tmp4, R, K);
		return tmp4;
	}

	return {reset : reset, inject : inject, transform : transform};
};

/*
---------------------------------------------
Mouse
---------------------------------------------
*/
xlab.Mouse = function(initial_spaceform) {
	'use strict';

	var TIME_CUTOFF = 200;
	// FIX
	var center = [ 0.0, 0.0, 0.0 ];
	var spaceform;
	var to_matrix = xlab.ToMatrix();
	var interpreter;
	var position;
	var animator;

	/*jshint unused:false*/
	function on_mouse_down(event) {
		animator.stop(); }
	function on_mouse_move(event) {
		position.inject(to_matrix(interpreter(event.button, event.dposition)));
	}
	function on_mouse_up(event) {
		if (event.dtime < TIME_CUTOFF) {
			animator.start(interpreter(event.button, event.dposition));
		}
	}
	/*jshint unused:true*/

	//var listener = xlab.MouseListener(
	//{down : on_down, move : on_move, up : on_up});

	function set_spaceform(in_spaceform) {
		if (spaceform === in_spaceform) { return; }
		spaceform = in_spaceform;
		interpreter = xlab.Interpreter(spaceform);
		position = spaceform === 0 ? xlab.PositionR3(center) : xlab.Position();
		animator = xlab.Animator(position.inject);
	}

	set_spaceform(initial_spaceform || 0);

	/*
	function connect(element) {
		listener.connect(element);
	}
	function disconnect(element) {
		listener.disconnect(element);
	}
	*/
	function update() {
		animator.update();
	}
	function transform() {
		return position.transform();
	}

	return {
		//connect : connect,
		//disconnect : disconnect,
		update : update,
		transform : transform,
		set_spaceform : set_spaceform,
		slot: { on_mouse_down:on_mouse_down, on_mouse_up:on_mouse_up, on_mouse_move:on_mouse_move }
	};
};
/* global
	 xlab
	 ,xwebgl
	 ,Float64Array
*/

/*
---------------------------------------------
CameraUtil
---------------------------------------------
*/
xlab.CameraUtil = function() {
	'use strict';

	/**
		Computes the camera position from a camera transform m.
	*/
	function camera_position(m) {
		var a00 = m[0];
		var a02 = m[8];
		var a03 = m[12];
		var a11 = m[5];
		var a12 = m[9];
		var a13 = m[13];
		var a32 = m[11];
		var a33 = m[15];

		return [
			(a03 * a32 - a02 * a33) / a00, (a13 * a32 - a12 * a33) / a11, a33, -a32
		];
	}

	/**
		 Compute ranges [[dx, dy], [zu, zv]].

		 @param[in] center 3-vector
		 @param[in] radius 3-vector
		 @param[in] view_direction 2-vector
		 @param[in] aspect 2-vector
		 @return [[dx, dy], [zu, zv]].
	*/
	function compute_ranges(center, radius, view_direction, aspect) {
		var dx;
		var dy;
		var zu;
		var zv;

		if (aspect[0] * radius[1] >= aspect[1] * radius[0]) {
			// wide window
			dy = radius[1];
			dx = (aspect[0] / aspect[1]) * dy;

			zu = dy * view_direction[0] + center[2] * view_direction[1];
		} else {
			// tall window
			dx = radius[0];
			dy = (aspect[1] / aspect[0]) * dx;

			zu = dx * view_direction[0] + center[2] * view_direction[1];
		}
		zv = view_direction[1];

		return [ [ dx, dy ], [ zu, zv ] ];
	}

	/**
		 Compute z cutoffs.

		 @param z 2-vector [zu, zv].
		 @param center 3-vector
		 @param user_cutoff 2-vector
		 @param view_direction 2-vector
		 @return cutoff 2-vector
	*/
	function compute_cutoff(z, center, user_cutoff, view_direction) {

		// cutoff determining perspective/orthographic camera
		var VIEWANGLE_CUTOFF = 1.0e-6;
		var ortho = view_direction[1] < VIEWANGLE_CUTOFF;

		if (ortho) {
			// orthgraphic camera
			return [
				center[2] + user_cutoff[1],
				center[2] + user_cutoff[0]
			];
		} else {
			// perspective camera
			var r = z[0] / z[1];
			return [
				r - (r - center[2]) * user_cutoff[0],
				r - (r - center[2]) * user_cutoff[1]
			];
		}
	}

	/**
		 radius = radius of the sphere which the camera encompasses.

		 center = center of the sphere which the camera encompasses.

		 aspect = {dx, dy}.
		 Only used as a ratio.

		 view_direction = {cos(theta), sin(theta)}, where theta is the viewing
		 halfangle.
		 Only used as a ratio.
		 For orthogonal projection, view_direction = {1, 0}.

		 @param[out] m 4x4 camera transform
		 @param[in] box=[x0,x1,y0,y1,z0,z1].
		 @param[in] aspect 2-vector
		 @param[in] view_direction 2-vector
		 @param[in] user_cutoff 2-vector
	*/
	function camera_transform(m, box, aspect, view_direction, user_cutoff) {

		if (aspect[0] === 0 || aspect[1] === 0) {
			throw Error('invalid aspect ratio ' + aspect.toString());
		}
		var v = xlab.math.normalize2(view_direction);

		//var radius = xlab.math.box.radius(box);
		//var center = xlab.math.box.center(box);

		// Compute ranges
		var ranges = compute_ranges(box.center, box.radius, v, aspect);
		var dx = ranges[0][0];
		var dy = ranges[0][1];
		var zu = ranges[1][0];
		var zv = ranges[1][1];

		// compute z cutoffs
		var cutoff =
				compute_cutoff([ zu, zv ], box.center, user_cutoff, view_direction);

		// x0, x1
		var rectangle = [
			box.center[0] - dx, box.center[0] + dx,
			// y0, y1
			box.center[1] - dy, box.center[1] + dy,
			// z
			box.center[2]
		];
		// camera (px, py, pz, pw)
		var camera = [ box.center[0] * zv, box.center[1] * zv, zu, zv ];

		xwebgl.mat4.camera(m, rectangle, cutoff, camera);

		if (isNaN(m[0])) {
			throw Error('nan in camera; aspect=' + aspect + ' box=' + box);
		}
	}

	// return {transform: function(){ return transform; }, update: update};
	return {transform : camera_transform, position : camera_position };
};

/*
---------------------------------------------
CameraUtil
---------------------------------------------
*/
xlab.Camera = function(aspect_) {
	'use strict';

	var INITIAL_SCALE = 1.1;
	var WHEEL_SCALE = 1.1;
	var util = xlab.CameraUtil();
	var user_cutoff = [ 0.1, 10.0 ];
	var angle = 5.0;
	var view_direction =
			[ Math.cos(angle * Math.PI / 180.0), Math.sin(angle * Math.PI / 180.0) ];
	var m = new Float64Array(16);
	var scale = INITIAL_SCALE;
	var box = {center: [0.0, 0.0, 0.0], radius: [1.0, 1.0, 1.0] };
	var aspect = aspect_;
	var position;

	// compute initial camera matrix
	util.transform(m, box, aspect, view_direction, user_cutoff);

	function set_box(box_) {
		box = box_;
		// reset scale
		scale = INITIAL_SCALE;
	}

	function update(aspect_) {
		aspect = aspect_;
		var radius = [scale * box.radius[0], scale * box.radius[1], scale * box.radius[2] ];
		var box2 = {center: box.center, radius:radius};
		util.transform(m, box2, aspect, view_direction, user_cutoff);
		position = util.position(m);
	}

	function on_wheel(delta) {
		var s = delta >= 0.0 ? WHEEL_SCALE : 1.0/WHEEL_SCALE;
		scale *= s;
		update(aspect);
	}

	//var wheel = xlab.WheelListener(on_wheel);

	return {
		transform : function() { return m; },
		position: function() { return position; },
		update : update,
		set_box : set_box,
		//connect : wheel.connect,
		//disconnect : wheel.disconnect,
		on_wheel: on_wheel
	};
};
/* global
	 xlab
*/

//-------------------------------------------
// grid
//-------------------------------------------

/*jshint bitwise: false*/

/*
	Helper function for xlab.triangulate_grid() below.
*/
xlab._triangulate_grid = function(A, B, start, x, y) {
	'use strict';

	if (A < 2 || B < 2) {
		throw Error('grid too small');
	}

	var size = B * (2 * A - 2) + A - 2;

	var out;
	if (A * B < (1 << 8)) {
		out = new Int8Array(size);
	} else if (A * B < (1 << 16)) {
		out = new Int16Array(size);
	} else {
		throw Error('grid too large');
	}

	var i = 0;
	var p = start;
	var s = y;
	for (var a = 0; a !== A - 1; ++a) {
		for (var b = 0; b !== B; ++b) {
			out[i++] = p;
			out[i++] = p + x;
			p += s;
		}
		p += x - s;
		if (a !== A - 2) {
			// degenerate connecting triangles
			out[i++] = p;
		}
		s = -s;
	}

	return out;
};

/**
	Computes a triangle strip representing a grid of size (I,J).
*/
xlab.triangulate_grid = function(gridsize) {
	'use strict';

	var I = gridsize[0];
	var J = gridsize[1];
	if (I >= J) {
		// horizontal
		return xlab._triangulate_grid(J, I, I * (J - 1), -I, 1);
	} else {
		// vertical
		return xlab._triangulate_grid(I, J, 0, 1, I);
	}
};


xlab._make_color = function(json) {
	'use strict';

	// transform.count = divisor * transform.block_count
	// divisor = number of instances with the same color
	// transform.block_count = number of colors

	// spec = [hue_offset, lightness, saturation]
	var spec = [0.25, 0.58, 0.45];

	var color = xlab.util.flatten(
		xlab.util.generate_colors(json.transform.block_count, spec) );

	var buffer = new Float32Array( color );
	var divisor = json.transform.count / json.transform.block_count;
	var packing = [{ 'name':'instance_color',
			 'type':'float32', 'stride': 4}];
	json.color = {'packing':packing, 'data': buffer, 'divisor': divisor };

	console.log("color.size=", color.length, " color_count=", color.length/4, "  divisor=", divisor);
	console.log("color=", color);


};

//-------------------------------------------
// load_surface
//-------------------------------------------

xlab._on_surface = function(data, callback) {
	'use strict';
	// var xdata = new Uint8Array(data);

	// json
	var view = new Int32Array(data);

	//--------------------------
	// FIX: slice before reading the offsets to avoid possible copy
	//--------------------------
	// check header
	if (view[0] !== parseInt('0x42414c58', 16) ||
			view[1] !== parseInt('0x4e4f534a', 16)) {
		throw Error('header is not XLABJSON');
	}
	var a = new Uint8Array(data.slice(view[2], view[3]));
	var json = String.fromCharCode.apply(null, a);
	json = JSON.parse(json);

	var x;
	var bdata;

	// vertex
	if ('vertex' in json) {
		x = json.vertex.offset;
		bdata = new Float32Array(data.slice(x[0], x[1]));
		json.vertex.data = bdata;
	}

	// index
	if ('element' in json) {
		if ('grid' in json.element) {
			// grid
			json.element.mode = 'triangle_strip';
			bdata = xlab.triangulate_grid(json.element.grid);
			switch (bdata.BYTES_PER_ELEMENT) {
			case 1: json.element.type = 'uint8'; break;
			case 2: json.element.type = 'uint16'; break;
			default: throw Error('unsupported buffer type');
			}
		} else {
			// not grid
			var numbertype = json.element['type'];
			x = json.element.offset;
			switch (numbertype) {
			case 'uint8':
				bdata = new Uint8Array(data.slice(x[0], x[1]));
				break;
			case 'uint16':
				bdata = new Uint16Array(data.slice(x[0], x[1]));
				break;
			default:
				throw Error('unsupported numbertype ' + numbertype);
			}
		}
		json.element.data = bdata;
	}

	// transform
	if ('transform' in json) {
		x = json.transform.offset;
		bdata = new Float32Array(data.slice(x[0], x[1]));
		json.transform.data = bdata;
	}

	xlab._make_color(json);

	// default box
	if (!('box' in json)) {
		json.box = {center : [ 0, 0, 0 ], radius : [ 1, 1, 1 ]};
	}

	callback(json);
};

xlab.load_surface = function(url, callback) {
	'use strict';
	xlab.load_file(url, function(data) { xlab._on_surface(data, callback); });
};
/* global
	 xlab
*/

//---------------------------------
// vshader
//---------------------------------
xlab.vshader = 'attribute vec4 position;\n' +
'attribute vec4 normal;\n' +
'attribute vec2 texture;\n' +
'\n' +
'#if INSTANCE==1\n' +
'uniform mat4 instance_transform;\n' +
'uniform vec2 instance_orientation;\n' +
'uniform vec4 instance_color;\n' +
'#endif\n' +
'#if INSTANCE==2\n' +
'attribute mat4 instance_transform;\n' +
'attribute vec2 instance_orientation;\n' +
'attribute vec4 instance_color;\n' +
'#endif\n' +
'\n' +
'uniform mat4 object_transform;\n' +
'uniform mat4 camera_transform;\n' +
'\n' +
'varying vec4 x_position;\n' +
'varying vec3 x_normal;\n' +
'varying vec2 x_texture;\n' +
'varying vec4 x_color;\n' +
'varying float x_orientation;\n' +
'\n' +
'vec3 normalized_difference(vec4 a, vec4 b)\n' +
'{\n' +
'  return a.xyz * b.w - b.xyz * a.w;\n' +
'}\n' +
'\n' +
'#if GEOMETRY==0\n' +
'void compute(mat4 T) {\n' +
'  x_position = T * position;\n' +
'  x_normal = normalize( ( T * vec4(normal.xyz, 0.0) ).xyz );\n' +
'}\n' +
'#endif\n' +
'#if GEOMETRY== 1\n' +
'void compute(mat4 T) {\n' +
'  vec4 P = T * position;\n' +
'  P.w += 1.0;\n' +
'  vec4 N = T * normal;\n' +
'  x_position = P;\n' +
'  x_normal = normalized_difference( P, N );\n' +
'}\n' +
'#endif\n' +
'\n' +
'void main() {\n' +
'#if INSTANCE>0\n' +
'  compute( object_transform * instance_transform );\n' +
'  x_normal *= instance_orientation[0];\n' +
'  x_orientation = 0.5*(1.0 - instance_orientation[1]);\n' +
'  // clamp to 0 or 1\n' +
'  //x_orientation = step(x_orientation, 0.5);\n' +
'#else\n' +
'  compute( object_transform );\n' +
'#endif\n' +
'  x_texture = texture;\n' +
'  x_color = instance_color;\n' +
'  gl_Position = camera_transform * x_position;\n' +
'}\n';

//---------------------------------
// fshader
//---------------------------------
xlab.fshader = '#if TEX==1\n' +
'#extension GL_OES_standard_derivatives : enable\n' +
'#endif\n' +
'\n' +
'varying vec4 x_position;\n' +
'varying vec3 x_normal;\n' +
'varying vec2 x_texture;\n' +
'varying vec4 x_color;\n' +
'varying float x_orientation;\n' +
'\n' +
'uniform vec4 camera_position;\n' +
'\n' +
'uniform vec4 light_position[LIGHT_COUNT];\n' +
'uniform vec4 diffuse_light_color[LIGHT_COUNT];\n' +
'uniform vec4 specular_light_color[LIGHT_COUNT];\n' +
'\n' +
'uniform float diffuse_factor;\n' +
'uniform float specular_factor;\n' +
'\n' +
'uniform vec3 fgcolor[2];\n' +
'uniform vec2 color_scale;\n' +
'\n' +
'uniform vec4 specular_color[2];\n' +
'\n' +
'uniform vec2 grid_frequency[2];\n' +
'uniform vec2 grid_width[2];\n' +
'\n' +
'vec3 normalized_difference_( vec4 a, vec4 b )\n' +
'{\n' +
'  return normalize( b.xyz * a.w - a.xyz * b.w );\n' +
'}\n' +
'\n' +
'float diffuse_fn( vec3 signed_normal, vec3 light_vector ) {\n' +
'  float t = dot( signed_normal, light_vector );\n' +
'  float q = 1.0 + 2.0 * diffuse_factor * (1.0 - t);\n' +
'  return (1.0 + t)*(1.0 + t) / ( 1.0 + 2.0*t + q*q );\n' +
'}\n' +
'\n' +
'float specular_fn( vec3 signed_normal, vec3 light_vector, vec3 camera_vector )\n' +
'{\n' +
'  vec3 R = reflect( -light_vector, signed_normal );\n' +
'  float d = dot(camera_vector, R);\n' +
'  float q = acos(d) / specular_factor;\n' +
'  return exp( -q*q );\n' +
'}\n' +
'\n' +
'//vec3 hsv2rgb(vec3 c)\n' +
'//{\n' +
'//  vec4 K = vec4(1.0, 2.0 / 3.0, 1.0 / 3.0, 3.0);\n' +
'//  vec3 p = abs(fract(c.xxx + K.xyz) * 6.0 - K.www);\n' +
'//  return c.z * mix(K.xxx, clamp(p - K.xxx, 0.0, 1.0), c.y);\n' +
'//}\n' +
'\n' +
'#if TEX==1\n' +
'float grid_fn(vec2 frequency, vec2 width)\n' +
' {\n' +
'  vec2 m = 2.0*fwidth(frequency * x_texture);\n' +
'  vec2 tex = fract(frequency * x_texture);\n' +
'  tex = 1.0 - abs(2.0 * tex - 1.0);\n' +
'  vec2 factor = smoothstep( m*(width - 1.0), m*(width + 1.0), tex );\n' +
'  return min(factor.x, factor.y);\n' +
'}\n' +
'void compute_color(out vec4 color[2])\n' +
'{\n' +
'  for (int i = 0; i != 2; ++i)\n' +
'  {\n' +
'    float g = grid_fn(grid_frequency[i], grid_width[i]);\n' +
'\n' +
'    //vec3 bgcolor = hsv2rgb(vec3(color_spec[i].x*x_color+color_spec[i].y, color_spec[i].z, color_spec[i].w));\n' +
'    //color[i] = vec4( mix( fgcolor[i], bgcolor, g), 1.0);\n' +
'    color[i] = vec4( mix( fgcolor[i], color_scale[i]*x_color.rgb, g ), 1.0);\n' +
'  }\n' +
'}\n' +
'#else\n' +
'void compute_color(out vec4 color[2])\n' +
'{\n' +
'  for (i = 0; i != 2; ++i)\n' +
'  {\n' +
'    //vec3 bgcolor = hsv2rgb(vec3(color_spec[i].x*x_color+color_spec[i].y, color_spec[i].z, color_spec[i].w));\n' +
'    //color[i] = vec4(bgcolor,1.0);\n' +
'    color[i] = vec4( color_scale[i]*x_color.rgb, 1.0 );\n' +
'  }\n' +
'}\n' +
'#endif\n' +
'\n' +
'\n' +
'void main()\n' +
'{\n' +
'  vec3 signed_normal = normalize( float(2*int(gl_FrontFacing)-1) * x_normal );\n' +
'  vec3 camera_vector = normalized_difference_( x_position, camera_position );\n' +
'\n' +
'  vec3 diffuse_light = vec3(0.0);\n' +
'  vec3 specular_light = vec3(0.0);\n' +
'  for (int i = 0; i != LIGHT_COUNT; ++i)\n' +
'  {\n' +
'    vec3 light_vector = normalized_difference_( x_position, light_position[i] );\n' +
'    diffuse_light += diffuse_fn( signed_normal, light_vector ) * diffuse_light_color[i].xyz;\n' +
'    specular_light += specular_fn( signed_normal, light_vector, camera_vector ) * specular_light_color[i].xyz;\n' +
'  }\n' +
'\n' +
'  // hack for safari\n' +
'  bool q =\n' +
'      gl_FrontFacing\n' +
'      ?\n' +
'      x_orientation < 0.5\n' +
'      :\n' +
'      x_orientation >= 0.5;\n' +
'\n' +
'  float front_facing = float(q);\n' +
'\n' +
'  // clamp x_orientation to 0 or 1\n' +
'  //float q = step(x_orientation, 0.5);\n' +
'\n' +
'  //bool flip = x_orientation > 0.5;\n' +
'  //float front_facing = float( gl_FrontFacing ^^ flip );\n' +
'\n' +
'  //float front_facing = float( gl_FrontFacing ^^ bool(x_orientation) );\n' +
'\n' +
'\n' +
'//  bool front = gl_FrontFacing;\n' +
'//  float front_facing = 0.0;\n' +
'//  if (front) {\n' +
'//    if (x_orientation < 0.5) {\n' +
'//        front_facing = 1.0;\n' +
'//    }\n' +
'//    else {\n' +
'//      front_facing = 0.0; }\n' +
'//  }\n' +
'//  else {\n' +
'//    if (x_orientation < 0.5) {\n' +
'//      front_facing = 0.0;\n' +
'//    }\n' +
'//    else {\n' +
'//      front_facing = 1.0;\n' +
'//    }\n' +
'//  }\n' +
'\n' +
'  //float front_facing = float(gl_FrontFacing);\n' +
'\n' +
'  vec4 d_color2[2];\n' +
'  compute_color(d_color2);\n' +
'  vec4 d_color = mix(d_color2[0], d_color2[1], front_facing);\n' +
'  vec4 s_color = mix(specular_color[0], specular_color[1], front_facing);\n' +
'  gl_FragColor = vec4( diffuse_light * d_color.xyz + specular_light * s_color.xyz, 1.0);\n' +
'}\n';

/* global
	 xwebgl
	 ,xlab
*/

//---------------------------------------------------
// ShaderCache
//---------------------------------------------------
xlab.ShaderCache = function(gl, shader_type, src) {
	'use strict';

	var shader = [];

	function get_shader(n) {
		if (!shader[n]) {
			shader[n] = xwebgl.compile(gl, shader_type, src[n]);
		}
		return shader[n];
	}

	return {get_shader : get_shader};
};

//---------------------------------------------------
// VertexShaderCache
//---------------------------------------------------
xlab.VertexShaderCache = function(gl) {
	'use strict';

	var version = '#version 100\n';
	var precision = 'precision highp float;\n';
	var header = version + precision;

	var src = [
		header + '#define GEOMETRY 0\n#define INSTANCE 0\n' + xlab.vshader,
		header + '#define GEOMETRY 1\n#define INSTANCE 0\n' + xlab.vshader,
		header + '#define GEOMETRY 0\n#define INSTANCE 1\n' + xlab.vshader,
		header + '#define GEOMETRY 1\n#define INSTANCE 1\n' + xlab.vshader,
		header + '#define GEOMETRY 0\n#define INSTANCE 2\n' + xlab.vshader,
		header + '#define GEOMETRY 1\n#define INSTANCE 2\n' + xlab.vshader
	];

	var shader_cache = xlab.ShaderCache(gl, gl.VERTEX_SHADER, src);

	function get_shader(geometry, instance) {
		var n = Number(geometry) + Number(instance) * 2;
		return shader_cache.get_shader(n);
	}
	return {get_shader : get_shader};
};

//---------------------------------------------------
// FragmentShaderCache
//---------------------------------------------------
xlab.FragmentShaderCache = function(gl) {
	'use strict';

	var version = '#version 100\n';
	var precision = 'precision mediump float;\n';
	var header = version + precision;

	var src = [
		header + '#define LIGHT_COUNT 3\n#define TEX 0\n' + xlab.fshader,
		header + '#define LIGHT_COUNT 3\n#define TEX 1\n' + xlab.fshader ];

	var shader_cache = xlab.ShaderCache(gl, gl.FRAGMENT_SHADER, src);

	function get_shader(tex) {
		return shader_cache.get_shader(Number(tex)); }

	return {get_shader : get_shader};
};

//---------------------------------------------------
// Uniforms
//---------------------------------------------------

xlab.Uniforms = function(surface) {
	'use strict';
	//var noneuclidean = xlab.util.spaceform_signature(surface.spaceform) !== 0;
	var grid_frequency = 'texture_scale' in surface ? surface.texture_scale : [1.0, 1.0];
	return {
		'light_position' : xlab.util.flatten([
			[ 1.0, 1.0, 1.0, 0.0 ], [ 0.0, 1.0, 1.0, 0.0 ], [ 1.0, 0.0, 1.0, 0.0 ]
		]),
		'diffuse_light_color' : xlab.util.flatten([
			[ 0.4, 0.4, 0.4, 1.0 ], [ 0.4, 0.4, 0.4, 1.0 ], [ 0.4, 0.4, 0.4, 1.0 ]
		]),
		'specular_light_color' : xlab.util.flatten([
			[ 0.4, 0.4, 0.4, 1.0 ], [ 0.4, 0.4, 0.4, 1.0 ], [ 0.4, 0.4, 0.4, 1.0 ]
		]),
		// back, front
		//'fgcolor' : xlab.util.flatten([ [0.8, 0.8, 0.8], [0.8, 0.8, 0.8] ] ),
		'fgcolor' : xlab.util.flatten([ [1.0, 1.0, 1.0], [1.0, 1.0, 1.0] ] ),

		//'color_scale': [ 0.3, 1.0 ],
		'color_scale': [ 0.7, 1.0 ],

		//'color_spec': xlab.util.flatten( [ [1.0, 0.8, 0.1, 0.2], [1.0, 0.8, 0.6, 0.6] ] ),
		'diffuse_factor' : 0.4,
		'specular_factor' : 0.5,
		'grid_frequency': [grid_frequency,grid_frequency],
		'grid_width': [[0.9, 0.9],[0.9, 0.9]],
		//'specular_color' : [ [ 0.2, 0.2, 0.2, 1.0 ], [ 0.4, 0.4, 0.4, 1.0 ] ]
		'specular_color' : [ [ 0.8, 0.8, 0.8, 1.0 ], [ 0.2, 0.2, 0.2, 1.0 ] ]
	};
};

//---------------------------------------------------
// Shader
//---------------------------------------------------

function has_texture(surface) {
	'use strict';
	for (var i = 0; i !== surface.vertex.packing.length; ++i) {
		if (surface.vertex.packing[i].name === 'texture') {
			return true;
		}
	}
	return false;
}

xlab.Shader = function(gl) {
	'use strict';
	var vshader_cache = xlab.VertexShaderCache(gl);
	var fshader_cache = xlab.FragmentShaderCache(gl);


	function get_shader(surface) {
		//--------------------------------
		// vshader
		var geometry = surface.spaceform.sign === 0 ? 0 : 1;
		var instanced =
	'transform' in surface ?
	(xwebgl.getExtension(gl,'ANGLE_instanced_arrays') === null ? 1 : 2) :
	0;
		//instanced =
		//	'transform' in surface ?
		//	1 :
		//	0;

		var vshader = vshader_cache.get_shader(geometry, instanced);

		//--------------------------------
		// fshader
		var fwidth = has_texture(surface) &&
				Boolean(xwebgl.getExtension(gl,'OES_standard_derivatives'));
		//fwidth = false;
		var fshader = fshader_cache.get_shader(fwidth);


		var attributes = [
		{'name' : 'position', 'type' : 'vec4'},
		{'name' : 'normal', 'type' : 'vec4'}, {'name' : 'texture', 'type' : 'vec2'},
		{'name' : 'instance_transform', 'type' : 'mat4'},
		{'name' : 'instance_orientation', 'type' : 'vec2'},
		{'name' : 'instance_color', 'type' : 'vec4'}
		];

		var uniforms = [
		{'name' : 'instance_transform', 'type' : 'mat4'},
		{'name' : 'instance_orientation', 'type' : 'vec2'},
		{'name' : 'instance_color', 'type' : 'vec4'},
		{'name' : 'object_transform', 'type' : 'mat4'},
		{'name' : 'camera_transform', 'type' : 'mat4'},
		{'name' : 'camera_position', 'type' : 'vec4'},
		{'name' : 'light_position', 'type' : 'vec4'},
		{'name' : 'diffuse_light_color', 'type' : 'vec4'},
		{'name' : 'specular_light_color', 'type' : 'vec4'},
		{'name' : 'diffuse_factor', 'type' : 'float'},
		{'name' : 'specular_factor', 'type' : 'float'},
		{'name' : 'fgcolor', 'type' : 'vec3'},
		{'name' : 'color_scale', 'type' : 'vec2'},
		{'name' : 'specular_color', 'type' : 'vec4'},
		{'name' : 'grid_frequency', 'type' : 'vec2'},
		{'name' : 'grid_width', 'type' : 'vec2'},
		];

		// program
		var program = xwebgl.Program(gl, [ vshader, fshader ], attributes, uniforms);
		program.uniform_constants = xlab.Uniforms(surface);
		return program;
	}

	return {get_shader : get_shader};
};
/*global
	xlab
	,WebGLDebugUtils
*/
//jshint unused:false
xlab.Panel = function(document, window, options) {
	'use strict';

	function log_gl(fn, args) {
		console.log('gl.' + fn + '(' +
		WebGLDebugUtils.glFunctionArgsToString(fn, args), ')' );
	}

	options = options || {};

	if ( ! window.WebGLRenderingContext ) {
		// this browser is not aware of WebGL
		alert( 'Your browser does not support WebGL. Try get.webgl.org.' );
	}

	var background_color = [ 0.05, 0.06, 0.07, 1.0 ];
	var callback;
	var fullscreen = true;
	// fixed_size is ignored if fullscreen==true
	var fixed_size = [400, 400];

	function _create_gl(options) {
		options = options || {};
		var canvas = document.createElement('canvas');

		// disable context menu
		canvas.oncontextmenu = function() { return false; };

		var gl = null;
		try {
			gl = canvas.getContext('webgl', options);
			if ( ! gl) {
	gl = canvas.getContext('experimental-webgl', options);
	if ( ! gl ) {
		alert('Could not start WebGL. Try get.webgl.org/troubleshooting.');
	}
			}
		}
		catch(error) {
			throw error;
		}


		//---------------------------------
		// debugging
		if (options['debug'] || options['log']) {
			console.log('enabling webgl debugging');
			if (options['log']) {
	console.log('enabling webgl logging');
	gl = WebGLDebugUtils.makeDebugContext(gl, undefined, log_gl);
			}
			else {
	gl = WebGLDebugUtils.makeDebugContext(gl);
			}
		}
		//---------------------------------

		gl.enable(gl.DEPTH_TEST);
		//gl.blendFunc(gl.SRC_ALPHA, gl.ONE_MINUS_SRC_ALPHA);
		//gl.enable(gl.BLEND);
		return gl;
	}

	var gl = _create_gl(options);

	function _set_viewport(gl) {
		var canvas = gl.canvas;

		var size_request;

		if (fullscreen) {
			size_request = [window.innerWidth, window.innerHeight];
		}
		else {
			size_request = fixed_size;
		}

		if ( [canvas.width,canvas.height] !== size_request) {
			canvas.width = size_request[0];
			canvas.height = size_request[1];
			gl.viewport(0, 0, canvas.width, canvas.height);
		}
	}

	function _gl_clear(gl) {
		//jshint bitwise:false
		gl.clear(gl.COLOR_BUFFER_BIT | gl.DEPTH_BUFFER_BIT);
		var b = background_color;
		gl.clearColor(b[0], b[1], b[2], b[3]);
	}

	function render(gl) {
		_set_viewport(gl);
		_gl_clear(gl);
		callback(gl);
	}

	function run() {
		(function loop() {
			window.requestAnimationFrame(loop);
			render(gl);
		})();
	}

	function add(callback_) {
		callback = callback_;
	}
	function remove(callback_) {
		callback = null;
	}

	return {
		gl : function() { return gl; },
		run : run,
		background_color : function() { return background_color; },
		set_background_color : function(_) { background_color = _; },
		size : function() {
			return [ gl.canvas.width, gl.canvas.height ];
		},
		add: add,
		remove: remove,
		canvas: gl.canvas
	};
};
/*global
xlab
,XMLHttpRequest
	,Uint8Array
 */

xlab.load_file = function(url, callback) {
	'use strict';
	var req = new XMLHttpRequest();
	req.open('GET', url);
	req.responseType = 'arraybuffer';

	/*jshint unused:false*/
	req.onload = function(e) {
		if (req.readyState === 4 && req.status === 200) {
			callback(req.response);
		}
	};
	/*jshint unused:true*/

	req.send(null);
};

xlab.load_image = function(url, callback) {
	'use strict';

	var image = new Image();
	image.onload = function() { callback(image); };
	image.src = url;
};

xlab.image_url = function(data) {
	'use strict';
	var blob = new Blob([ data ], {type : 'image/png'});
	var urlCreator = window.URL || window.webkitURL;
	return urlCreator.createObjectURL(blob);
};

xlab.load_image_from_data = function(data, callback) {
	'use strict';
	var image = new Image();
	// attach an onload callback to the image
	image.onload = function() { callback(image); };
	// load the image (asynchronous)
	image.src = xlab.image_url(data);
};


/*
xlab.load_cubemap = function(url, callback) {
	'use strict';

	var images = [];

	function on_image_load(i, image) {
		images[i] = image;
		if (images.length === 6) {
			callback(images);
		}
	}

	function make_image_callback(i, image) {
		return function() { on_image_load(i, image); };
	}

	function on_load(data) {

		var view = new Int32Array(data);

		//--------------------------
		// FIX: slice before reading the offsets to avoid possible copy
		//--------------------------

		for (var i = 0; i !== 12; i += 2) {
			var idata = new Uint8Array( data.slice(view[i], view[i+1]) );
			var image = new Image();
			image.onload = make_image_callback(i/2, image);
			image.src = xlab.image_url(idata);
		}
	}

	xlab.load_file(url, on_load);
};
*/


xlab._round_up = function(length, alignment) {
	'use strict';
	if (length % alignment === 0) { return length; }
	return length + (alignment - length % alignment);
};

xlab.load_images = function(url, callback) {
	'use strict';

	var ALIGNMENT = 4;

	var images = [];
	var total = 0;

	function on_image(i, image) {
		images[i] = image;
		if (images.length === total) {
			callback(images);
		}
	}

	function make_image_callback(i, image) {
		return function() { on_image(i, image); };
	}

	function on_file(data) {
		var p = 0;
		var i = 0;

		while(p < data.byteLength) {
			var length = new Uint32Array( data.slice(p, p+4) )[0];
			p += 4;
			if (xlab._round_up(p+length, ALIGNMENT) >= data.byteLength) {
	total = i+1;
			}
			var image = new Image();
			var slice = new Uint8Array(data.slice(p, p+length));
			url = xlab.image_url( slice );

			image.onload = make_image_callback(i, image);
			image.src = url;
			p = xlab._round_up(p+length, ALIGNMENT);
			++i;
		}
	}

	xlab.load_file(url, on_file);
};
/*global
	xlab
*/

xlab.rgba_string = function(x) {
	'use strict';
	return 'rgba(' + Math.round(x[0] * 255) + ',' + Math.round(x[1] * 255) + ',' +
				 Math.round(x[2] * 255) + ',' + x[3] + ')';
};

xlab.Button = function(document, index, callback) {
	'use strict';

	var SIZE = [ 20, 20 ];
	var RADIUS = 8;
	var LINE_WIDTH = 4;
	var canvas;

	var DISABLED = 0, NORMAL = 1, ACTIVE = 2;
	var state = DISABLED;

	var color = [
		// disabled
		[ 0.2, 0.2, 0.2, 0.5 ],
		// normal
		[ 0.5, 0.5, 0.5, 0.5 ],
		// active
		[ 1.0, 1.0, 1.0, 0.5 ]
	];
	var hover_color = [ 0.5, 1.0, 0.0, 0.5 ];
	var down_color = [ 0.0, 0.5, 1.0, 0.5 ];

	function draw(color) {
		var ctx = canvas.getContext('2d');
		ctx.clearRect(0, 0, canvas.width, canvas.height);
		ctx.lineWidth = LINE_WIDTH;
		ctx.strokeStyle = xlab.rgba_string(color);
		ctx.beginPath();
		ctx.arc(0.5 * SIZE[0], 0.5 * SIZE[1], RADIUS, 0.0, 2.0 * Math.PI);
		ctx.stroke();
	}

	function on_mouse_over() { draw(state ? hover_color : color[state]); }
	function on_mouse_out() { draw(color[state]); }
	function on_mouse_down() { draw(state ? down_color : color[state]); }
	function on_mouse_up() {
		if (state === DISABLED) {
			return;
		}
		draw(color[state]);
	}

	function init() {
		canvas = document.createElement('canvas');
		canvas.width = SIZE[0];
		canvas.height = SIZE[1];
		// top,right,bottom,left
		canvas.style.margin = '10px 5px 0px 5px';

		canvas.onclick = callback;
		canvas.onmouseover = function() { on_mouse_over(); };
		canvas.onmouseout = function() { on_mouse_out(); };
		canvas.onmousedown = function() { on_mouse_down(); };
		canvas.onmouseup = function() { on_mouse_up(); };

		draw(color[DISABLED]);
	}
	init();

	function enable() {
		state = NORMAL;
		draw(color[state]);
	}

	function set_active(flag) {
		if (state === DISABLED) {
			return;
		}
		state = flag ? ACTIVE : NORMAL;
		draw(color[state]);
	}

	function set_color(c) {
		color = [ c.disabled, c.normal, c.active ];
		hover_color = c.hover;
		down_color = c.down;
		draw(color[state]);
	}

	return {
		element : function() { return canvas; },
		enable : enable,
		set_active : set_active,
		set_color : set_color,
		size : SIZE
	};
};

/*
---------------------------------------------
ButtonBox
---------------------------------------------
*/
xlab.ButtonBox = function(document, count, callback) {
	'use strict';
	var div = document.createElement('div');
	var button = [];

	function make_callback(n) {
		return function() {
			for (var i = 0; i !== count; ++i) {
				button[i].set_active(false);
			}
			button[n].set_active(true);
			callback(n);
		};
	}

	function init() {
		for (var i = 0; i !== count; ++i) {
			var b = xlab.Button(document, i, make_callback(i));
			div.appendChild(b.element());
			button.push(b);
		}
	}
	init();

	function select(n) {
		for (var i = 0; i !== count; ++i) {
			button[i].set_active(false);
		}
		button[n].set_active(true);
	}

	function set_color(color) {
		for (var i = 0; i !== count; ++i) {
			button[i].set_color(color);
		}
	}

	return {
		element : function() { return div; },
		enable : function(i) { button[i].enable(); },
		select : select,
		set_color : set_color
	};
};
/*global
	xlab
*/

xlab.ViewerPanel = function() {
	'use strict';

	var panel = xlab.Panel(document, window );
	var mouse_filter = xlab.MouseFilter();
	var wheel_filter = xlab.WheelFilter();

	function init() {
		mouse_filter.connect(panel.gl().canvas);
		wheel_filter.connect(panel.gl().canvas);
	}
	init();

	function add(client) {
		panel.add(client.on_draw);
		mouse_filter.add(client);
		wheel_filter.add(client.on_wheel);
	}
	function remove(client) {
		panel.remove(client.draw);
		mouse_filter.remove(client);
		wheel_filter.remove(client.on_wheel);
	}

	return {
		add : add,
		remove : remove,
		run : panel.run,
		canvas : panel.gl().canvas,
		gl : panel.gl,
		set_background_color : panel.set_background_color
	};
};
/* global
	 xlab
*/

xlab.ViewerClient = function() {
	'use strict';

	var mouse = xlab.Mouse();
	var camera = xlab.Camera([1,1]);
	var program;
	var drawer;
	var surface_count = 0;

	function dispose() {
		if (program) {
			program.dispose();
		}
	}

	function set(surface, drawer_, program_) {
		dispose();
		mouse.set_spaceform(surface.spaceform.sign);

		if (surface_count === 0) {
			camera.set_box(surface.box);
			++surface_count;
		}

		program = program_;
		drawer = drawer_;
	}

	function on_draw(gl) {
		if (!drawer) {
			return;
		}

		program.enable();

		camera.update([gl.canvas.clientWidth, gl.canvas.clientHeight]);
		mouse.update();

		// camera transform
		program.uniforms.camera_transform(camera.transform());

		// camera_position
		program.uniforms.camera_position(camera.position());

		// object transform
		program.uniforms.object_transform(mouse.transform());
		program.set_uniforms(program.uniform_constants);

		drawer.update();
		program.disable();
	}

	return {
		set : set,
		slot : {
			on_mouse_down: mouse.slot.on_mouse_down,
			on_mouse_up: mouse.slot.on_mouse_up,
			on_mouse_move: mouse.slot.on_mouse_move,
			on_wheel:camera.on_wheel,
			on_draw: on_draw
		}
	};
};
/*global
	xwebgl
	,xlab
*/
xlab.Viewer = function() {
	'use strict';
	var surface_buttons;
	//var shader_buttons;

	var key_callback = {
		'32': function(){ console.log('space'); },
		'37': function(){ console.log('left'); },
		'39': function(){ console.log('right'); }
	};

	var viewer_panel = xlab.ViewerPanel();
	var viewer_client = xlab.ViewerClient();
	var shader_cache = xlab.Shader(viewer_panel.gl());
	var drawer_cache = xwebgl.DrawerCache(viewer_panel.gl());

	// listen to keyevents in document (rather than canvas)
	// to kill default key responses of the browser
	var key = xlab.Key(document, key_callback);

	function init() {
		document.body.style.margin = '0';
		// hide scrollbars
		document.body.style.overflow = 'hidden';

		// panel
		var gl = viewer_panel.gl();
		gl.canvas.style.position = 'absolute';
		gl.canvas.style.left = '0';
		gl.canvas.style.top = '0';
		// gl.canvas.style.zIndex = '-1';
		document.body.appendChild(gl.canvas);

		viewer_panel.add(viewer_client.slot);
	}
	init();

	function on_surface_button(id) {
		var surface = drawer_cache.get_surface(id);
		if (! surface) { return; }
		var program = shader_cache.get_shader(surface);
		viewer_client.set(surface, drawer_cache.get_drawer(id, program), program );
	}

	// callback when a surface is downloaded
	function on_surface(id, in_surface) {
		drawer_cache.set_surface(id, in_surface);
		//surface[id] = in_surface;
		surface_buttons.enable(id);

		// inject surface into viewer (if id==0)
		if (id !== 0) {
			return;
		}

		// initialize surface
		surface_buttons.select(0);
		on_surface_button(0);
	}

	function load(urls) {
		"http://service.ifam.uni-hannover.de/~geometriewerkstatt/gallery/resources/090b01/"
		console.log(urls[0])

		// surface_buttons
		surface_buttons = xlab.ButtonBox(document, urls.length, on_surface_button);
		var e = surface_buttons.element();
		e.style.position = 'absolute';
		e.style.left = '0px';
		e.style.top = '0px';
		document.body.appendChild(surface_buttons.element());

		// load surfaces
		function make_function(index) {
			return function(_) { on_surface(index, _); };
		}

		for (var i = 0; i !== urls.length; i += 1) {
			xlab.load_surface(urls[i], make_function(i));
		}
	}
	function run() { viewer_panel.run(); }

	return {load : load, run : run};
};

// jshint unused:false
function run(urls) {
	'use strict';
	var viewer = xlab.Viewer();
	viewer.load(urls);
	viewer.run();
}
