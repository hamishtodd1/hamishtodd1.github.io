async function initCrystallography()
{
	//probably want it to receive shadow
	let crystalArea = new THREE.Mesh(new THREE.PlaneBufferGeometry(.8,.8), new THREE.MeshBasicMaterial())
	crystalArea.position.x = -.5
	scene.add(crystalArea)

	let asymmetricUnitAtoms = []
	let atomGeometry = new THREE.SphereBufferGeometry(.04)
	function AsymmetricUnitAtom()
	{
		let atom = new THREE.Object3D()
		crystalArea.add(atom)
		let mat = new THREE.MeshBasicMaterial()
		mat.color.r = Math.random()

		for(let i = 0; i < 4; i++)
		{
			let symmetricCopy = new THREE.Mesh(atomGeometry,mat)
			atom.add(symmetricCopy)
			clickables.push(symmetricCopy)
		}
		atom.children[0].position.x += .4;
		atom.children[1].position.y += .4;
		atom.children[2].position.x += .4;
		atom.children[2].position.y += .4;

		asymmetricUnitAtoms.push(atom)

		updateFunctions.push(function()
		{
			if(mouse.clicking && atom.children.indexOf(mouse.lastClickedObject) !== -1 )
			{
				atom.position.add(mouse.zZeroPosition)
				atom.position.sub(mouse.oldZZeroPosition)

				if(atom.position.x > 0.)
					atom.position.x -= .4
				if(atom.position.x < -.4)
					atom.position.x += .4
				if(atom.position.y > 0.)
					atom.position.y -= .4
				if(atom.position.y < -.4)
					atom.position.y += .4
			}
		})
	}

	AsymmetricUnitAtom()
	AsymmetricUnitAtom()
	asymmetricUnitAtoms[1].position.y = -.2

	{
		let atomCoords = new Float32Array(asymmetricUnitAtoms.length*3); //next thing to do is get an array in there, suuuurely possible
		//could do it as a texture though, rgb = xyz

		let material = new THREE.ShaderMaterial({
			uniforms: {
				numberGoingBetweenZeroAndOne: {value: 0},
				atomCoords: {value: atomCoords}
			},
		});
		await assignShader("basicVertex", material, "vertex")
		await assignShader("crystallographyFragment", material, "fragment")

		function assignCoords(index, v)
		{
			atomCoords[index*3 + 0] = v.x;
			atomCoords[index*3 + 1] = v.y;
			atomCoords[index*3 + 2] = v.z;
		}

		let plane = new THREE.Mesh(new THREE.PlaneBufferGeometry(.8,.8), material);
		plane.position.x = .5
		scene.add(plane);

		updateFunctions.push( function() 
		{
			material.uniforms.numberGoingBetweenZeroAndOne.value = 0.5 + Math.sin(clock.elapsedTime) * 0.5;

			for(let i = 0; i < asymmetricUnitAtoms.length; i++)
				assignCoords(i, asymmetricUnitAtoms[i].position)
		} )
	}
}