/*
	Sigh, need to consult an animator over this. It is an art and therefore it might go badly
	Eh, the pi creatures have very little to them but are effective. And you never notice the monkies in super monkey ball. This is exactly the kind of thing that *doesn't* matter
	Actually thinking about it more might make people like it less? Snakebird...
	Think snakebird music. Also noby noby boy
	Could add a "replace birds with controllers" button to ui if many don't like them.

	The beak is your hand. The head is "pulled" around behind it, eg position += destination-position * 0.1

	sound effect when you pick something up

	Geese never look at the screen, that's distracting, only at the stuff that you want the user to look at.

	Board is 16:9

	The beak goes where your hand goes

	Holding down the button opens the mouth. If there's a thing to bite down on, it does that

	It's certainly fine / plausible, in say an RI lecture, for one's assistants to not have a full understanding

	beak mouth is 0

	The pilotCamera lies on the z axis of the board

	bird heads fully respect hand rotation iff hand is holding something
	Otherwise their rotation is such that their neck is in a plane parallel to the board

	Geese should in general be facing the screen?
		Always have one in the frame, like if your hand leaves it it sticks around?
	Enforce some kind of "you can't move things in z because user can't?"
	Keep geese at fixed z and y in pilotCamera space
	Camera swivels so the board is directed towards you
	The left one is "sitting", the right one is showing stuff/teaching. Right one is bigger, left is a gosling
	But you do want to do things with both hands

	The situation is: you have an object and you want to gesture with both hands

	if(hand distance > board.width || hands not holding anything )
	{
		keep the student x fixed
	}
	else
	{
		student is still
	}

	Have to pick things up with right hand, "playing field" is fixed to your left hand

	When left is the only one onscreen you have some kind of holding animation

	Geese heads are always upright, never turned more than 90 degrees from pilotCamera
	Necks infinitely long probably, so swans maybe better

	Beaker from the muppets, simpsons, aardman, snakebird. But which have eyebrows. Groundskeeper willie

	Perhaps they could get frustrated if you've not done anything fun for a while

	eyelids, eyebrows (for raising), tongue

	could not update the geese while recording so they don't distract you?

	when paused, eyes could follow mouse

	Really you want to control the position of the beak, the head should not be the center
	 _
	/ \		pate
	| |O	
	| |\	
	| |/	
	| |
*/

function Goose()
{
	var newGoose = new THREE.Group();

	newGoose.scale.setScalar(0.01); //head radius

	var skinMaterial = new THREE.MeshPhongMaterial({color:0xFFFFFF});

	var radiusSegments = 32;

	var pate = new THREE.Mesh(new THREE.SphereBufferGeometry(1, radiusSegments, 32, TAU/4, TAU, 0, TAU/4), skinMaterial);
	newGoose.add(pate);
	pate.position.y = 1.7;
	var neckLength = pate.position.y;
	var cylinder = new THREE.Mesh(new THREE.CylinderBufferGeometry( 1, 1, pate.position.y + neckLength, radiusSegments), skinMaterial);
	cylinder.position.y = ( pate.position.y - neckLength ) / 2;
	newGoose.add(cylinder);

	var eyeRadius = 0.23;
	var ipd = eyeRadius * 2.05;
	var eyeballs = Array(2);
	for(var i = 0; i < 2; i++)
	{
		eyeballs[i] = new Eyeball(eyeRadius);
		eyeballs[i].position.z = eyeRadius + 1;
		eyeballs[i].position.y = pate.position.y - 0.4;
		eyeballs[i].rotation.x = TAU/4;
		var eyeAngleFromForward = Math.asin(ipd/2/eyeballs[i].position.z)
		if( i )
		{
			eyeAngleFromForward *= -1;
		}
		eyeballs[i].position.applyAxisAngle(yAxis,eyeAngleFromForward)

		newGoose.add(eyeballs[i]);
	}

	var beakTop = new THREE.Mesh(new THREE.Geometry(), new THREE.MeshLambertMaterial({color:0xE8B281}));
	var beakWidth = 1.2;
	beakTop.geometry.vertices.push(
		new THREE.Vector3( beakWidth/2,0,0),
		new THREE.Vector3(-beakWidth/2,0,0),
		new THREE.Vector3(0,beakWidth*0.9,0),
		new THREE.Vector3(0,0,beakWidth*0.7)
		);
	beakTop.geometry.faces.push(
		new THREE.Face3(0,2,3),
		new THREE.Face3(1,3,2),
		new THREE.Face3(0,3,1)
		);
	beakTop.geometry.computeFaceNormals();
	beakTop.position.z = Math.sqrt(1-sq(beakWidth/2))
	newGoose.add(beakTop);
	var beakBottom = new THREE.Mesh(new THREE.Geometry(), new THREE.MeshLambertMaterial({color:0xE8B281}));
	var beakWidth = 1.2;
	beakBottom.geometry.vertices.push(
		new THREE.Vector3( beakWidth/2*0.9,0,0),
		new THREE.Vector3(-beakWidth/2*0.8,0,0),
		new THREE.Vector3(0,-beakWidth*0.4,0),
		new THREE.Vector3(0,0,beakWidth*0.65)
		);
	beakBottom.geometry.faces.push(
		new THREE.Face3(0,3,2),
		new THREE.Face3(1,2,3),
		new THREE.Face3(0,1,3)
		);
	beakBottom.geometry.computeFaceNormals();
	beakBottom.position.z = Math.sqrt(1-sq(beakWidth/2))
	newGoose.add(beakBottom);

	beakSupposedToBeGrabbing = false;
	var beakGrabbingStage = 0;

	//a sound effect would be nice
	newGoose.update = function()
	{
		// this.rotation.y += 0.02
		
		var beakAngle = 0;
		var beakAngleWhenGrabbing = TAU/8;
		if( beakSupposedToBeGrabbing )
		{
			beakGrabbingStage += frameDelta * 4;
			beakGrabbingStage = clamp(beakGrabbingStage,0,1)

			var peakTime = 0.65;
			if(beakGrabbingStage < peakTime)
			{
				beakAngle = beakGrabbingStage;
			}
			else
			{
				beakAngle = peakTime - (beakGrabbingStage-peakTime);
			}
			beakAngle /= peakTime - (1-peakTime);
			console.log(beakAngle)
			beakAngle *= beakAngleWhenGrabbing;
			console.log(beakGrabbingStage)
		}
		else
		{
			beakGrabbingStage -= frameDelta * 4;
			beakGrabbingStage = clamp(beakGrabbingStage,0,1)

			beakAngle = beakGrabbingStage * beakAngleWhenGrabbing;
		}

		// beakAngle = (Math.sin(frameTime) + 1)/2 * TAU/6;
		beakTop.rotation.x = -beakAngle/2;
		beakBottom.rotation.x = beakAngle/2;
	}

	return newGoose;
}

function Eyeball(radius)
{
	var pupilAngle = TAU / 17;
	var eyeball = new THREE.Mesh(new THREE.SphereBufferGeometry(radius, 32, 32, 0, TAU, pupilAngle, TAU/2-pupilAngle), new THREE.MeshPhongMaterial({color:0xFFFFFF}) );
	var pupil = new THREE.Mesh(new THREE.SphereBufferGeometry(radius, 32, 32, 0, TAU, 0, pupilAngle), new THREE.MeshPhongMaterial({color:0x000000}) );
	eyeball.add(pupil);
	return eyeball;
}