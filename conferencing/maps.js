/*
 * TODO: when the thing moves away, the lines get thicker
 */

function initMap(mapURL, slabPlanes)
{
	modelAndMap.map = new THREE.LineSegments( new THREE.BufferGeometry(), new THREE.LineBasicMaterial({
		color:0xFFFFFF, //0x777799 is coot 
		linewidth: 1.2, 
		clippingPlanes: slabPlanes}));
//	modelAndMap.map = new THREE.Mesh( new THREE.BufferGeometry(), new THREE.MeshLambertMaterial({
//		//side: THREE.DoubleSide, transparent:true, opacity:0.5, 
//		side: THREE.BackSide, 
//		clippingPlanes: camera.slabPlanes,
//		color:0x777799
//	}));
	if(modelAndMap.model)
		modelAndMap.map.position.copy(modelAndMap.model.position);
	modelAndMap.add(modelAndMap.map);
	
	var cubeMarchingSystem = CubeMarchingSystem();
	modelAndMap.map.contour = function(isolevel)
	{
		if( !this.data )
		{
			return;
		}
		else
		{
			var oldGeometry = this.geometry;
			if( this.isLineSegments)
			{
				//Alex Rose's code is much faster
				//both the below take about 0.4s, yeesh
				var solidGeometry = cubeMarchingSystem.createGeometry( modelAndMap.map.data, isolevel );
				this.geometry = new WireframeGeometry( solidGeometry );
				solidGeometry.dispose();
			}
			else
			{
				this.geometry = cubeMarchingSystem.createGeometry( modelAndMap.map.data, isolevel );
				//the below takes a quarter the time of wireframe making
				this.geometry.computeFaceNormals();
				this.geometry.computeVertexNormals();
			}
			oldGeometry.dispose(); //if we expect them to go back we could remember it
		}
	}
	
	new THREE.FileLoader().load( mapURL,
		function ( scalarFieldFile )
		{
			var scalarFieldCommas = scalarFieldFile.replace(/\s+/g,",");
			modelAndMap.map.data = 
			{
				array: new Float32Array( JSON.parse("[" + scalarFieldCommas.substr(1,scalarFieldCommas.length-2) + "]") ),  //substring to remove start and end commas. -2 instead of -1 because javascript
				sizeX: 53,
				sizeY: 53,
				sizeZ: 53,
				gridSamplingX:168,
				gridSamplingY:200,
				gridSamplingZ:100,
				cellDimensionX: 64.897,
				cellDimensionY: 78.323,
				cellDimensionZ: 38.792,
				startingI: 125, //Note!!! this is swapped from Paul's email!
				startingJ: -10,
				startingK: 4,
				meanDensity: 0,
				maxDensity: 2.13897
				/* Map mode ........................................    2
		           Start and stop points on columns, rows, sections    33   51   48   66   46   62
		           Grid sampling on x, y, z ........................  256  256  360
		           Cell dimensions .................................  142.2 142.2 200.41 90.0 90.0 120.0
		           Fast, medium, slow axes .........................    Y    X    Z
		           Space-group .....................................    1
		           
		           scalarField: 19,19,17
		           scalarFieldLarge: 103,101,26
		           
		           Number of columns, rows, sections ...............   53 53   53
		           Start and stop points on columns, rows, sections   -10 42  125  177    4   56
		           Grid sampling on x, y, z ........................  168 200  100
		           Cell dimensions ................................. 64.8970    78.3230    38.7920    90.0000    90.0000    90.0000
		           58, 6, 11
		           
		           "the thing to add to uvw is 125,-10,4
		           uvw=0,0,0
				 */
			}
//			bottom left will be at molecule coordinates: 125*64.87/168, -10*78.323/200, 4*38.792/100
			if( modelAndMap.map.data.array.length !== modelAndMap.map.data.sizeX * modelAndMap.map.data.sizeY * modelAndMap.map.data.sizeZ )
				console.error("you may need to change map metadata");
				
			modelAndMap.map.contour(0.9);
		},
		function ( xhr ) {}, //progression function
		function ( xhr ) { console.error( "couldn't load PDB" ); }
	);
}