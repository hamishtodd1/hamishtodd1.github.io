//need double precision

function ellipticRf(double x, double y, double z)
{
    if (x < 0.0 || y < 0.0 || z < 0.0)
        return 0.0; // error case???

    auto delx = 1.0;
    auto dely = 1.0;
    auto delz = 1.0;

    const double epsilon = 0.0025;
    while (std::abs(delx) > epsilon || std::abs(dely) > epsilon || std::abs(delz) > epsilon)
    {
        const auto sx = std::sqrt(x);
        const auto sy = std::sqrt(y);
        const auto sz = std::sqrt(z);
        const auto len = sx * (sy + sz) + sy * sz;
        x = 0.25 * (x + len);
        y = 0.25 * (y + len);
        z = 0.25 * (z + len);
        const auto mean = (x + y + z) / 3.0;
        delx = (mean - x) / mean;
        dely = (mean - y) / mean;
        delz = (mean - z) / mean;
    }
    const auto e2 = delx * dely - delz * delz;
    const auto e3 = delx * dely * delz;
    const auto mean = (x + y + z) / 3.0;
    return (1.0 + (e2 / 24.0 - 0.1 - 3.0 * e3 / 44.0) * e2+ e3 / 14) / std::sqrt(mean);
}

function ellipticFaux(double cos_phi, double sin_phi, double k)
{
    const auto x = cos_phi * cos_phi;
    const auto y = 1.0 - k * k * sin_phi * sin_phi;
    const auto z = 1.0;
    const auto rf = ellipticRf(x,y,z);
    return sin_phi * rf;
}

function schwarzChristoffelHemisphere(double sin_lambda, double cos_lambda, double r)
{
    const auto halfSqrt2 = std::sqrt(0.5);
    const auto cos_phiosqrt2 = halfSqrt2 * r;
    const auto cos_a = cos_phiosqrt2 * (sin_lambda + cos_lambda);
    const auto cos_b = cos_phiosqrt2 * (sin_lambda - cos_lambda);
    const auto sin_a = std::sqrt(1.0 - std::min(1.0, cos_a * cos_a));
    const auto sin_b = std::sqrt(1.0 - std::min(1.0, cos_b * cos_b));
    const auto cos_a_cos_b = cos_a * cos_b;
    const auto sin_a_sin_b = sin_a * sin_b;
    auto sin2_m = std::max(0.0, 1.0 + cos_a_cos_b - sin_a_sin_b);
    auto sin2_n = std::max(0.0, 1.0 - cos_a_cos_b - sin_a_sin_b);

    const auto sin_m = sign(sin_lambda) * std::sqrt(sin2_m);
    sin2_m = std::min(1.0, sin2_m);

    const auto cos_m = std::sqrt(1.0 - sin2_m);

    const auto sin_n = -sign(cos_lambda) * std::sqrt(sin2_n);
    sin2_n = std::min(1.0, sin2_n);

    const auto cos_n = std::sqrt(1.0 - sin2_n);

    return [
        ellipticFaux(cos_m, sin_m, halfSqrt2),
        ellipticFaux(cos_n, sin_n, halfSqrt2)
    ];
}

function projectPeirceQuincuncial(projectedPoint) {
    const auto halfSqrt2 = std::sqrt(0.5);

    const auto xy = schwarzChristoffelHemisphere(
        Math.sin(lon), 
        Math.cos(lon), 
        Math.cos(lat));
    auto x = xy.first;
    auto y = xy.second;

    const auto qccScale = 2.0 * 1.85407; //1.85407 = std::comp_ellint_1(halfSqrt2);
    if(projectedPoint.ref_lat < 0)
    {
        if (projectedPoint.ref_lon < -0.75 * pi)
            y = qccScale - y;
        else if (projectedPoint.ref_lon < -0.25 * pi)
            x = -qccScale - x;
        else if (projectedPoint.ref_lon < 0.25 * pi)
            y = -qccScale - y;
        else if (projectedPoint.ref_lon < 0.75 * pi)
            x = qccScale - x;
        else
            y = qccScale - y;
    }

    projectedPoint.x = 0.75f * static_cast<float>((x - y) * halfSqrt2);
    projectedPoint.y = 0.75f * static_cast<float>((x + y) * halfSqrt2);
    projectedPoint.z = 0.;
}