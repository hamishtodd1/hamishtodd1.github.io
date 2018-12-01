function ColoredBall()
{
	coloredBall = new THREE.Mesh(new THREE.SphereGeometry(0.1),new THREE.MeshPhongMaterial())
	coloredBall.castShadow = true;
	coloredBall.material.color.setRGB(Math.random(),Math.random(),Math.random())

	coloredBall.wandClone = function()
	{
		let cup = new THREE.Mesh(cupGeometry, cupMaterial)
		let newBall = new THREE.Mesh(new THREE.SphereGeometry(0.1),this.material)
		newBall.cup = cup
		return newBall
	}

	return coloredBall
}

function makeCupGame( objectsToHide, defaultScrambleAmount, chapter, acceptReject, spedUp )
{
	let _scene = new THREE.Group()
	chapter.add(_scene,"sceneElements")

	var correctSign = makeTextSign("Correct!")
	correctSign.material.color.setRGB(0,1,0)
	correctSign.scale.multiplyScalar(1.8)
	correctSign.position.x = -0.44
	var incorrectSign = makeTextSign("Incorrect!")
	incorrectSign.material.color.setRGB(1,0,0)
	incorrectSign.scale.multiplyScalar(1.8)
	incorrectSign.position.x = -0.44

	if(acceptReject === undefined)
	{
		acceptReject = false
	}

	var duplicate = null

	var wand = new THREE.Mesh(new THREE.PlaneGeometry(1/8,1), new THREE.MeshPhongMaterial({transparent:true, depthTest:false}))
	wand.material.map = new THREE.TextureLoader().load( "data/textures/wand.png" )
	wand.geometry.vertices[2].y = 0
	wand.geometry.vertices[3].y = 0
	wand.scale.setScalar(0.5)
    wand.objectToDuplicate = null
    wand.duplicationProgress = 0;
    var progressSpeed = 0;
    var duplicatingPosition = null
	_scene.add(wand)

	wand.duplicateObjectAndCoveringCup = function(object)
	{
		this.objectToDuplicate = object
		duplicatingPosition = this.objectToDuplicate.position.clone()
		duplicatingPosition.x += 0.2
		duplicatingPosition.y -= 0.2

		wand.duplicationProgress = 0;
		if(!spedUp)
		{
			progressSpeed = frameDelta * 2.9
		}
		else
		{
			progressSpeed = 0.14
		}
	}

	wand.update = function()
	{
		var pulse = sq( Math.sin(frameCount * 0.15) )
		this.material.emissive.setRGB(pulse,pulse,0)

		let unusedPosition = new THREE.Vector3(1.2,0,0)
		_scene.worldToLocal(unusedPosition)
		this.position.copy(unusedPosition)

		if(this.objectToDuplicate !== null)
		{
			wand.duplicationProgress += progressSpeed

			if(wand.duplicationProgress < 1)
			{
				this.position.lerpVectors(unusedPosition,duplicatingPosition,wand.duplicationProgress)
			}
			else if(wand.duplicationProgress < 2)
			{
				this.position.copy(duplicatingPosition)
				this.rotation.z = (wand.duplicationProgress-1) * TAU/12
			}
			else if(wand.duplicationProgress < 3)
			{
				if(duplicate === null)
				{
					duplicate = this.objectToDuplicate.wandClone()

					duplicate.cup.visible = true
					duplicate.cup.scale.divide(duplicate.scale)

					if(duplicate.profilePicture)
					{
						duplicate.profilePicture.visible = false
					}
					duplicate.originalObject = this.objectToDuplicate

					_scene.add(duplicate)
				}

				var placeToSitAndBeInspected = new THREE.Vector3(-0.85,0,0)
				duplicate.position.lerpVectors(wand.objectToDuplicate.position, placeToSitAndBeInspected,wand.duplicationProgress-2)
			}
			else if(wand.duplicationProgress <4)
			{
				this.position.copy(duplicatingPosition)
				this.rotation.z = TAU/12 * (1-(wand.duplicationProgress-3) )
			}
			else if(wand.duplicationProgress < 5 )
			{
				this.position.lerpVectors(duplicatingPosition,unusedPosition,wand.duplicationProgress-4)
			}
		}
	}
	chapter.add(wand,"updatables")

	var selectionArrowGeometry = new THREE.Geometry()
	selectionArrowGeometry.vertices.push(
		new THREE.Vector3(-1.5,0,0),
		new THREE.Vector3(-0.5,1,0),
		new THREE.Vector3(-0.5,-1,0))
	selectionArrowGeometry.faces.push(new THREE.Face3(0,2,1) )
	selectionArrowGeometry.merge(new THREE.PlaneGeometry(1,1))
	selectionArrowGeometry.applyMatrix(new THREE.Matrix4().makeScale(cupHeight/2,cupHeight/2,cupHeight/2) )

	let tickGeometry = new THREE.Geometry()
	tickGeometry.merge(new THREE.OriginCorneredPlaneGeometry(0.06,0.16))
	tickGeometry.merge(new THREE.OriginCorneredPlaneGeometry(0.32,0.06))
	tickGeometry.applyMatrix(new THREE.Matrix4().makeRotationZ(TAU/8).setPosition(new THREE.Vector3(-0.12,-0.12,0)))
	tickGeometry.applyMatrix(new THREE.Matrix4().makeScale(0.8,0.8,0.8))

	let crossGeometry = new THREE.Geometry()
	crossGeometry.merge(new THREE.PlaneGeometry(0.06,0.24))
	crossGeometry.merge(new THREE.PlaneGeometry(0.24,0.06))
	crossGeometry.applyMatrix(new THREE.Matrix4().makeRotationZ(TAU/8))

	function addCorrectOrIncorrectSign(correct, objectToTurnGreenOrRed)
	{
		if( correct )
		{
			correctSign.material = makeTextSign("Correct!",true)
			correctSign.material.color.setRGB(0,1,0)
			_scene.add(correctSign)
			// objectToTurnGreenOrRed.material.color.setRGB(0,1,0)
		}
		else
		{
			incorrectSign.material = makeTextSign("Incorrect!",true)
			incorrectSign.material.color.setRGB(1,0,0)
			_scene.add(incorrectSign)
			// objectToTurnGreenOrRed.material.color.setRGB(1,0,0)
		}
	}

	function Cup()
	{
		var cup = new THREE.Mesh(cupGeometry, cupMaterial);
		cup.castShadow = true;
		cup.progressSpeed = 0;
		cup.hidingProgress = 0;
		var hideTarget = null

		let followHideTarget = false;

		cup.selectors = [];
		if(!acceptReject)
		{
			var arrowSelector = new THREE.Mesh(selectionArrowGeometry,new THREE.MeshBasicMaterial({color:0x000000}))
			arrowSelector.position.x = 0.33
			cup.selectors.push(arrowSelector)
			arrowSelector.onClick = function()
			{
				addCorrectOrIncorrectSign(this.associatedObject === duplicate.originalObject,this)
				duplicate.cup.visible = false
				//and then question restarting stuff, including removing these from the scene and nulling associated objects
			}
			chapter.add(arrowSelector,"clickables")
		}
		else
		{
			var tick = new THREE.Mesh(tickGeometry,new THREE.MeshBasicMaterial({color:0x0000FF}))
			tick.position.x = 0.33
			cup.selectors.push(tick)
			chapter.add(tick,"clickables")
			tick.onClick = function()
			{
				addCorrectOrIncorrectSign(this.associatedObject === duplicate.originalObject,this)
				duplicate.cup.visible = false
			}

			var cross = new THREE.Mesh(crossGeometry,new THREE.MeshBasicMaterial({color:0x0000FF}))
			cross.position.x = 0.66
			cup.selectors.push(cross)
			chapter.add(cross,"clickables")
			cross.onClick = function()
			{
				addCorrectOrIncorrectSign(this.associatedObject !== duplicate.originalObject,this)
				duplicate.cup.visible = false
			}
		}

		cup.hide = function( newHideTarget )
		{
			hideTarget = newHideTarget
			this.hidingProgress = 0
			if(!spedUp)
			{
				this.progressSpeed = frameDelta * 1.5
			}
			else
			{
				this.progressSpeed = 0.14
			}
			this.unusedPosition.y = hideTarget.position.y

			if(acceptReject)
			{
				hideTarget.tick = tick
				hideTarget.cross = cross
			}
		}

		cup.reveal = function()
		{
			this.unusedPosition.y = hideTarget.position.y

			followHideTarget = false
			if(hideTarget.profilePicture)
			{
				hideTarget.profilePicture.visible = true
			}

			if(!spedUp)
			{
				this.progressSpeed = -frameDelta * 1.5
			}
			else
			{
				this.progressSpeed = -0.14
			}

			for(let i = 0; i < cup.selectors.length; i++)
			{
				_scene.add(cup.selectors[i])
				cup.selectors[i].position.y = this.position.y
				cup.selectors[i].associatedObject = hideTarget
			}
		}

		cup.update = function()
		{
			if(hideTarget !== null)
			{
				var behindPosition = hideTarget.position.clone()
				behindPosition.z -= cupHeight

				var oldHidingProgress = this.hidingProgress
				this.hidingProgress += this.progressSpeed

				if(this.hidingProgress < 1) //go to it
				{
					this.position.lerpVectors(this.unusedPosition,behindPosition,this.hidingProgress)
					this.rotation.x = -TAU/4 * this.hidingProgress
				}
				else if(this.hidingProgress < 2) //go forward
				{
					this.position.lerpVectors(behindPosition,hideTarget.position,this.hidingProgress-1)
					this.rotation.x = -TAU/4
				}
				else if(this.hidingProgress < 3) //enclose it
				{
					var progressThroughThisPart = this.hidingProgress-2
					this.position.copy(hideTarget.position)
					this.rotation.x = -TAU/4 * (1-progressThroughThisPart)
				}
				else if(oldHidingProgress < 3) //make sure we've enclosed it
				{
					this.position.copy( hideTarget.position )
					this.rotation.x = 0;

					followHideTarget = true
					if(hideTarget.profilePicture)
					{
						hideTarget.profilePicture.visible = false
					}

					this.hidingProgress = 3
					this.progressSpeed = 0;
				}
			}

			if(followHideTarget)
			{
				this.position.copy(hideTarget.position)
			}
		}
		chapter.add( cup ,"updatables") 

		_scene.add(cup) 
		return cup;
	}

	//"story"
	{
		var scrambleCount = 0
		var startingSwapsPerSecond = 1.2
		var swapsPerSecond = startingSwapsPerSecond
		var originA = new THREE.Vector3()
		var originB = new THREE.Vector3()
		var objectA = null
		var objectB = null
		var swapProgress = 0

		let allButOneToTakeAwayIndex = null
		let takingAwayAllButOneProgress = 0

		var manager = {};
		var puzzlingStep = 0;
		var scrambleStarted = false;
        var duplicationStarted = false;
        manager.update = function()
		{
			if(puzzlingStep === 0) //moving cups
			{
				if(cups[0].hidingProgress >= 3)
				{
					scrambleCount = defaultScrambleAmount
					puzzlingStep++;
				}
			}

			if( puzzlingStep === 1 ) //duplication
			{
				if( scrambleCount === 0 )
				{
					let indexOfObjectToDuplicate = Math.floor( Math.random() * objectsToHide.length )
					wand.duplicateObjectAndCoveringCup( objectsToHide[indexOfObjectToDuplicate] )
					puzzlingStep++;
				}
			}

			if( puzzlingStep === 2 )
			{
				if( duplicate !== null && wand.duplicationProgress >= 4)
				{
					scrambleCount = defaultScrambleAmount
					puzzlingStep++;
				}
			}

			if( puzzlingStep === 3 )
			{
				if( scrambleCount === 0 )
				{
					//commence lerping them into correct place
					if(!acceptReject)
					{
						for(var i = 0; i < cups.length; i++)
						{
							cups[i].reveal();
						}
					}
					else
					{
						allButOneToTakeAwayIndex = Math.floor( Math.random() * objectsToHide.length )
					}
					puzzlingStep++;
				}
			}

			if( puzzlingStep === 4 && acceptReject)
			{
				if( takingAwayAllButOneProgress > 1 )
				{
					for(var i = 0; i < cups.length; i++)
					{
						cups[i].reveal();
					}
					puzzlingStep++;
				}
			}

			//-----actually doing stuff
			if( allButOneToTakeAwayIndex !== null && takingAwayAllButOneProgress <= 1 )
			{
				for( let i = 0; i < objectsToHide.length; i++ )
				{
					if(takingAwayAllButOneProgress === 0)
					{
						objectsToHide[i].positionBeforeWeStartedTakingThemAway = objectsToHide[i].position.clone()
					}
				}

				if(!spedUp)
				{
					takingAwayAllButOneProgress += frameDelta * 1.3
				}
				else
				{
					takingAwayAllButOneProgress += 0.14
				}

				for( let i = 0; i < objectsToHide.length; i++ )
				{
					if(i === allButOneToTakeAwayIndex)
					{
						objectsToHide[i].position.lerpVectors(objectsToHide[i].positionBeforeWeStartedTakingThemAway,zeroVector,takingAwayAllButOneProgress)
					}
					else
					{
						let placeToTakeAwayTo = new THREE.Vector3(0,1,0)
						// if(objectsToHide[i].position.y < 0)
						// {
						// 	placeToTakeAwayTo.y *= -1
						// }
						objectsToHide[i].parent.worldToLocal(placeToTakeAwayTo)
						objectsToHide[i].position.lerpVectors(objectsToHide[i].positionBeforeWeStartedTakingThemAway,placeToTakeAwayTo,takingAwayAllButOneProgress)
					}
				}
			}

			if( scrambleCount !== 0 )
			{
				if( objectA === null )
				{
					var swap = Math.floor(Math.random() * objectsToHide.length)
					objectA = objectsToHide[swap];
					objectB = objectsToHide[(swap+1)%objectsToHide.length]

					originA.copy(objectA.position)
					originB.copy(objectB.position)
				}

				if(!spedUp)
				{
					swapProgress += frameDelta * swapsPerSecond
				}
				else
				{
					swapProgress += 0.14
				}

				var pointToRotateAround = originA.clone().lerp(originB,0.5)

				objectA.position.copy(originA)
				objectA.position.sub(pointToRotateAround)
				objectA.position.applyAxisAngle(zUnit,TAU / 2 * swapProgress)
				objectA.position.add(pointToRotateAround)

				objectB.position.copy(originB)
				objectB.position.sub(pointToRotateAround)
				objectB.position.applyAxisAngle(zUnit,TAU / 2 * swapProgress)
				objectB.position.add(pointToRotateAround)

				if( swapProgress >= 1 )
				{
					objectA.position.copy(originB)
					objectB.position.copy(originA)

					objectA = null;
					objectB = null;

					swapProgress = 0;

					swapsPerSecond *= 1.5
					swapsPerSecond = clamp(swapsPerSecond,0,8)

					scrambleCount--;
					if(scrambleCount <= 0)
					{
						swapsPerSecond = startingSwapsPerSecond
					}
				}
			}
		}

		_scene.decideBasedOnPValue = function(userP)
		{
			if(duplicate === null || allButOneToTakeAwayIndex === null)
			{
				return
			}
			let meanOfSamplesTaken = duplicate.getSamplesAverage()

			//it should be the case that if you have the lot, thing will be accepted even if p = 0.99999
			//yo what if two distributions have similar means?

			let populationDistribution = objectsToHide[allButOneToTakeAwayIndex]
			let standardError = Math.sqrt( populationDistribution.variance ) / Math.sqrt(duplicate.getNumSamples())
			let z = ( meanOfSamplesTaken - populationDistribution.mean ) / standardError
			//standard error? =/ ie num samples gets involved
			let probabilityOfSampleMeanAtLeastAsExtremeAsThisFromPopulation = 2 * ( 1 - standardNormalCdf( Math.abs(z) ) )
			// console.log(z,standardNormalCdf( Math.abs(z) ))
			// console.log(z,probabilityOfSampleMeanAtLeastAsExtremeAsThisFromPopulation, userP)
			if( probabilityOfSampleMeanAtLeastAsExtremeAsThisFromPopulation < userP )
			{
				return populationDistribution.cross.position.x
			}
			else
			{
				return populationDistribution.tick.position.x
			}
		}
	}
	chapter.add(manager,"updatables")

	var cups = Array(objectsToHide.length);
	for(var i = 0; i < cups.length; i++)
	{
		cups[i] = Cup();
		cups[i].unusedPosition = new THREE.Vector3(1.2,-(i-1) * cupHeight * 1.2,0)
		cups[i].position.copy(cups[i].unusedPosition)
		cups[i].hide(objectsToHide[i])
	}

	for(var i = 0; i < objectsToHide.length; i++)
	{
		_scene.add(objectsToHide[i])
	}

	return _scene
}

