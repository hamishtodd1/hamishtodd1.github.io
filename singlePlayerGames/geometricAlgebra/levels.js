//this is not doodling
//possibly should be able to hotload
//definitely want to doodle with process
//Heh, the input output sandbox is your editor

function Levels()
{
	let arr = [
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
				new Float32Array([0.,1.,1.,0.,0.,0.,0.,0.]),
			options: [
				new Float32Array([0.,0.,1.,0.,0.,0.,0.,0.]),
				new Float32Array([0.,1.,0.,0.,0.,0.,0.,0.]),
				new Float32Array([1.,0.,0.,0.,0.,0.,0.,0.]),
			],
			operators: [geometricSum]
		},
		{
			singularGoal: 
				new Float32Array([5.,0.,0.,0.,0.,0.,0.,0.]),
			options: [
				new Float32Array([2.,0.,0.,0.,0.,0.,0.,0.]),
				new Float32Array([3.,0.,0.,0.,0.,0.,0.,0.]),
			],
			operators: [geometricSum]
		},
		{
			singularGoal: 
				new Float32Array([6.,0.,0.,0.,0.,0.,0.,0.]),
			options: [
				new Float32Array([2.,0.,0.,0.,0.,0.,0.,0.]),
				new Float32Array([3.,0.,0.,0.,0.,0.,0.,0.]),
			],
			operators: [geometricSum,geometricProduct]
		},
		{
			singularGoal:
				new Float32Array([2.,0.,2.,0.,0.,0.,0.,0.]),
			options: [
				new Float32Array([1.,0.,0.,0.,0.,0.,0.,0.]),
				new Float32Array([0.,0.,1.,0.,0.,0.,0.,0.]),
				new Float32Array([2.,0.,0.,0.,0.,0.,0.,0.]),
			],
			operators: [geometricSum,geometricProduct]
		},
		{
			singularGoal:
				new Float32Array([0.,0.,0.,0.,1.,0.,0.,0.]),
			options: [
				new Float32Array([0.,1.,0.,0.,0.,0.,0.,0.]),
				new Float32Array([0.,0.,1.,0.,0.,0.,0.,0.]),
			],
			operators: [geometricProduct]
		},
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
			markerTimes: [4.5,7.2],
		},
		options: [
			new Float32Array([0.,1.,0.,0.,0.,0.,0.,0.]),
			new Float32Array([0.,0.,1.,0.,0.,0.,0.,0.]),
		],
		operators: [geometricSum,geometricProduct]
	},
	{
		videoDetails: {
			filename: "dzhanibekov",
			startTime: 0.,
			endTime: 8.,
			markerTimes: [4.,5.5,7.],
		},
		options: [
			new Float32Array([0.,1.,0.,0.,0.,0.,0.,0.]),
			new Float32Array([0.,0.,1.,0.,0.,0.,0.,0.]),
		],
		operators: [geometricSum,geometricProduct]
	}]
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
	*/
	
	arr.push( videoLevels[0] )
	// arr.push( videoLevels[1] )
	return arr
}