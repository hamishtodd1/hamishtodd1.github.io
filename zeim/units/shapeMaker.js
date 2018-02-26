function initShapeMaker()
{
	var coreRadius = 0.03;
	var core = new THREE.Mesh(new THREE.EfficientSphereBufferGeometry(coreRadius), new THREE.MeshPhongMaterial());
	core.position.z = -0.6;
	scene.add(core)

	clickables.push(core);

	function TippedRod()
	{
		var tippedRod = new THREE.Mesh(new THREE.CylinderBufferGeometryUncentered(coreRadius / 3,1), new THREE.MeshPhongMaterial());
		tippedRod.velocity = new THREE.Vector3();
		return tippedRod;
	}

	var tippedRods = [];
	var rodLength = 0.2;

	core.onClick = function()
	{
		var newTippedRod = TippedRod();
		this.add(newTippedRod);
		tippedRods.push(newTippedRod)
	}

	core.update = function()
	{
		var lastTipGrabbed = false;
		if( mouse.clicking && mouse.lastClickedObject === core )
		{
			lastTipGrabbed = true;
		}

		if( lastTipGrabbed )
		{
			var tip = mouse.rayIntersectionWithZPlaneInCameraSpace(this.position.z);
			if( tip.distanceToSquared(this.position) < sq(rodLength) )
			{
				tip.z += Math.sqrt(sq(rodLength)-tip.distanceToSquared(this.position));
			}
			else
			{
				tip.sub(this.position).setLength(rodLength).add(this.position)
			}
			pointCylinder(tippedRods[tippedRods.length-1], tip);
		}

		for(var i = 0; i < tippedRods.length; i++)
		{
			if( i === tippedRods.length-1 && lastTipGrabbed )
			{
				continue;
			}

			var acceleration = new THREE.Vector3()
			
			for(var j = 0; j < tippedRods.length; j++)
			{
				if(tippedRods[i] === tippedRods[j])
				{
					continue;
				}
				
				var addition = new THREE.Vector3().subVectors(tippedRods[j].position, tippedRods[i].position);
				var magnitude = (0.6 - addition.length()) * -0.06;
				addition.setLength( magnitude );
				
				acceleration.add(addition);
			}
			
			tippedRods[i].velocity.set(0,0,0); //can remove this severe damping for bounciness
			tippedRods[i].velocity.add(acceleration);
			var tip = yUnit.clone();
			tippedRods[i].localToWorld(tip)
			tip.sub(this.position).setLength(rodLength).add(this.position);

			pointCylinder(tippedRods[tippedRods.length-1], tip);
		}
	}
	markedThingsToBeUpdated.push(core);



	/*
		The interesting idea is putting points on a sphere and connecting with springs
		(the springs are on the surface)
		you can control their desired lengths
		Multiple concentric spheres; much more complexity that way
		Not spheres, rods that you drag out of the middle. Then you can change radii to "pull the thing over"
		decreasing the radius of the sphere is equivalent to "stretching the stuff over"

		octahedron
		icosahedron
		truncated octahedron
		truncated cuboctahedron
		truncated cube
		snub cube

		octagonal prism

		rhombic dodecahedron - not vertex transitive
		triakis truncated tetrahedron - not same edge lengths
		Weaire–Phelan - pretty chaotic
		hendecahedron - chaotic
		doggy - mirror symmetry but nothing else

		perhaps you should do it as coxeter dynkin diagrams
	*/
}