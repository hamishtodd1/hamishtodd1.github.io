function init_audio()
{
	var audioListener = new THREE.AudioListener();
	Camera.add( audioListener );

	ambientMusic = new THREE.Audio( audioListener );
	ambientMusic.setLoop(true);
	ambientMusic.autoplay = true;
	Scene.add( ambientMusic );
	ambientMusic.load(
		'Data/looped_balcony.ogv'
	);
	
	BadSound = new THREE.Audio( audioListener );
	Scene.add( BadSound );
	BadSound.load(
		'Data/BadSound.ogv'
	);
	GoodSound = new THREE.Audio( audioListener );
	Scene.add( GoodSound );
	GoodSound.load(
		'Data/GoodSound.ogv'
	);
}