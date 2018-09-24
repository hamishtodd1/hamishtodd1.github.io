/*
	Discovery fiction: start with axis scalar-multiplied by angle
		But shit! With some vectors we get back to where we started and we want to take account of that
		Plus, how do we combine them?
		Might sound a bit like that old asteroids thing

	Complex multiplication as an example of multiplying points. And, heck, vector addition

	At some point make a hand attached to a shoulder that has a certain orientation

	The double cover is "this shitty little thing"
		That idea about the fish and its shadow world
		Attach it to *something outside its world*, and now it can tell whether it is in shadow world



	//---------------------
	You put a slice through the sphere and project from points either side of it, on the surface and as far away as possible from the slice
	The location and orientation of the slice is what matters

	The shells of the spheres are both projections of the slice plane
	For both spheres, the area outside it is area that COULD be projected to, you just reduce it to the other sphere

	If there's a triangle whose vertices are in separate spheres, urgh, gotta "cut" it. Soooo, better have line segments

	There's a 2D and 1D analogue of this, and you can even just take slices out

	
	You do want this "go from 2 to one having everything" thing
	That requires you to think of this universe as S3. ok.
	Either one "inflates" (around an inflation point quite close to the other)
	To match up with the other
	Or one is "sapped" by the other


	Obviously you want to project geometry in there.
		That rather screws up this "update" dichotomy, because you don't want to record every coordinate

	Script
		Map analogy: You see the two hemispheres, they have quite a separation
		"Rotate the globe". Show you can increase and decrease the size of the slice, putting more of the globe on one
		Unfolds to a fish universe with a little fish in it
		It was "wrapped around" the hemisphere with a single widely-curved fold.
		There's an "equator" controlling where the projection is limited to
		Make that fold bigger and smaller, showing how that redistributes bits of the globe or makes the same projection bigger and smaller
		And then you can still move the fold back and forth
		Close up the fold, showing how it becomes very much like the globe is "squashed" to the center
			And you can remove the equator
		
		Ok then, up a dimension?

	Ohhh, origami
		Grab rigidly in one hand, move a point with the other and that does define a fold
*/



function initStereographicThreeSphere()
{
	var stereographicThreeSphere = new THREE.Group();
	var sphereRepresentations = Array(2);
	for(var i = 0; i < 2; i++)
	{
		sphereRepresentations[i] = new THREE.Mesh(
			new THREE.EfficientSphereBufferGeometry(1),
			new THREE.MeshPhongMaterial({transparent:true,opacity:0.3}));
		sphereRepresentations[i].position.x = i?1:-1;
		sphereRepresentations[i].material.color.setRGB(Math.random(),Math.random(),Math.random());
		stereographicThreeSphere.add(sphereRepresentations[i]);
	}
	stereographicThreeSphere.position.z = -0.5;
	stereographicThreeSphere.scale.setScalar(0.1);
	scene.add(stereographicThreeSphere);

	var positionsOnThreeSphere = Array(5);
	updatePositionOnThreeSphere = function()
	{
		// this.add(new THREE.Vector4().setToRandomQuaternion().multiplyScalar(0.05))
		this.setLength(1);
		
		this.representation.position.copy(getStereographicProjectionToTwoSpheres(this));
		if( this.representation.position.distanceTo(sphereRepresentations[ 0 ].position) > 1 &&
			this.representation.position.distanceTo(sphereRepresentations[ 1 ].position) > 1 )
		{
			console.error("hmm")
		}
	}
	for(var i = 0; i < positionsOnThreeSphere.length; i++)
	{
		positionsOnThreeSphere[i] = new THREE.Vector4().setToRandomQuaternion();
		markedThingsToBeUpdated.push(positionsOnThreeSphere[i]);

		positionsOnThreeSphere[i].update = updatePositionOnThreeSphere;

		positionsOnThreeSphere[i].representation = new THREE.Mesh(
			new THREE.EfficientSphereBufferGeometry(0.03),
			new THREE.MeshPhongMaterial());
		positionsOnThreeSphere[i].representation.material.color.setRGB(Math.random(),Math.random(),Math.random());
		stereographicThreeSphere.add(positionsOnThreeSphere[i].representation);
	}

	return stereographicThreeSphere;
}

THREE.Vector4.prototype.distanceTo = function(otherVec)
{
	var displacement = otherVec.clone().sub(this);
	return displacement.length();
}
THREE.Vector4.prototype.setToRandomQuaternion = function()
{
	this.set(
		Math.random()-0.5,
		Math.random()-0.5,
		Math.random()-0.5,
		Math.random()-0.5);
	this.setLength(1);

	return this;
}

function getStereographicProjectionToTwoSpheres(vector)
{
	var rayOrigin = new THREE.Vector4(-1,0,0,0);
	//projects from the side of the sphere it's on to the hyperplane at x = 0
	var sphereToGoInto = null;
	if(vector.x > 0)
	{
		sphereToGoInto = sphereRepresentations[0].position.x > sphereRepresentations[1].position.x ? sphereRepresentations[0] : sphereRepresentations[1];
	}
	else
	{
		rayOrigin.negate()
		sphereToGoInto = sphereRepresentations[0].position.x > sphereRepresentations[1].position.x ? sphereRepresentations[1] : sphereRepresentations[0];
	}
	var rayDirection = vector.clone().sub(rayOrigin);
	var multiplier = 1 / rayDirection.x;
	var stereographicProjectionInFourSpace = rayDirection.multiplyScalar(multiplier);
	stereographicProjectionInFourSpace.add(rayOrigin);
	//if you've done it right these will not leave the spheres
	var stereographicProjection = new THREE.Vector3(
		stereographicProjectionInFourSpace.y,
		stereographicProjectionInFourSpace.z,
		stereographicProjectionInFourSpace.w );
	stereographicProjection.add(sphereToGoInto.position)
	return stereographicProjection;
}