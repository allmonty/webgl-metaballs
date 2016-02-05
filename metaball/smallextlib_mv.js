function multMat4ToVec3(m, v)
{
    var result = vec3();
    
    result[0] = v[0]*m[0][0] + v[1]*m[0][1] + v[2]*m[0][2];
    result[1] = v[0]*m[1][0] + v[1]*m[1][1] + v[2]*m[1][2];
    result[2] = v[0]*m[2][0] + v[1]*m[2][1] + v[2]*m[2][2];
    
    return result;
}

function multMat4ToVec4(m, v)
{
    var result = vec4();
    
    result[0] = v[0]*m[0][0] + v[1]*m[0][1] + v[2]*m[0][2] + v[3]*m[0][3];
    result[1] = v[0]*m[1][0] + v[1]*m[1][1] + v[2]*m[1][2] + v[3]*m[1][3];
    result[2] = v[0]*m[2][0] + v[1]*m[2][1] + v[2]*m[2][2] + v[3]*m[2][3];
    result[3] = v[0]*m[3][0] + v[1]*m[3][1] + v[2]*m[3][2] + v[3]*m[3][3];
    
    return result;
}

function vec3To4(v)
{
    return vec4(v[0], v[1], v[2], 1);
}

function vec4To3(v)
{
    return vec3(v[0]/v[3], v[1]/v[3], v[2]/v[3]);
}