//To begin: teacher view same as student view

function initClt()
{
	// {
	// 	var counter = makeTextSign("Score: 0")
	// 	scene.add(counter)
	// 	var numRightSoFar = 0;
	// 	var numWrongSoFar = 0;
	// 	counter.update = function()
	// 	{
	// 		var totalSoFar = (numRightSoFar + numWrongSoFar)
	// 		var amountTheyGotThroughGuessing = Math.round(numRightSoFar / 3) //TODO
	// 		this.updateText("Score: " + numRightSoFar.toString())
	// 	}
	// }

	{
		var rightArrow = new THREE.Mesh(new THREE.Geometry(), new THREE.MeshBasicMaterial({side:THREE.DoubleSide, color:0xFF0000}))
		rightArrow.geometry.vertices.push(new THREE.Vector3(0,0,0),new THREE.Vector3(-1,1,0),new THREE.Vector3(-1,-1,0))
		rightArrow.geometry.faces.push(new THREE.Face3(0,1,2))
		rightArrow.scale.multiplyScalar(0.07)
		var leftArrow = rightArrow.clone()
		leftArrow.scale.x *= -1
		rightArrow.position.x = 1
		leftArrow.position.x = -1
		scene.add(rightArrow)

		function changeChapter(chapterAddition)
		{
			chapter.setDown()

			var newChapterIndex = chapters.indexOf(chapter)
			newChapterIndex += chapterAddition
			newChapterIndex = clamp(newChapterIndex,0,chapters.length-1)
			chapter = chapters[newChapterIndex]

			chapter.setUp()
		}

		clickables.push(rightArrow)
		rightArrow.onClick = function()
		{
			changeChapter(1)
		}

		// clickables.push(leftArrow)
		// leftArrow.onClick = function()
		// {
		// 	changeChapter(-1)
		// }
	}

	initClickableDistributions()

	Chapter()

	// initFinger()

	// {
	// 	var numColoredBalls = 2;
	// 	var numSwaps = 2;
		
	// 	var ballAndCupResetButton = makeTextSign("Reset")
	// 	ballAndCupResetButton.position.x = 0.8
	// 	ballAndCupResetButton.position.y = -0.4
	// 	function reset()
	// 	{
	// 		var newChapterPosition = chapters.indexOf(chapter) + 1
	// 		if( numColoredBalls === 2 || (numColoredBalls<4 && numSwaps>6))
	// 			numColoredBalls++
	// 		else
	// 			numSwaps += 2
	// 		var newChapter = makeBallAndCupChapter( newChapterPosition )
	// 		changeChapter(1)
	// 	}
	// 	ballAndCupResetButton.onClick = reset

	// 	function makeBallAndCupChapter(newChapterPosition)
	// 	{
	// 		var cupChapter = Chapter( newChapterPosition )

	// 		cupChapter.addSceneElement(ballAndCupResetButton)
	// 		cupChapter.addClickable(ballAndCupResetButton)

	// 		var coloredBalls = Array(numColoredBalls)
	// 		for(var i = 0; i < coloredBalls.length; i++)
	// 		{
	// 			coloredBalls[i] = ColoredBall()
	// 			coloredBalls[i].position.y = i/(coloredBalls.length-1) * 0.8 - 0.4
	// 			cupChapter.addSceneElement(coloredBalls[i])
	// 		}
	// 		makeCupGame(coloredBalls, numSwaps, cupChapter)
	// 		return cupChapter
	// 	}
	// 	var firstBallAndCupChapter = makeBallAndCupChapter()
	// }

	// var singleCdChapter = Chapter()
	// var singularDist = HumpedClickableDistribution([1,1,1,2,3,1,3,2],false,singleCdChapter)
	// singularDist.position.y -= 0.24

	{
		var cdAndCupResetButton = makeTextSign("Reset")
		cdAndCupResetButton.position.x = 0.8
		cdAndCupResetButton.position.y = -0.4
		function cdAndCupReset()
		{
			var newChapterPosition = chapters.indexOf(chapter) + 1
			var newChapter = makeCdAndCupChapter( newChapterPosition )
			changeChapter(1)
		}
		cdAndCupResetButton.onClick = cdAndCupReset

		function makeCdAndCupChapter(newChapterPosition)
		{
			var cdAndCupChapter = Chapter( newChapterPosition )

			cdAndCupChapter.addSceneElement(cdAndCupResetButton)
			cdAndCupChapter.addClickable(cdAndCupResetButton)

			var oneHumpedDistribution = HumpedClickableDistribution([1,1,1,1,4.5,1],false,cdAndCupChapter)
			var twoHumpedDistribution = HumpedClickableDistribution([1,2.75,1,1,4.5,1],false,cdAndCupChapter)
			var threeHumpedDistribution = HumpedClickableDistribution([4,1,4,1,1,4],false,cdAndCupChapter)
			oneHumpedDistribution.scale.multiplyScalar(0.2)
			twoHumpedDistribution.scale.multiplyScalar(0.2)
			threeHumpedDistribution.scale.multiplyScalar(0.2)

			var clickableDistributions = [oneHumpedDistribution,twoHumpedDistribution,threeHumpedDistribution]

			for(var i = 0; i < clickableDistributions.length; i++)
			{
				clickableDistributions[i].position.y = 0.3 * (i-(clickableDistributions.length-1)/2)
			}
			
			makeCupGame(clickableDistributions, 3, cdAndCupChapter)
			return cdAndCupChapter
		}
		var firstCdCupChapter = makeCdAndCupChapter()
	}

	Chapter()

	var chapter = chapters[0]
	changeChapter(0)
}

