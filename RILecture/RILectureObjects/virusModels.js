function initSolidVirusModels()
{
	var Paria_models = Array(4); //DNA, pentamers, Dextros, Laevos in that order
	
	Paria_models[0] = new THREE.Mesh(new THREE.BufferGeometry, new THREE.MeshPhongMaterial({color:0xF6F0D8,transparent:false}) ); //DNA
	Paria_models[1] = new THREE.Mesh(new THREE.BufferGeometry, new THREE.MeshPhongMaterial({color:0xBBC7DC,transparent:false}) ); //Pentamers
	Paria_models[2] = new THREE.Mesh(new THREE.BufferGeometry, new THREE.MeshPhongMaterial({color:0xB5D5BF,transparent:false}) ); //Dextros
	Paria_models[3] = new THREE.Mesh(new THREE.BufferGeometry, new THREE.MeshPhongMaterial({color:0xF2D4D7,transparent:false}) ); //Laevos
	
	Paria_models[0].geometry.addAttribute('position',new THREE.BufferAttribute( Pariacoto_DNAs_vertices, 3 ));
	Paria_models[0].geometry.setIndex(new THREE.BufferAttribute( Pariacoto_DNAs_faces, 1 ));
	Paria_models[1].geometry.addAttribute('position',new THREE.BufferAttribute( Pariacoto_Ps_vertices, 3 ));
	Paria_models[1].geometry.setIndex(new THREE.BufferAttribute( Pariacoto_Ps_faces, 1 ));
	Paria_models[2].geometry.addAttribute('position',new THREE.BufferAttribute( Pariacoto_Ds_vertices, 3 ));
	Paria_models[2].geometry.setIndex(new THREE.BufferAttribute( Pariacoto_Ds_faces, 1 ));
	Paria_models[3].geometry.addAttribute('position',new THREE.BufferAttribute( Pariacoto_Ls_vertices, 3 ));
	Paria_models[3].geometry.setIndex(new THREE.BufferAttribute( Pariacoto_Ls_faces, 1 ));
	
	var pariacoto = new THREE.Object3D();
	for(var i = 0; i < Paria_models.length; i++)
	{
		Paria_models[i].geometry.computeFaceNormals();
		Paria_models[i].geometry.computeVertexNormals();
		pariacoto.add(Paria_models[i]);
	}
	
	var QC_atoms = create_QC_atoms();
	var pariaScale = 0.03;
	pariacoto.scale.set(pariaScale,pariaScale,pariaScale);
	var QCAScale = 0.105;
	QC_atoms.scale.set(QCAScale,QCAScale,QCAScale);
	QC_atoms.geometry.attributes.position.needsUpdate = true;
	
	var loader = new THREE.OBJLoader();
	loader.load(
		'http://hamishtodd1.github.io/RILecture/Data/Virus model data/Zika.obj',
		function ( zika ) {
			var zikaScale = 0.001;
			zika.scale.set(zikaScale,zikaScale,zikaScale)
//			OurObject.add( zika );
		}
	);
	
//	loader.load("http://hamishtodd1.github.io/HepCardboard/Data/hep.obj",
//		function ( hepOBJ ) {
//			var hep = hepOBJ.children[0];
//			hep.material.shading = THREE.SmoothShading;
//			console.log(hep.material)
//			var hep_center = new THREE.Vector3(60.5, 59, 74);
//			hep_center.multiplyScalar(1 / 0.7);
//			hep.updateMatrixWorld();
//			hep.worldToLocal(hep_center);
//			for(var i = 0, il = hep.geometry.attributes.position.array.length / 3; i < il; i++)
//			{
//				hep.geometry.attributes.position.array[i*3+0] -= hep_center.x;
//				hep.geometry.attributes.position.array[i*3+1] -= hep_center.y;
//				hep.geometry.attributes.position.array[i*3+2] -= hep_center.z;
//			}
//			
//			//and then we may wish to get rid of everything above a certain radius
//			
//			hep.material.vertexColors = THREE.VertexColors;
//		
//			var hep_vertexcolors = new Float32Array( hep.geometry.attributes.position.array.length );
//			hep.geometry.addAttribute('color', new THREE.BufferAttribute(hep_vertexcolors, 3));
//			
//			for(var i = 0, il = hep.geometry.attributes.position.array.length; i < il; i++)
//				hep.geometry.attributes.position.array[i] *= 0.007;
//			
//			hep.geometry.computeFaceNormals();
//			hep.geometry.computeVertexNormals();
//			
//			var layer_boundaries = [0.19,0.104,0.065,0.049,0.0203,0.01];//disordered membrane, golf ball, protrusions, corners, thing, inner corners
//			var radius = 0;
//			var blueishR = 62 / 256;
//			var blueishG = 108 / 256;
//			var blueishB = 210 / 256;
//			var blueishRincrement = ( 1 - blueishR ) / layer_boundaries.length;
//			var blueishGincrement = ( 1 - blueishG ) / layer_boundaries.length;
//			var blueishBincrement = ( 1 - blueishB ) / layer_boundaries.length;
//			var j = 0;
//			
//			for(var i = 0, il = hep.geometry.attributes.position.array.length / 3; i < il; i++)
//			{
//				radius = 
//				  hep.geometry.attributes.position.array[i*3+0] * hep.geometry.attributes.position.array[i*3+0]
//				+ hep.geometry.attributes.position.array[i*3+1] * hep.geometry.attributes.position.array[i*3+1] 
//				+ hep.geometry.attributes.position.array[i*3+2] * hep.geometry.attributes.position.array[i*3+2];
//				
//				for( j = 0; j < 6; j++)
//				{
//					if( radius > layer_boundaries[j] )
//					{
//						hep.geometry.attributes.color.array[i*3+0] = blueishR + blueishRincrement * j;
//						hep.geometry.attributes.color.array[i*3+1] = blueishG + blueishGincrement;
//						hep.geometry.attributes.color.array[i*3+2] = blueishB + blueishBincrement;
//						
//						break;
//					}
//				}
//				if( 0.01 > radius || radius > 0.19)
//				{
//					hep.geometry.attributes.position.array[i*3+0] = 0;
//					hep.geometry.attributes.position.array[i*3+1] = 0;
//					hep.geometry.attributes.position.array[i*3+2] = 0;
//				}
//			}
//			
//			var hepScale = 1;
//			hep.scale.set(hepScale,hepScale,hepScale)
////			OurObject.add(hep); //we'd prefer MS2. Also you can make this obj smaller
//		},
//		function ( xhr ) {}, //progression function
//		function ( xhr ) { console.error( "couldn't load OBJ" ); }
//	);
	
	var tamiflu = new THREE.Object3D();
	loadXYZ( "http://hamishtodd1.github.io/RILecture/Data/tamiflu.xyz", tamiflu, 1 );
	tamiflu.scale.multiplyScalar(0.1)
	
	//MS2. TODO this is a usable xyz loader
	{
		var MS2 = new THREE.Object3D();
		loadXYZ( "http://hamishtodd1.github.io/RILecture/Data/Virus model data/MS2 model.xyz", MS2, 3 );
		
		loader.load("http://hamishtodd1.github.io/RILecture/Data/Virus model data/MS2 icosahedrally averaged.obj",
			function ( ms2OBJ ) 
			{
				ms2Data = ms2OBJ.children[1];
				ms2Data.geometry.center();
				for(var i = 0, il = ms2Data.geometry.attributes.position.array.length / 3; i < il; i++)
				{
					var dist = 
						ms2Data.geometry.attributes.position.array[i*3+0] *
						ms2Data.geometry.attributes.position.array[i*3+0] +
						ms2Data.geometry.attributes.position.array[i*3+1] *
						ms2Data.geometry.attributes.position.array[i*3+1] +
						ms2Data.geometry.attributes.position.array[i*3+2] *
						ms2Data.geometry.attributes.position.array[i*3+2];
					
					if(dist > 28000)
					{
						ms2Data.geometry.attributes.position.array[i*3+0] = 0;
						ms2Data.geometry.attributes.position.array[i*3+0] = 0;
						ms2Data.geometry.attributes.position.array[i*3+1] = 0;
						ms2Data.geometry.attributes.position.array[i*3+1] = 0;
						ms2Data.geometry.attributes.position.array[i*3+2] = 0;
						ms2Data.geometry.attributes.position.array[i*3+2] = 0;
					}
				}
				ms2Data.geometry.center();
				MS2.add( ms2Data );
				var ms2Scale = 0.0035;
				MS2.scale.set(ms2Scale,ms2Scale,ms2Scale);
				//TODO align
			},
			function ( xhr ) {}, //progression function
			function ( xhr ) { console.error( "couldn't load OBJ" ); }
		);
	}
}

