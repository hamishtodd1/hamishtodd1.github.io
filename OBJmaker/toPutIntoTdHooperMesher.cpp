// BOUNDING_BOX_POSITION 0 0 0
// BOUNDING_BOX_SIZE 2 2 2

float opUnion( float d1, float d2 ) { return min(d1,d2); }
float opSubtraction( float d1, float d2 ) { return max(-d1,d2); }
float opIntersection( float d1, float d2 ) { return max(d1,d2); }

float sdPlane( vec3 p, vec3 n, float h )
{
  // n must be normalized
  return dot(p,n) + h;
}

float sdCone( vec3 p, vec2 c )
{
    // c is the sin/cos of the angle
    vec2 q = vec2( length(p.xz), -p.y );
    float d = length(q-c*max(dot(q,c), 0.));
    return d * ((q.x*c.y-q.y*c.x<0.)?-1.:1.);
}

vec2 applyAngle(vec2 v, float angle) {
  float newX = v.x * cos(angle) - v.y * sin(angle);
	float newY = v.x * sin(angle) + v.y * cos(angle);
  return vec2(newX, newY);
}

float mapDistance(vec3 p) {
  float planeDist = sdPlane(p, vec3(0.,1.,0.), 0.);
  
  float outerDomeRadius = 1.;
  float outerDomeDist = length(p) - outerDomeRadius;
  
  float innerDomeRadius = .96;
  float innerDomeDist = length(p) - innerDomeRadius;
  
  float a = opSubtraction(planeDist, outerDomeDist);
  float b = opSubtraction(innerDomeDist,a);
  
  //holes
  float coneAngle = .03;
  vec2 sinCos = vec2(sin(coneAngle), cos(coneAngle) );
  float lat = 2.5;
  float lon = 6.2;
  //float a[5] = float[5](3.4, 4.2, 5.0, 5.2, 1.1);
  vec2 latLons[2];
  latLons[0] = vec2(0.20572888744804363,0.7308494519389657);latLons[1] = vec2(0.7196808120044229,0.409263541864761);
  
  float finalDist = b;
  for(int i = 0; i < 2; ++i) {
    vec2 lonXz = applyAngle(p.xz, latLons[i].y);
    vec3 withLonApplied = vec3( lonXz.x, p.y, lonXz.y);
    vec3 withLatLonApplied = vec3( withLonApplied.x, applyAngle(withLonApplied.yz, latLons[i].x + 3.1415926536) );
    float coneDist = sdCone( withLatLonApplied, sinCos );
  
    finalDist = opSubtraction(coneDist,finalDist);
  }
  
  return finalDist;
}