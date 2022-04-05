/*
    So there's:
        Practical programming thing for:
            Undergraduate CS students learning computer graphics (needs spatially varying stuff for lighting!)
            Assessing undergraduates
            Being a thing that people want a VR version of
            Improving live-coding streams of people doing 3D graphics
                AND science videos, where you make the science video demo while talking about it
                - though that needs calculus, so you wouldn't dogfood with this
        Non-VR (2,0,1) game, for:
            Highbrow gamers
            People wanting to learn GA right now
        VR animation-maker for:
            Live coding dance shows
            Kids making puppet shows (lack of arrays is good, encourages unique behaviour in everything)
            Teenagers in the future wanting to make fun things without knowing how to program
            Engineers wanting to reproduce the behaviour of real-world objects and attaching animations to them
            Can involve calculus
        Quantum thing for:
            Explaining some quantum metaphysics
            Helping quantum computing researchers
            Helping quantum computing undergraduates

        It's all (3,0,1) and (3,1). (2,0,1) is subalgebra
        Most you'll ever do will probably be (3,0,1)+(3,1)=(3,1,1)
        Limiting 

    TODO
        Reread your notes in editor
        Rewatch bret victor and ken perlin

    code editor
        could it be done with codepen?
        How would YOU use it? Probably only embedded in vscode


    These notes essentially for a differentiation game, where you've got a zoomed in view of some field:
        Do it in raw webgl. Bootstrap your shaders!
        Maybe wait until they've nailed join lines
        This is CALCULUS. Don't expect to get it right the first time, just try things out

        Different spaces:
            "points on the surface of the sphere" = sphere at infinity?
            1D scalar space. A bar chart, when comparing
            1D circle = directions in 2D? = angles?
            mass space, how heavy some things are
            Binary space, {1,-1}. A button...
            If you've got a 1D/2D simulation
                The space of that 2D simulation
            The surface in which you're doing the thing
            "Vector space" where you can add things, distinct from PGA-type spaces ("euclidean" spaces)
            RGB color space/hue, also alpha
            A closeup of "a point" in a domain space, = uv
            A 2D vector space within a 3D vector space requires a 2x3 matrix
                Try to just drag it into one and it'll automatically make that matrix and initialize it to a default
            "Rasterized space", a 2D space such that you ascribe colors to each place in it
                That's a window in which you are *not* comparing things

        Actions
            Press a button and see a space where all the various variables of that type superimposed


        Your calculus thing is just one example of that
        PGA/CGA gives you a nice set of visualizable geometric objects you can have and work with and program with
        The spaces give you the way you work with them
        Something YOU would use
        Hook to unity transform
        
        Array for light sources

        Unity plugin that lets you run the thing
            Should be able to make:
                Diffuse lit plane
                Arrow, 2D and 3D
                Donut
        
        unreal and unity don't compile shaders at runtime
*/