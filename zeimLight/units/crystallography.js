/*
	http://www.ams.org/publicoutreach/feature-column/fc-2011-10
	https://www.youtube.com/watch?v=r3f__K8aoIE
	http://www.ysbl.york.ac.uk/~cowtan/sfapplet/sftut1.html
	http://www.ysbl.york.ac.uk/~cowtan/sfapplet/src/sfcalc.py

	Structure factors feel remarkably like a moire
*/

async function initCrystallography()
{
	//probably want it to receive shadow
	let crystalArea = new THREE.Mesh(new THREE.PlaneBufferGeometry(.8,.8), new THREE.MeshBasicMaterial())
	crystalArea.position.x = -.5
	scene.add(crystalArea)

	let unitCellDimension = .4

	let indicatorMat = new THREE.LineBasicMaterial({color:0x000000})
	let unitCellIndicator = new THREE.Group()
	crystalArea.add(unitCellIndicator)
	let corners = [
		new THREE.Vector3(unitCellDimension/2.,unitCellDimension/2.,.001),
		new THREE.Vector3(unitCellDimension/2.,-unitCellDimension/2.,.001),
		new THREE.Vector3(-unitCellDimension/2.,-unitCellDimension/2.,.001),
		new THREE.Vector3(-unitCellDimension/2.,unitCellDimension/2.,.001),
	]
	for(let i = 0; i < 4; i++)
	{
		let line = new THREE.LineSegments(new THREE.Geometry(),indicatorMat)
		unitCellIndicator.add(line)
		let toGoAlong = corners[(i+1)%4].clone().sub(corners[i])
		log(toGoAlong)
		for(let j = 0.; j < 10.; j++)
		{
			line.geometry.vertices.push(
				corners[i].clone().addScaledVector(toGoAlong, j / 10.),
				corners[i].clone().addScaledVector(toGoAlong, (j + .5) / 10.)
				)
		}
	}

	let asymmetricUnitAtoms = []
	let atomGeometry = new THREE.SphereBufferGeometry(.04)
	function AsymmetricUnitAtom()
	{
		let atom = new THREE.Object3D()
		crystalArea.add(atom)
		let mat = new THREE.MeshBasicMaterial({color:0x000000})

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
			}

			{
				if (atom.position.x > 0.)
					atom.position.x -= unitCellDimension
				if (atom.position.x < -unitCellDimension)
					atom.position.x += unitCellDimension
				if (atom.position.y > 0.)
					atom.position.y -= unitCellDimension
				if (atom.position.y < -unitCellDimension)
					atom.position.y += unitCellDimension
			}
		})
	}

	AsymmetricUnitAtom()
	AsymmetricUnitAtom()
	AsymmetricUnitAtom()
	asymmetricUnitAtoms[1].position.y = -.2
	asymmetricUnitAtoms[2].position.y = -.25


	//structure factors
	{
		var maxHk = 10 //how many from origin to the right
		var hkWide = maxHk * 2 + 1

		asymmetricUnitAtoms[0].position.set( 0.12, 0.10, 0. )
		asymmetricUnitAtoms[1].position.set( 0.20, 0.38, 0. )
		asymmetricUnitAtoms[2].position.set( 0.40, 0.20, 0. )

		//could be done in a vertex shader? Or a texture if it's axis aligned? Probably isn't though
		var amplitudes = new Float32Array(hkWide*hkWide)
		var phases = new Float32Array(hkWide*hkWide)

		let structureFactorArea = new THREE.Mesh(new THREE.PlaneBufferGeometry(.8, .8), new THREE.MeshBasicMaterial({color:0x000000}));
		let geo = new THREE.SphereBufferGeometry(.01)
		var structureFactorMeshes = Array(hkWide)
		for(let h = 0; h < hkWide; h++)
		{
			structureFactorMeshes[h] = Array(hkWide)
			for(let k = 0; k < hkWide; k++)
			{
				structureFactorMeshes[h][k] = new THREE.Mesh(geo, new THREE.MeshBasicMaterial())
				structureFactorMeshes[h][k].position.set(h - maxHk, k - maxHk, 0.).multiplyScalar(.4 / maxHk)
				structureFactorArea.add(structureFactorMeshes[h][k])
			}
		}
		// structureFactorArea.position.y = .8
		structureFactorArea.position.x = .5
		scene.add(structureFactorArea);
	}

	if(0)
	{
		let atomCoords = new Float32Array(asymmetricUnitAtoms.length*3); //next thing to do is get an array in there, suuuurely possible
		//could do it as a texture though, rgb = xyz

		var mapUniforms = {
			"numberGoingBetweenZeroAndOne": { value: 0 },
			"atomCoords": { value: atomCoords },
			"amplitudes": { value: amplitudes },
			"phases": { value: phases },
			"numStructureFactors": {value: hkWide*hkWide}
		}

		let material = new THREE.ShaderMaterial({
			uniforms: mapUniforms
		});
		await assignShader("basicVertex", material, "vertex")
		await assignShader("crystallographyFragment", material, "fragment")

		function assignCoords(index, v)
		{
			atomCoords[index*3 + 0] = v.x;
			atomCoords[index*3 + 1] = v.y;
			atomCoords[index*3 + 2] = v.z;
		}

		let mapArea = new THREE.Mesh(new THREE.PlaneBufferGeometry(.8,.8), material);
		mapArea.position.x = .5
		scene.add(mapArea);
	}

	updateFunctions.push(function ()
	{
		//don't you need to know the unit cell size?
		{
			let r, i, amplitude, phase, a, sfMesh, sfMeshCopy;
			//could do it on a texture, or a vertex shader?
			let amplitudeMax = 60.
			for (let h = -maxHk; h <= maxHk; h++) 
			{
				for (let k = -maxHk; k <= maxHk; k++) 
				{
					if (k > 0 || (k == 0 && h >= 0))
					{
						sfMesh = structureFactorMeshes[maxHk + h][maxHk + k];
						sfMeshCopy = structureFactorMeshes[maxHk - h][maxHk - k];

						r = 0.;
						i = 0.;
						for (let j = 0; j < asymmetricUnitAtoms.length; j++) {
							a = asymmetricUnitAtoms[j].position
							r += 6. * Math.cos(TAU * (h * a.x + k * a.y))
							i += 6. * Math.sin(TAU * (h * a.x + k * a.y))
						}
						amplitude = Math.sqrt(r * r + i * i)
						phase = Math.atan2(i, r)

						amplitudes	[(maxHk + h)*hkWide + maxHk + k] = amplitude;
						phases		[(maxHk + h)*hkWide + maxHk + k] = phase;
						amplitudes	[(maxHk - h)*hkWide + maxHk - k] = amplitude;
						phases		[(maxHk - h)*hkWide + maxHk - k] = -phase;

						sfMesh.scale.setScalar(.08 * amplitude)
						sfMeshCopy.scale.setScalar(.08 * amplitude) //better as a vertex attribute
						if (0) //realistic
							phase = 0.
						// amplitude = Math.min(1., amplitude / amplitudeMax)
						sfMesh.material.color.setHSL(phase, amplitude, .5)
						sfMeshCopy.material.color.copy(sfMesh.material.color)
					}
				}
			}
		}

		// mapUniforms.numberGoingBetweenZeroAndOne.value = 0.5 + Math.sin(clock.elapsedTime) * 0.5;

		// for (let i = 0; i < asymmetricUnitAtoms.length; i++)
		// 	assignCoords( i, asymmetricUnitAtoms[i].position )
	})
}