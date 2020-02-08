function Levels()
{
	return [
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
}