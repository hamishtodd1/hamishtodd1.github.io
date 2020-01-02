function initBayes()
{
	let horizontalResolution = 74
	let verticalResolution = 74
	let pixelArea = new THREE.Mesh(new THREE.OriginCorneredPlaneBufferGeometry(horizontalResolution,verticalResolution))
	pixelArea.width = 0.9
	pixelArea.height = pixelArea.width
	pixelArea.scale.multiplyScalar(pixelArea.width/horizontalResolution,pixelArea.height/verticalResolution,1)
	pixelArea.position.set(pixelArea.scale.x,pixelArea.scale.y,0).multiplyScalar(horizontalResolution/-2)
	pixelArea.position.x -= 0.5
	scene.add(pixelArea)

	let pickedColor = -1
	let colorPickers = Array(4)
	for(let i = 0; i < colorPickers.length; i++)
	{
		colorPickers[i] = new THREE.Mesh(new THREE.CircleBufferGeometry(0.1,16), new THREE.MeshBasicMaterial({color:0x000000}))
		colorPickers[i].position.copy(pixelArea.position)
		colorPickers[i].position.x = pixelArea.position.x + pixelArea.width / 2 + (i-1.5) * 0.22
		colorPickers[i].position.y = pixelArea.position.y - 0.15
		scene.add(colorPickers[i])

		clickables.push(colorPickers[i])
		colorPickers[i].onClick = function()
		{
			pickedColor = i-1
			console.log(pickedColor)
		}
	}
	colorPickers[1].material.color.r = 1
	colorPickers[2].material.color.g = 1
	colorPickers[3].material.color.b = 1

	// {
	// 	let switches = Array(3)
	// 	for( let i = 0; i < switches.length; i++ )
	// 	{
	// 		switches[i] = new THREE.Mesh(new THREE.CircleBufferGeometry(0.1,16), new THREE.MeshBasicMaterial({color:0x000000}))
	// 		switches[i].position.x = 0.5 + (i-1) * 0.32
	// 		scene.add(switches[i])

	// 		let selected = new THREE.Mesh(new THREE.CircleBufferGeometry(0.13,16), new THREE.MeshBasicMaterial({color:0xFFFFFF}))
	// 		selected.position.z = -0.01
	// 		selected.visible = false
	// 		switches[i].add(selected)

	// 		clickables.push(switches[i])
	// 		switches[i].onClick = function()
	// 		{
	// 			selected.visible = !selected.visible
	// 		}
	// 	}
	// 	switches[0].material.color.g = 1
	// 	switches[1].material.color.b = 1
	// 	switches[2].material.color.r = 1
	// }

	let pixelGeometry = new THREE.OriginCorneredPlaneBufferGeometry(1,1)
	pixelArea.pixels = Array(horizontalResolution*verticalResolution)
	for(let i = 0; i < horizontalResolution; i++)
	{
		for(let j = 0; j < verticalResolution; j++)
		{
			let pixel = new THREE.Mesh(pixelGeometry, new THREE.MeshBasicMaterial({color:0x000000}))
			pixelArea.pixels[i*verticalResolution+j] = pixel
			pixel.position.set(i,j,0)
			pixelArea.add(pixel)
		}
	}

	let result = new THREE.Group()
	result.scale.copy(pixelArea.scale)
	result.pixels = []
	scene.add(result)
	for(let i = 0; i < horizontalResolution; i++)
	{
		let pixel = new THREE.Mesh(pixelGeometry, new THREE.MeshBasicMaterial({color:0x000000}))
		result.pixels[i] = pixel
		pixel.position.set(i,0,0)
		result.add(pixel)
	}
	result.position.x = 0.5 - result.scale.x * horizontalResolution * 0.5
	result.scale.y *= 5
	result.position.y -= 0.5

	// function preMakeArea(center, radius, r,g,b)
	// {

	// }

	// let premadeAreas = []
	// premadeAreas

	for(let i = 0; i < 3; i++)
	{
		let center = new THREE.Vector3(10,0,0)
		center.applyAxisAngle(zUnit,i*TAU/3)
		center.x += horizontalResolution/2
		center.y += verticalResolution/2
		console.log(center)
		colorPixelsInDisk( center, 20, i)
	}

	function colorPixelsInDisk(center, radius, rGOrB)
	{
		for(let i = 0; i < pixelArea.pixels.length; i++)
		{
			if( center.distanceTo(pixelArea.pixels[i].position) < radius )
			{
				if( rGOrB === 0)
				{
					pixelArea.pixels[i].material.color.r = 1
				}
				else if( rGOrB === 1)
				{
					pixelArea.pixels[i].material.color.g = 1
				}
				else if( rGOrB === 2)
				{
					pixelArea.pixels[i].material.color.b = 1
				}
				else
				{
					pixelArea.pixels[i].material.color.setRGB(0,0,0)
				}
			}
		}
	}
	
	updatables.push(pixelArea)
	clickables.push(pixelArea)
	pixelArea.update = function()
	{
		if(mouse.lastClickedObject !== this)
		{
			return
		}

		if( mouse.clicking && !mouse.oldClicking)
		{
			//make it all black probably so you can think only about yer new area?
		}

		if( mouse.clicking)
		{
			let localMouse = mouse.zZeroPosition.clone()
			this.worldToLocal(localMouse)

			colorPixelsInDisk( localMouse, 3, pickedColor )

			let numerator = 0
			let denominator = 0
			for(let i = 0; i < this.pixels.length; i++)
			{
				let c = this.pixels[i].material.color
				if(c.r && c.g)
				{
					denominator++
					if(c.b)
					{
						numerator++
					}
				}
			}
			if(denominator)
			{
				let proportion = numerator/denominator
				for(let i = 0; i < result.pixels.length; i++)
				{
					if(i/result.pixels.length < proportion)
					{
						result.pixels[i].material.color.b = 1
					}
					else
					{
						result.pixels[i].material.color.b = 0
					}
				}
			}
		}
		
		if( !mouse.clicking && mouse.oldClicking )
		{

		}
	}
}

