function testGetShaderOutput() {
    let testShader = `
                varying vec2 frameCoord;
            
                void main() {
                    float[8] myFloats;
                    myFloats[0] = 420.420;
                    myFloats[1] = 72.1;
                    myFloats[2] = .005;
                    myFloats[3] = 20.420;
                    myFloats[4] = 172.1;
                    myFloats[5] = 98.1;
                    myFloats[6] = 72.1;
                    myFloats[7] = 420.420;

                    int pixelIndex = int(round(frameCoord.x * 8. - .5));
                    float pixelFloat = 0.;
                    for (int k = 0; k < 8; ++k) {
                        if (pixelIndex == k)
                            pixelFloat = myFloats[k];
                    }

                    gl_FragColor = encodeFloat(pixelFloat);
                }`
    let out = await getShaderOutput(testShader, Array(8))
    log(out)
    log("that should be the same as what you see in this file")
}