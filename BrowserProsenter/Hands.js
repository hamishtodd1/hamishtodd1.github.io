function UpdateHands(Models,Users)
{	
	//aesthetic stuff
	if(Users[0].Controller.Gripping){
//		Users[0].Controller.material.color.g = 1;
//		Users[0].Controller.scale.set(0.8,0.8,0.8);
	}
	else {
//		Users[0].Controller.material.color.g = 0;
//		Users[0].Controller.scale.set(1,1,1);
	}
	
	//The only camera in the scene that can be gripped is the real camera.
	//Note this does introduce minor disagreement - for the person whose controller it is, they're not holding that camera.
	
	
	for(var i = 0; i < Users.length; i++){
		if(Users[i].Gripping)
		{			
			for(var j = 0; j < Models.length; j++)
			{
				if( point_in_BoxHelper(Users[i].Controller.position,
						Models[j].children[0].BoundingBoxAppearance.geometry.attributes.position.array) )
				{
					AttemptPickup(Users[i].Controller, Models[j]);
				}
			}
			
			//i > 0 because it's hard to think of a situation in which you want to hold your own camera
			//note that no camera other than our own is picked up. The models are just that - models
			if( !VRMODE && i > 0 && Users[i].Controller.position.distanceTo( Camera.position ) < 0.2 )
			{
				//TODO iff you're not receiving input from a head tracker
				AttemptPickup(Users[i].Controller, Camera);
				//don't be surprised if this causes the camera to turn 45 degrees, you just have work to do
				//there is a good argument for allowing you multiple things in your hands, what if there's many cameras?
			}
		}
		else{
			Users[i].Controller.updateMatrixWorld();
			for(var j = 0; j < Users[i].Controller.children.length; j++)
			{
				Users[i].Controller.children[j].updateMatrixWorld();
				THREE.SceneUtils.detach(Users[i].Controller.children[j], Users[i].Controller, Scene);
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