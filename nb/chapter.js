let chapters = []

function initChapters()
{
	makeResettableChapter = function(chapterMakingFunction)
	{
		let resetButton = makeTextSign("Reset")
		resetButton.position.x = 0.8
		resetButton.position.y = -0.4
		resetButton.scale.multiplyScalar(2)
		function reset()
		{
			let newChapterPosition = chapters.indexOf(chapter) + 1
			let newChapter = chapterMakingFunction( newChapterPosition )
			newChapter.add(resetButton,"sceneElements")
			newChapter.add(resetButton,"clickables")
			changeChapter(1)
		}
		resetButton.onClick = reset

		// updatables.push({update:function(){
		// 	console.log(resetButton.parent)
		// }})

		let firstChapterOfThisKind = chapterMakingFunction()
		firstChapterOfThisKind.add(resetButton,"sceneElements")
		firstChapterOfThisKind.add(resetButton,"clickables")
	}

	{
		let rightArrow = new THREE.Mesh(new THREE.Geometry(), new THREE.MeshBasicMaterial({side:THREE.DoubleSide, color:0xFF0000}))
		rightArrow.geometry.vertices.push(new THREE.Vector3(0,0,0),new THREE.Vector3(-1,1,0),new THREE.Vector3(-1,-1,0))
		rightArrow.geometry.faces.push(new THREE.Face3(0,1,2))
		rightArrow.scale.multiplyScalar(0.07)
		let leftArrow = rightArrow.clone()
		leftArrow.scale.x *= -1
		rightArrow.position.x = 1
		leftArrow.position.x = -1

		rightArrow.position.z = -camera.position.z
		leftArrow.position.z = -camera.position.z
		camera.add(rightArrow)

		changeChapter = function(chapterAddition)
		{
			chapter.setDown()

			let newChapterIndex = chapters.indexOf(chapter)
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

	Chapter = function(newChapterPosition,_scene)
	{
		if(_scene === undefined)
		{
			_scene = scene
		}

		let chapter = {
			sceneElementsToAdd:[],
			sceneElementsToRemove:[],
			cameraElementsToAdd:[],
			cameraElementsToRemove:[],
			updatablesToAdd:[],
			updatablesToRemove:[],
			clickablesToAdd:[],
			clickablesToRemove:[],
			functionsToCallOnSetUp:[],
			functionsToCallOnSetDown:[]
		}

		if(newChapterPosition === undefined || newChapterPosition === -1 )
		{
			newChapterPosition = chapters.length;
		}
		chapters.splice(newChapterPosition,0,chapter)

		let isSetUp = false

		chapter.add = function(object,arrayName)
		{
			if(isSetUp)
			{
				if( arrayName === "sceneElements")
				{
					_scene.add(object)
				}
				else if( arrayName === "cameraElements")
				{
					camera.add(object)
				}
				else
				{
					eval(arrayName).push(object)
				}
			}
			else
			{
				this[arrayName + "ToAdd"].push(object)
			}

			//hmm, and if you come back to this chapter? Well, we don't do that.
			this[arrayName + "ToRemove"].push(object)
		}

		chapter.setUp = function()
		{
			for(let i = 0; i < this.sceneElementsToAdd.length; i++)
			{
				_scene.add(this.sceneElementsToAdd[i])
			}

			for(let i = 0; i < this.cameraElementsToAdd.length; i++)
			{
				camera.add(this.cameraElementsToAdd[i])
				this.cameraElementsToAdd[i].updateText(this.cameraElementsToAdd[i].text)
				// console.log(this.cameraElementsToAdd[i].material.map.needsUpdate)
			}

			for(let i = 0; i < this.updatablesToAdd.length; i++)
			{
				updatables.push(this.updatablesToAdd[i])
			}

			for(let i = 0; i < this.clickablesToAdd.length; i++)
			{
				clickables.push(this.clickablesToAdd[i])
			}

			for(let i = 0; i < this.functionsToCallOnSetUp.length; i++)
			{
				this.functionsToCallOnSetUp[i]()
			}

			isSetUp = true
		}
		chapter.setDown = function()
		{
			for(let i = 0; i < this.sceneElementsToRemove.length; i++)
			{
				if(this.sceneElementsToRemove[i].parent)
				{
					this.sceneElementsToRemove[i].parent.remove(this.sceneElementsToRemove[i])
				}
			}

			for(let i = 0; i < this.cameraElementsToRemove.length; i++)
			{
				if(this.cameraElementsToRemove[i].parent)
				{
					this.cameraElementsToRemove[i].parent.remove(this.cameraElementsToRemove[i])
				}
			}

			for(let i = 0; i < this.updatablesToRemove.length; i++)
			{
				let index = updatables.indexOf(this.updatablesToRemove[i])
				if(index !== -1)
				{
					updatables.splice(index,1)
				}
			}

			for(let i = 0; i < this.clickablesToRemove.length; i++)
			{
				let index = clickables.indexOf(this.clickablesToRemove[i])
				if(index !== -1)
				{
					clickables.splice(index,1)
				}
			}

			for(let i = 0; i < this.functionsToCallOnSetDown.length; i++)
			{
				this.functionsToCallOnSetDown[i]()
			}

			isSetUp = false
		}

		return chapter;
	}

	let chapter = null
	finishSettingUpChapters = function()
	{
		chapter = chapters[0]
		chapter.setUp()
	}
}