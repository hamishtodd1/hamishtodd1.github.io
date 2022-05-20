//from https://stackoverflow.com/questions/17981163/webgl-read-pixels-from-floating-point-render-target

//takes the 32 bits of a float and puts them into the 32 bits spread between 8 of R, G, B, A

float shiftRight (float v, float amt) { 
    v = floor(v) + 0.5; 
    return floor(v / exp2(amt)); 
}
float shiftLeft (float v, float amt) { 
    return floor(v * exp2(amt) + 0.5); 
}
float maskLast (float v, float bits) { 
    return mod(v, shiftLeft(1., bits)); 
}
float extractBits (float num, float from, float to) { 
    from = floor(from + 0.5); to = floor(to + 0.5); 
    return maskLast(shiftRight(num, from), to - from); 
}
vec4 encodeFloat (float val) { 
    if (val == 0.)
        return vec4(0, 0, 0, 0); 

    float sign = val > 0. ? 0. : 1.; 
    val = abs(val); 
    float exponent = floor(log2(val)); 
    float biased_exponent = exponent + 127.; 
    float fraction = ((val / exp2(exponent)) - 1.) * 8388608.; 
    float t = biased_exponent / 2.; 
    float last_bit_of_biased_exponent = fract(t) * 2.; 
    float remaining_bits_of_biased_exponent = floor(t); 
    float byte4 = extractBits(fraction, 0., 8.) / 255.; 
    float byte3 = extractBits(fraction, 8., 16.) / 255.; 
    float byte2 = (last_bit_of_biased_exponent * 128. + extractBits(fraction, 16., 23.)) / 255.; 
    float byte1 = (sign * 128. + remaining_bits_of_biased_exponent) / 255.; 
    return vec4(byte4, byte3, byte2, byte1); 
}