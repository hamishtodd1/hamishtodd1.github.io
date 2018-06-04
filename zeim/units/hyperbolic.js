/*
	maybe you just want to get the longest geodesic possible?
	Maybe your projectile has a radius and it shouldn't get too close in a parallel-ish way

	https://cs.stanford.edu/people/jbaek/18.821.paper2.pdf
	
	Do for plane, sphere, torus, elipsoid, weirdly curved torus? Cylinder. Hyperboloid?
	Surfaces of revolution? Picture a skewed figure-of-8

	In script: in reality, our universe is weirdly curved and has a huge number of dimensions.
	The path that particles take through it are always geodesics, so studies of this are very important for physics
	Finding paths for paint on robots spraying car parts - so the Tesla Model 3 plant might do well to take account of this
	Also useful in geometric optics? "illumination problem"

	surfaces (function = 0)
		sphere			x2+y2+z2 - 1
		Trousers
		Torus			(x2+y2+z2+R2−r2)2−4R2(x2+y2)		easy parameterization
		Cylinder		x2+y2-1
		Dini Surface	http://web1.kcn.jp/hp28ah77/us20_pseu.htm https://mathoverflow.net/questions/149842/geodesics-on-the-twisted-pseudosphere-dinis-surface
		Pseudosphere	nonHypotenuseyBit = Math.sqrt(sq(radius)-sq(x)) - choose lots of x's
						y = radius * Math.log((radius+nonHypotenuseyBit)/x) - nonHypotenuseyBit
		Something made of a bunch of pseudospheres?
		klein quartic	x3y + y3z + z3x = 0 supposed to be in complex numbers but surely something?
		double torus? nicholas schmitt/dugan hammock. 
		https://arxiv.org/pdf/1307.6938.pdf
		Nice 2-torus	((sqrt(y^2+z^2)-b)^2+(x-a)^2) * ((sqrt(((sqrt(3)x-y)/2)^2+z^2)-b)^2+((x+sqrt(3)y)/2+a)^2) * ((sqrt((-(sqrt(3)x+y)/2)^2+z^2)-b)^2+((x-sqrt(3)y)/2+a)^2) = c^6
		hyperbolic paraboloid z = sq(x)-sq(y)
		Hyperboloid

	Can nicely morph between these because it's just lerping a few coefficients


*/