function loadXYZ(linkString, objectToAddTo, atomRadius )
{
	var xyzLoader = new THREE.XHRLoader();
	xyzLoader.setPath( this.path );
	xyzLoader.load( linkString , function ( xyzFile ) 
	{
		var sphereGeometryTemplate = (new THREE.BufferGeometry()).fromGeometry(new THREE.IcosahedronGeometry(atomRadius,1));
		var verticesInSphere = sphereGeometryTemplate.attributes.position.array.length / 3;
		

		var lines = xyzFile.split( '\n' );
		var geometriesIndexedByColor = {};
		
		for( var i = 0, il = lines.length; i < il; i++ )
		{
			if( typeof geometriesIndexedByColor[ lines[i][0] ] !== 'undefined')
				geometriesIndexedByColor[ lines[i][0] ].totalSpheres++;
			else
			{
				geometriesIndexedByColor[ lines[i][0] ] = new THREE.BufferGeometry();
				geometriesIndexedByColor[ lines[i][0] ].totalSpheres = 1;
				geometriesIndexedByColor[ lines[i][0] ].spheresSoFar = 0;
			}
		}
			
		for( var color in geometriesIndexedByColor)
		{
			geometriesIndexedByColor[ color ].addAttribute( 'position', new THREE.BufferAttribute( 
					new Float32Array( geometriesIndexedByColor[ color ].totalSpheres * verticesInSphere * 3 ), 3 ) );
			geometriesIndexedByColor[ color ].addAttribute( 'normal', new THREE.BufferAttribute( 
					new Float32Array( geometriesIndexedByColor[ color ].totalSpheres * verticesInSphere * 3 ), 3 ) );
		}
		
		for ( var i = 0, il = lines.length; i < il; i++ )
		{
			var components = lines[i].split(" ");
			var locationX = parseFloat(components[1]);
			var locationY = parseFloat(components[2]);
			var locationZ = parseFloat(components[3]);
			
			var bufferOffset = verticesInSphere * geometriesIndexedByColor[ components[0] ].spheresSoFar * 3;
			
			for(var j = 0; j < verticesInSphere; j++)
			{
				geometriesIndexedByColor[ components[0] ].attributes.position.array[bufferOffset+j*3+0] = sphereGeometryTemplate.attributes.position.array[j*3+0] + locationX;
				geometriesIndexedByColor[ components[0] ].attributes.position.array[bufferOffset+j*3+1] = sphereGeometryTemplate.attributes.position.array[j*3+1] + locationY;
				geometriesIndexedByColor[ components[0] ].attributes.position.array[bufferOffset+j*3+2] = sphereGeometryTemplate.attributes.position.array[j*3+2] + locationZ;

				geometriesIndexedByColor[ components[0] ].attributes.normal.array[bufferOffset+j*3+0] = sphereGeometryTemplate.attributes.normal.array[j*3+0];
				geometriesIndexedByColor[ components[0] ].attributes.normal.array[bufferOffset+j*3+1] = sphereGeometryTemplate.attributes.normal.array[j*3+1];
				geometriesIndexedByColor[ components[0] ].attributes.normal.array[bufferOffset+j*3+2] = sphereGeometryTemplate.attributes.normal.array[j*3+2];
			}
			geometriesIndexedByColor[ components[0] ].spheresSoFar++;
		}

		for( var color in geometriesIndexedByColor)
		{
			objectToAddTo.add(new THREE.Mesh( geometriesIndexedByColor[ color ], new THREE.MeshPhongMaterial({color: new THREE.Color(Math.random(),Math.random(),Math.random()), shading: THREE.SmoothShading}) ));
			if( color === "C")
				objectToAddTo.children[objectToAddTo.children.length-1].material.color = new THREE.Color( 0x121212 );
			if( color === "O")
				objectToAddTo.children[objectToAddTo.children.length-1].material.color = new THREE.Color( 0xDD342D );
			if( color === "N")
				objectToAddTo.children[objectToAddTo.children.length-1].material.color = new THREE.Color( 0x59B8E4 );
			if( color === "H")
				objectToAddTo.children[objectToAddTo.children.length-1].material.color = new THREE.Color( 0xFFFFFF );
		}
	}, function(xhr){}, function(xhr){console.log("couldn't load xyz")} );
}

