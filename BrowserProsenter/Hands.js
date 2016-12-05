function UpdateHands(Models,Controllers)
{	
	for(var i = 0; i < Controllers.length; i++)
	{
		if(Controllers[i].Gripping){
//			Controllers[i].material.color.g = 1;
//			Controllers[i].scale.set(0.8,0.8,0.8);
		}
		else {
//			Controllers[i].material.color.g = 0;
//			Controllers[i].scale.set(1,1,1);
		}
	}
	
	if(VRMODE) for(var i = 0; i < Controllers.length; i++)
	{
		if(Controllers[i].Gripping)
		{			
			for(var j = 0; j < Models.length; j++)
			{
				if( point_in_BoxHelper(Controllers[i].position,
						Models[j].children[0].BoundingBoxAppearance.geometry.attributes.position.array) )
				{
					AttemptPickup(Controllers[i], Models[j]);
				}
			}
		}
		else{
			Controllers[i].updateMatrixWorld();
			for(var j = 0; j < Controllers[i].children.length; j++)
			{
				Controllers[i].children[j].updateMatrixWorld();
				THREE.SceneUtils.detach(Controllers[i].children[j], Controllers[i], Scene);
			}
		}
	}
}

function AttemptPickup(UserController, GrabbableObject)
{
	var alreadyholdingthisobject = 0;
	for(var j = 0; j < UserController.children.length; j++){
		if(UserController.children[j].uuid === GrabbableObject.uuid)
			alreadyholdingthisobject = 1;
	}
	
	if(!alreadyholdingthisobject)
	{
		UserController.updateMatrixWorld();
		THREE.SceneUtils.attach(GrabbableObject, Scene, UserController);
	}
}

function point_in_BoxHelper(ourpoint,boxgeometryarray){
	//going to assume that these always hold true
	var maxX = boxgeometryarray[0];
	var maxY = boxgeometryarray[1];
	var maxZ = boxgeometryarray[2];
	
	var minX = boxgeometryarray[18];	
	var minY = boxgeometryarray[19];	
	var minZ = boxgeometryarray[20];
	
	if( minX <= ourpoint.x && ourpoint.x <= maxX &&
		minY <= ourpoint.y && ourpoint.y <= maxY &&
		minZ <= ourpoint.z && ourpoint.z <= maxZ )
		return 1;
	else return 0;
}