/*
	An example is a circle that all points gravitate towards then start circulating

	you can put a rigid object in a particular spot, pointing at two things

	Picture your hand in the "right hand rule configuration"

	Orientation field
		You put your hand in many places, potentially moving it
		the vectors wherever your hand was will go to that orientation

	Movement field
		You move your hand around. Whever it was and went to, a particle where it was will go where it went

	Put them together?

	Diffusive tensor field
		You move your hand through a given voxel multiple times
		a particle going through that voxel
			if it goes in the direction of your hand went it will go at the speed your hand went
			Limiting dimensionality a bit (eg do this first):
				it goes fastest in direction of your index finger
				second fastest if it's going in direction of middle finger
				third (0?) if it's going in the direction of your thumb
			or two hands. 6dof each and you're using the position of one to select voxel so perfect
				one goes at center of ellipsoid and defines its orientation
				t'other defines.. something else...
					You just have its translation and orientation from the origin
					But, you can have a copy of it
		Explain the ellipsoid deal (and their colors?)
		"Script"
			Brain
				See what's connected to what
				Look for tumors

	Could have an isosurface enclosing all matrices within a certain "distance" of the one being made by your hands

	Hmm, three vector fields = a tensor field?

	Want a particle system
	Maybe lots of tiny copies of your controller

	Make laminations? Certainly have different viz methods
*/

function initFieldSculptor()
{
	let fieldRepresentation = new THREE.Group()
	fieldRepresentation.scale.multiplyScalar(0.07)
	scene.add(fieldRepresentation)

	let gridRadius = 8
	function iterateGrid( func )
	{
		let gridRadiusSq = gridRadius*gridRadius
		let index = 0;
		for(let i = -gridRadius; i <= gridRadius; i++)
		{
			let iSq = i*i
			for( let j = -gridRadius; j <= gridRadius; j++)
			{
				let iSqPlusJSq = iSq + j*j
				for(let k = -gridRadius; k <= gridRadius; k++)
				{
					if( iSqPlusJSq+k*k <= gridRadiusSq)
					{
						func(i,j,k,index)
						index++
					}
				}
			}
		}
	}
	let numPointsInGrid = 0
	iterateGrid(function(){numPointsInGrid++})

	//particle system would be better, you do want lots
	//Oh it's probably not thaaaat hard to change
	//we maaaaay want to access their data though
	//if you want different colors it's a shader
	let particles = Array(numPointsInGrid*2)

	particles.representation = new THREE.Points(new THREE.Geometry(), new THREE.PointsMaterial({
		size:0.01
	}))
	particles.representation.geometry.vertices.length = particles.length
	fieldRepresentation.add(particles.representation)

	for(let i = 0; i < particles.length; i++)
	{
		particles[i] = {
			position: new THREE.Vector3(),
			velocity: new THREE.Vector3(Math.random()-0.5,Math.random()-0.5,Math.random()-0.5).multiplyScalar(0.01)
		}
		particles.representation.geometry.vertices[i] = particles[i].position
	}

	updatables.push(particles)
	particles.update = function()
	{
		for(let i = 0; i < particles.length; i++)
		{
			particles[i].position.add(particles[i].velocity)
		}
		this.representation.geometry.verticesNeedUpdate = true
	}

	return

	//tensor field
	{
		//This could be instanced but that is somewhat premature optimization
		//it's not hard though, you just have to have the positions and orientations in buffers

		let ellipsoids = Array(numPointsInGrid)
		let ellipsoidGeometry = new THREE.SphereBufferGeometry(0.4)
		iterateGrid( function(i,j,k)
		{
			let ellipsoid = new THREE.Mesh(ellipsoidGeometry, new THREE.MeshLambertMaterial({color:getRandomColor()}))
			ellipsoid.position.set(i,j,k)
			ellipsoid.scale.set(Math.random(),Math.random(),Math.random())
			ellipsoid.quaternion.set(Math.random()*2-1,Math.random()*2-1,Math.random()*2-1,Math.random()*2-1)
			ellipsoid.quaternion.normalize()
			fieldRepresentation.add(ellipsoid)
		})
	}
}