function initTubeBayes()
{
	let pipeRadius = 0.06;
	let pipeCurve = new THREE.Curve();
	let numRadialSegments = 16
	pipeCurve.getPoint = function( t )
	{
		return new THREE.Vector3(0,-t,0)
	}
	let pipeGeometry = new THREE.TubeGeometry( pipeCurve, 60, pipeRadius * 1.04, numRadialSegments )
	let pipe = new THREE.Mesh( pipeGeometry, new THREE.MeshPhongMaterial({
		transparent:true,
		opacity:0.4,
		color:0xFF0000,
		// visible:false
	}) )
	pipe.position.y = 0.5
	scene.add( pipe );

	let segment = new THREE.Mesh(new THREE.Geometry())
	segment.geometry.vertices.push(new THREE.Vector3())
	for(let i = 0; i < numRadialSegments+1; i++)
	{
		segment.geometry.vertices.push(new THREE.Vector3())
		if(i < numRadialSegments+1)
		{
			segment.geometry.faces.push(new THREE.Face3(0,i,i+1))
		}
	}

	let p = 0.25
	let thetaLength = p * TAU
	for(let i = 1, il = segment.geometry.vertices.length; i < il; i++)
	{
		let v = segment.geometry.vertices[i]
		v.set(0,0,pipeRadius)
		v.applyAxisAngle(yUnit,(i-1)/numRadialSegments * thetaLength)
	}

	segment.position.y = -0.5

	//mouse gets anywhere near the fuckers, great big grabbables pop up
	//erm, is this a bayes net? No. The variables would affect many points on... a pipe?

	scene.add(segment)

	// let balls = Array(50); //multiples of 2 and 5
	// let ballGeometry = new THREE.EfficientSphereGeometry(0.009)
	// for(let i = 0; i < balls.length; i++)
	// {

	// }
}