function loadGiuliana(linkString, objectToAddTo, atomRadius, cutoutRadius)
{
	var giulianaLoader = new THREE.XHRLoader();
	giulianaLoader.setPath( this.path );
	giulianaLoader.load( linkString, function ( giulianaFile ) 
	{
		var sphereGeometryTemplate = (new THREE.BufferGeometry()).fromGeometry(new THREE.IcosahedronGeometry(atomRadius,1));
		var verticesInSphere = sphereGeometryTemplate.attributes.position.array.length / 3;		
		var lines = giulianaFile.split( '\n' );
		
		var layerGeometries = Array();
		
		var modelPoints = Array(lines.length);
		for(var i = 0, il = lines.length; i < il; i++)
		{
			var components = lines[i].split("	");
			var modelPoint = new THREE.Vector3(
					parseFloat(components[0]),
					parseFloat(components[1]),
					parseFloat(components[2]) );
			if(modelPoint.length() < cutoutRadius )
			{
				console.log("skipping")
				continue;
			}
			var foundLayer = 0;
			for( var j = 0; j < layerGeometries.length; j++)
			{
				if( Math.abs( layerGeometries[j].characteristicRadius - modelPoint.length() ) < 0.0001 )
				{
					layerGeometries[j].points.push(modelPoint);
					foundLayer = 1;
					break;
				}
			}
			if( !foundLayer )
			{
				layerGeometries.push(new THREE.BufferGeometry());
				layerGeometries[layerGeometries.length-1].characteristicRadius = modelPoint.length();
				layerGeometries[layerGeometries.length-1].points = [];
				layerGeometries[layerGeometries.length-1].points.push(modelPoint);
			}
		}
		
		for( var i = 0; i < layerGeometries.length; i++)
		{
			layerGeometries[i].addAttribute( 'position', new THREE.BufferAttribute( 
					new Float32Array( layerGeometries[i].points.length * verticesInSphere * 3 ), 3 ) );
			layerGeometries[i].addAttribute( 'normal', new THREE.BufferAttribute( 
					new Float32Array( layerGeometries[i].points.length * verticesInSphere * 3 ), 3 ) );
			
			for(var j = 0; j < layerGeometries[i].points.length; j++ )
			{
				for(var k = 0; k < verticesInSphere; k++)
				{
					var bufferOffset = verticesInSphere * j * 3;
					layerGeometries[i].attributes.position.array[bufferOffset+k*3+0] = sphereGeometryTemplate.attributes.position.array[k*3+0] + layerGeometries[i].points[j].x;
					layerGeometries[i].attributes.position.array[bufferOffset+k*3+1] = sphereGeometryTemplate.attributes.position.array[k*3+1] + layerGeometries[i].points[j].y;
					layerGeometries[i].attributes.position.array[bufferOffset+k*3+2] = sphereGeometryTemplate.attributes.position.array[k*3+2] + layerGeometries[i].points[j].z;

					layerGeometries[i].attributes.normal.array[bufferOffset+k*3+0] = sphereGeometryTemplate.attributes.normal.array[k*3+0];
					layerGeometries[i].attributes.normal.array[bufferOffset+k*3+1] = sphereGeometryTemplate.attributes.normal.array[k*3+1];
					layerGeometries[i].attributes.normal.array[bufferOffset+k*3+2] = sphereGeometryTemplate.attributes.normal.array[k*3+2];
				}
			}
			objectToAddTo.add(new THREE.Mesh( layerGeometries[i], 
					new THREE.MeshPhongMaterial({color: new THREE.Color(Math.random(),Math.random(),Math.random()), shading: THREE.SmoothShading}) ));
		}
	}, function(xhr){}, function(xhr){console.log("couldn't load xyz")} );
}

