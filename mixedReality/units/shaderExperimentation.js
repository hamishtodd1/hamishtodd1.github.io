/*
	Ideas
		Placing spheres and cylinders would be nice, for corners
		Arrows too
		volumetric ray cast
		scalar fields
			wavefunctions
			Reaction diffusion
			complex analysis
		Amman beenker!
		bezier tetrahedra
		SDF
			These are interesting for constructive geometry
			But are they even the best way of doing eg toruses? Can surely get arbitrary intersection immediately
		Complex functions; height = modulus, color = angle

	QM
		particle in a 1D box. Visualize as the series of complex planes along the line, eg a 3D space
		It's vertical
		Or could be a donut, which makes it simpler
		Amplitude to probability distribution is easy, it's a surface of revolution of |phi^2|

	Reaction diffusion
		https://www.youtube.com/watch?v=BV9ny785UNc
		https://pmneila.github.io/jsexp/grayscott/
		https://www.quantamagazine.org/wrinkles-and-dimples-obey-simple-rules-20150408/
		howto http://www.karlsims.com/rd.html to go with reaction diffusion what would be cool would be a cube of it,
		maybe even concentric spheres.
		You could have a “graph” going along the time axis next to the rectangle that shows the feed rate and death rate,
		and you could change them.

	z buffer crap? Can intersect hand controller? Test

	<script type="x-shader/x-vertex" id="vertexShader">
		void main() 
		{
			gl_Position = projectionMatrix * modelViewMatrix * vec4(position, 1.0);
		}
	</script>
	<script type="x-shader/x-fragment" id="fragmentShader">
		void main()
		{
			gl_FragColor = vec4(1.0, 0.0, 0.0, 1.0);
		}
	</script>
*/

async function initShaderExperimentation()
{
	let material = new THREE.ShaderMaterial({
		uniforms: {
			numberGoingBetweenZeroAndOne: {value: 0}
		},
	});
	await assignShader("vertex2", material, "vertex")
	// await assignShader("sdfFragment", material, "fragment")
	await assignShader("virtualHeart", material, "fragment")

	let plane = new THREE.Mesh(new THREE.PlaneBufferGeometry(0.5, 0.5, 10, 10), material);
	plane.position.y = 1.6
	plane.position.z = -0.5;
	scene.add(plane);
	
	let vertexDisplacement = new Float32Array(plane.geometry.attributes.position.count);
	for(let i = 0; i < vertexDisplacement.length; i ++)
	{
		vertexDisplacement[i] = 0//Math.sin(i);
	}
	plane.geometry.addAttribute('vertexDisplacement', new THREE.BufferAttribute(vertexDisplacement, 1));

	updateFunctions.push( function() 
	{
		//uniform
		material.uniforms.numberGoingBetweenZeroAndOne.value = 0.5 + Math.sin(clock.elapsedTime) * 0.5;
	
		//attribute
		for( let i = 0, il = vertexDisplacement.length; i < il; i++ )
		{
			vertexDisplacement[i] = Math.sin(i + clock.elapsedTime);
		}
		plane.geometry.attributes.vertexDisplacement.needsUpdate = true;
	} )
}

function getShader ( gl, id ){
	var shaderScript = document.getElementById ( id );
	var str = "";
	var k = shaderScript.firstChild;
	while ( k ){
		if ( k.nodeType == 3 ) str += k.textContent;
		k = k.nextSibling;
	}
	var shader;
	if ( shaderScript.type == "x-shader/x-fragment" )
					shader = gl.createShader ( gl.FRAGMENT_SHADER );
	else if ( shaderScript.type == "x-shader/x-vertex" )
					shader = gl.createShader(gl.VERTEX_SHADER);
	else return null;
	gl.shaderSource(shader, str);
	gl.compileShader(shader);
	if (gl.getShaderParameter(shader, gl.COMPILE_STATUS) == 0)
		alert(gl.getShaderInfoLog(shader));
	return shader;
}

var gl, canvas, c_w, c_h,
	prog, prog2, texture, texture2, FBO, FBO2, mvMat, mvMatLoc, rotMat,
	xOffs = yOffs = 0,  drag  = 0,  xRot = yRot = 0,  transl = -2.,
	n = 128, ny = 64,  it = 10, frames = 0, animation = "animate",
	a = .1, b = .2, eps = .05, D = 1,
	dt = .5, h = 2,  delay = 10, time, time0, ti0;
