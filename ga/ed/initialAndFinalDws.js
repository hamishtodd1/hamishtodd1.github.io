function initInitialAndFinalDws() {

    let dw = new Dw("final", false, camera, false)
    // dw.elem.style.display = 'none'

    //////////////
    // Fragment //
    //////////////
    
    let oldFragFsq = null
    let defaultVertexShader = `
    varying vec4 fragmentPosition;
    void main() {
        fragmentPosition = modelViewMatrix * vec4(position, 1.);
        gl_Position = projectionMatrix * fragmentPosition;
    }`
    updateFinalDwFragment = (text, uniforms) => {
        if (oldFragFsq !== null) {
            dw.removeNonMentionChild(oldFragFsq)
            oldFragFsq.material.dispose()
        }

        const toFragColorSuffix = `
        varying vec4 fragmentPosition;
        void main() {
            vec3 myCol = getColor(fragmentPosition);
            gl_FragColor = vec4( myCol, 1. );
        }`
        
        let fullFragmentShader = generalShaderPrefix + text + toFragColorSuffix
        conferOverrideSensetivityToUniforms(uniforms)
        
        oldFragFsq = FullScreenQuadMesh(defaultVertexShader,fullFragmentShader, uniforms)
        dw.addNonMentionChild(oldFragFsq)
    }

    ////////////
    // Vertex //
    ////////////

    let finalMesh = null
    let initialMesh = null
    const initialMeshUniforms = {
        projectionMatrix:   { value: camera.projectionMatrix },
        viewMatrix:         { value: camera.matrixWorldInverse }
    }
    const versionPrefix = `#version 300 es\n`
    const toPointsPrefix = `
        uniform mat4 viewMatrix;
        uniform mat4 projectionMatrix;
        
        in vec3 position;

        in vec2 uv;
        out vec2 vUv;
        
        void main() {
            gl_PointSize = 2.0;
            vec4 initialVertex = vec4(position, 1.);`
    const toVertexSuffix = toPointsPrefix + `
            vUv = uv;
            vec4 changedVertex = getChangedVertex(initialVertex);
            if(changedVertex.w < 0.)
                changedVertex *= -1.; //gl no likey. Hacky, try to understand it better, TODO
            gl_Position = projectionMatrix * viewMatrix * changedVertex;
        }`
    const initialMeshVertexShader = versionPrefix + toPointsPrefix + `
            vUv = uv;
            gl_Position = projectionMatrix * viewMatrix * initialVertex;
        }`
    const initialMeshFragmentShader = versionPrefix + `
        precision mediump float;
        out vec4 fragColor;
        void main() {
            fragColor = vec4(1., 0., 0., 1.);
        }`
    const finalFragmentShaderForVertex = versionPrefix + `
        precision mediump float;

        out vec4 fragColor;

        in vec2 vUv;
        uniform sampler2D map;
        void main() {
            fragColor = texture(map, vUv);
        }`
    updateFinalDwVertex = (text, uniforms, geo) => {

        Object.assign(uniforms,initialMeshUniforms)
        conferOverrideSensetivityToUniforms(uniforms)
        
        //bit hacky. Ins that are built-in, such as position, seem to be handled bizarrely
        geo.setAttribute(`uv`, initialMeshData.uv)
        uniforms.map = { value: initialMeshData.texture }

        let finalMeshMat = new THREE.RawShaderMaterial({
            uniforms,
            vertexShader: versionPrefix + generalShaderPrefix + text + toVertexSuffix,
            fragmentShader: finalFragmentShaderForVertex,
            side: THREE.DoubleSide
        })
        let initialMeshMat = new THREE.RawShaderMaterial({
            uniforms,
            vertexShader: initialMeshVertexShader,
            fragmentShader: finalFragmentShaderForVertex,
        })

        if(finalMesh!==null) {
            finalMesh.parent.remove(finalMesh)
            finalMesh.geometry.dispose()
            finalMesh.material.dispose()
            initialMesh.parent.remove(initialMesh)
            initialMesh.geometry.dispose()
            initialMesh.material.dispose()
        }
        
        finalMesh = new THREE.Mesh(geo, finalMeshMat)
        dw.addNonMentionChild(finalMesh)

        initialMesh = new THREE.Mesh(geo, initialMeshMat)
        dws.untransformed.addNonMentionChild(initialMesh)

        if (pageParameters.numExtraCows !== undefined ) {

            let dqCoefs = [
                `-0.79,-1.27,-1.22,1.24,-0.39,-0.22,0.42,1.63`,
                `-0.957,0.958,1.337,1.147,0.179,-0.179,0.14,-0.606`,
                `-0.52,1.22,-0.28,0.02,0.12,-0.55,0.64,-1.80`, //probably unnormalized!
            ]
            for (let i = 0; i < pageParameters.numExtraCows; ++i) {
                
                let standinText = `
                    vec4 getChangedVertex(in vec4 initialVertex) {
                        Dq transform = Dq(`+dqCoefs[i]+`);
                        vec4 ret = apply(transform, initialVertex );
                        return ret;
                    }
                `
                let blendExampleMat = new THREE.RawShaderMaterial({
                    uniforms,
                    vertexShader: versionPrefix + generalShaderPrefix + standinText + toVertexSuffix,
                    fragmentShader: finalFragmentShaderForVertex,
                })

                blendExampleMesh = new THREE.Mesh(geo, blendExampleMat)
                dw.addNonMentionChild(blendExampleMesh)
            }
        }
        // a = new Biv()
        // for (i = 0; i < 6; ++i)
        //     a[i] = 3. * (Math.random() - .5)
        // b = a.exp()
        // myStr = ``
        // for (let i = 0; i < 8; ++i)
        //     myStr += b[i].toFixed(2) + `,`
    }
}