function initOldBayes()
{
	let balls = Array(50); //multiples of 2 and 5
	let ballGeometry = new THREE.EfficientSphereGeometry(0.009)
	let resetBall = function()
	{
		this.position.set(Math.random()-0.5,0.5,0)
		this.velocity.set(0,0,0);
		this.material.color.setRGB(0,0,0)
	}
	let bouncing = true;
	let updateBall = function()
	{
		let acceleration = new THREE.Vector3(0,-0.0012,0);
		this.velocity.add(acceleration)
		let terminalVelocity = 0.03;
		if(Math.abs(this.velocity.y) > terminalVelocity )
			this.velocity.y = this.velocity.y < 0? -terminalVelocity:terminalVelocity;
		
		for(let i = 0, il = shelves.length; i<il;i++)
		{
			shelves[i].ballInteraction(this)
		}
		
		this.position.add(this.velocity);
		
		if( this.position.y < -0.5)
			this.reset();
	}
	for(let i = 0, il = balls.length; i < il; i++)
	{
		balls[i] = new THREE.Mesh( ballGeometry, new THREE.MeshBasicMaterial());
		scene.add(balls[i]);
		updatables.push(balls[i])
		balls[i].velocity = new THREE.Vector3();
		balls[i].reset = resetBall;
		balls[i].reset();
		balls[i].update = updateBall;
		balls[i].position.y = 0.5 + Math.random() 
	}
	
	let shelfHeight = 0.02;
	let shelfGetSideX = function(side)
	{
		let centerToSide = this.scale.x;
		if( side !== SHELF_RIGHT )
			centerToSide *= -1;
		return centerToSide + this.position.x;
	}
	let shelfSetSideX = function(side,newX)
	{
		let otherSideX = this.getSideX(1-side)
		this.position.x = ( newX + otherSideX ) / 2;
		this.scale.x = Math.abs( newX - otherSideX ) / 2;
	}
	let shelfBallInteraction = function(ball)
	{
		if( ball.position.y + ball.velocity.y < this.position.y 
			&& ball.position.y > this.position.y
			&& this.getSideX(SHELF_LEFT) < ball.position.x && ball.position.x < this.getSideX(SHELF_RIGHT) )
		{
			if( ball.material.color.getComponent(this.importantColorComponent) !== this.material.color.getComponent(this.importantColorComponent) )
			{
				if(bouncing)
				{
					//bad integration but who cares
					ball.position.y = this.position.y;
					ball.velocity.y *= -0.5;
				}
				
				ball.material.color.setComponent( this.importantColorComponent, this.material.color.getComponent(this.importantColorComponent) );
			}
		}
	}
	let SHELF_LEFT = 1;
	let SHELF_RIGHT = 0;
	let shelfUpdate = function()
	{
		if(!clientClicking)
		{
			this.grabbed = false;
			this.leftSideGrabbed = false;
			this.rightSideGrabbed = false;
			somethingGrabbed = false;
		}
		else if( !somethingGrabbed )
		{
			if( clientPosition.y < this.position.y && clientPosition.y > this.position.y - shelfHeight )
			{
				if( Math.abs( -this.scale.x - (clientPosition.x - this.position.x) ) < 0.01 )
				{
					this.leftSideGrabbed = true;
					somethingGrabbed = true;
				}
				else if( Math.abs( this.scale.x - (clientPosition.x - this.position.x) ) < 0.01 )
				{
					this.rightSideGrabbed = true;
					somethingGrabbed = true;
				}
				else if( -this.scale.x < clientPosition.x - this.position.x && clientPosition.x - this.position.x < this.scale.x )
				{
					this.grabbed = true;
					somethingGrabbed = true;
				}
			}
		}
		
		if( this.leftSideGrabbed )
		{
			this.setSideX( SHELF_LEFT, this.getSideX(SHELF_LEFT) + clientDelta.x);
		}
		if( this.rightSideGrabbed )
		{
			this.setSideX( SHELF_RIGHT, this.getSideX(SHELF_RIGHT) + clientDelta.x);
		}
		if( this.grabbed )
		{
			this.position.x += clientDelta.x;
//			this.position.y += clientDelta.y; //irrelevant, distracting. Creates unwanted phenomenon regarding the color that balls can be as determined by order
			
			if( this.getSideX(SHELF_LEFT) < -0.5)
			{
				this.position.x -= this.getSideX(SHELF_LEFT) - -0.5;
			}
			if( this.getSideX(SHELF_RIGHT) > 0.5)
			{
				this.position.x -= this.getSideX(SHELF_RIGHT) - 0.5;
			}
		}
	}
	function makeShelf(index)
	{
		let shelf = new THREE.Mesh(new THREE.PlaneGeometry(2,shelfHeight), new THREE.MeshBasicMaterial({color:0xFF0000}));
		updatables.push(shelf)
		shelf.importantColorComponent = index;
		shelf.position.x = 0.3*(Math.random() - 0.5);
		shelf.position.y = -shelfHeight * index; //narrow so people don't think about what color things can be in between 
		let newRGB = [0,0,0];
		if(newRGB.length <= shelf.importantColorComponent) console.error("Nope")
		newRGB[shelf.importantColorComponent] = 1;
		shelf.material.color.fromArray(newRGB);
		for(let i = 0; i < shelf.geometry.vertices.length; i++)
			shelf.geometry.vertices[i].y -= shelfHeight / 2;
		shelf.scale.x = 0.1
		
		shelf.grabbed = false;
		shelf.leftSideGrabbed = false;
		shelf.rightSideGrabbed = false;
		
		shelf.getSideX = shelfGetSideX;
		shelf.setSideX = shelfSetSideX;
		shelf.update = shelfUpdate;
		shelf.ballInteraction = shelfBallInteraction;
		
		scene.add(shelf);
		return shelf;
	}
	let shelves = Array(3);
	for(let i = 0; i < shelves.length; i++)
		shelves[i] = makeShelf(i);
	
	let singleHolderGeometry = new THREE.Geometry()
	let gapWidth = 0.8;
	let gapHeight = 0.8;
	singleHolderGeometry.vertices.push(
			new THREE.Vector3(0,1,0),
			new THREE.Vector3((1-gapWidth)/2,1,0),
			new THREE.Vector3(1-(1-gapWidth)/2,1,0),
			new THREE.Vector3(1,1,0),
			new THREE.Vector3((1-gapWidth)/2,1-gapHeight,0),
			new THREE.Vector3(1-(1-gapWidth)/2,1-gapHeight,0),
			new THREE.Vector3(0,0,0),
			new THREE.Vector3(1,0,0)
	);
	singleHolderGeometry.faces.push(
			new THREE.Face3(0,1,6),
			new THREE.Face3(4,1,6),
			new THREE.Face3(4,5,6),
			new THREE.Face3(7,5,6),
			new THREE.Face3(7,5,2),
			new THREE.Face3(7,3,2)
	);
	let singleHolderMaterial = new THREE.MeshBasicMaterial({color:0x000000, side:THREE.DoubleSide});

	let arrayHolder = new THREE.Object3D();
	for(let i = 0; i < balls.length; i++)
	{
		let newHolder = new THREE.Mesh(singleHolderGeometry,singleHolderMaterial);
		newHolder.position.x = i - balls.length/2;
		arrayHolder.add(newHolder);
	}
	arrayHolder.scale.setScalar(0.4/balls.length)
	scene.add(arrayHolder)	
	
	let somethingGrabbed = false;
}