function webGLStart() {
	canvas = document.getElementById("canvas");
	c_w = window.innerWidth - 50;   c_h = window.innerHeight - 10;
	canvas.width = c_w;   canvas.height = c_h;
	var err = "Your browser does not support ";
	if (!window.WebGLRenderingContext){
		alert(err+"WebGL. See http://get.webgl.org");
		return;}
	try { gl = canvas.getContext("experimental-webgl");
	} catch(e) {}
	if ( !gl ) {alert("Can't get WebGL"); return;}
	if (gl.getParameter(gl.MAX_VERTEX_TEXTURE_IMAGE_UNITS) == 0){
		alert(err + "Vertex texture"); return;}
	var ext;
	try { ext = gl.getExtension("OES_texture_float");
	} catch(e) {}
	if ( !ext ) {alert(err + "OES_texture_float extension"); return;}

	prog  = gl.createProgram();
	gl.attachShader(prog, getShader( gl, "shader-vs" ));
	gl.attachShader(prog, getShader( gl, "shader-fs" ));
	gl.linkProgram(prog);
	gl.useProgram(prog);

	var vertices = [];
	for ( var y = 0; y < ny; y++ )
	for ( var z = 0; z < n; z++ )
		for ( var x = 0; x < n; x++ )
				vertices.push ( (x+.5)/n, y/ny, (z+.5)/n );
	var aPosLoc = gl.getAttribLocation(prog, "aPos");
	gl.enableVertexAttribArray( aPosLoc );
	gl.bindBuffer(gl.ARRAY_BUFFER, gl.createBuffer());
	gl.bufferData(gl.ARRAY_BUFFER, new Float32Array(vertices), gl.STATIC_DRAW);
	gl.vertexAttribPointer(aPosLoc, 3, gl.FLOAT, false, 0, 0);

	gl.uniform1i(gl.getUniformLocation(prog, "samp"), 0);
	gl.uniform1i(gl.getUniformLocation(prog, "path"), 1);
	gl.uniform1f(gl.getUniformLocation(prog, "pSize"), 5);

	var pixels = [];
	for(var y = 0; y < ny; y++)
	for(var z = 0; z < n; z++)
		for(var x = 0; x < n; x++){
			if( z > n/2 ){
				var t = (x + .2*y - n/2)*.1,  t2 = t - 2;
				pixels.push( 1*Math.exp(-t*t), .5*Math.exp(-t2*t2) );}
			else pixels.push( 0, 0 );
			pixels.push( 0, 0 );
		}
	texture = gl.createTexture();
	gl.bindTexture(gl.TEXTURE_2D, texture);
	gl.pixelStorei(gl.UNPACK_ALIGNMENT, 1);
	gl.texImage2D(gl.TEXTURE_2D, 0, gl.RGBA, n, ny*n, 0,
		gl.RGBA, gl.FLOAT, new Float32Array(pixels));
	gl.texParameteri(gl.TEXTURE_2D, gl.TEXTURE_MIN_FILTER, gl.NEAREST);
	gl.texParameteri(gl.TEXTURE_2D, gl.TEXTURE_MAG_FILTER, gl.NEAREST);
	gl.texParameteri(gl.TEXTURE_2D, gl.TEXTURE_WRAP_S, gl.CLAMP_TO_EDGE);
	gl.texParameteri(gl.TEXTURE_2D, gl.TEXTURE_WRAP_T, gl.CLAMP_TO_EDGE);
	texture2 = gl.createTexture();
	gl.bindTexture(gl.TEXTURE_2D, texture2);
	gl.pixelStorei(gl.UNPACK_ALIGNMENT, 1);
	gl.texImage2D(gl.TEXTURE_2D, 0, gl.RGBA, n, ny*n, 0, gl.RGBA,
			gl.FLOAT, new Float32Array(pixels));
	gl.texParameteri(gl.TEXTURE_2D, gl.TEXTURE_MIN_FILTER, gl.NEAREST);
	gl.texParameteri(gl.TEXTURE_2D, gl.TEXTURE_MAG_FILTER, gl.NEAREST);
	gl.texParameteri(gl.TEXTURE_2D, gl.TEXTURE_WRAP_S, gl.CLAMP_TO_EDGE);
	gl.texParameteri(gl.TEXTURE_2D, gl.TEXTURE_WRAP_T, gl.CLAMP_TO_EDGE);

	var prMatrix = new CanvasMatrix4();
	prMatrix.perspective(45, c_w/c_h, .1, 100);
	gl.uniformMatrix4fv( gl.getUniformLocation(prog,"prMatrix"),
		false, new Float32Array(prMatrix.getAsArray()) );
	mvMatrix = new CanvasMatrix4();
	rotMat = new CanvasMatrix4();
	rotMat.makeIdentity();
	rotMat.rotate(10, 1,0,0);
	mvMatLoc = gl.getUniformLocation(prog,"mvMatrix");

	prog2  = gl.createProgram();
	gl.attachShader(prog2, getShader( gl, "shader-vs2" ));
	gl.attachShader(prog2, getShader( gl, "shader-fs2" ));
	var aPos2Loc = 1;
	gl.bindAttribLocation(prog2, aPos2Loc, "aPos2");
	var aTexLoc = 2;
	gl.bindAttribLocation(prog2, aTexLoc, "aTexCoord");
	gl.linkProgram(prog2);
	gl.useProgram(prog2);
	gl.enableVertexAttribArray( aPos2Loc );
	gl.enableVertexAttribArray( aTexLoc );
	gl.uniform1i(gl.getUniformLocation(prog2, "samp2"), 0);
	gl.uniform1f(gl.getUniformLocation(prog2, "a"), a);
	gl.uniform1f(gl.getUniformLocation(prog2, "b"), b);
	gl.uniform1f(gl.getUniformLocation(prog2, "eps"), eps);
	gl.uniform1f(gl.getUniformLocation(prog2, "dt"),  dt);
	gl.uniform1f(gl.getUniformLocation(prog2, "dth2"), D*dt/(h*h));

	gl.bindBuffer(gl.ARRAY_BUFFER, gl.createBuffer());
	var vertices = new Float32Array([-1,-1,0, 1,-1,0, -1,1,0, 1,1,0]);
	var texCoords = new Float32Array([0,0, 1,0, 0,1, 1,1]);
	var texCoordOffset = vertices.byteLength;
	gl.bufferData(gl.ARRAY_BUFFER,
			texCoordOffset + texCoords.byteLength, gl.STATIC_DRAW);
	gl.bufferSubData(gl.ARRAY_BUFFER, 0, vertices);
	gl.bufferSubData(gl.ARRAY_BUFFER, texCoordOffset, texCoords);
	gl.vertexAttribPointer(aPos2Loc, 3, gl.FLOAT, gl.FALSE, 0, 0);
	gl.vertexAttribPointer(aTexLoc, 2, gl.FLOAT, gl.FALSE, 0, texCoordOffset);

	FBO = gl.createFramebuffer();
	gl.bindFramebuffer(gl.FRAMEBUFFER, FBO);
	gl.framebufferTexture2D(gl.FRAMEBUFFER, gl.COLOR_ATTACHMENT0,
			gl.TEXTURE_2D, texture, 0);
	FBO2 = gl.createFramebuffer();
	gl.bindFramebuffer(gl.FRAMEBUFFER, FBO2);
	gl.framebufferTexture2D(gl.FRAMEBUFFER, gl.COLOR_ATTACHMENT0,
			gl.TEXTURE_2D, texture2, 0);
	if( gl.checkFramebufferStatus(gl.FRAMEBUFFER) != gl.FRAMEBUFFER_COMPLETE)
		alert(err + "FLOAT as the color attachment to an FBO");

	gl.enable(gl.DEPTH_TEST);
	gl.depthFunc(gl.LEQUAL);
	gl.clearDepth(1.0);
	gl.clearColor(0, 0, .2, 1);

//draw(); return;
	time = time0 = ti0 = new Date().getTime();
	timer = setInterval(fr, 500);
	anim();

	canvas.resize = function (){
		c_w = window.innerWidth - 50;  c_h = window.innerHeight - 10;
		canvas.width = c_w;   canvas.height = c_h;
		prMatrix.makeIdentity();
		prMatrix.perspective(45, c_w/c_h, .1, 100);
		gl.uniformMatrix4fv( gl.getUniformLocation(prog,"prMatrix"),
			false, new Float32Array(prMatrix.getAsArray()) );
		draw();
	}
	canvas.onmousedown = function ( ev ){
			drag  = 1;
			xOffs = ev.clientX;  yOffs = ev.clientY;
	}
	canvas.onmouseup = function ( ev ){
			drag  = 0;
			xOffs = ev.clientX;  yOffs = ev.clientY;
	}
	canvas.onmousemove = function ( ev ){
			if ( drag == 0 ) return;
			if ( ev.shiftKey ) {
				transl *= 1 + (ev.clientY - yOffs)/300;
				yRot = - xOffs + ev.clientX; }
			else {
				yRot = - xOffs + ev.clientX;  xRot = - yOffs + ev.clientY; }
			xOffs = ev.clientX;   yOffs = ev.clientY;
			draw();
	}
	var wheelHandler = function(ev) {
		var del = 1.1;
		if (ev.shiftKey) del = 1.01;
		var ds = ((ev.detail || ev.wheelDelta) < 0) ? del : (1 / del);
		transl *= ds;
		draw();
		ev.preventDefault();
	};
	canvas.addEventListener('DOMMouseScroll', wheelHandler, false);
	canvas.addEventListener('mousewheel', wheelHandler, false);
}
function drawScene(){
	gl.viewport(0,0,n,ny*n);
	gl.useProgram(prog2);
	for(var i = 0; i < it; i++){
		gl.bindTexture(gl.TEXTURE_2D, texture);
		gl.bindFramebuffer(gl.FRAMEBUFFER, FBO2);
		gl.drawArrays(gl.TRIANGLE_STRIP, 0, 4);

		gl.bindTexture(gl.TEXTURE_2D, texture2);
		gl.bindFramebuffer(gl.FRAMEBUFFER, FBO);
		gl.drawArrays(gl.TRIANGLE_STRIP, 0, 4);
	}
	frames++;
//  if(time - time0 > 3000)
	draw();
}
function draw(){
	gl.viewport(0, 0, c_w, c_h);
	gl.bindFramebuffer(gl.FRAMEBUFFER, null);
	gl.useProgram(prog);
	rotMat.rotate(xRot/3, 1,0,0);  rotMat.rotate(yRot/3, 0,1,0);
	yRot = 0;  xRot = 0;
	mvMatrix.load( rotMat );
	mvMatrix.translate(0, 0, transl);
	gl.clear(gl.COLOR_BUFFER_BIT | gl.DEPTH_BUFFER_BIT);
	gl.uniformMatrix4fv( mvMatLoc, false,
		new Float32Array(mvMatrix.getAsArray()) );

	gl.drawArrays(gl.POINTS, 0, n*ny*n);
	gl.flush ();
}
function anim(){
	drawScene();
	switch ( animation ){
		case "reset":
		var pixels = [];
		for(var y = 0; y < ny; y++)
			for(var z = 0; z < n; z++)
			for(var x = 0; x < n; x++){
				if( z > n/2 ){
					var t = (x + .2*y - n/2)*.1,  t2 = t - 2;
					pixels.push( 1*Math.exp(-t*t), .5*Math.exp(-t2*t2) );}
				else pixels.push( 0, 0 );
				pixels.push( 0, 0 );
			}
		gl.bindTexture(gl.TEXTURE_2D, texture);
		gl.texImage2D(gl.TEXTURE_2D, 0, gl.RGBA, n, ny*n, 0,
			gl.RGBA, gl.FLOAT, new Float32Array(pixels));
		gl.bindTexture(gl.TEXTURE_2D, texture2);
		gl.texImage2D(gl.TEXTURE_2D, 0, gl.RGBA, n, ny*n, 0, gl.RGBA,
			gl.FLOAT, new Float32Array(pixels));
		time0 = time;
		animation = "animate";
		case "animate":
			if (delay == 0) requestAnimationFrame(anim);
			else setTimeout("requestAnimationFrame(anim)", delay);
			break;
		case "stop":
			break;
	}
}
function run(v) {
	if( animation == "animate" ){
		animation = "stop";
		document.getElementById('runBtn').value = "Run ";}
	else{
		animation = "animate";
		document.getElementById('runBtn').value = "Stop";
		anim();
	}
}
function reset() {
	if( animation == "stop" ){
		animation = "reset";
		document.getElementById('runBtn').value = "Stop";
		anim();}
	else animation = "reset";
}
function fr(){
	var ti = new Date().getTime();
	var fps = Math.round(1000*frames/(ti - time));
	document.getElementById("framerate").value = fps;
	frames = 0;  time = ti;
}