/*
	TODO
	Finger thing (graph next to them) - should be on its side. Bump going up and down
	correct and incorrect signs, jesus christ

	Show slides
	Ball thing where it gets faster and faster
	Graph where you're learning how it works
	Graph thing where you try to guess
	And change the positions of those blasted things

	Graph thing where you try to get out early using normal dist
	Final slide: values in front of mug are your "sample"	
	
	Back to puzzles
	Now you can click and hold and you'll get them
	They see the normal distribution describing where the average should go
	They should get used to looking at the normal distribution next to it, using it to "get out early"
	Still should feel slow
	Now you get a big bunch at a time
	You can do it faster
	Now...
	We are NOT showing the actual graph, or actual samples, just the normal distribution
	And all you're doing is accepting/rejecting a single graph
	Now: automated. You see loads at a time.
	You see ~200 sample means marked on as many distributions next to a "accept/reject"
	You can control the p (width of acceptance on graph) - changes many accept/reject statuses
	You're given a specific n, at least at this point
	Then you click "go" and "correct/incorrect" pop up on all the graphs.
	You get shown another bunch
	Should be able to see that approximately 200 * p of them give false positives
	Then?
	You can control the n - but it means you do more/less experiments

	// Central limit theorem
	// 	One of the distributions is one that they all got
	// 	Their averages are plotted on teacher screen
	// 		You can hover on teacher screen and you'll see on your own screen that teacher is hovering on yours
	// 	Bulk it up with a few more?
	// 	Woo it's a normal distribution
	// 	Give loads more examples, using every distribution they faced 
	*/

function initFinger()
{
	var fingerMaterial = new THREE.MeshBasicMaterial()
	// fingerMaterial.map = new THREE.TextureLoader().load( "data/textures/finger.jpg" )
	var fingerGeometry = new THREE.OriginCorneredPlaneBufferGeometry(0.5,1)
	
	var fingerRuler = new THREE.Mesh( fingerGeometry, fingerMaterial )
	fingerRuler.scale.multiplyScalar(0.5)
	fingerRuler.position.x -= 0.5
	
	var markerThickness = 0.01
	var lengthMarker = new THREE.Mesh(
		new THREE.OriginCorneredPlaneBufferGeometry(markerThickness,1),
		new THREE.MeshBasicMaterial({color:0x0000FF}))
	lengthMarker.position.x = fingerRuler.position.x - 0.05
	var cmMarkers = Array(10)
	var markerLength = markerThickness*4
	var markerSpacing = 0.1
	for( var i = 0; i < cmMarkers.length; i++ )
	{
		cmMarkers[i] = new THREE.Mesh(
			new THREE.OriginCorneredPlaneBufferGeometry(markerLength,markerThickness),
			new THREE.MeshBasicMaterial({color:0x0000FF}))
		cmMarkers[i].position.y = i * markerSpacing
		cmMarkers[i].position.x = lengthMarker.position.x - markerLength

		var numberSign = makeTextSign( i.toString() )
		numberSign.position.x = -markerLength/2
		cmMarkers[i].add( numberSign )

		// console.log(cmMarkers)
	}

	fingerRuler.clickedPoint = null;
	fingerRuler.update = function()
	{
		if(mouse.clicking && mouse.lastClickedObject === this)
		{
			var newClickedPoint = mouse.rayIntersectionWithZPlane(0)
			this.scale.multiplyScalar( newClickedPoint.distanceTo(this.position) / this.clickedPoint.distanceTo(this.position) )
			this.clickedPoint = newClickedPoint
		}

		lengthMarker.scale.y = this.scale.y
		for( var i = 0; i < cmMarkers.length; i++ )
		{
			cmMarkers[i].visible = lengthMarker.scale.y > cmMarkers[i].position.y
		}
	}
	fingerRuler.onClick = function()
	{
		this.clickedPoint = mouse.rayIntersectionWithZPlane(0)
	}

	var fingerChapter = Chapter()
	fingerChapter.addSceneElement(fingerRuler)
	fingerChapter.addSceneElement(lengthMarker)
	fingerChapter.addClickable(fingerRuler)
	fingerChapter.addUpdatingObject(fingerRuler)
	for( var i = 0; i < cmMarkers.length; i++ )
	{
		fingerChapter.addSceneElement(cmMarkers[i])
	}
}

