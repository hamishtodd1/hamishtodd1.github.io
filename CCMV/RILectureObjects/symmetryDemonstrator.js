/* Points of rotational, arrows of translational, lines of mirror
 * Your idea was diamonds. No points of > 2 degrees of rotational symmetry is the problem
 */
function initSymmetryDemonstration()
{
	//you could make it out of lines, that would deffo mean you could see what was behind it
	
	//the line of reflection
	morphedPattern.reflectionSymbol = new THREE.Object3D();
	morphedPattern.reflectionSymbol.scale.set(0.03,0.03,0.03);
	var num_measuringstick_dashes = 12;
	for(var i = 0; i < num_measuringstick_dashes; i++)
	{
		morphedPattern.reflectionSymbol.add(new THREE.Mesh(new THREE.PlaneGeometry(1,1), new THREE.MeshBasicMaterial({color:0x000000})));
		morphedPattern.reflectionSymbol.children[i].position.y = -0.5 - 2 * i;
	}
	
	morphedPattern.changeMode( "rotation" );
	
	morphedPattern.grabbedPosition = new THREE.Vector3(1,1,0);
	
	morphedPattern.update = function()
	{
		var grabbedPositionAsCurrentlySeen = grabbedPosition.clone();
		this.updateMatrixWorld();
		this.localToWorld(grabbedPositionAsCurrentlySeen);
		
		if(this.mode === "translation" )
		{
			this.position.x += grabbedPositionAsCurrentlySeen.x - currentHandLocation.x;
			if( this.position.x > this.translationSymbol.scale.x ) //YO THE SYMBOL NEEDS TO BE A 1 LONG MESH THAT IS SCALED
				this.position.x = this.translationSymbol.scale.x;
			if( this.position.x < 0 )
				this.position.x = 0;
		}	
		else if(this.mode === "rotation" )
		{
			var currentHandLocationInPlane = currentHandLocation.clone();
			currentHandLocationInPlane.z = 0;
			this.rotation.z = grabbedPositionAsCurrentlySeen.angleTo(currentHandLocationInPlane);
				
			if( this.rotation.z > TAU * 2 / 3)
				this.rotation.z = TAU * 2 / 3;
			if( this.rotation.z < 0)
				this.rotation.z = 0;
		}
		else if(this.mode === "reflection" )
		{
			
		}
	}
	
	morphedPattern.changeMode = function(newMode)
	{
		if(newMode === "translation" )
		{
			Scene.add(morphedPattern.translationSymbol);
		}
		if(newMode === "rotation" )
		{
			Scene.add(morphedPattern.rotationSymbol);
		}
		if(newMode === "reflection" )
		{
			Scene.add(morphedPattern.reflectionSymbol);
		}
		morphedPattern.
		//you add those objects to the scene so that they can be moved around. Ideally that affects how much the thing can change but eh
		this.mode = newMode;
	}
}