/*
	Useful for get monomer, anything else?
	
	Do you often put the same ligand into the same structure in many places?
		Assuming you're not doing a weird competition...
		Could make it so you can duplicate the things

	Could make it so you could make them! Buuuut they'd probably be all wrong if you did

	If you put it in place and then change your mind, wanna "undo", which puts it back in your hand
*/

function initMonomerReceiver()
{
	socket.commandReactions["monomerGotten"] = function(msg)
	{
		var monomer = makeModelFromCootString( modelDataString, visiBox.planes );

		monomer.scale.setScalar(getAngstrom())
		controllers[0].add(monomer);

		objectsToBeUpdated.push(monomer)
		monomer.update = function()
		{
			if(this.parent.button1)
			{
				THREE.SceneUtils.detach( this, this.parent, scene )
				THREE.SceneUtils.attach( this, scene, assemblage );

				objectsToBeUpdated.splice(objectsToBeUpdated.indexOf(this.update),1)
				delete this.update;
			}
		}
	}
}

function initKeyboardInput()
{
	var userString = "";
	var keycodeArray = "0123456789abcdefghijklmnopqrstuvwxyz";
	var textMesh = new THREE.Mesh( new THREE.PlaneBufferGeometry(1,1) )
	textMesh.position.z = -camera.near * 1.01
	textMesh.scale.set(0.01,0.01,1)
	//TODO signs saying "no internet connection" and "it's on its way" and "monomer not found"

	function updateUserString(newstring)
	{
		userString = newstring;
		
		//remove the previous string that was in there
		for(var i = 0; i < scene.children.length; i++)
		{
			if( scene.children[i].name === "The User's string")
			{
				scene.remove(scene.children[i]);
			}
		}
		
		var oldMaterial = textMesh.material;
		var oldTexture = textMesh.material.map;

		textMesh.material = makeTextSign( userString, false, true);
		textMesh.scale.x = textMesh.scale.y * textMesh.material.map.image.width / textMesh.material.map.image.height;

		oldMaterial.dispose(); //have to dispose of the canvas as well?
		if(oldTexture!==null)oldTexture.dispose();

		if( userString === "" )
		{
			camera.remove(textMesh)
		}
		else
		{
			camera.add(textMesh)
		}
	}

	document.addEventListener( 'keydown', function(event)
	{
		if(event.keyCode === 13) //enter
		{
			console.log("we send off for it")
			updateUserString( "" );
		}
		if(event.keyCode === 8) //backspace
		{
			updateUserString( userString.slice(0, userString.length - 1) );
		}
		//TODO ctrl + v
		
		var characterIndex = null;
		if( 48 <= event.keyCode && event.keyCode <= 57 )
		{
			characterIndex = event.keyCode - 48;
		}
		if( 65 <= event.keyCode && event.keyCode <= 90 )
		{
			characterIndex = event.keyCode - 55;
		}
		
		if( characterIndex !== null)
		{
			updateUserString( userString + keycodeArray[characterIndex] );
		}
	});
}