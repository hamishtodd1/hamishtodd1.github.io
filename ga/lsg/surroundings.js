function initSurroundings() {

    scene.background = new THREE.Color(0x8F8F8F)

    // const urls = ['posx.jpg', 'negx.jpg', 'posy.jpg', 'negy.jpg', 'posz.jpg', 'negz.jpg'];
    // new THREE.CubeTextureLoader()
    //     .setPath('data/')
    //     .load(urls, (cubeTexture) => {
    //         cubeTexture.generateMipmaps = true;
    //         cubeTexture.minFilter = THREE.LinearMipmapLinearFilter;
    //         scene.background = cubeTexture
    //     })

    const floorGeometry = new THREE.CircleGeometry(5., 31)
    const floorMaterial = new THREE.MeshPhongMaterial()
    textureLoader.load('data/negy.jpg', (texture) => {
        floorMaterial.map = texture
        floorMaterial.needsUpdate = true
    })
    const floor = new THREE.Mesh(floorGeometry, floorMaterial)
    floor.rotation.x = - Math.PI / 2
    floor.position.y = -2.5
    floor.receiveShadow = true
    scene.add(floor)

    {
        scene.background = new THREE.Color(0x8F8F8F)

        var vertexShader = `varying vec3 vWorldPosition;
            void main() {
                vec4 worldPosition = modelMatrix * vec4( position, 1.0 );
                vWorldPosition = worldPosition.xyz;
                gl_Position = projectionMatrix * modelViewMatrix * vec4( position, 1.0 );
            }`
        var fragmentShader = `
            uniform vec3 topColor;
            uniform vec3 bottomColor;
            uniform float offset;
            uniform float exponent;
            varying vec3 vWorldPosition;
            void main() {
                float h = normalize( vWorldPosition + offset ).y;
                gl_FragColor = vec4( mix( bottomColor, topColor, max( pow( max( h , 0.0), exponent ), 0.0 ) ), 1.0 );
            }`
        var uniforms = {
            topColor: { type: "c", value: new THREE.Color(0x0077ff) },
            bottomColor: { type: "c", value: new THREE.Color(0xffffff) },
            offset: { type: "f", value: 33 },
            exponent: { type: "f", value: 0.6 }
        };

        var skyGeo = new THREE.SphereGeometry(80., 5);
        var skyMat = new THREE.ShaderMaterial({
            vertexShader,
            fragmentShader,
            uniforms,
            side: THREE.BackSide
        });

        scene.add(new THREE.Mesh(skyGeo, skyMat))
    }

    scene.add(new THREE.HemisphereLight(0x808080, 0x606060))

    const light = new THREE.DirectionalLight(0xffffff)
    light.position.set(-.5, 2., 2.)
    light.lookAt(0.,1.6,0.)
    light.castShadow = true
    light.shadow.camera.top = 2
    light.shadow.camera.bottom = - 2
    light.shadow.camera.right = 2
    light.shadow.camera.left = - 2
    light.shadow.mapSize.set(4096, 4096)
    scene.add(light)
}