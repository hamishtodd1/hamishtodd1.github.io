//all the objects we make elsewhere should be accessible from hwwew
function initPresentation(presentationObject)
{
	presentationObject.pages = [];
	
	function makeSlide(url)
	{
		var slide = new THREE.Mesh( new THREE.PlaneGeometry(1, 1), new THREE.MeshBasicMaterial({side:THREE.DoubleSide}) );
		loadpic(url, slide.material);
		return slide;
	}
	var slides = {};
//	slides.intro = makeSlide("http://hamishtodd1.github.io/RILecture/Data/Slides/radial pattern.png");
//	slides.inflamedLivers = makeSlide("http://hamishtodd1.github.io/RILecture/Data/Slides/pure beeli.png");
	
	function page(arrayOfDesiredObjects) //constructor
	{
		console.log(arrayOfDesiredObjects)
		this.presentObjects = arrayOfDesiredObjects;
		this.symmetryDemonstrationMode = "nothing";
		
//		page.adornments = Array(5);
//		for(var i = 0; i < page.adornments)
		
		/*
		 * States to set up:
		 * what symmetry demonstration we're on
		 * whether the lattices are showing shapes or points
		 * whether the viruses have points in them
		 * whether the axes have their adornments
		 * whether the axes are factories
		 */
	}
	
	//PAGES
	presentationObject.pages.push( new page([axis3D, axis4D]) );
	presentationObject.pages.push( new page([presentationObject.symmetryDemonstration]) );
	
	presentationObject.pages.push( new page([presentationObject.symmetryDemonstration]) );
	presentationObject.pages[ presentationObject.pages.length-1 ].symmetryDemonstrationMode = "rotation";
	//NO LONGER PAGES
	
	presentationObject.changePage = function( direction ) //either 1 or -1, triggered when you read from the controllers
	{
		for(var property in this.pages[this.currentPageIndex].presentObjects )
			OurObject.remove( this.pages[this.currentPageIndex].presentObjects[property] );
		
		this.currentPageIndex += direction;
		if(this.currentPageIndex >= this.pages.length)
			this.currentPageIndex = this.pages.length - 1;
		if(this.currentPageIndex < 0)
			this.currentPageIndex = 0;
		
		var objectSpacing = 1;
		var objectsSoFar = 0;
		for(var property in this.pages[this.currentPageIndex].presentObjects )
		{
			OurObject.add( this.pages[this.currentPageIndex].presentObjects[property] );
			//it might be nice if their state could be reset here
			this.pages[this.currentPageIndex].presentObjects[property].position.x = objectSpacing * objectsSoFar;
			objectsSoFar++;
		}
		for(var property in this.pages[this.currentPageIndex].presentObjects )
			this.pages[this.currentPageIndex].presentObjects[property].position.x -= objectSpacing * (objectsSoFar-1) / 2;
		
		this.symmetryDemonstration.changeMode(this.pages[this.currentPageIndex].symmetryDemonstrationMode)
	}
	
	presentationObject.currentPageIndex = 0;
	presentationObject.changePage(0);
	
	document.addEventListener( 'keydown', function(event) {
		if( event.keyCode === 81 )
			presentationObject.changePage( -1 );
		if( event.keyCode === 69 )
			presentationObject.changePage( 1 );
	}, false );
}