//this is all the stuff
function setDelay(v) {
	delay = parseInt(v);
}
function setA(v) {
	gl.useProgram(prog2);
	gl.uniform1f(gl.getUniformLocation(prog2, "a"), parseFloat(v));
}
function setB(v) {
	gl.useProgram(prog2);
	gl.uniform1f(gl.getUniformLocation(prog2, "b"), parseFloat(v));
}
function setEps(v) {
	gl.useProgram(prog2);
	gl.uniform1f(gl.getUniformLocation(prog2, "eps"), parseFloat(v));
}
function setDt(v) {
	dt = parseFloat(v);
	gl.useProgram(prog2);
	gl.uniform1f(gl.getUniformLocation(prog2, "dt"), dt);
	gl.uniform1f(gl.getUniformLocation(prog2, "dth2"), D*dt/(h*h));
}
function setH(v) {
	h = parseFloat(v);
	gl.useProgram(prog2);
	gl.uniform1f(gl.getUniformLocation(prog2, "dth2"), D*dt/(h*h));
}
function setPath(v) {
	gl.finish();
	gl.useProgram(prog);
	gl.uniform1i(gl.getUniformLocation(prog, "path"), v);
	draw();
}
function setSize(v) {
	var si = parseInt(v);
	gl.useProgram(prog);
	gl.uniform1f(gl.getUniformLocation(prog, "pSize"), si);
	draw();
//alert(si);
}
