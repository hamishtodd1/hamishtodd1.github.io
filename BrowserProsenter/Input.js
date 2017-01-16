/*
 * You will almost certainly need a "viewport square", because people are used to their FOV being huge - that's the psychological thing that has been happenning. Put in VR journal?
 * If you connect with a browser and there's no VRMODE thing broadcasting, put a sign up
 */

//"get position data from other users" and "get our controller data" might be very different abstractions
var InputObject = { 
	//"private variables"
	ModelPositions: Array(),
	ModelQuaternions: Array(),
	ModelsReSynched: 0,
	
	UserString: "",
	proteinRequested: 0,
	
	clientX: 0,
	clientY: 0,
	
	HandPositions: Array(new THREE.Vector3(),new THREE.Vector3()),
	HandQuaternions: Array(new THREE.Quaternion(),new THREE.Quaternion()),
};

InputObject.processInput = function(Models,Controllers) //the purpose of this is to update everything
{	
	if( this.proteinRequested === 1 || this.theydownloaded !== "" )
	{
		var NewProteinString;
		//pretty damn unlikely that two users downloaded something on the same frame
		//note that this means that a person in VR can use the computer of a spectator to get themselves a protein, if they're on google cardboard
		if( this.proteinRequested === 1 )
		{
			NewProteinString = this.UserString;
			socket.emit('wedownloaded', this.UserString );
			ChangeUserString("");
			this.proteinRequested = 0;
		}
		else
		{
			NewProteinString = this.theydownloaded;
			this.theydownloaded = "";
		}
		
		for( var i = 0; i < FamousProteins.length / 2; i++ )
		{
			if( NewProteinString === FamousProteins[i*2] )
				Loadpdb( "http://files.rcsb.org/download/" + FamousProteins[i*2+1] + ".pdb", Models);
			
			if( i === FamousProteins.length - 1 ) //what if it's not a protein?
				Loadpdb( "http://files.rcsb.org/download/" + NewProteinString + ".pdb", Models);
		}
	}
	
	if(VRMODE) //including google cardboard TODO
	{
		OurVRControls.update();
		
//		GetVRInput(Controllers);
		
		for(var i = 0; i < Models.length; i++)
		{
			this.ModelPositions[i].copy(Models[i].position);
			this.ModelQuaternions[i].copy(Models[i].quaternion);
		}
		socket.emit('ModelStateUpdate', { positions:this.ModelPositions, quaternions:this.ModelQuaternions });
		
		socket.emit('CameraStateUpdate', {position:Camera.position.clone(), quaternion:Camera.quaternion.clone()});
		
		//also the controller
	}
	else
	{
		for(var i = 0; i < Models.length; i++)
		{
			Models[i].position.copy(this.ModelPositions[i]); 
			Models[i].quaternion.copy(this.ModelQuaternions[i]);
		}
	}
}

InputObject.ChangeUserString = function(newstring)
{
	this.UserString = newstring;
	
	//remove the previous string that was in there
	for(var i = 0; i < Scene.children.length; i++)
	{
		if( Scene.children[i].name === "The User's string")
			Scene.remove(Scene.children[i]);
	}
	
	if(newstring === "")
		return;
	
	var TextMesh = new THREE.Mesh(
			new THREE.TextGeometry(newstring,{size: 5, height: 1, font: gentilis}),
			new THREE.MeshPhongMaterial( {
				color: 0x156289,
				emissive: 0x072534,
				shading: THREE.FlatShading
			}) );
	
	TextMesh.scale.set(0.02,0.02,0.02)
	
	var TextCenter = new THREE.Vector3();
	for ( var i = 0, l = TextMesh.geometry.vertices.length; i < l; i ++ ){
		TextCenter.add( TextMesh.geometry.vertices[ i ] );
	}
	
	TextMesh.name = "The User's string";

	TextCenter.multiplyScalar( 1 / TextMesh.geometry.vertices.length );
	TextCenter.multiplyScalar( TextMesh.scale.x );
	TextMesh.position.sub(TextCenter);
	Scene.add(TextMesh);
}