function initHyperbolic()
{
	var maxSpeed = 0.05;

	//maybe two balls sent in opposite directions?
	{
		var ball = new THREE.Mesh(new THREE.EfficientSphereGeometry(0.05), new THREE.MeshPhongMaterial({color:0xFF0000}));
		ball.velocity = new THREE.Vector3();
		
		{
			var trailCurrentSegment = 0;
			var trailSegments = 600;
			var trail;
			var trailThickness = 0.01;
			var trailCylinderSides = 16;
			trail = new THREE.Mesh(new THREE.Geometry(), new THREE.MeshBasicMaterial({color: ball.material.color}) );
			trail.geometry.vertices = Array(trailCylinderSides*2);
			trail.geometry.faces = Array(trailCylinderSides*2);
			var firstVertexIndex = 0;
			for(var i = 0; i < trailSegments; i++)
			{
				for( var j = 0; j < trailCylinderSides; j++)
				{
					trail.geometry.vertices[firstVertexIndex+j*2  ] = new THREE.Vector3();
					trail.geometry.vertices[firstVertexIndex+j*2+1] = new THREE.Vector3();
					
					trail.geometry.faces[firstVertexIndex+j*2 ] = new THREE.Face3(
						firstVertexIndex +  j*2+1,
						firstVertexIndex +  j*2+0,
						firstVertexIndex + (j*2+2) % (trailCylinderSides*2) );
					
					trail.geometry.faces[firstVertexIndex+j*2+1 ] = new THREE.Face3(
						firstVertexIndex +  j*2+1,
						firstVertexIndex + (j*2+2) % (trailCylinderSides*2),
						firstVertexIndex + (j*2+3) % (trailCylinderSides*2) );
				}
				firstVertexIndex += trailCylinderSides * 2;
			}
			function resetTrail()
			{
				for(var i = 0, il = trail.geometry.vertices.length; i < il; i++)
				{
					trail.geometry.vertices[i].copy(ball.position);
				}
			}
		}

		markedThingsToBeUpdated.push(ball);
		ball.update = function()
		{
			if(mouse.lastClickedObject === this.parent)
			{
				if(mouse.clicking && !mouse.oldClicking)
				{
					var clickedPoint = mouse.rayCaster.intersectObject( this.parent )[0].point;
					this.parent.updateMatrixWorld()
					this.parent.worldToLocal(clickedPoint);

					this.position.copy(clickedPoint)
					this.position.copy(this.parent.closestPointToPoint(this.position))
					resetTrail();
					this.velocity.set(0,0,0)
				}

				if(!mouse.clicking && mouse.oldClicking)
				{
					var cameraSpaceZ = this.position.clone().applyMatrix4(this.parent.matrix).z;
					this.velocity.copy( mouse.rayIntersectionWithZPlaneInCameraSpace(cameraSpaceZ) );
					this.parent.worldToLocal(this.velocity)
					this.velocity.sub(this.position).setLength(maxSpeed)
				}
			}

			var formerPosition = this.position.clone();
			var formerNormal = this.parent.getNormal(this.position);
			this.position.add(this.velocity)
			this.position.copy(this.parent.closestPointToPoint(this.position))
			var normal = this.parent.getNormal(this.position);
			var normalChangingQuaternion = new THREE.Quaternion().setFromUnitVectors(formerNormal,normal);
			this.velocity.applyQuaternion(normalChangingQuaternion)

			insertCylindernumbers( this.position, formerPosition,
				trail.geometry.vertices, trailCylinderSides, trailCurrentSegment * trailCylinderSides * 2, trailThickness );
			trail.geometry.verticesNeedUpdate = true;
			
			trailCurrentSegment++;
			if( trailCurrentSegment === trailSegments )
			{
				trailCurrentSegment = 0;
			}
		}
	}

	var surfaceMaterial = new THREE.MeshStandardMaterial({color:0x00FF00, side:THREE.DoubleSide});
	var surfaces = {};

	surfaces.planar = new THREE.Mesh(new THREE.PlaneGeometry(0.9,0.9), surfaceMaterial )
	surfaces.planar.closestPointToPoint = function(ambientPoint)
	{
		return ambientPoint.clone().setComponent(2,0)
	}
	surfaces.planar.getNormal = function(pointOnSurface)
	{
		return zUnit.clone();
	}

	var radius = 0.45;
	surfaces.spherical = new THREE.Mesh(new THREE.EfficientSphereGeometry(0.45,2), surfaceMaterial);
	surfaces.spherical.closestPointToPoint = function(ambientPoint)
	{
		return ambientPoint.clone().setLength(radius)
	}
	surfaces.spherical.getNormal = function(pointOnSurface)
	{
		return pointOnSurface.clone().normalize();
	}

	surfaces.toroidal = new THREE.Mesh(new THREE.Geometry(), surfaceMaterial);
	var torusRadiusIn4Space = 1;
	var param = 20;
	var projectionVector = new THREE.Vector4(1,0,0,0)
	for(var i = 0; i < param; i++)
	{
		for(var j = 0; j < param; j++)
		{
			var newPoint = new THREE.Vector3();
			surfaces.toroidal.geometry.vertices.push(newPoint);

			var wrappedI = i === 0? param-1:i-1;
			var wrappedJ = j === 0? param-1:j-1;
			var tl = wrappedI*param + wrappedJ;
			var tr = wrappedI*param + j;
			var bl = i*param + wrappedJ;
			var br = i*param + j;
			surfaces.toroidal.geometry.faces.push(new THREE.Face3(tl,tr,bl))
			surfaces.toroidal.geometry.faces.push(new THREE.Face3(bl,tr,br))
		}
	}
	
	// surfaces.toroidal.geometry.faces.push(new THREE.Face3(1,0,param))
	surfaces.toroidal.scale.setScalar(0.03)

	markedThingsToBeUpdated.push(surfaces.toroidal)
	surfaces.toroidal.update = function()
	{
		for(var i = 0; i < param; i++)
		{
			for(var j = 0; j < param; j++)
			{
				var newPointIn4Space = surfaces.toroidal.geometry.vertices[i*param+j]
				
				newPointIn4Space.x = Math.sin((i/param * TAU)*1.001);
				newPointIn4Space.y = Math.cos((i/param * TAU)*1.001);

				newPointIn4Space.z = Math.sin((j/param * TAU)*1.001);
				newPointIn4Space.w = Math.cos((j/param * TAU)*1.001);

				var newPoint = getStereographicProjection(newPointIn4Space,projectionVector)
				surfaces.toroidal.geometry.vertices[i*param+j].copy(newPoint)
			}
		}
		surfaces.toroidal.geometry.computeFaceNormals();
		surfaces.toroidal.geometry.computeVertexNormals();
		surfaces.toroidal.geometry.verticesNeedUpdate = true;
		surfaces.toroidal.geometry.normalsNeedUpdate = true;
		surfaces.toroidal.rotation.y += 0.01
	}

	/*
		Klein quartic
		Want a heptagon
		If there's a better way to do the genus 3 surface do that. But perfectly distributed perfectly toroidal holes sounds good
		Lots of partial tori
		4 * 2 triangles

		Heptagon
			Boundary first, that's the real part. Polar coordinates
			Then this thing becomes a parameterization from which you get thingy

		Five pentagon thing. Glue four edges together and you get a dodecagon
		Hmm so apparently two pentagons parameterize a pair of pants?
		Look you need to contact saul schleimer or whoever.
			Ok, the point is moving on the hyperbolic plane and the tori are a wrapped-up version of that
			



		
	*/

	var chosenSurface = surfaces.spherical
	scene.add(chosenSurface)
	clickables.push(chosenSurface)
	chosenSurface.position.z = -10;
	chosenSurface.add(ball, trail);
}

function getStereographicProjection(vector, projectionVector)
{
	//projects from the side of the sphere it's on to the hyperplane at x = 0
	var rayDirection = vector.clone().sub(projectionVector);
	var multiplier = 1 / rayDirection.x;
	var stereographicProjectionInFourSpace = rayDirection.multiplyScalar(multiplier);
	stereographicProjectionInFourSpace.add(projectionVector);

	var stereographicProjection = new THREE.Vector3(
		stereographicProjectionInFourSpace.y,
		stereographicProjectionInFourSpace.z,
		stereographicProjectionInFourSpace.w );
	return stereographicProjection;
}