function HumpedClickableDistribution(arrayOfBlocks, normalDistributionsPresent,chapter)
{
	//the distribution is made of blocks
	var totalBlocks = 0;
	for(var i = 0; i < arrayOfBlocks.length; i++)
	{
		totalBlocks += arrayOfBlocks[i]
	}

	function humpedSamplingFunction()
	{
		var blockWeAreIn = Math.random() * totalBlocks
		var blocksCountedThrough = 0;
		for(var i = 0; i < arrayOfBlocks.length; i++)
		{
			if(blockWeAreIn < blocksCountedThrough + arrayOfBlocks[i] )
			{
				// console.log(i)
				return i
			}
			blocksCountedThrough += arrayOfBlocks[i]
		}
	}
	return ClickableDistribution( humpedSamplingFunction, arrayOfBlocks.length,240, normalDistributionsPresent,chapter )
}

var ClickableDistribution = null;
function initClickableDistributions()
{
	var textureLoader = new THREE.TextureLoader()
	var profilePictures = Array(19)
	var profilePictureGeometry = new THREE.OriginCorneredPlaneBufferGeometry(1,1)
	for(var i = 0; i < profilePictures.length; i++)
	{
		var fileName = i.toString()
		if(i < 10)
		{
			fileName = "0" + fileName
		}
		if(i < 8)
		{
			fileName += ".png"
		}
		else
		{
			fileName += ".jpg"
		}

		profilePictures[i] = new THREE.Mesh(profilePictureGeometry,new THREE.MeshBasicMaterial())
		profilePictures[i].material.color.setRGB(Math.random(),Math.random,Math.random())
		// profilePictures[i].map = textureLoader.load( 'data/textures/rugbyPlayers/' + fileName )
	}

	var lowestUnusedProfilePicture = 0;

	ClickableDistribution = function( samplingFunction,numControlPoints = 11,numSamples = 30 * numControlPoints, normalDistributionsPresent, chapter, samples )
	{
		//if you go too high on numControlPoints the noise is bad ;_;

		var clickableDistribution = new THREE.Mesh(
			new THREE.PlaneGeometry(numControlPoints*0.2),
			new THREE.MeshBasicMaterial({transparent:true,opacity:0.001}))
		clickableDistribution.geometry.vertices[2].y = 0
		clickableDistribution.geometry.vertices[3].y = 0

		//very hacky
		var chapterIsSetUp = chapter.sceneElementsToAdd.length !== 0 && chapter.sceneElementsToAdd[0].parent === scene
		if(!chapterIsSetUp)
		{
			chapter.addClickable(clickableDistribution)
			chapter.addSceneElement(clickableDistribution)
			chapter.addUpdatingObject(clickableDistribution)
		}
		else
		{
			clickables.push(clickableDistribution)
			scene.add(clickableDistribution)
			objectsToBeUpdated.push(clickableDistribution)

			chapter.updatingObjectsToRemove.push(clickableDistribution)
			chapter.sceneElementsToRemove.push(clickableDistribution)
			chapter.clickablesToRemove.push(clickableDistribution)
		}

		//going the samples route is kiiiinda cheating, but you want to give people an assurance that they'll eventually reproduce what they'll seeing
		var numSamplesAvailable = numSamples;
		clickableDistribution.samplesDone = new Array(numSamples)
		var highestSample = -Infinity
		var lowestSample = Infinity
		clickableDistribution.mean = 0;

		if( samples === undefined )
		{
			clickableDistribution.samples = new Float32Array(numSamples)
			for(var i = 0; i < numSamples; i++)
			{
				clickableDistribution.samples[i] = samplingFunction()
			}
		}
		else
		{
			clickableDistribution.samples = samples
		}

		for(var i = 0; i < numSamples; i++)
		{
			clickableDistribution.mean += clickableDistribution.samples[i]

			clickableDistribution.samplesDone[i] = false
			if( highestSample < clickableDistribution.samples[i] )
			{
				highestSample = clickableDistribution.samples[i]
			}
			if( lowestSample > clickableDistribution.samples[i] )
			{
				lowestSample = clickableDistribution.samples[i]
			}
		}
		clickableDistribution.mean /= numSamples

		clickableDistribution.variance = 0;
		for(var i = 0; i < numSamples; i++)
		{
			clickableDistribution.variance += sq( clickableDistribution.samples[i] - clickableDistribution.mean )
		}
		clickableDistribution.variance /= numSamples

		var controlPoints = Array(numControlPoints)
		var areaBeneath = new THREE.Mesh(new THREE.Geometry(), new THREE.MeshPhongMaterial({}))

		var memberHolder = new THREE.Group()
		areaBeneath.add(memberHolder)
		var range = highestSample - lowestSample
		var spacing = 1 / (numControlPoints-1)
		for(var i = 0; i < numControlPoints; i++)
		{
			var position = i * spacing - 0.5
			controlPoints[i] = new THREE.Vector3(position,0,0)

			areaBeneath.geometry.vertices.push(new THREE.Vector3(controlPoints[i].x,0,0)) //i*2+0
			areaBeneath.geometry.vertices.push(controlPoints[i]) //i*2+1
			if( i !== 0 )
			{
				areaBeneath.geometry.faces.push(new THREE.Face3(i*2+0,i*2-1,i*2-2))
				areaBeneath.geometry.faces.push(new THREE.Face3(i*2+0,i*2+1,i*2-1))
			}
		}

		function controlPointIndexFromSample( sample )
		{
			var sampleNormalizedToRange = ( sample - lowestSample ) / range
			sampleNormalizedToRange = clamp( sampleNormalizedToRange, 0, 0.999999999999 )
			var floored = Math.floor( sampleNormalizedToRange * controlPoints.length )
			return floored
		}

		var highestPeak = 0;
		for(var i = 0; i < numSamples; i++)
		{
			var indexOfControlPointToBumpUp = controlPointIndexFromSample( clickableDistribution.samples[i] )
			controlPoints[indexOfControlPointToBumpUp].y++
			if( controlPoints[indexOfControlPointToBumpUp].y > highestPeak)
			{
				highestPeak = controlPoints[indexOfControlPointToBumpUp].y
			}
		}

		clickableDistribution.vomitMember = function()
		{
			if(numSamplesAvailable === 0)
			{
				return;
			}

			var undrawnSampleToDraw = Math.floor( Math.random() * numSamplesAvailable )
			var numUndrawnSamplesGoneThrough = 0
			var sample = null;
			for(var i = 0; i < numSamples; i++)
			{
				if( !this.samplesDone[i] )
				{
					if( numUndrawnSamplesGoneThrough === undrawnSampleToDraw )
					{
						sample = this.samples[ i ]
						this.samplesDone[ i ] = true
						numSamplesAvailable--;
						break;
					}
					numUndrawnSamplesGoneThrough++
				}
			}

			var placeToLand = new THREE.Vector3()
			var controlPointIndex = controlPointIndexFromSample( sample )
			placeToLand.x = controlPoints[ controlPointIndex ].x
			for(var i = 0; i < memberHolder.children.length; i++)
			{
				if( memberHolder.children[i].placeToLand !== undefined && memberHolder.children[i].placeToLand.x === placeToLand.x )
				{
					placeToLand.y++
				}
			}

			var member = Member(controlPoints[ 0 ].x, placeToLand,chapter)
			member.scale.x = spacing * 0.9
			memberHolder.add(member)

			//TODO you want it so the highest column is sort of always nearly there
			var scaleWithNoMembers = 3.5
			memberHolder.scale.y = scaleWithNoMembers - (scaleWithNoMembers-1) * Math.sqrt(memberHolder.children.length / this.samples.length)

			this.excitedness = 1;

			if(normalDistributionsPresent)
			{
				correspondingNormalDistribution.sendInSample(placeToLand.x)
			}
		}

		clickableDistribution.excitedness = 0

		clickableDistribution.add( areaBeneath )
		var curveOnTop = new THREE.Mesh( new THREE.TubeBufferGeometry( new THREE.CatmullRomCurve3( controlPoints, false, "centripetal" ), controlPoints.length * 8, 0.01 ) )
		// areaBeneath.add( curveOnTop )
		clickableDistribution.width = controlPoints[numControlPoints-1].x * 2
		clickableDistribution.height = highestPeak
		clickableDistribution.geometry.vertices[0].y = highestPeak
		clickableDistribution.geometry.vertices[1].y = highestPeak

		clickableDistribution.update = function()
		{
			if(mouse.clicking && mouse.lastClickedObject === this )
			{
				// if( !mouse.oldClicking )
				if( !mouse.oldClicking || frameCount % 11 === 0 ) //always get the first
				{
					this.vomitMember()
				}
			}

			clickableDistribution.excitedness -= frameDelta * 1.5
			if(clickableDistribution.excitedness < 0)
			{
				clickableDistribution.excitedness = 0
			}
			areaBeneath.material.color.r = clickableDistribution.excitedness
			areaBeneath.position.y = clickableDistribution.excitedness * 5 * sq(Math.sin(frameCount * 0.2))

			if( normalDistributionsPresent )
			{
				correspondingNormalDistribution.scale.y = 1 / clickableDistribution.scale.y
			}
		}

		if(normalDistributionsPresent)
		{
			var correspondingNormalDistribution = MarkedNormalDistribution( clickableDistribution.mean, clickableDistribution.variance )
			clickableDistribution.add(correspondingNormalDistribution)
		}

		clickableDistribution.wandClone = function()
		{
			var clone = ClickableDistribution(samplingFunction, numControlPoints,numSamples, false, chapter,this.samples)
			clone.scale.copy(this.scale)
			// for(var i = clone.children.length; i < this.children.length; i++)
			// {
			// 	clone.add(this.children[i].clone())
			// }
			return clone
		}

		clickableDistribution.scale.set(1/clickableDistribution.width,0.5/clickableDistribution.height,1)
		
		clickableDistribution.profilePicture = profilePictures[lowestUnusedProfilePicture]
		lowestUnusedProfilePicture++

		clickableDistribution.add(clickableDistribution.profilePicture)
		// profilePictures[lowestUnusedProfilePicture].scale.set( ,clickableDistribution.height/clickableDistribution.scale.y,1)
		clickableDistribution.profilePicture.scale.y = clickableDistribution.height
		clickableDistribution.profilePicture.scale.x = clickableDistribution.height / clickableDistribution.scale.x * clickableDistribution.scale.y
		clickableDistribution.profilePicture.position.z = -0.001
		clickableDistribution.profilePicture.position.x = -clickableDistribution.width/2 - clickableDistribution.profilePicture.scale.x

		return clickableDistribution;
	}

	function Member(initialX, placeToLand, chapter)
	{
		/*
			Little shockwave? Little bounce?

			Sigh, probably need to synchronize everyone's samples

			The next thing to do is that heart monitor etc thing!!!! For Kate!!!
		*/

		//might need to merge the geometries. That would be fine!
		var member = new THREE.Mesh(memberGeometry,memberMaterial)
		member.placeToLand = placeToLand
		var arcDuration = 0.5;
		member.lifetime = 0;
		member.update = function()
		{
			this.lifetime += frameDelta
			this.position.x = initialX + this.lifetime / arcDuration * ( this.placeToLand.x - initialX )
			this.position.y = this.placeToLand.y + sq( arcDuration/2 ) * 20
			this.position.y -= sq(this.lifetime - arcDuration/2) * 20

			if( this.lifetime >= arcDuration)
			{
				this.position.copy( this.placeToLand )
			}
		}
		objectsToBeUpdated.push(member)
		chapter.updatingObjectsToRemove.push(member)
		
		member.position.x = 0
		member.position.y = member.placeToLand.y

		return member
	}

	var memberGeometry = new THREE.PlaneGeometry(1,2 * 0.9)
	var memberMaterial = new THREE.MeshLambertMaterial({color:0xF15946,depthTest:false})
	for( var i = 0; i < memberGeometry.vertices.length; i++ )
	{
		if(memberGeometry.vertices[i].y < 0)
		{
			memberGeometry.vertices[i].y = 0
		}
	}
}

