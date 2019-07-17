//function pointInBoundingSphere( point )
//{
//	var localPosition = point.clone();
//	this.updateMatrixWorld();
//	this.worldToLocal(localPosition);
//	var distance = localPosition.distanceTo( this.boundingSphere.center);
//	console.log(distance)
//	if( distance < this.boundingSphere.radius )
//		return true;
//	else return false;
//}

//function updateBoundingSphere()
//{
//	var oldRadius = this.geometry.boundingSphere.radius;
//	this.geometry.computeBoundingSphere();
//	var radiusChange = this.geometry.boundingSphere.radius / oldRadius;
//	//update the appearance of the bounding sphere TODO including position
//	this.children[0].geometry.applyMatrix(new THREE.Matrix4().makeScale( radiusChange, radiusChange, radiusChange ));
//}