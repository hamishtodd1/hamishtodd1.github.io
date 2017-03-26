//all the objects we make elsewhere should be accessible from hwwew
function initPresentation(presentation)
{
	presentation.pages = [];
	
	//this one we want to zoom in on
	var ammannBeenkerPic = new THREE.Mesh( new THREE.PlaneGeometry(0.6,0.6), new THREE.MeshBasicMaterial({side:THREE.DoubleSide, transparent:true}) );
	loadpic("http://hamishtodd1.github.io/RILectureVR/Data/Amman Beenker.png", ammannBeenkerPic.material);
	ammannBeenkerPic.material.transparent = true;
	presentation.createNewHoldable( "ammannBeenkerPic", ammannBeenkerPic );
	
	var slideNames = [
			"sevenfoldPattern", 
			"sunflowerAndWall",
			"",
			"virusVictims",
			"virusStructures", 
			"",
			"mainQC",
			"",
			"",
			"symmetryExerciseCue", 
			"lungsAndBuilding", 
			"everyday3DPatterns",
			"",
			"", 
			"marioBros",
			"orangeSlide",
			"",
			"tree",
			"slicingExerciseCue", 
			"banana", 
			"mri",
			"",
			"",
			"crystal1",
			"crystal2", 
			"diffractionImages", 
			"diffractionMachine",
			"", 
			"moreDiffraction",
			"moreCrystals",
			"strangeSymmetryCrystals",
			"strangeSymmetryDiffraction",
			"lunchCue",
			"brilliantCut",
			"brilliantCutHighlighted",
			"octagonsExerciseCue",
			"brilliantCutAndDiffraction",
			"",
			"",
			"orthogonalExercises",
			"",
			"",
			"",
			"dimensionsExerciseCue",
			"flatCubesPattern",
			"",
			"",
			"",
			"",
			"",
			"garnetCrystal", 
			"mainQC",
			"",
			"lesserQCs",
			"",
			"",
			"",
			"allPhotos",
			"rhombille",
			"rhombille2",
			];
	
	var slides = {};
	for(var i = 0; i < slideNames.length; i++)
	{
		if(slideNames[i] === "")
			continue;
		var numString = i < 9 ? "0"+(i+1).toString() : (i+1).toString();
		slides[slideNames[i]] = makeSlide("http://hamishtodd1.github.io/RILectureVR/Data/Slides/RI lecture viruses (1)-page-0" + numString + ".jpg");
	}
	slides["zikaBaby"] = makeSlide("http://hamishtodd1.github.io/Data/Slides/Zika victim.png");
	slides["zikaHazmat"] = makeSlide("http://hamishtodd1.github.io/RILectureVR/Data/Slides/zikaHazmat.jpg");
	
	function page( sceneContents )
	{
		if( typeof sceneContents.length === 'undefined') //it's not an array, it's a slide
		{
			this.slideInScene = sceneContents;
			this.holdablesInScene = [];
		}
		else
		{
			this.holdablesInScene = sceneContents;
			this.slideInScene = new THREE.Object3D(); //TODO urgh
		}
		
		this.axis3DisSnowflake = false;
		
		this.adornmentsVisible = false;
		
		this.symmetryDemonstrationMode = "nothing";

		this.volumeVisible = false;
		this.startingEL = {ep2D: 0, ep3D: 0, ep4D: 0, ep6D: 0};
		
//		this.whetherAxesAreFactories = [false,true, true, true, true]; //for now this is crap
		
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
	
	//--------------Begin Plan
	var h = presentation.holdables;
	var p = presentation.pages;
	
	p.push( new page( slides.sevenfoldPattern ) );
	p.push( new page( slides.sunflowerAndWall ) );
	p.push( new page( [h.looseRhom0, h.looseRhom1, h.looseGico,h.looseDode,h.looseTria] ) );//they fit together
	p.push( new page( [h.star, h.adornedTria, h.looseGico, h.looseDode] ) );
	
//	p.push( new page( slides.virusVictims ) );
//	p.push( new page( slides.virusStructures ) );
//	p.push( new page( slides.zikaBaby ) );
//	p.push( new page( [ h.zika ] ) );
//	p.push( new page( slides.mainQC ) );
//	
//	p.push( new page( [h.symmetryDemonstration] ) );
//	p[ p.length-1 ].symmetryDemonstrationMode = "nothing";
//	p.push( new page( [h.symmetryDemonstration] ) );
//	p[ p.length-1 ].symmetryDemonstrationMode = "reflection";
//	p.push( new page( [h.symmetryDemonstration] ) );
//	p[ p.length-1 ].symmetryDemonstrationMode = "rotation";
//	p.push( new page( [h.symmetryDemonstration] ) );
//	p[ p.length-1 ].symmetryDemonstrationMode = "translation";
//	
//	p.push( new page( slides.symmetryExerciseCue ) );
//	p.push( new page( slides.lungsAndBuilding ) );
	
	p.push( new page( slides.lungsAndBuilding ) );
	p.push( new page( slides.everyday3DPatterns ) );
	
	p.push( new page( [ h.cubicLattice ] ) );
	p.push( new page( [ h.octaHoneycomb, h.baseOcta, h.baseLTet ] ) );
	p.push( new page( [ h.RDhoneycomb, h.baseRD ] ) );
	
	p.push( new page( [ h.fishUniverse ] ) );
	p.push( new page( slides.marioBros ) );
	p.push( new page( [ h.fishUniverse, h.octagon0 ] ) );
	p.push( new page( [ h.fishUniverse, h.ep3D ] ) );
	p[ p.length-1 ].volumeVisible = true;
	p[ p.length-1 ].startingEL["ep3D"] = 3;
	p.push( new page( [ h.fishUniverse, h.treePuzzle ] ) );
	p.push( new page( [ h.fishUniverse, h.sliceableTree, h.treeSlicer ] ) );
	p.push( new page( slides.tree ) );
	p.push( new page( slides.orangeSlide ) );
	p.push( new page( slides.slicingExerciseCue ) );
	p.push( new page( [ h.fullNoHole ] ) );
	
	p.push( new page( slides.banana ) );
	p.push( new page( slides.mri ) );
	p.push( new page( [ h.mriVideo ] ) );
	p.push( new page( [ h.fullNoHole ] ) );
	p.push( new page( [ h.halfNoHole ] ) );
	p.push( new page( [ h.full3hole ] ) );
	p.push( new page( [ h.half3hole ] ) );

	p.push( new page( slides.crystal2 ) );
	p.push( new page( slides.crystal1 ) );
	p.push( new page( [ h.cubicLattice ] ) );
	p.push( new page( [ h.cubicLattice, h.atomicCubicLattice ] ) );
	p.push( new page( [ h.snowflakeGrowthVideo ] ) );
	p.push( new page( [ h.crystalGrowthVideo ] ) );
	p.push( new page( [ h.fishUniverse, h.atomicCubicLattice, h.latticeShadow, h.torch ] ) );
	p.push( new page( slides.diffractionImages ) );
	p.push( new page( slides.diffractionMachine ) );
	p.push( new page( [ h.diffractionVideo ] ) );
	
	p.push( new page( slides.moreCrystals ) );
	p.push( new page( slides.moreDiffraction ) );
	
	p.push( new page( slides.strangeSymmetryCrystals ) );
	p.push( new page( slides.strangeSymmetryDiffraction ) );

	p.push( new page( [ h.axis1D, h.axis2D, h.axis3D, h.axis4D, h.axis6D ] ) );
	p[ p.length-1 ].adornmentsVisible = false;
	p.push( new page( [ h.axis1D, h.axis2D, h.axis3D, h.axis4D, h.axis6D ] ) );
	p[ p.length-1 ].adornmentsVisible = true; //go back and forth

	p.push( new page( slides.rhombille ) );
	p.push( new page( slides.rhombille2 ) );
	p.push( new page( [ h.squashableCubic, h.axis3D, h.xAxisGrabber3D, h.zAxisGrabber3D ] ) );
	p[ p.length-1 ].axis3DisSnowflake = true;
	p.push( new page( [ h.fishUniverse, h.squashableCubic, h.axis3D, h.xAxisGrabber3D, h.zAxisGrabber3D ] ) );
	p[ p.length-1 ].axis3DisSnowflake = true;
	p.push( new page( [ h.fishUniverse, h.atomicCubicLattice, h.latticeShadow ] ) );

	p.push( new page( [ h.fishUniverse, h.axis3D, h.ep3D, h.xAxisGrabber3D, h.zAxisGrabber3D ] ) );
	p[ p.length-1 ].volumeVisible = false; //show them extrusion and squashing
	p.push( new page( [ h.fishUniverse, h.house, h.axis3D, h.xAxisGrabber3D, h.zAxisGrabber3D ] ) );
	
	p.push( new page( slides.garnetCrystal ) );
	p.push( new page( [ h.axis3D, h.xAxisGrabber3D, h.zAxisGrabber3D, h.axis4D ] ) ); //So if this is a 3D axis squashed down to 2D, what is this? 
	p.push( new page( slides.orthogonalExercises ) );
	p.push( new page( slides.garnetCrystal ) );
	p.push( new page( [ h.axis4D, h.ep4D ] ) );
	p[ p.length-1 ].volumeVisible = false;
	p.push( new page( [ h.ep4D, h.RDhoneycomb ] ) );
	p[ p.length-1 ].startingEL["ep4D"] = 4;
	p[ p.length-1 ].volumeVisible = true;
	
	p.push( new page( slides.dimensionsExerciseCue ) );
	
	p.push( new page( slides.brilliantCut ) );
	p.push( new page( slides.brilliantCutHighlighted ) );
	p.push( new page( slides.brilliantCutAndDiffraction ) );
	p.push( new page( [ammannBeenkerPic] ) );
	p.push( new page( [ h.axis4D, h.ep4D, h.xAxisGrabber4D, h.zAxisGrabber4D, h.wAxisGrabber4D ] ) );
	p[ p.length-1 ].startingEL["ep4D"] = 4;
	p[ p.length-1 ].volumeVisible = false; //whaaaat? Not working?

	p.push( new page( [h.fishUniverse, ammannBeenkerPic] ) );
	
	
	
	p.push( new page( slides.mainQC ) );
	p.push( new page( [h.ep6D, h.axis6D ] ) );
	p[ p.length-1 ].volumeVisible = true;
	p.push( new page( [h.looseRhom0, h.looseRhom1, h.looseGico,h.looseDode,h.looseTria] ) );//they fit together
	p.push( new page( [h.star, h.adornedTria] ) );
	p.push( new page( [h.goldenLattice] ) );
	
	p.push( new page( slides.lesserQCs ) );
	
//	p.push( new page( [ h.zika, h.looseTria ] ) );
//	p.push( new page( slides.zikaHazmat ) );
//	p.push( new page( [ h.pariaModel, h.pariaData ] ) );
////	p.push( new page( [ h.CCMV, h.tamiflu ] ) );
//	p.push( new page( [ h.ms2Model, h.ms2Data ] ) );
//
//	p.push( new page( slides.allPhotos ) );
	
	//--------------End Plan
	
	presentation.changePage = function( pageChangeAmount ) //either 1 or -1, triggered when you read from the controllers
	{
		for(var i = 0; i < this.pages[this.currentPageIndex].holdablesInScene.length; i++ )
			if( typeof this.pages[this.currentPageIndex].holdablesInScene[i].documentElement !== "undefined")
				this.pages[this.currentPageIndex].holdablesInScene[i].documentElement.pause();
		for(var i = 0; i < this.pages[this.currentPageIndex].holdablesInScene.length; i++ )
			Scene.remove( this.pages[this.currentPageIndex].holdablesInScene[i] );
		
		this.pictureHolder.remove( this.pages[this.currentPageIndex].slideInScene );
		
		this.currentPageIndex += pageChangeAmount;
		if(this.currentPageIndex >= this.pages.length)
			this.currentPageIndex = this.pages.length - 1;
		if(this.currentPageIndex < 0)
			this.currentPageIndex = 0;
		
		var objectSpacing = 0.3;
		var objectsSoFar = 0;
		for(var i = 0; i < this.pages[this.currentPageIndex].holdablesInScene.length; i++ )
		{
			Scene.add( this.pages[this.currentPageIndex].holdablesInScene[i] );
			this.pages[ this.currentPageIndex ].holdablesInScene[i].position.x = objectSpacing * objectsSoFar;
			objectsSoFar++;
		}
		for(var i = 0; i < this.pages[this.currentPageIndex].holdablesInScene.length; i++ )
			this.pages[this.currentPageIndex].holdablesInScene[i].position.x -= objectSpacing * (objectsSoFar-1) / 2;
		
		for(var i = 0; i < this.pages[this.currentPageIndex].holdablesInScene.length; i++ )
		{
			if( typeof this.pages[this.currentPageIndex].holdablesInScene[i].reset !== 'undefined' )
				this.pages[this.currentPageIndex].holdablesInScene[i].reset();
		}
		
		for( var i in this.holdables )
			copyPositionAndQuaternion( inputObject.holdableStates[i], this.holdables[i] ); //sigh, that was meant to be synchronous. TODO stop being an idiot
		
		this.holdables.ep3D.children[0].visible = this.pages[this.currentPageIndex].volumeVisible;
		this.holdables.ep4D.children[0].visible = this.pages[this.currentPageIndex].volumeVisible;
		this.holdables.ep6D.children[0].visible = this.pages[this.currentPageIndex].volumeVisible;
		
		this.holdables.ep2D.extrusionLevel = this.pages[this.currentPageIndex].startingEL["ep2D"];
		this.holdables.ep3D.extrusionLevel = this.pages[this.currentPageIndex].startingEL["ep3D"];
		this.holdables.ep4D.extrusionLevel = this.pages[this.currentPageIndex].startingEL["ep4D"];
		this.holdables.ep6D.extrusionLevel = this.pages[this.currentPageIndex].startingEL["ep6D"];
		
		for(var i = 0; i < 5; i++)
			this.holdables.axis1D.children[ this.holdables.axis1D.children.length-1-i ].visible = this.pages[this.currentPageIndex].adornmentsVisible;
		this.holdables.axis1D.children[this.holdables.axis1D.children.length-1].visible = this.pages[this.currentPageIndex].adornmentsVisible;
		this.holdables.axis2D.children[this.holdables.axis2D.children.length-1].visible = this.pages[this.currentPageIndex].adornmentsVisible;
		this.holdables.axis3D.children[this.holdables.axis3D.children.length-1].visible = this.pages[this.currentPageIndex].adornmentsVisible;
		
//		if( this.pages[this.currentPageIndex].axis3DisSnowflake)
//		{
//			h.xAxisGrabber3D.position.set( HS3,-0.5,0.001);
//			h.zAxisGrabber3D.position.set(-HS3,-0.5,0.001);
//			
//			h.xAxisGrabber3D.position.add(h.axis3D.position);
//			h.zAxisGrabber3D.position.add(h.axis3D.position);
//		}
		
		this.pictureHolder.add( this.pages[ this.currentPageIndex ].slideInScene );
		
		this.holdables.symmetryDemonstration.changeMode( this.pages[this.currentPageIndex].symmetryDemonstrationMode)
	}
	
	presentation.currentPageIndex = 0;
	presentation.changePage(0);
	
	presentation.alreadyMovedSlideForward = 0;
	presentation.alreadyMovedSlideBackward = 0;
	
	socket.on('pageChange', function( newPageNumber )
	{
		//they won't start out on the right page necessarily but you can change and change back
		presentation.changePage( newPageNumber - presentation.currentPageIndex );
	});
}

function makeSlide(url)
{
	var slide = new THREE.Mesh( new THREE.PlaneGeometry(16/10, 9/10), new THREE.MeshBasicMaterial({side:THREE.DoubleSide}) );
	loadpic(url, slide.material);
	return slide;
}