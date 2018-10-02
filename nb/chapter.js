var chapters = []

function Chapter(newChapterPosition)
{
	var chapter = {
		sceneElementsToAdd:[],
		sceneElementsToRemove:[],
		updatingObjectsToAdd:[],
		updatingObjectsToRemove:[],
		clickablesToAdd:[],
		clickablesToRemove:[],
		functionsToCallOnSetUp:[],
		functionsToCallOnSetDown:[]
    }
    
    if(newChapterPosition === undefined)
    {
        chapters.push(chapter)
    }
    else
    {
        chapters.splice(newChapterPosition,0,chapter)
    }

	chapter.addSceneElement = function(object3D)
	{
		this.sceneElementsToAdd.push(object3D)
		this.sceneElementsToRemove.push(object3D)
	}
	chapter.addUpdatingObject = function(object)
	{
		this.updatingObjectsToAdd.push(object)
		this.updatingObjectsToRemove.push(object)
	}
	chapter.addClickable = function(object)
	{
		this.clickablesToAdd.push(object)
		this.clickablesToRemove.push(object)
	}

	chapter.setUp = function()
	{
		for(var i = 0; i < this.sceneElementsToAdd.length; i++)
		{
			scene.add(this.sceneElementsToAdd[i])
		}

		for(var i = 0; i < this.updatingObjectsToAdd.length; i++)
		{
			objectsToBeUpdated.push(this.updatingObjectsToAdd[i])
		}

		for(var i = 0; i < this.clickablesToAdd.length; i++)
		{
			clickables.push(this.clickablesToAdd[i])
		}

		for(var i = 0; i < this.functionsToCallOnSetUp.length; i++)
		{
			this.functionsToCallOnSetUp[i]()
		}
	}
	chapter.setDown = function()
	{
		for(var i = 0; i < this.sceneElementsToRemove.length; i++)
		{
            if(this.sceneElementsToRemove[i].parent)
            {
                this.sceneElementsToRemove[i].parent.remove(this.sceneElementsToRemove[i])
            }
		}

		for(var i = 0; i < this.updatingObjectsToRemove.length; i++)
		{
			var index = objectsToBeUpdated.indexOf(this.updatingObjectsToRemove[i])
			if(index !== -1)
			{
				objectsToBeUpdated.splice(index,1)
			}
		}

		for(var i = 0; i < this.clickablesToRemove.length; i++)
		{
			var index = clickables.indexOf(this.clickablesToRemove[i])
			if(index !== -1)
			{
				clickables.splice(index,1)
			}
		}

		for(var i = 0; i < this.functionsToCallOnSetDown.length; i++)
		{
			this.functionsToCallOnSetDown[i]()
		}
	}

	return chapter;
}