function initCCMV()
{
	var CCMV = new THREE.Object3D();
	
	CCMVcapsid = new THREE.LineSegments(new THREE.BufferGeometry(), new THREE.LineBasicMaterial({color:0xFF0000}));
	CCMVcapsid.geometry.addAttribute('position', new THREE.BufferAttribute(new Float32Array(defaultCCMVCAPositions.length), 3));
	CCMVcapsid.scale.setScalar(0.003);
	
	CCMV.conformation = 0;
	CCMV.conformationChangeSpeed = 0.0034;
	CCMV.conformationDifference = new Float32Array(defaultCCMVCAPositions.length);
	for(var i = 0, il = defaultCCMVCAPositions.length; i < il; i++)
		CCMV.conformationDifference[i] = swollenCCMVCAPositions[i] - defaultCCMVCAPositions[i];
	
	CCMV.add(CCMVcapsid);
	
	var defaultModel = new THREE.Object3D();
	var swollenModel = new THREE.Object3D();
	//these cutoffs (the last parameter) might be wrong
	loadGiuliana("http://hamishtodd1.github.io/RILecture/Data/Virus model data/pointarray2751.txt", swollenModel, 0.28, 4 );
	loadGiuliana("http://hamishtodd1.github.io/RILecture/Data/Virus model data/pointarray1044.txt", defaultModel, 0.28, 6.2);
	swollenModel.scale.setScalar(0.04);
	defaultModel.scale.setScalar(0.04);
	swollenModel.rotation.y = TAU / 4;
	defaultModel.rotation.y = TAU / 4;
	CCMV.add(swollenModel);
	
	CCMV.update = function()
	{
		this.conformation += this.conformationChangeSpeed;
		if( this.conformation > 1 )
		{
			this.conformation = 1;
			this.conformationChangeSpeed *= -1;
		}
		if( this.conformation < 0 )
		{
			this.conformation = 0;
			this.conformationChangeSpeed *= -1;
		}
		
		for( var i = 0, il = this.children[0].geometry.attributes.position.array.length; i < il; i++)
			this.children[0].geometry.attributes.position.array[i] = defaultCCMVCAPositions[i] + this.conformation * this.conformationDifference[i];
		this.children[0].geometry.attributes.position.needsUpdate = true;
	}
	CCMV.update();
	
	OurObject.add(CCMV);
}