function initEditableDistributionWithPopulation()
{
	//------------Population stuff
	var population = Array(28);
	const verticalSpacing = 2/(16/9) / population.length
	const max = 10;
	const height = verticalSpacing / 1.1

	population.representation = new THREE.Group()
	population.representation.position.x = -0.9
	population.representation.scale.x = 1/max
	scene.add( population.representation )
	objectsToBeUpdated.push(population.representation)
	population.representation.update = function()
	{
		// if(mouse.lastClickedObject === null && mouse.clicking)
		// {
		// 	mouse.rotateObjectByGesture(this)
		// }
	}

	var barGeometry = new THREE.OriginCorneredPlaneBufferGeometry();
	var beepHeights = [0,0,0,0,0,0,0,0,0,-1,0,-7,10,-1,0,2]

	var fingerMaterial = new THREE.MeshBasicMaterial({map:new THREE.TextureLoader().load( "data/textures/heart.jpg" )})
	var fingerGeometry = new THREE.OriginCorneredPlaneBufferGeometry(0.5,1)

	var fingerRuler = new THREE.Mesh( fingerGeometry, fingerMaterial )
	for(var i = 0, il = population.length; i < il; i++)
	{
		population[i] = new THREE.Mesh(barGeometry,new THREE.MeshBasicMaterial({side:THREE.DoubleSide}))

		population[i].scale.x = Math.round( Math.random() * max ) + 1 //if the scale is 0 the determinant is an error

		population[i].material.color.setRGB((max-population[i].scale.x)/max,1,(max-population[i].scale.x)/max)
		// population[i].castShadow = true;
		population[i].scale.y = height
		population[i].position.y = i * verticalSpacing - il / 2 * verticalSpacing
		population[i].correctPosition = population[i].position.clone()
		population.representation.add(population[i])

		population[i].clickedPoint = null;
		population[i].update = function()
		{
			this.position.lerp( this.correctPosition, 0.1)

			if(mouse.clicking && mouse.lastClickedObject === this)
			{
				/*
					Move bar up and down (only useful for visualization)?
					"stack" them?
					Arguably no. The point of the interaction is to achieve something. The mutual control does that
				*/
				var newClickedPoint = mouse.rayIntersectionWithZPlane(population.representation.position.z)

				this.scale.x += (newClickedPoint.x - this.clickedPoint.x) / population.representation.scale.x
				this.material.color.setRGB((max-this.scale.x)/max,1,(max-this.scale.x)/max)

				this.clickedPoint = newClickedPoint

				refreshFromPopulation()
			}
			// if(mouse.lastClickedObject === this && !mouse.clicking && mouse.oldClicking)
			// {
			// 	this.scale.x = Math.round( this.scale.x ) + 0.00000000001

			// 	refreshFromPopulation()
			// }
		}
		population[i].onClick = function()
		{
			//TODO to get the closest one to your click in case it's between
			this.clickedPoint = mouse.rayIntersectionWithZPlane(population.representation.position.z)
		}
		clickables.push(population[i])
		objectsToBeUpdated.push(population[i])

		{
			var numRounds = 1+Math.round(population[i].scale.x)
			var beepControlPoints = Array( numRounds * beepHeights.length )
			for(var round = 0; round < numRounds; round++)
			{
				for(var j = 0; j < beepHeights.length; j++)
				{
					var index = round*beepHeights.length + j
					beepControlPoints[index] = new THREE.Vector3(index * 5.6,beepHeights[j]*0.13,0)
				}
			}
			// console.log(beepControlPoints)
			population[i].beeps = new THREE.Mesh( new THREE.TubeBufferGeometry( new THREE.CatmullRomCurve3( beepControlPoints, false, "centripetal" ), beepControlPoints.length * 3, 0.3 ), new THREE.MeshBasicMaterial({color:0xFF0000}) )
			population.representation.add(population[i].beeps)
			population[i].beeps.position.copy(population[i].position)
			population[i].beeps.position.y+=height/2
			population[i].beeps.scale.multiplyScalar(0.01)
		}
	}

	// population.sort(function(a,b){ return a.scale.x - b.scale.x })

	// for(var i = 0, il = population.length; i < il; i++)
	// {
	// 	population[i].correctPosition.y = i * verticalSpacing - il / 2 * verticalSpacing
	// }

	// for(var i = 0, il = data.length; i < il; i++)
	// {
	// 	data[i].correctPosition.y = data[i].scale.x - il / 2 * dataSpacing
	// 	for(var j = 0; j < data.length; j++)
	// 	{
	// 		if(data[j].correctPosition.y === data[i].correctPosition.y)
	// 		{
	// 			data[i].correctPosition.z -= dataSpacing
	// 		}
	// 	}
	// }

	// ----------
	// for(var i = 0; i < data.length; i++)
	// {
	// 	distribution.controlPoints[Math.round(data[i].scale.x)]++;
	// }

	var controlPoints = Array(max+1)
	var width = 0.9;
	for(var i = 0; i < controlPoints.length; i++)
	{
		controlPoints[i] = new THREE.Vector3( i, 0, 0 )
	}
	var populationDistributionCurve = new THREE.Mesh( new THREE.TubeBufferGeometry( new THREE.CatmullRomCurve3( controlPoints, false, "centripetal" ), controlPoints.length * 13, 0.09 ) )

	function refreshFromPopulation()
	{
		for(var i = 0; i < controlPoints.length; i++)
		{
			controlPoints[i].y = 0
			for(var j = 0; j < population.length; j++)
			{
				if( Math.round(population[j].scale.x) === i )
				{
					controlPoints[i].y++;
				}
			}
		}

		populationDistributionCurve.geometry.refreshSegmentsFromCurve()
	}
	refreshFromPopulation()

	var highest = 0;
	for(var i = 0; i < controlPoints.length; i++)
	{
		highest = Math.max(highest,controlPoints[i].y)
	}

	populationDistributionCurve.scale.x = 1/max
	populationDistributionCurve.scale.z = populationDistributionCurve.scale.x
	populationDistributionCurve.scale.y = 1/(16/9)/highest
	//you may be asking it to take a bad number of points
	scene.add(populationDistributionCurve)
	populationDistributionCurve.position.y = -0.4
	populationDistributionCurve.scale.x *= 0.9

	clickables.push(populationDistributionCurve)
	var grabbedPoint = null;
	populationDistributionCurve.onClick = function(intersection)
	{
		var localIntersection = intersection.point.clone()
		this.worldToLocal(localIntersection)
		grabbedPoint = controlPoints[0]
		for(var i = 1; i < controlPoints.length; i++ )
		{
			if( Math.abs( controlPoints[i].x - localIntersection.x ) < Math.abs( grabbedPoint.x - localIntersection.x ) )
			{
				grabbedPoint = controlPoints[i]
			}
		}
		//and those whose height is equal to this number flash
	}

	objectsToBeUpdated.push(populationDistributionCurve)
	populationDistributionCurve.update = function()
	{
		if(grabbedPoint !== null)
		{
			var placeDraggedTo = mouse.rayIntersectionWithZPlane(0)
			this.worldToLocal(placeDraggedTo)
			grabbedPoint.y = placeDraggedTo.y
			populationDistributionCurve.geometry.refreshSegmentsFromCurve()

			if( mouse.lastClickedObject !== this || !mouse.clicking )
			{
				grabbedPoint = null
			}
		}
	}
}

