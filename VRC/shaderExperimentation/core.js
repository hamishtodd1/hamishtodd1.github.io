function init()
{
	var renderer,
		scene,
		camera,
		myCanvas = document.getElementById('myCanvas');
	
	//RENDERER
	renderer = new THREE.WebGLRenderer({
	  canvas: myCanvas, 
	  antialias: true
	});
	renderer.setClearColor(0xffffff);
	renderer.setPixelRatio(window.devicePixelRatio);
	renderer.setSize(window.innerWidth, window.innerHeight);
	
	//CAMERA
	camera = new THREE.PerspectiveCamera(35, window.innerWidth / window.innerHeight, 300, 10000 );
	
	//SCENE
	scene = new THREE.Scene();
	
	//Custom Shader Material
	var whichMaterial = 2;
	if(whichMaterial === 2)
	{
		var customUniforms = {
	    delta: {value: 0}
		};
		var material = new THREE.ShaderMaterial({
			transparent:true,
			uniforms: customUniforms,
			vertexShader: document.getElementById('vertexShader2').textContent,
			fragmentShader: document.getElementById('fragmentShader2').textContent
		});
	}
	else
	{
		var material = new THREE.ShaderMaterial({
			transparent:true,
			uniforms: [],
			vertexShader: document.getElementById('vertexShader').textContent,
			fragmentShader: document.getElementById('fragmentShader').textContent
		});
	}
	
	var box = new THREE.Mesh(new THREE.BoxBufferGeometry(100, 100, 100, 10, 10, 10), material);
	box.position.z = -1000;
	box.position.x = -100;
	scene.add(box);
	
	var sphere = new THREE.Mesh(new THREE.SphereGeometry(50, 20, 20), material);
	sphere.position.z = -1000;
	sphere.position.x = 100;
	scene.add(sphere);
	
	var plane = new THREE.Mesh(new THREE.PlaneGeometry(10000, 10000, 100, 100), material);
	plane.rotation.x = -90 * Math.PI / 180;
	plane.position.y = -100;
	scene.add(plane);
	
	//attribute
	var vertexDisplacement = new Float32Array(box.geometry.attributes.position.count);
	
	for (var i = 0; i < vertexDisplacement.length; i ++) {
	    vertexDisplacement[i] = Math.sin(i);
	}
	
	box.geometry.addAttribute('vertexDisplacement', new THREE.BufferAttribute(vertexDisplacement, 1));
	
	//RENDER LOOP
	render();
	
	var delta = 0;
	function render() 
	{
	    delta += 0.0005;
	
	    //uniform
		if(whichMaterial === 2)
			material.uniforms.delta.value = 0.5 + Math.sin(delta) * 0.5;
	
	    //attribute
	    for (var i = 0, il = vertexDisplacement.length; i < il; i ++) {
	        vertexDisplacement[i] = 0.5 + Math.sin(i + delta) * 0.25;
	    }
	    box.geometry.attributes.vertexDisplacement.needsUpdate = true;
	
		renderer.render(scene, camera);
	
		requestAnimationFrame(render);
	}
}