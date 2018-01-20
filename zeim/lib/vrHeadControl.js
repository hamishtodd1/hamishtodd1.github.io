/**
 * @author dmarcos / https://github.com/dmarcos
 * @author mrdoob / http://mrdoob.com
 */

THREE.VRControls = function ( object, onError ) {

	var scope = this;
	
	var ourFrameData = new VRFrameData();

	var vrInputs = [];
	this.vrInputs = vrInputs;

	function filterInvalidDevices( devices ) {

		// Exclude Cardboard position sensor if Oculus exists.

		var oculusDevices = devices.filter( function ( device ) {

			if(device.displayName)
				return device.displayName.toLowerCase().indexOf( 'oculus' ) !== - 1;
			if(device.deviceName)
				return device.deviceName.toLowerCase().indexOf( 'oculus' ) !== - 1;

		} );

		if ( oculusDevices.length >= 1 ) {

			return devices.filter( function ( device ) {

				if(device.displayName)
					return device.displayName.toLowerCase().indexOf( 'oculus' ) !== - 1;
				if(device.deviceName)
					return device.deviceName.toLowerCase().indexOf( 'oculus' ) !== - 1;

			} );

		} else {

			return devices;

		}

	}

	function gotVRDevices( devices ) {

		devices = filterInvalidDevices( devices );

		for ( var i = 0; i < devices.length; i ++ ) {

			if ( ( typeof PositionSensorVRDevice !== 'undefined' && devices[ i ] instanceof PositionSensorVRDevice ) 
				|| ( typeof VRDisplay !== 'undefined' && devices[ i ] instanceof VRDisplay ) )
			{

				vrInputs.push( devices[ i ] );

//				console.log(typeof renderer)
				

			}

		}

		if ( onError ) onError( 'HMD not available' );

	}

	if ( navigator.getVRDevices ) {

		navigator.getVRDevices().then( gotVRDevices );

	}
	else if ( navigator.getVRDisplays ) {

		navigator.getVRDisplays().then( gotVRDevices );

	}
	else console.error("hmd getter not present in navigator")

	// the Rift SDK returns the position in meters
	// this scale factor allows the user to define how meters
	// are converted to scene units.

	this.scale = 1;

	this.update = function () {

		for ( var i = 0; i < vrInputs.length; i ++ ) {

			if( typeof vrInputs[ i ].isPresenting !== 'undefined' )
			{				
				if(vrInputs[ i ].isPresenting)
				{
					vrInputs[i].getFrameData(ourFrameData);
					object.quaternion.fromArray(ourFrameData.pose.orientation);
					object.position.fromArray(ourFrameData.pose.position);
				}
			}
			else
			{
				var state = vrInputs[ i ].getState();

				if ( state.orientation !== null ) {

					object.quaternion.copy( state.orientation );

				}

				if ( state.position !== null ) {

					object.position.copy( state.position ).multiplyScalar( scope.scale );

				}
			}

		}

	};

	this.resetSensor = function () {

		for ( var i = 0; i < vrInputs.length; i ++ ) {

			var vrInput = vrInputs[ i ];

			if ( vrInput.resetSensor !== undefined ) {

				vrInput.resetSensor();

			} else if ( vrInput.zeroSensor !== undefined ) {

				vrInput.zeroSensor();

			}

		}

	};

	this.zeroSensor = function () {

		console.warn( 'THREE.VRControls: .zeroSensor() is now .resetSensor().' );
		this.resetSensor();

	};

	this.dispose = function () {

		vrInputs = [];

	};

};