//as you "pick up more" for your sample
function MarkedNormalDistribution( mean, variance )
{
	//this gets plotted and you use it geometrically
	var numControlPoints = 30;
	var controlPoints = Array(numControlPoints)
	var graphWidth = 10;
	for(var i = 0; i < numControlPoints; i++)
	{
		var normalizedToMinusOneHalfToPlusOneHalf = (i-numControlPoints/2) / numControlPoints
		var position = mean + graphWidth * normalizedToMinusOneHalfToPlusOneHalf;
		controlPoints[i] = new THREE.Vector3( position, 0, 0 )
		controlPoints[i].y = normal(position, mean, variance)
	}

	var graph = new THREE.Mesh( new THREE.TubeBufferGeometry( new THREE.CatmullRomCurve3( controlPoints, false, "centripetal" ), controlPoints.length * 8, 0.01 ) )
	graph.scale.x = 0.9/graphWidth

	var areaBeneath = new THREE.Mesh(new THREE.Geometry(), new THREE.MeshPhongMaterial({vertexColors:THREE.FaceColors}))
	graph.add(areaBeneath)
	var sd = Math.sqrt(variance)
	for(var i = 0; i < numControlPoints; i++)
	{
		areaBeneath.geometry.vertices.push(new THREE.Vector3(controlPoints[i].x,0,0)) //i*2+0
		areaBeneath.geometry.vertices.push(controlPoints[i]) //i*2+1
		var r = Math.abs( controlPoints[i].x - mean ) < 1.96 * sd ? 0 : 1
		if( i !== 0 )
		{
			areaBeneath.geometry.faces.push(new THREE.Face3(i*2+0,i*2-1,i*2-2))
			areaBeneath.geometry.faces[areaBeneath.geometry.faces.length-1].color.setRGB(r,0,0)
			areaBeneath.geometry.faces.push(new THREE.Face3(i*2+0,i*2+1,i*2-1))
			areaBeneath.geometry.faces[areaBeneath.geometry.faces.length-1].color.setRGB(r,0,0)
		}
	}

	var meanMarker = new THREE.Mesh(new THREE.CircleGeometry(0.04,32 ), new THREE.MeshBasicMaterial({depthTest:false}))
	graph.add(meanMarker) //you're going to send it samples
	meanMarker.scale.x = 1 / graph.scale.x
	meanMarker.position.x = Infinity

	var numSamplesSoFar = 0;
	var sumSoFar = 0;
	graph.sendInSample = function(sample)
	{
		sumSoFar += sample
		numSamplesSoFar++;
		meanMarker.position.x = sumSoFar / numSamplesSoFar
		
		//seriously need to sort this. It has to be the absolute value.
	}

	return graph
}