function create_QC_atoms(){
	var QC_atoms = new THREE.Points( new THREE.BufferGeometry(), new THREE.PointsMaterial({size: 0.02,vertexColors: THREE.VertexColors}));
	
	var positionArray = new Float32Array(
			[1.7946890592575073,2.2250046730041504,0.6896183490753174,0.6896183490753174,1.7946890592575073,2.2250046730041504,2.2250046730041504,0.6896183490753174,1.7946890592575073,1.7900772094726562,1.3698935508728027,0.6814972758293152,0.6814972758293152,1.7900772094726562,1.3698935508728027,1.3698935508728027,0.6814972758293152,1.7900772094726562,0.8466413617134094,1.1105918884277344,0.683510959148407,0.683510959148407,0.8466413617134094,1.1105918884277344,1.1105918884277344,0.683510959148407,0.8466413617134094,3.0020430543512585e-16,2.910515069961548,-0.41956043243408203,1.1158260107040405,2.484307289123535,1.1091787815093994,1.7946890592575073,2.2250046730041504,-0.6896183490753174,0.41956043243408203,2.213900089263916,-0.6841338872909546,0.4238227307796478,2.2122719287872314,0.6867681741714478,1.5307745933532715,1.7894539833068848,-0.002634249161928892,0.25930261611938477,1.5330249071121216,1.9968361009689762e-16,0.6863834857940674,1.3698945045471191,0.26395049691200256,0.6863834857940674,1.3698945045471191,-0.26395049691200256,-1.7946890592575073,2.2250046730041504,0.6896183490753174,8.10551608792972e-16,2.910515069961548,0.41956043243408203,-1.1158260107040405,2.484307289123535,-1.1091787815093994,-1.5307745933532715,1.7894539833068848,0.002634249161928892,-0.41956043243408203,2.213900089263916,0.6841338872909546,-0.4238227307796478,2.2122719287872314,-0.6867681741714478,-0.6863834857940674,1.3698945045471191,0.26395049691200256,-0.25930261611938477,1.5330249071121216,-1.7317457581205142e-16,-0.6863834857940674,1.3698945045471191,-0.26395049691200256,-1.1091787815093994,1.1158260107040405,2.484307289123535,-1.1158260107040405,2.484307289123535,1.1091787815093994,-2.484307289123535,1.1091787815093994,1.1158260107040405,-1.3656312227249146,0.683125376701355,1.7927114963531494,-0.683125376701355,1.7927114963531494,1.3656312227249146,-1.7927114963531494,1.3656312227249146,0.683125376701355,-0.683510959148407,0.8466413617134094,1.1105918884277344,-0.8466413617134094,1.1105918884277344,0.683510959148407,-1.1105918884277344,0.683510959148407,0.8466413617134094,-0.6896183490753174,1.7946890592575073,2.2250046730041504,-0.41956043243408203,-6.004085844004721e-17,2.910515069961548,1.1091787815093994,1.1158260107040405,2.484307289123535,-0.002634249161928892,1.5307745933532715,1.7894539833068848,-0.6841338872909546,0.41956043243408203,2.213900089263916,0.6867681741714478,0.4238227307796478,2.2122719287872314,-0.26395049691200256,0.6863834857940674,1.3698945045471191,-2.5972446853694483e-16,0.25930261611938477,1.5330249071121216,0.26395049691200256,0.6863834857940674,1.3698945045471191,-1.1091787815093994,-1.1158260107040405,2.484307289123535,0.6896183490753174,-1.7946890592575073,2.2250046730041504,0.41956043243408203,-4.202860223152203e-16,2.910515069961548,-0.6867681741714478,-0.4238227307796478,2.2122719287872314,0.002634249161928892,-1.5307745933532715,1.7894539833068848,0.6841338872909546,-0.41956043243408203,2.213900089263916,-0.26395049691200256,-0.6863834857940674,1.3698945045471191,0.26395049691200256,-0.6863834857940674,1.3698945045471191,-4.272340218233105e-16,-0.25930261611938477,1.5330249071121216,1.1158260107040405,-2.484307289123535,1.1091787815093994,2.484307289123535,-1.1091787815093994,1.1158260107040405,1.1091787815093994,-1.1158260107040405,2.484307289123535,0.683125376701355,-1.7927114963531494,1.3656312227249146,1.7927114963531494,-1.3656312227249146,0.683125376701355,1.3656312227249146,-0.683125376701355,1.7927114963531494,0.8466413617134094,-1.1105918884277344,0.683510959148407,1.1105918884277344,-0.683510959148407,0.8466413617134094,0.683510959148407,-0.8466413617134094,1.1105918884277344,2.484307289123535,1.1091787815093994,1.1158260107040405,2.2250046730041504,-0.6896183490753174,1.7946890592575073,2.910515069961548,-0.41956043243408203,4.503064846224684e-16,2.2122719287872314,0.6867681741714478,0.4238227307796478,1.7894539833068848,-0.002634249161928892,1.5307745933532715,2.213900089263916,-0.6841338872909546,0.41956043243408203,1.3698945045471191,0.26395049691200256,0.6863834857940674,1.3698945045471191,-0.26395049691200256,0.6863834857940674,1.5330249071121216,-2.4016343376018884e-16,0.25930261611938477,2.910515069961548,0.41956043243408203,3.452349591913286e-16,2.484307289123535,-1.1091787815093994,-1.1158260107040405,2.2250046730041504,0.6896183490753174,-1.7946890592575073,2.213900089263916,0.6841338872909546,-0.41956043243408203,2.2122719287872314,-0.6867681741714478,-0.4238227307796478,1.7894539833068848,0.002634249161928892,-1.5307745933532715,1.5330249071121216,-7.204903542201257e-16,-0.25930261611938477,1.3698945045471191,-0.26395049691200256,-0.6863834857940674,1.3698945045471191,0.26395049691200256,-0.6863834857940674,2.484307289123535,1.1091787815093994,-1.1158260107040405,1.1091787815093994,1.1158260107040405,-2.484307289123535,1.1158260107040405,2.484307289123535,-1.1091787815093994,1.7927114963531494,1.3656312227249146,-0.683125376701355,1.3656312227249146,0.683125376701355,-1.7927114963531494,0.683125376701355,1.7927114963531494,-1.3656312227249146,1.1105918884277344,0.683510959148407,-0.8466413617134094,0.683510959148407,0.8466413617134094,-1.1105918884277344,0.8466413617134094,1.1105918884277344,-0.683510959148407,-2.484307289123535,-1.1091787815093994,-1.1158260107040405,-1.1091787815093994,-1.1158260107040405,-2.484307289123535,-1.1158260107040405,-2.484307289123535,-1.1091787815093994,-1.7927114963531494,-1.3656312227249146,-0.683125376701355,-1.3656312227249146,-0.683125376701355,-1.7927114963531494,-0.683125376701355,-1.7927114963531494,-1.3656312227249146,-1.1105918884277344,-0.683510959148407,-0.8466413617134094,-0.683510959148407,-0.8466413617134094,-1.1105918884277344,-0.8466413617134094,-1.1105918884277344,-0.683510959148407,-1.1158260107040405,-2.484307289123535,1.1091787815093994,-1.7946890592575073,-2.2250046730041504,-0.6896183490753174,-4.803268675203777e-16,-2.910515069961548,-0.41956043243408203,-0.4238227307796478,-2.2122719287872314,0.6867681741714478,-1.5307745933532715,-1.7894539833068848,-0.002634249161928892,-0.41956043243408203,-2.213900089263916,-0.6841338872909546,-0.6863834857940674,-1.3698945045471191,0.26395049691200256,-0.6863834857940674,-1.3698945045471191,-0.26395049691200256,-0.25930261611938477,-1.5330249071121216,-4.998879287669133e-16,1.7946890592575073,-2.2250046730041504,0.6896183490753174,-1.230837657577972e-15,-2.910515069961548,0.41956043243408203,1.1158260107040405,-2.484307289123535,-1.1091787815093994,1.5307745933532715,-1.7894539833068848,0.002634249161928892,0.41956043243408203,-2.213900089263916,0.6841338872909546,0.4238227307796478,-2.2122719287872314,-0.6867681741714478,0.6863834857940674,-1.3698945045471191,0.26395049691200256,0.25930261611938477,-1.5330249071121216,4.1333802280713006e-16,0.6863834857940674,-1.3698945045471191,-0.26395049691200256,2.2250046730041504,-0.6896183490753174,-1.7946890592575073,1.7946890592575073,-2.2250046730041504,-0.6896183490753174,0.6896183490753174,-1.7946890592575073,-2.2250046730041504,1.3698935508728027,-0.6814972758293152,-1.7900772094726562,1.7900772094726562,-1.3698935508728027,-0.6814972758293152,0.6814972758293152,-1.7900772094726562,-1.3698935508728027,1.1105918884277344,-0.683510959148407,-0.8466413617134094,0.8466413617134094,-1.1105918884277344,-0.683510959148407,0.683510959148407,-0.8466413617134094,-1.1105918884277344,-0.6896183490753174,-1.7946890592575073,-2.2250046730041504,-0.41956043243408203,4.803268675203777e-16,-2.910515069961548,1.1091787815093994,-1.1158260107040405,-2.484307289123535,-0.002634249161928892,-1.5307745933532715,-1.7894539833068848,-0.6841338872909546,-0.41956043243408203,-2.213900089263916,0.6867681741714478,-0.4238227307796478,-2.2122719287872314,-0.26395049691200256,-0.6863834857940674,-1.3698945045471191,-1.0052070195567313e-16,-0.25930261611938477,-1.5330249071121216,0.26395049691200256,-0.6863834857940674,-1.3698945045471191,0.41956043243408203,7.505107635878146e-17,-2.910515069961548,-1.1091787815093994,1.1158260107040405,-2.484307289123535,0.6896183490753174,1.7946890592575073,-2.2250046730041504,0.6841338872909546,0.41956043243408203,-2.213900089263916,-0.6867681741714478,0.4238227307796478,-2.2122719287872314,0.002634249161928892,1.5307745933532715,-1.7894539833068848,3.0715230494321607e-16,0.25930261611938477,-1.5330249071121216,-0.26395049691200256,0.6863834857940674,-1.3698945045471191,0.26395049691200256,0.6863834857940674,-1.3698945045471191,-0.6896183490753174,1.7946890592575073,-2.2250046730041504,-2.2250046730041504,0.6896183490753174,-1.7946890592575073,-1.7946890592575073,2.2250046730041504,-0.6896183490753174,-0.6814972758293152,1.7900772094726562,-1.3698935508728027,-1.3698935508728027,0.6814972758293152,-1.7900772094726562,-1.7900772094726562,1.3698935508728027,-0.6814972758293152,-0.683510959148407,0.8466413617134094,-1.1105918884277344,-1.1105918884277344,0.683510959148407,-0.8466413617134094,-0.8466413617134094,1.1105918884277344,-0.683510959148407,-2.910515069961548,-0.41956043243408203,-3.9026558647775177e-16,-2.484307289123535,1.1091787815093994,-1.1158260107040405,-2.2250046730041504,-0.6896183490753174,-1.7946890592575073,-2.213900089263916,-0.6841338872909546,-0.41956043243408203,-2.2122719287872314,0.6867681741714478,-0.4238227307796478,-1.7894539833068848,-0.002634249161928892,-1.5307745933532715,-1.5330249071121216,3.6024517711006287e-16,-0.25930261611938477,-1.3698945045471191,0.26395049691200256,-0.6863834857940674,-1.3698945045471191,-0.26395049691200256,-0.6863834857940674,-2.484307289123535,-1.1091787815093994,1.1158260107040405,-2.2250046730041504,0.6896183490753174,1.7946890592575073,-2.910515069961548,0.41956043243408203,-3.9026558647775177e-16,-2.2122719287872314,-0.6867681741714478,0.4238227307796478,-1.7894539833068848,0.002634249161928892,1.5307745933532715,-2.213900089263916,0.6841338872909546,0.41956043243408203,-1.3698945045471191,-0.26395049691200256,0.6863834857940674,-1.3698945045471191,0.26395049691200256,0.6863834857940674,-1.5330249071121216,1.0807354783906294e-15,0.25930261611938477,-1.7946890592575073,-2.2250046730041504,0.6896183490753174,-0.6896183490753174,-1.7946890592575073,2.2250046730041504,-2.2250046730041504,-0.6896183490753174,1.7946890592575073,-1.7900772094726562,-1.3698935508728027,0.6814972758293152,-0.6814972758293152,-1.7900772094726562,1.3698935508728027,-1.3698935508728027,-0.6814972758293152,1.7900772094726562,-0.8466413617134094,-1.1105918884277344,0.683510959148407,-0.683510959148407,-0.8466413617134094,1.1105918884277344,-1.1105918884277344,-0.683510959148407,0.8466413617134094,0.6841326951980591,-1.106950044631958,1.791082739830017,1.791082739830017,-0.6841326951980591,1.106950044631958,1.106950044631958,-1.791082739830017,0.6841326951980591,-0.6841326951980591,-1.106950044631958,1.791082739830017,0,0,2.213900089263916,-1.791082739830017,-0.6841326951980591,1.106950044631958,-1.106950044631958,-1.791082739830017,0.6841326951980591,-2.213900089263916,0,0,-1.791082739830017,0.6841326951980591,1.106950044631958,-1.791082739830017,0.6841326951980591,-1.106950044631958,-1.791082739830017,-0.6841326951980591,-1.106950044631958,-0.6841326951980591,1.106950044631958,-1.791082739830017,-1.106950044631958,1.791082739830017,-0.6841326951980591,0.6841326951980591,1.106950044631958,-1.791082739830017,0,0,-2.213900089263916,1.106950044631958,1.791082739830017,-0.6841326951980591,1.791082739830017,0.6841326951980591,-1.106950044631958,0,2.213900089263916,0,1.106950044631958,1.791082739830017,0.6841326951980591,-1.106950044631958,1.791082739830017,0.6841326951980591,-0.6841326951980591,1.106950044631958,1.791082739830017,0.6841326951980591,1.106950044631958,1.791082739830017,1.791082739830017,0.6841326951980591,1.106950044631958,2.213900089263916,0,0,1.791082739830017,-0.6841326951980591,-1.106950044631958,0.6841326951980591,-1.106950044631958,-1.791082739830017,1.106950044631958,-1.791082739830017,-0.6841326951980591,-0.6841326951980591,-1.106950044631958,-1.791082739830017,-1.106950044631958,-1.791082739830017,-0.6841326951980591,0,-2.213900089263916,0]
	);
	var colorArray = new Float32Array(//don't worry, the numbers are down there, just in white for some stupid reason
	[0.58203125,0.35546875,0.67578125,0.58203125,0.35546875,0.67578125,0.58203125,0.35546875,0.67578125,0.921875,0.44140625,0.1484375,0.921875,0.44140625,0.1484375,0.921875,0.44140625,0.1484375,0,0.4296875,0.7734375,0,0.4296875,0.7734375,0,0.4296875,0.7734375,0.58203125,0.35546875,0.67578125,0.58203125,0.35546875,0.67578125,0.58203125,0.35546875,0.67578125,0.921875,0.44140625,0.1484375,0.921875,0.44140625,0.1484375,0.921875,0.44140625,0.1484375,0,0.4296875,0.7734375,0,0.4296875,0.7734375,0,0.4296875,0.7734375,0.58203125,0.35546875,0.67578125,0.58203125,0.35546875,0.67578125,0.58203125,0.35546875,0.67578125,0.921875,0.44140625,0.1484375,0.921875,0.44140625,0.1484375,0.921875,0.44140625,0.1484375,0,0.4296875,0.7734375,0,0.4296875,0.7734375,0,0.4296875,0.7734375,0.58203125,0.35546875,0.67578125,0.58203125,0.35546875,0.67578125,0.58203125,0.35546875,0.67578125,0.921875,0.44140625,0.1484375,0.921875,0.44140625,0.1484375,0.921875,0.44140625,0.1484375,0,0.4296875,0.7734375,0,0.4296875,0.7734375,0,0.4296875,0.7734375,0.58203125,0.35546875,0.67578125,0.58203125,0.35546875,0.67578125,0.58203125,0.35546875,0.67578125,0.921875,0.44140625,0.1484375,0.921875,0.44140625,0.1484375,0.921875,0.44140625,0.1484375,0,0.4296875,0.7734375,0,0.4296875,0.7734375,0,0.4296875,0.7734375,0.58203125,0.35546875,0.67578125,0.58203125,0.35546875,0.67578125,0.58203125,0.35546875,0.67578125,0.921875,0.44140625,0.1484375,0.921875,0.44140625,0.1484375,0.921875,0.44140625,0.1484375,0,0.4296875,0.7734375,0,0.4296875,0.7734375,0,0.4296875,0.7734375,0.58203125,0.35546875,0.67578125,0.58203125,0.35546875,0.67578125,0.58203125,0.35546875,0.67578125,0.921875,0.44140625,0.1484375,0.921875,0.44140625,0.1484375,0.921875,0.44140625,0.1484375,0,0.4296875,0.7734375,0,0.4296875,0.7734375,0,0.4296875,0.7734375,0.58203125,0.35546875,0.67578125,0.58203125,0.35546875,0.67578125,0.58203125,0.35546875,0.67578125,0.921875,0.44140625,0.1484375,0.921875,0.44140625,0.1484375,0.921875,0.44140625,0.1484375,0,0.4296875,0.7734375,0,0.4296875,0.7734375,0,0.4296875,0.7734375,0.58203125,0.35546875,0.67578125,0.58203125,0.35546875,0.67578125,0.58203125,0.35546875,0.67578125,0.921875,0.44140625,0.1484375,0.921875,0.44140625,0.1484375,0.921875,0.44140625,0.1484375,0,0.4296875,0.7734375,0,0.4296875,0.7734375,0,0.4296875,0.7734375,0.58203125,0.35546875,0.67578125,0.58203125,0.35546875,0.67578125,0.58203125,0.35546875,0.67578125,0.921875,0.44140625,0.1484375,0.921875,0.44140625,0.1484375,0.921875,0.44140625,0.1484375,0,0.4296875,0.7734375,0,0.4296875,0.7734375,0,0.4296875,0.7734375,0.58203125,0.35546875,0.67578125,0.58203125,0.35546875,0.67578125,0.58203125,0.35546875,0.67578125,0.921875,0.44140625,0.1484375,0.921875,0.44140625,0.1484375,0.921875,0.44140625,0.1484375,0,0.4296875,0.7734375,0,0.4296875,0.7734375,0,0.4296875,0.7734375,0.58203125,0.35546875,0.67578125,0.58203125,0.35546875,0.67578125,0.58203125,0.35546875,0.67578125,0.921875,0.44140625,0.1484375,0.921875,0.44140625,0.1484375,0.921875,0.44140625,0.1484375,0,0.4296875,0.7734375,0,0.4296875,0.7734375,0,0.4296875,0.7734375,0.58203125,0.35546875,0.67578125,0.58203125,0.35546875,0.67578125,0.58203125,0.35546875,0.67578125,0.921875,0.44140625,0.1484375,0.921875,0.44140625,0.1484375,0.921875,0.44140625,0.1484375,0,0.4296875,0.7734375,0,0.4296875,0.7734375,0,0.4296875,0.7734375,0.58203125,0.35546875,0.67578125,0.58203125,0.35546875,0.67578125,0.58203125,0.35546875,0.67578125,0.921875,0.44140625,0.1484375,0.921875,0.44140625,0.1484375,0.921875,0.44140625,0.1484375,0,0.4296875,0.7734375,0,0.4296875,0.7734375,0,0.4296875,0.7734375,0.58203125,0.35546875,0.67578125,0.58203125,0.35546875,0.67578125,0.58203125,0.35546875,0.67578125,0.921875,0.44140625,0.1484375,0.921875,0.44140625,0.1484375,0.921875,0.44140625,0.1484375,0,0.4296875,0.7734375,0,0.4296875,0.7734375,0,0.4296875,0.7734375,0.58203125,0.35546875,0.67578125,0.58203125,0.35546875,0.67578125,0.58203125,0.35546875,0.67578125,0.921875,0.44140625,0.1484375,0.921875,0.44140625,0.1484375,0.921875,0.44140625,0.1484375,0,0.4296875,0.7734375,0,0.4296875,0.7734375,0,0.4296875,0.7734375,0.58203125,0.35546875,0.67578125,0.58203125,0.35546875,0.67578125,0.58203125,0.35546875,0.67578125,0.921875,0.44140625,0.1484375,0.921875,0.44140625,0.1484375,0.921875,0.44140625,0.1484375,0,0.4296875,0.7734375,0,0.4296875,0.7734375,0,0.4296875,0.7734375,0.58203125,0.35546875,0.67578125,0.58203125,0.35546875,0.67578125,0.58203125,0.35546875,0.67578125,0.921875,0.44140625,0.1484375,0.921875,0.44140625,0.1484375,0.921875,0.44140625,0.1484375,0,0.4296875,0.7734375,0,0.4296875,0.7734375,0,0.4296875,0.7734375,0.58203125,0.35546875,0.67578125,0.58203125,0.35546875,0.67578125,0.58203125,0.35546875,0.67578125,0.921875,0.44140625,0.1484375,0.921875,0.44140625,0.1484375,0.921875,0.44140625,0.1484375,0,0.4296875,0.7734375,0,0.4296875,0.7734375,0,0.4296875,0.7734375,0.58203125,0.35546875,0.67578125,0.58203125,0.35546875,0.67578125,0.58203125,0.35546875,0.67578125,0.921875,0.44140625,0.1484375,0.921875,0.44140625,0.1484375,0.921875,0.44140625,0.1484375,0,0.4296875,0.7734375,0,0.4296875,0.7734375,0,0.4296875,0.7734375,0.98828125,0.90625,0.14453125,0.98828125,0.90625,0.14453125,0.98828125,0.90625,0.14453125,0.98828125,0.90625,0.14453125,0.98828125,0.90625,0.14453125,0.98828125,0.90625,0.14453125,0.98828125,0.90625,0.14453125,0.98828125,0.90625,0.14453125,0.98828125,0.90625,0.14453125,0.98828125,0.90625,0.14453125,0.98828125,0.90625,0.14453125,0.98828125,0.90625,0.14453125,0.98828125,0.90625,0.14453125,0.98828125,0.90625,0.14453125,0.98828125,0.90625,0.14453125,0.98828125,0.90625,0.14453125,0.98828125,0.90625,0.14453125,0.98828125,0.90625,0.14453125,0.98828125,0.90625,0.14453125,0.98828125,0.90625,0.14453125,0.98828125,0.90625,0.14453125,0.98828125,0.90625,0.14453125,0.98828125,0.90625,0.14453125,0.98828125,0.90625,0.14453125,0.98828125,0.90625,0.14453125,0.98828125,0.90625,0.14453125,0.98828125,0.90625,0.14453125,0.98828125,0.90625,0.14453125,0.98828125,0.90625,0.14453125,0.98828125,0.90625,0.14453125]
	);
	QC_atoms.geometry.addAttribute( 'position', new THREE.BufferAttribute(positionArray, 3 ) );
	QC_atoms.geometry.addAttribute( 'color', new THREE.BufferAttribute(colorArray, 3 ) );
	
	return QC_atoms;
}

