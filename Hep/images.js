images = Array();
showing_image = new THREE.Mesh( new THREE.CubeGeometry(2.5,2.5, 0), new THREE.MeshBasicMaterial( {} ) );
showing_image.position.z = INITIAL_CAMERA_POSITION.z * 2;
background_image = new THREE.Mesh( new THREE.CubeGeometry(5,5, 0), new THREE.MeshBasicMaterial( {} ) );
background_image.position.z = INITIAL_CAMERA_POSITION.z * 2 + 0.01;

var texture_loader = new THREE.TextureLoader();

var image_urls = Array();
image_urls.push( "http://hamishtodd1.github.io/BrowserProsenter/Data/hepatitis pics/Hepatitis victim.png" );
image_urls.push( "http://hamishtodd1.github.io/BrowserProsenter/Data/hepatitis pics/Murrays.png" );
image_urls.push( "http://hamishtodd1.github.io/BrowserProsenter/Data/hepatitis pics/vaccine administered.jpg" );
image_urls.push( "http://hamishtodd1.github.io/BrowserProsenter/Data/hepatitis pics/yeast.png" );

function set_up_pictures()
{
	var image_selector_size = 0.09;
	
	for(var i = 0; i < image_urls.length; i++ )
	{
		images[i] = new THREE.Mesh( new THREE.CubeGeometry(image_selector_size,image_selector_size, 0),
			new THREE.MeshBasicMaterial( {} ) );
		
		images[i].position.z = INITIAL_CAMERA_POSITION.z * 2;
		images[i].position.applyAxisAngle( Central_Y_axis, TAU / image_urls.length * i );
		images[i].lookAt(new THREE.Vector3(0,0,0));
		
		load_picture(i);
	}
}

function load_picture(index)
{
	texture_loader.load(
		image_urls[index],
		function(texture) {
			console.log("texture loaded")
			images[ index ].material.map = texture;
			
			Scene.add(images[ index ]);
		},
		function ( xhr ) {}, function ( xhr ) {
			console.log( 'texture loading error, switch to using the other code in this function' );
		}
	);
}

function update_pictures(Users)
{
	for(var i = 0; i < images.length; i++)
	{
		for( var j = 0; j < Users.length; j++ )
		{
			if(Users[j].Controller.position.distanceTo( images[i].position ) < 0.3 )
			{
				images[i].material.color.r = 0;
				images[i].material.needsUpdate = true;
				
				if( Users[j].Gripping && !Users[j].Gripping_previously)
				{
					if(images[i].scale.x < 2)
						images[i].scale.set(16,16,16);
					else
						images[i].scale.set(1,1,1);
				}
			}
			else
			{
				images[i].material.color.r = 1;
				images[i].material.needsUpdate = true;
			}
		}
	}
}