function normal(position, mean, variance)
{
	var multiple = 1 / Math.sqrt( TAU * variance )
	var exponent = -sq( position - mean ) / ( 2 * variance )
	return multiple * Math.exp(exponent)
}

function studentsT(t,sampleSize)
{
	if( !(sampleSize>0) )
	{
		console.error("nope")
	}
	else if( sampleSize > 19 )
	{
		return Math.exp(-t*t)
	}
	else
	{
		//it might be so close that you're better off always using normal dist
		//everyone knows you want a big sample
		var v = sampleSize - 1;
		var numerator = gamma(sampleSize/2)
		var denominator = Math.sqrt(Math.PI*v)*gamma(v/2)
		var extra = Math.pow(1+t*t/v,-(sampleSize/2))
		return numerator/denominator*extra;
	}
}

function generateGaussianNoise()
{
	// var u = 0, v = 0;
	// while(u === 0) u = Math.random();
	// while(v === 0) v = Math.random();
	// return Math.sqrt( -2.0 * Math.log( u ) ) * Math.cos( TAU * v );

	var rand = 0;

	for (var i = 0; i < 6; i += 1) {
		rand += Math.random();
	}

	return rand / 6;
}

function gamma(z)
{
	var g = 7;
	var C = [0.99999999999980993, 676.5203681218851, -1259.1392167224028,771.32342877765313, -176.61502916214059, 12.507343278686905, -0.13857109526572012, 9.9843695780195716e-6, 1.5056327351493116e-7];

	if(z < 0.5)
	{
		return Math.PI / (Math.sin(Math.PI * z) * gamma(1 - z));
	}
	else
	{
	    z -= 1;

	    var x = C[0];
	    for (var i = 1; i < g + 2; i++)
	    {
	    	x += C[i] / (z + i);
	    }

	    var t = z + g + 0.5;
	    return Math.sqrt(2 * Math.PI) * Math.pow(t, (z + 0.5)) * Math.exp(-t) * x;
	}
}

/*
	Other ideas
		Transparency thing?
		Identify normal distributions?
			median and mean don't coincide = not normal dist
			Interquartile range
		The most interesting part of this long term is that the user controls a discrete distribution (the normal distribution is not that interesting)
		Obvious, so say it: the larger the sample size, the more confident you are about how close you are to population mean
		"free sample" to introduce the term sample
		Every time you hear some bloody statistic, this is what they've done
		Cloud of points with the same PDF governing their x,y,z
			Take their manhattan distance
			i.e. take the lines connecting them to the origin paralell to the axes then straighten them
			Might work better/well with more than three axes!
		Numbers next to the lines, probably
*/