function insert_quasiatom(ourposition,lowest_unused_index, QC_atoms){
	var multfactor = 0.0169;
	QC_atoms.geometry.attributes.position.setXYZ(lowest_unused_index, ourposition.x * multfactor, ourposition.y * multfactor, ourposition.z * multfactor );
	
	if(	QC_atoms.geometry.attributes.color.array[lowest_unused_index*3+0]===0 &&
		QC_atoms.geometry.attributes.color.array[lowest_unused_index*3+1]===0 &&
		QC_atoms.geometry.attributes.color.array[lowest_unused_index*3+2]===0
	  ){
		var wavelength = ourposition.lengthSq();
		wavelength /= 25000; //apparently as large as we get
		wavelength *= (781-380);
		wavelength += 380;
		if((wavelength >= 380) && (wavelength<440)){
	        QC_atoms.geometry.attributes.color.setXYZ(lowest_unused_index,	-(wavelength - 440) / (440 - 380),	0,	1);
	    }else if((wavelength >= 440) && (wavelength<490)){
	        QC_atoms.geometry.attributes.color.setXYZ(lowest_unused_index,	0,	(wavelength - 440) / (490 - 440),	1);
	    }else if((wavelength >= 490) && (wavelength<510)){
	        QC_atoms.geometry.attributes.color.setXYZ(lowest_unused_index,	0,	1,	-(wavelength - 510) / (510 - 490));
	    }else if((wavelength >= 510) && (wavelength<580)){
	        QC_atoms.geometry.attributes.color.setXYZ(lowest_unused_index,	(wavelength - 510) / (580 - 510),	1,	0);
	    }else if((wavelength >= 580) && (wavelength<645)){
	        QC_atoms.geometry.attributes.color.setXYZ(lowest_unused_index,	1,	-(wavelength - 645) / (645 - 580),	0);
	    }else if((wavelength >= 645) && (wavelength<781)){
	    	QC_atoms.geometry.attributes.color.setXYZ(lowest_unused_index,	1,	0,	0);
	    }else{
	    	QC_atoms.geometry.attributes.color.setXYZ(lowest_unused_index,	0,	0,	0);
	    };
	}
}

