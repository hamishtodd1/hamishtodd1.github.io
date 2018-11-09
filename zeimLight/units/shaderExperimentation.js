/*
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
	var customUniforms = {
    	numberGoingBetweenZeroAndOne: {value: 0}
	};
	var material = new THREE.ShaderMaterial({
		uniforms: customUniforms,
	});
	await assignShader("vertex2", material, "vertex")
	await assignShader("fragment2", material, "fragment")


	// function c()
	// {
	// 	console.log("yo")
	// }
	// async function b()
	// {
	// 	await c()
	// }
	// b()

	var plane = new THREE.Mesh(new THREE.PlaneBufferGeometry(0.9, 0.9, 10, 10), material);
	// plane.rotation.x = -90 * Math.PI / 180;
	// plane.position.y = -100;
	scene.add(plane);
	
	//attribute
	var vertexDisplacement = new Float32Array(plane.geometry.attributes.position.count);
	
	for (var i = 0; i < vertexDisplacement.length; i ++)
	{
	    vertexDisplacement[i] = Math.sin(i);
	}
	
	plane.geometry.addAttribute('vertexDisplacement', new THREE.BufferAttribute(vertexDisplacement, 1));

	updatables.push(plane)
	plane.update = function() 
	{
	    //uniform
		material.uniforms.numberGoingBetweenZeroAndOne.value = 0.5 + Math.sin(clock.elapsedTime) * 0.5;
	
	    //attribute
	    for( var i = 0, il = vertexDisplacement.length; i < il; i++ )
	    {
	        vertexDisplacement[i] = Math.sin(i + clock.elapsedTime);
	    }
	    plane.geometry.attributes.vertexDisplacement.needsUpdate = true;
	}
}

function assignShader(fileName, materialToReceiveAssignment, vertexOrFragment)
{
	var propt = vertexOrFragment + "Shader"
	var fullFileName = "units/shaders/" + fileName + ".glsl"

	return new Promise(resolve => {
		var xhr = new XMLHttpRequest();
		xhr.open("GET", fullFileName, true);
		xhr.onload = function(e)
		{
			materialToReceiveAssignment[propt] = xhr.response
			resolve();
		};
		xhr.onerror = function ()
		{
			console.error(fullFileName, "didn't load");
		};
		xhr.send();
	})
}