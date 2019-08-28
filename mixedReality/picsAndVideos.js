



/*
	Stay the same size from point of view of camera?
		Small when off screen and get big when they're picked up?
		Maybe better if you choose a "canvas plane" and things just go to that

	Videos
		"Play" is a button in the middle
			Keep the button held down and move up or down on it to increase or decrease speed or rewind
		MAY be memory intensive

	More
		Auto-rearrangement when on screen?
		Like in Captain disillusion. Physics sim?
		Panel should automatically go...
			close to camera so you don't have to look away much?
			On side so you don't have to crane your neck much?
		The corner of theirs that sticks to your hand is bottom left
			Later: may change to avoid obscuring your face
			It has to obscure your arm
*/

async function initPics(filenames, prefix)
{
	//gray scott simulation plane should get the orientation treatment too

	let picturesHeight = .09;

	let picturesGeo = new THREE.PlaneGeometry(1,1);
	picturesGeo.vertices.forEach(function(v)
	{
		v.y += .5;
	})

	let rosterHeight = 0.1;
	let borderThickness = .007;
	let roster = new THREE.Mesh( new THREE.PlaneGeometry( 1,picturesHeight + borderThickness*2. ), new THREE.MeshBasicMaterial({color:0xA0A0A0}));
	roster.scale.x = borderThickness*2.;
	roster.geometry.vertices.forEach(function(v)
	{
		v.z -= .000001;
		v.y += .5 * picturesHeight;
	})
	scene.add(roster)
	roster.position.copy(rightHand.position)
	updateFunctions.push(function()
	{
		roster.quaternion.copy(camera.quaternion)
	})

	let loader = new THREE.TextureLoader().setCrossOrigin(true)
	let imageMeshes = [];

	bindButton("s",function()
	{
		if(imageMeshes[0].handParent === null)
		{
			imageMeshes[0].handParent = rightHand
			rightHand.button1 = true
		}
		else
		{
			rightHand.button1 = false
		}
	})

	bindButton("a",function()
	{
		for(let i = 0; i < imageMeshes.length; i++)
		{
			imageMeshes[i].lastPlacedPosition.copy(imageMeshes[i].attractor)
			imageMeshes[i].attractor.copy(imageMeshes[i].rosterPosition)
		}
	})
	bindButton("q",function()
	{
		for(let i = 0; i < imageMeshes.length; i++)
		{
			imageMeshes[i].attractor.copy(imageMeshes[i].lastPlacedPosition)
		}
	})

	let videoDomElements = []
	let safeForVideo = false
	
	let load = async function(i)
	{
		let fileExtension = filenames[i].slice(filenames[i].length-3);
		let isVideo = ( fileExtension === "mp4" || fileExtension === "mov");

		let fullFilename = "data/" + prefix + "/" + filenames[i];

		let texture = null;
		let aspectRatio = -1;
		if(!isVideo)
		{
			await new Promise(resolve =>
			{
				loader.load(fullFilename,function(staticTexture)
				{
					texture = staticTexture;
					aspectRatio = texture.image.naturalWidth / texture.image.naturalHeight;

					resolve();

				}, function(){},function(e){console.error(e)})
			})
		}
		else
		{
			var videoDomElement = document.createElement( 'video' )
			videoDomElement.style = "display:none"
			videoDomElement.crossOrigin = 'anonymous';
			videoDomElement.src = fullFilename
			videoDomElement.loop = true
			videoDomElement.muted = true

			videoDomElements.push(videoDomElement)
			if(videoDomElements.length === 1)
			{
				log("Yo, you have to do this in chrome. Also, you probably have to click")
				renderer.domElement.addEventListener( 'click', function () {
					safeForVideo = true
					for(let i = 0; i < videoDomElements.length; i++)
					{
						videoDomElements[i].play();
						videoDomElements[i].pause();
					}
				});
			}

			texture = new THREE.VideoTexture( videoDomElement );
			aspectRatio = 2;
		}

		let imageMesh = new THREE.Mesh(picturesGeo,new THREE.MeshBasicMaterial({map:texture,side:THREE.DoubleSide}))
		imageMeshes.push(imageMesh)
		imageMesh.scale.x = aspectRatio * picturesHeight;
		imageMesh.scale.y = picturesHeight
		scene.add(imageMesh)

		imageMesh.rosterPosition = roster.position.clone();
		imageMesh.attractor = imageMesh.rosterPosition.clone();
		imageMesh.lastPlacedPosition = new THREE.Vector3()
		imageMesh.handParent = null

		roster.scale.x += imageMesh.scale.x;
		if( i > 0 )
		{
			imageMesh.rosterPosition.copy( imageMeshes[imageMeshes.length-2].rosterPosition )
			imageMesh.rosterPosition.x += imageMeshes[imageMeshes.length-2].scale.x / 2 + imageMesh.scale.x / 2

			for(let j = 0; j < imageMeshes.length; j++)
			{
				imageMeshes[j].rosterPosition.x -= imageMesh.scale.x / 2
				imageMeshes[j].attractor.copy(imageMeshes[j].rosterPosition)
			}
		}

		updateFunctions.push(function()
		{
			imageMesh.quaternion.copy(camera.quaternion)

			hands.forEach(function(hand)
			{
				let intersections = hand.intersectLaserWithObject(imageMesh)
				if( intersections.length !== 0 )
				{
					hand.laser.visible = true;
					if(hand.button1)
					{
						imageMesh.handParent = hand;
					}
				}
			})

			if( imageMesh.handParent !== null )
			{
				if( imageMesh.handParent.button1 )
				{
					imageMesh.attractor.copy(imageMesh.handParent.position)
				}
				else
				{
					imageMesh.handParent = null
				}
			}
			if( isVideo && safeForVideo )
			{
				let potentiallyOnScreen = !imageMesh.attractor.equals(imageMesh.rosterPosition);
				if( potentiallyOnScreen && videoDomElement.paused )
				{
					videoDomElement.play()
				}
				if( !potentiallyOnScreen && !videoDomElement.paused )
				{
					videoDomElement.pause()
				}
			}

			imageMesh.position.lerp(imageMesh.attractor,.2)
		})
	}
	for(let i = 0; i < filenames.length; i++)
	{
		await load(i)
	}
}