function dist_along_tria_edge(triaconta_minorvertex_radius,desired_r){
	
//	desired_r = triaconta_majorvertex_radius; //we want to make it so we can see them on the tria vertices and then remove this
//	var dodecaedgelen = triaconta_minorvertex_radius / (Math.sqrt(3)/4*(1+Math.sqrt(5)));
//	var tria_edgelen = 0.5 * Math.sqrt(1+PHI*PHI) * dodecaedgelen;
//	
//	console.log(Math.acos(get_cos_rule(triaconta_majorvertex_radius, tria_edgelen,triaconta_minorvertex_radius)));
	
	var ourangle = 1.3820857960113346;
	var completed_square_factor = desired_r * desired_r - Square(triaconta_minorvertex_radius * Math.sin(ourangle));
	var sol1 = triaconta_minorvertex_radius * Math.cos(ourangle) + Math.sqrt(completed_square_factor);
	var sol2 = triaconta_minorvertex_radius * Math.cos(ourangle) - Math.sqrt(completed_square_factor);
	if(sol2 > 0 && sol1 > 0){
		console.error("two positive solutions?"); //bastard. So do it by sight, it needs to line up with lb.
//		return sol2;
	}
	if(sol1 > 0)
		return sol1;
	else
		console.error("no positive solution?");
}