//keyboard crap. Have to use "preventdefault" within ifs, otherwise certain things you'd like to do are prevented
InputObject.readfromkeyboard = function(event)
{
	//arrow keys
	if( 37 <= event.keyCode && event.keyCode <= 40)
	{
//		if(event.keyCode === 38)
//			Scene.scale.multiplyScalar(0.5);
//		if(event.keyCode === 40)
//			Scene.scale.multiplyScalar(2);
		
		//tank controls
//		var movingspeed = 0.8;
//		var turningspeed = 0.05;
//		
//		var forwardvector = Camera.getWorldDirection();
//		forwardvector.setLength(movingspeed);
//		
//		if(event.keyCode === 37)
//			Camera.quaternion.multiply(new THREE.Quaternion().setFromAxisAngle(Central_Y_axis, turningspeed));
//		if(event.keyCode === 38)
//			Camera.position.add(forwardvector);
//		if(event.keyCode === 39)
//			Camera.quaternion.multiply(new THREE.Quaternion().setFromAxisAngle(Central_Y_axis,-turningspeed));
//		if(event.keyCode === 40)
//			Camera.position.sub(forwardvector);
//		return;
	}
	
	if(event.keyCode === 190 )
	{
		event.preventDefault();
		OurVREffect.setFullScreen( true );
		
		//bug if we do this earlier(?)
		console.log(OurVREffect.scale);
		OurVREffect.scale = 0; //you'd think this would put your eyes in the same place but it doesn't
		
		return;
	}
	
	if(event.keyCode === 13) //enter
	{
		event.preventDefault();
		
		
		indicatorsound.source.stop();
		indicatorsound.playbackRate *= 2;
		indicatorsound.play();
		
//		this.proteinRequested = 1;
		return;
	}
	if(event.keyCode === 8) //backspace
	{
		event.preventDefault();
		this.ChangeUserString( this.UserString.slice(0, this.UserString.length - 1) );
		return;
	}
	
	//symbols
	{
		var arrayposition;
		if( 48 <= event.keyCode && event.keyCode <= 57 )
			arrayposition = event.keyCode - 48;
		if( 65 <= event.keyCode && event.keyCode <= 90 )
			arrayposition = event.keyCode - 55;
		
		if(typeof arrayposition != 'undefined')
		{
//			event.preventDefault(); //want to be able to ctrl+shift+j
			this.ChangeUserString(this.UserString + keycodeArray[arrayposition]); //this might get called before the above is compiled, ignore warning
			return;
		}
	}	
}
document.addEventListener( 'keydown', InputObject.readfromkeyboard, false );


InputObject.updatemouseposition = function(event)
{
	event.preventDefault();
	
	if(delta_t === 0) return; //so we get no errors before beginning
	
	this.clientX = event.clientX;
	this.clientY = event.clientY;
	
	var vector = new THREE.Vector3(
		  ( event.clientX / window.innerWidth ) * 2 - 1,
	    - ( event.clientY / window.innerHeight) * 2 + 1,
	    0.5 );
	vector.unproject( Camera );
	var dir = vector.sub( Camera.position ).normalize();
	var distance = - Camera.position.z / dir.z;
	var finalposition = Camera.position.clone();
	finalposition.add( dir.multiplyScalar( distance ) );
	
//	this.UserData[0].HandPosition.copy(finalposition);
}
document.addEventListener( 'mousemove', InputObject.updatemouseposition, false );

InputObject.sync_model_states = function(msg)
{
	if(msg.ModelPositions.length > this.ModelPositions.length)
	{
		for(var i = this.ModelPositions.length; i < msg.ModelPositions.length; i++)
		{
			this.ModelPositions[i] = new THREE.Vector3();
			this.ModelQuaternions[i] = new THREE.Quaternion();
		}
	}
	
	for(var i = 0; i < msg.ModelPositions.length; i++)
	{
		copyvec(this.ModelPositions[i], msg.ModelPositions[i]);
		copyquat(this.ModelQuaternions[i], msg.ModelQuaternions[i]);
	}
	
	this.ModelsReSynched = 1;
}
socket.on('ModelsReSync', InputObject.sync_model_states);

socket.on('theydownloaded', function(msg)
{
	this.theydownloaded = msg;
});

//TODO wanna remove spaces and reduce to lower case before checking this
var FamousProteins = Array(
		"rubisco", "1rcx",
		"keratin", "3TNU",
		"actin", "1RFQ",
		"myosin", "1W7J",
		"collagen", "1BKV",
		"integrin", "1rcx",
		"insulin", "4ins",
		"histone", "1AOI",
		"ferritin", "1FHA");