/* Points of rotational, arrows of translational, lines of mirror
 * Your idea was diamonds. No points of > 2 degrees of rotational symmetry is the problem
 */

initSymmetryDemonstration = function()
{
	this.mode = "nothing";

	var symbolMaterial = new THREE.MeshBasicMaterial({ transparent:true });
	
	this.translationalSymbol = new THREE.Mesh( new THREE.PlaneGeometry(1, 1), symbolMaterial );
	this.translationalSymbol.rotation.z = TAU/4;
	var translationLength = 0.19;//tweak further
	this.translationalSymbol.scale.setScalar(translationLength);
	this.translationalSymbol.position.y = translationLength/2;
	this.translationalSymbol.position.z = 0.001;
	loadpic("http://hamishtodd1.github.io/RILecture/Data/symmetryDemonstration/translationalSymbol.png", this.translationalSymbol.material);
	
	this.rotationalSymbol = new THREE.Mesh( new THREE.PlaneGeometry(1, 1), symbolMaterial );
	loadpic("http://hamishtodd1.github.io/RILecture/Data/symmetryDemonstration/threefoldRotational.png", this.rotationalSymbol.material);
	this.rotationalSymbol.position.z = 0.001;
	this.rotationalSymbol.scale.setScalar(translationLength);
	
	this.reflectionalSymbol = new THREE.Mesh( new THREE.PlaneGeometry(1, 1), symbolMaterial );
	loadpic("http://hamishtodd1.github.io/RILecture/Data/symmetryDemonstration/reflectionalSymbol.png", this.reflectionalSymbol.material);
	this.reflectionalSymbol.position.z = 0.001;

	this.morphablePattern = new THREE.Mesh( new THREE.PlaneGeometry(1, 1), new THREE.MeshBasicMaterial({transparent:true, opacity:1, side:THREE.DoubleSide}) );
	loadpic("http://hamishtodd1.github.io/RILecture/Data/symmetryDemonstration/morphablePattern.png", this.morphablePattern.material);
	this.add( this.morphablePattern );
	
	this.underneathPattern = this.morphablePattern.clone();
	this.underneathPattern.position.z = -0.0001;
	this.underneathPattern.visible = false;
	this.add( this.underneathPattern );
	
	this.controllerWeAreGrabbedBy = "not grabbed";
	this.positionWhereMeshWasGrabbed = new THREE.Vector3(0,0,0);
	
//	this.update = function()
//	{
//		if( this.controllerWeAreGrabbedBy !== "not grabbed" )
//		{
//			if( !this.controllerWeAreGrabbedBy.Gripping )
//				this.controllerWeAreGrabbedBy = "not grabbed";
//			else
//			{
//				var destinationForPWMWG = controllerWeAreGrabbedBy.position.clone();
//				destinationForPWMWG.z = 0;
//				
//				if(this.mode === "translation" )
//				{
//					this.morphablePattern.position.y = destinationForPWMWG.y - this.positionWhereMeshWasGrabbed.y;
//					if( this.position.y > this.translationSymbol.scale.y ) //YO THE SYMBOL NEEDS TO BE A 1 LONG MESH THAT IS SCALED
//						this.position.y = this.translationSymbol.scale.y;
//					if( this.position.y < 0 )
//						this.position.y = 0;
//				}	
//				else if(this.mode === "rotation" )
//				{
//					this.morphablePattern.rotation.z = this.positionWhereMeshWasGrabbed.angleTo( destinationForPWMWG ); //minus?
//					if( this.rotation.z > TAU)
//						this.rotation.z = TAU;
////					if( this.rotation.z < 0)
////						this.rotation.z = 0;
//				}
//				else if( this.mode === "reflection" )
//				{
//					this.morphablePattern.scale.x = destinationForPWMWG.x / this.positionWhereMeshWasGrabbed.x;
//					if( this.scale.x >  1 )
//						this.scale.x =  1;
//					if( this.scale.x < -1 )
//						this.scale.x = -1;
//				}
//			}
//		}
//		else
//		{
//			for(var i = 0; i < 2; i++)
//			{
//				if( Controllers[i].position.distanceTo( this.morphablePattern.geometry.boundingSphere.center ) < this.morphablePattern.geometry.boundingSphere.radius )
//				{
//					this.controllerWeAreGrabbedBy = Controllers[i];
//					this.positionWhereMeshWasGrabbed = Controllers[i].position.clone();
//					this.morphablePattern.updateMatrixWorld();
//					this.morphablePattern.worldToLocal(this.positionWhereMeshWasGrabbed );
//					this.positionWhereMeshWasGrabbed.z = 0;
//				}
//			}
//		}
//	}
	
	this.changeMode = function(newMode)
	{
		this.mode = newMode;
		if(this.mode === "translation" )
		{
			if(this.children.length > 2)
				this.remove(this.children[2]);
			this.add(this.translationalSymbol);
		}
		if(this.mode === "rotation" )
		{
			if(this.children.length > 2)
				this.remove(this.children[2]);
			this.add(this.rotationalSymbol);
		}
		if(this.mode === "reflection" )
		{
			if(this.children.length > 2)
				this.remove(this.children[2]);
			this.add(this.reflectionalSymbol);
		}
		if(this.mode === "nothing" )
		{
			this.remove(this.children[2]);
		}
//		this.morphablePattern.position.set(0,0,0);
//		this.morphablePattern.scale.set(1,1,1);
//		this.morphablePattern.rotation.set(0,0,0);
	}
	this.changeMode("reflection")
	
	Protein.add(this)
}

function loadpic(url, materialToMapTo) {
	var texture_loader = new THREE.TextureLoader();
	texture_loader.crossOrigin = true;
	texture_loader.load(
			url,
		function(texture) {			
			materialToMapTo.map = texture;
			materialToMapTo.needsUpdate = true;
		},
		function ( xhr ) {}, function ( xhr ) {
			console.log( 'texture loading error' );
		}
	);
}