{
	let cupRadius = 0.12
	let cupInnerRadius = cupRadius * 0.86
	cupHeight = 2 * cupRadius
	let cupRoundedness = 4;
	let cupRadialSegments = 16;
	cupGeometry = new THREE.CylinderGeometry( cupRadius, cupRadius, cupHeight, cupRadialSegments)

	let indexOfVertexAtBottom = cupGeometry.vertices.length-1; //2?
	for(let i = 0; i < cupGeometry.faces.length; i++)
	{
		for(let j = 0; j < 3; j++)
		{
			if( cupGeometry.faces[i].getCorner(j) === indexOfVertexAtBottom )
			{
				cupGeometry.faces[i].set(indexOfVertexAtBottom,indexOfVertexAtBottom,indexOfVertexAtBottom)
				break;
			}
		}
	}
	cupGeometry.merge( new THREE.CylinderGeometry( cupInnerRadius, cupInnerRadius, cupHeight, cupRadialSegments,1,true) )
	cupGeometry.merge( new THREE.RingGeometry( cupInnerRadius, cupRadius, cupRadialSegments).applyMatrix(new THREE.Matrix4().makeRotationX(TAU/4).setPosition(new THREE.Vector3(0,-cupHeight/2,0))) )
	cupMaterial = new THREE.MeshLambertMaterial({color:0xC0C0FF, side:THREE.DoubleSide})

	let handleThickness = cupRadius / 6
	let handleGeometry = new THREE.TorusGeometry(cupRadius/1.5,handleThickness,16,16,TAU/2)
	handleGeometry.applyMatrix(new THREE.Matrix4().makeRotationZ(-TAU/4))
	handleGeometry.applyMatrix(new THREE.Matrix4().makeTranslation(cupRadius-handleThickness,0,0))
	cupGeometry.merge(handleGeometry)
}