/* Points of rotational, arrows of translational, lines of mirror
 * Your idea was diamonds. No points of > 2 degrees of rotational symmetry is the problem
 */

function initSymmetryDemonstration(presentation, transferredObjectData )
{
	var s = presentation.createNewHoldable("symmetryDemonstration");
	
	s.mode = "nothing";
	
	s.translationalSymbol = new THREE.Mesh( new THREE.PlaneGeometry(1, 1), new THREE.MeshBasicMaterial({ transparent:true }) );
	s.translationalSymbol.rotation.z = TAU/4;
	var translationLength = 0.19;//tweak further
	s.translationalSymbol.scale.setScalar(translationLength/2);
	s.translationalSymbol.position.y = translationLength/4;
	s.translationalSymbol.position.z = 0.001;
	loadpic("http://hamishtodd1.github.io/RILecture/Data/symmetryDemonstration/translationalSymbol.png", s.translationalSymbol.material);
	
	s.rotationalSymbol = new THREE.Mesh( new THREE.PlaneGeometry(0.5,0.5), new THREE.MeshBasicMaterial({ transparent:true }) );
	loadpic("http://hamishtodd1.github.io/RILecture/Data/symmetryDemonstration/threefoldRotational.png", s.rotationalSymbol.material);
	s.rotationalSymbol.position.z = 0.001;
	s.rotationalSymbol.scale.setScalar(translationLength);
	
	s.reflectionalSymbol = new THREE.Mesh( new THREE.PlaneGeometry(0.5,0.5), new THREE.MeshBasicMaterial({ transparent:true }) );
	loadpic("http://hamishtodd1.github.io/RILecture/Data/symmetryDemonstration/reflectionalSymbol.png", s.reflectionalSymbol.material);
	s.reflectionalSymbol.position.x += 0.001;
	s.reflectionalSymbol.position.z = 0.001;

	s.morphablePattern = new THREE.Mesh( new THREE.PlaneGeometry(0.5,0.5), new THREE.MeshBasicMaterial({transparent:true, opacity:0.5, side:THREE.DoubleSide}) );
	loadpic("http://hamishtodd1.github.io/RILecture/Data/symmetryDemonstration/morphablePattern.png", s.morphablePattern.material);
	s.add( s.morphablePattern );
	
	s.underneathPattern = new THREE.Mesh( new THREE.PlaneGeometry(0.5,0.5), new THREE.MeshBasicMaterial({side:THREE.DoubleSide}) );
	loadpic("http://hamishtodd1.github.io/RILecture/Data/symmetryDemonstration/morphablePattern.png", s.underneathPattern.material);
	s.underneathPattern.position.z = -0.0001;
	s.add( s.underneathPattern );
	
	s.positionWhereMeshWasGrabbed = new THREE.Vector3(0,0,0);
	
	s.rotateable = false;
	s.movable = false;
	
	s.grabbedPreviously = false;
	
	s.update = function()
	{
		if( s.controllerWeAreGrabbedBy === null )
			s.grabbedPreviously = false;
		else
		{
			if( !s.grabbedPreviously )
			{
				s.grabbedPreviously = true;
				
				s.positionWhereMeshWasGrabbed.copy( s.controllerWeAreGrabbedBy.position );
				s.morphablePattern.updateMatrixWorld();
				s.morphablePattern.worldToLocal(s.positionWhereMeshWasGrabbed );
				s.positionWhereMeshWasGrabbed.z = 0;
			}
			
			var destinationForPWMWG = s.controllerWeAreGrabbedBy.position.clone();
			destinationForPWMWG.z = 0;
			
			if(s.mode === "translation" )
			{
				s.morphablePattern.position.y = destinationForPWMWG.y - s.positionWhereMeshWasGrabbed.y;
				if( s.morphablePattern.position.y > s.translationalSymbol.scale.y ) //YO THE SYMBOL NEEDS TO BE A 1 LONG MESH THAT IS SCALED
					s.morphablePattern.position.y = s.translationalSymbol.scale.y;
				if( s.morphablePattern.position.y < 0 )
					s.morphablePattern.position.y = 0;
			}	
			else if(s.mode === "rotation" )
			{
				var crossProd = s.positionWhereMeshWasGrabbed.clone().cross( destinationForPWMWG );
				if( crossProd.z < 0 )
				{
					s.morphablePattern.rotation.z = -s.positionWhereMeshWasGrabbed.angleTo( destinationForPWMWG ); //minus?
					if( s.morphablePattern.rotation.z < -TAU / 3 )
						s.morphablePattern.rotation.z = -TAU / 3;
//					if( s.rotation.z < 0)
//						s.rotation.z = 0;
				}
			}
			//TODO a second rotation?
			else if( s.mode === "reflection" )
			{
				s.morphablePattern.scale.x = destinationForPWMWG.x / s.positionWhereMeshWasGrabbed.x;
				if( s.morphablePattern.scale.x >  1 )
					s.morphablePattern.scale.x =  1;
				if( s.morphablePattern.scale.x < -1 )
					s.morphablePattern.scale.x = -1;
			}
		}
	}
	
	s.reset = function()
	{
		s.morphablePattern.position.set( 0,0,0 );
		s.morphablePattern.rotation.set( 0,0,0 );
		s.morphablePattern.scale.set( 1,1,1 );
	}
	
	s.changeMode = function(newMode)
	{
		s.mode = newMode;
		if(s.mode === "translation" )
		{
			if(s.children.length > 2)
				s.remove(s.children[2]);
			s.add(s.translationalSymbol);
		}
		if(s.mode === "rotation" )
		{
			if(s.children.length > 2)
				s.remove(s.children[2]);
			s.add(s.rotationalSymbol);
		}
		if(s.mode === "reflection" )
		{
			if(s.children.length > 2)
				s.remove(s.children[2]);
			s.add(s.reflectionalSymbol);
		}
		if(s.mode === "nothing" )
		{
			s.remove(s.children[2]);
		}
//		s.morphablePattern.position.set(0,0,0);
//		s.morphablePattern.scale.set(1,1,1);
//		s.morphablePattern.rotation.set(0,0,0);
	}
	s.changeMode("rotation");
	
	transferredObjectData.thingsWithCopy.mpPosition = s.morphablePattern.position;
	transferredObjectData.thingsWithCopy.mpRotation = s.morphablePattern.rotation;
	transferredObjectData.thingsWithCopy.mpScale = s.morphablePattern.scale;
}

