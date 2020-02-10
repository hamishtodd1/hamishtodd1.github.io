//this is not doodling
//possibly should be able to hotload
//definitely want to doodle with process
//Heh, the input output sandbox is your editor

function Levels()
{
	let arr = [
		{
			singularGoal:
				new Float32Array([0.,1.,1.,0.,0.,0.,0.,0.]),
			options: [
				new Float32Array([0.,0.,1.,0.,0.,0.,0.,0.]),
				new Float32Array([0.,1.,0.,0.,0.,0.,0.,0.]),
				new Float32Array([1.,0.,0.,0.,0.,0.,0.,0.]),
			],
			operators: [geometricSum,geometricProduct]
		},
		{
			inputs:[ //"0"
				new Float32Array([0.,1.,0.,0.,0.,0.,0.,0.]),
				new Float32Array([0.,0.,1.,0.,0.,0.,0.,0.]),
			],
			options: [
				new Float32Array([2.,0.,0.,0.,0.,0.,0.,0.]), //"1"
				new Float32Array([3.,0.,0.,0.,0.,0.,0.,0.]), //"2"
			],
			steps:[
				//don't worry about them being deleted
				[geometricSum,0,1], //result is "3"
				[geometricProduct,2,3],
			],
			operators: [geometricSum,geometricProduct,geometricProduct]
		},
		{
			singularGoal: 
				new Float32Array([2.,0.,0.,0.,0.,0.,0.,0.]),
			options: [
				new Float32Array([1.,0.,0.,0.,0.,0.,0.,0.]),
				new Float32Array([1.,0.,0.,0.,0.,0.,0.,0.]),
			],
			operators: [geometricSum,geometricSum,geometricProduct]
		},
		{
			singularGoal:
				new Float32Array([6.,0.,0.,0.,0.,0.,0.,0.]),
			options: [
				new Float32Array([3.,0.,0.,0.,0.,0.,0.,0.]),
				new Float32Array([2.,0.,0.,0.,0.,0.,0.,0.]),
			],
			operators: [geometricSum,geometricProduct]
		},
		{
			singularGoal:
				new Float32Array([0.,2.,0.,0.,0.,0.,0.,0.]),
			options: [
				new Float32Array([0.,1.,0.,0.,0.,0.,0.,0.]),
				new Float32Array([0.,1.,0.,0.,0.,0.,0.,0.]),
			],
			operators: [geometricSum,geometricProduct]
		},
		{
			singularGoal:
				new Float32Array([0.,0.,0.,0.,1.,0.,0.,0.]),
			options: [
				new Float32Array([0.,0.,1.,0.,0.,0.,0.,0.]),
				new Float32Array([0.,1.,0.,0.,0.,0.,0.,0.]),
			],
			operators: [geometricSum,geometricProduct]
		}
	]
	/*
		,
		{
			singularGoal:
				new Float32Array([0.,0.,0.,0.,0.,0.,0.,0.]),
			options: [
				new Float32Array([0.,0.,0.,0.,0.,0.,0.,0.]),
				new Float32Array([0.,0.,0.,0.,0.,0.,0.,0.]),
			],
			operators: [geometricSum,geometricProduct]
		}
	*/

	let browserIsChrome = false;
	for (i = 0; i < navigator.plugins.length; i++)
	{
		if (navigator.plugins[i].name == 'Chrome PDF Viewer')
		{
			browserIsChrome = true
			break
		}
	}
	if(!browserIsChrome)
		return arr

	initVideo()

	let videoLevels = [{
		videoDetails: {
			filename: "hoberman",
			startTime: .1,
			endTime: 7.7,
			markerTimes: [3.4,7.2],
		},
		inputs:[ //"0"
			new Float32Array([1.,0.,0.,0.,0.,0.,0.,0.]),
			new Float32Array([3.,0.,0.,0.,0.,0.,0.,0.]),
		],
		options: [
			new Float32Array([0.,1.,0.,0.,0.,0.,0.,0.]),
			new Float32Array([0.,0.,1.,0.,0.,0.,0.,0.]),
		],
		operators: [geometricSum,geometricProduct,geometricProduct]
	}]
	arr[1] = videoLevels[0]
	/*
		{
			filename: "dzhanibekov",
			startTime: 0.,
			endTime: 8.,
			markerTimes: [4.,5.5,7.],
		},
		{
			filename: "segerman",
			startTime: 0.,
			endTime: Infinity,
			markerTimes: [3.4,7.2],
		},
		{
			filename: "hoberman",
			startTime: .1,
			endTime: 7.7,
			markerTimes: [3.4,7.2],
		},
	*/
	for(let j = 0; j < videoLevels.length; j++)
	{
		let d = videoLevels[j].videoDetails
		d.markerPositions = Array(d.markerTimes.length)
		for(let i = 0; i < d.markerTimes.length; i++)
		{
			d.markerPositions[i] = new THREE.Vector3(
				camera.rightAtZZero * .5,
				-(i-(d.markerTimes.length-1)/2.)*2.,
				-.01 )
		}
	}
	
	return arr
}