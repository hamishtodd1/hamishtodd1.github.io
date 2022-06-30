/*
    from https://www.iquilezles.org/www/articles/intersectors/intersectors.htm

    the plane/sphere at infinity is a different kind of window
    is it a sphere or is it a plane dead ahead?
    the same thing can be seen in multiple window, eg a plane is a line in the infinity window

    a bunch of scalars, with a choice of "horizon", probably can be visualized in your PGA space
    null points... they are both the points-at-infinity of PGA, and the points of CGA
    the 2D version is

    is it overkill to try to render them all in one?
        You get may get ambient occlusion on them  (but do you? Also threejs has lighting)
        It's faster
        You need to get arrays of them all for the snapping comparison anyway
    On the other hand
        You might need their values on the CPU anyway
        How much code to inject?
            Can apparently have globals to push to
        Probably it's not faster actually, because every pixel has to do the suggestion-finding
        Could compare in javascript. Would let you update the textarea in realtime
            It'll be a nightmare to debug the suggester in glsl
        You may want to visualize things in a way that's better done with a mesh than an sdf

        When the whole thing is compiled,
*/


varying vec4 coord;
varying vec2 frameCoord;

float boxIntersection( in vec3 rayOrigin, in vec3 rayDirection, vec3 boxSize ) //normal you figure out
{
    vec3 m = 1./rayDirection; // can precompute if traversing a set of aligned boxes
    vec3 n = m*rayOrigin;   // can precompute if traversing a set of aligned boxes
    vec3 k = abs(m)*boxSize;
    vec3 t1 = -n - k;
    vec3 t2 = -n + k;
    float tNear = max( max( t1.x, t1.y ), t1.z );
    float tFar  = min( min( t2.x, t2.y ), t2.z );
    return tNear > tFar || tFar < 0. ? 999. : tNear;
}

float cylIntersect( in vec3 rayOrigin, in vec3 rayDirection, in vec3 basePoint, in vec3 axis )
{
    vec3 oc = rayOrigin - basePoint;
    float card = dot(axis,rayDirection);
    float caoc = dot(axis,oc);
    float a = 1.0 - card*card;
    float b = dot( oc, rayDirection) - caoc*card;

    float radius = .02;
    float c = dot( oc, oc) - caoc * caoc - radius * radius;
    float h = b*b - a*c;

    float ret = h < 0. ? 999. : -b-sqrt(h);
    return ret;
}

float sphereIntersect( in vec3 rayOrigin, in vec3 rayDirection, in vec3 center )
{
    vec3 oc = rayOrigin - center;
    float b = dot( oc, rayDirection );

    float radius = .12;
    float c = dot( oc, oc ) - radius*radius;
    float h = b*b - c;
    
    float ret = h < 0. ? 999. : -b-sqrt(h);
    return ret;
}

float nrand( vec3 n )
{
	return fract(sin(dot(n.xy + n.z, vec2(12.9898, 78.233)))* 43758.5453);
}

vec3 hash3( vec3 p )
{
    vec3 q = vec3( dot(p,vec3(127.1,311.7,195.4)), 
				   dot(p,vec3(269.5,183.3,494.0)), 
				   dot(p,vec3(419.2,371.9,139.7)) );
	return fract(sin(q)*43758.5453);
}

//pretty sure PGA would do a better job
float patchyPlaneIntersect( in vec3 rayOrigin, in vec3 rayDirection, in vec4 p )
{
    float val = -(dot(rayOrigin,p.xyz)+p.w)/dot(rayDirection,p.xyz);
    vec3 loc = rayOrigin + val * rayDirection;

    bool sphereHere = false;
    {
        const float gridDensity = 30.;
        const float radiusSqOnGrid = .0065 * gridDensity;

        vec3 scaledLoc = loc * gridDensity;
        vec3 i = floor(scaledLoc);
        vec3 f = fract(scaledLoc);
        
        //larger radius spheres require this to be 2 instead of 1
        for( int x=-1; x<=1; ++x )
        for( int y=-1; y<=1; ++y )
        for( int z=-1; z<=1; ++z )
        {
            vec3 localGridCoord = vec3( x, y, z );
            vec3 threeRandomNumbers = hash3( i + localGridCoord );
            vec3 spherePosition = localGridCoord + i + threeRandomNumbers;

            vec3 toSphere = scaledLoc - spherePosition;
            float distSqToSphere = dot(toSphere,toSphere);
            sphereHere = sphereHere || distSqToSphere < radiusSqOnGrid;
        }
    }

    // vec3 rounded = round(loc * 128.);
    // float spatiallyDependentRandomNumber = nrand( round(loc * 128.) );

    //alternatively, spheres get smaller closer to the camera
    float distWhereItMoires = 8.5;

    return val > 0. && val < distWhereItMoires && !sphereHere ? val : 999.;
}

void updateFromDist(in float dist, inout float lowestDist, in vec3 potentialColor, out vec3 lowestDistColor) {
    lowestDistColor = dist < lowestDist ? potentialColor : lowestDistColor;
    lowestDist = min(dist, lowestDist);
}

float capIntersect( in vec3 ro, in vec3 rd, in vec3 pa, in vec3 pb, in float ra )
{
    vec3  ba = pb - pa;
    vec3  oa = ro - pa;
    float baba = dot(ba,ba);
    float bard = dot(ba,rd);
    float baoa = dot(ba,oa);
    float rdoa = dot(rd,oa);
    float oaoa = dot(oa,oa);
    float a = baba      - bard*bard;
    float b = baba*rdoa - baoa*bard;
    float c = baba*oaoa - baoa*baoa - ra*ra*baba;
    float h = b*b - a*c;
    if( h >= 0. )
    {
        float t = (-b-sqrt(h))/a;
        float y = baoa + t*bard;
        // body
        if( y>0. && y<baba ) return t;
        // caps
        vec3 oc = (y <= 0.) ? oa : ro - pb;
        b = dot(rd,oc);
        c = dot(oc,oc) - ra*ra;
        h = b*b - c;
        if( h>0. ) return -b - sqrt(h);
    }
    return 999.;
}


            
void raycast()
{
    vec3 rayOrigin = vec3(coord);
    vec3 rayDirection = normalize( rayOrigin - cameraPosition );

    float lowestDist = 998.;
    vec3 lowestDistColor = vec3(1.,1.,1.);

    {
        vec3 exampleSpherePosition = vec3(-.5,.5,0.);
        float dist = sphereIntersect(rayOrigin,rayDirection,exampleSpherePosition);

        updateFromDist( dist, lowestDist, vec3(1.,1.,0.), lowestDistColor );
    }

    {
        vec3 planeNormal = normalize( vec3(1.,1.,0.) );
        float planeExtra = 0.;
        float dist = patchyPlaneIntersect( rayOrigin, rayDirection, vec4(planeNormal, planeExtra) );

        updateFromDist( dist, lowestDist, vec3(0.,1.,1.), lowestDistColor );
    }

    {
        vec3 cylAxis = normalize( vec3(0.,1.,0.) );
        vec3 cylBasePoint = normalize( vec3(.3,0.,0.) );
        float dist = cylIntersect( rayOrigin, rayDirection, cylBasePoint, cylAxis );

        updateFromDist( dist, lowestDist, vec3(1.,0.,1.), lowestDistColor );
    }

    // {
    //     vec3 floorDimensions = vec3(2.,.001,2.);
    //     vec3 floorPosition = vec3(0.,-1.,0.);
    //     float dist = boxIntersection( rayOrigin - floorPosition, rayDirection, floorDimensions );

    //     updateFromDist( dist, lowestDist, vec3(.5,.5,.5), lowestDistColor );
    // }

    // {
    //     vec3 ySquareDimensions = vec3(1.,.01,1.);
    //     vec3 ySquarePosition = vec3(0.,0.,0.);

    //     float dist = boxIntersection( rayOrigin - ySquarePosition, rayDirection, ySquareDimensions );
    //     updateFromDist( dist, lowestDist, vec3(.7,.7,.7), lowestDistColor );

    //     dist = capIntersect( rayOrigin, rayDirection, vec3(0.,1.,0.), vec3(0.,-1.,0.), .03 );
    //     updateFromDist( dist, lowestDist, vec3(.6,.6,.6), lowestDistColor );
    // }
    
    // res = rayOrigin + distAlongRay * rayDirection;
    if(lowestDist == 998.)
        discard;
    else
        gl_FragColor = vec4(lowestDistColor, 1.);
}

//the above will have your entered shader tacked onto the end
//that shader will then have, below the mentions:
// pointsToBeVisualized()
