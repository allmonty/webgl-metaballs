var canvas;
var gl;

//Camera variables

var camEye;
var camAt;
var camUp;
var camRight;
var camForward;

//Shader references

var SHADER_MODELVIEW_MATRIX;
var MVMatrix;

var SHADER_PROJECTION_MATRIX;
var PMatrix;

var SHADER_ROTATION_MATRIX;
var SHADER_TRANSLATION_MATRIX;
var SHADER_SCALE_MATRIX;

var VERTEX_POSITION;
var VERTEX_COLOR;

//=====Projections=====//

var perspFOVY = 45.0;
var perspNear = 0.3;
var perspFar = 100.0;
var perspAspect; //calculated based on canvas height and width

var orthoNear   = -100.0;
var orthoFar    =  100.0;
var orthoLeft   = -10.0;
var orthoRight  =  10.0;
var orthoBottom = -10.0;
var orthoTop    =  10.0;

//=======OBJECTS=======//

// var grid = new RenderObject();
// grid.instanceName = "Grid";
// grid.init(40, GridVertices, GridColors, GridIndices);

var cube = new RenderObject();
cube.instanceName = "Cube";
cube.init(36, CubeVertices, CubeColors, CubeIndices);
cube.setScale(vec3(3.0, 3.0, 3.0));

//=====Control Variables=====//

var usePerspective = true;
var camRotateAround = true;
var camRotationSpeed = 0.1;

window.onload = function init()
{
    canvas = document.getElementById( "gl-canvas" );
    
    gl = WebGLUtils.setupWebGL( canvas );
    if ( !gl ) { alert( "WebGL isn't available" ); }

    gl.viewport( 0, 0, canvas.width, canvas.height );
    gl.clearColor( 0.05, 0.05, 0.1, 1.0 );
    
    gl.enable(gl.DEPTH_TEST);

    var program = initShaders( gl, "vertex-shader", "fragment-shader" );
    gl.useProgram( program );
    
    perspAspect = canvas.width/canvas.height;

    //=====Get vertex attributes=====//

    VERTEX_POSITION             = gl.getAttribLocation( program, "vPosition" );
    VERTEX_COLOR                = gl.getAttribLocation( program, "vColor" );

    SHADER_MODELVIEW_MATRIX     = gl.getUniformLocation( program, "modelView" );
    SHADER_PROJECTION_MATRIX    = gl.getUniformLocation( program, "projection" );

    SHADER_ROTATION_MATRIX      = gl.getUniformLocation( program, "rotation" );
    SHADER_TRANSLATION_MATRIX   = gl.getUniformLocation( program, "translate" );
    SHADER_SCALE_MATRIX         = gl.getUniformLocation( program, "scale" );

    //=====Load objects=====//
    
    // grid.loadBuffers();

    cube.loadBuffers();

    //=====CAMERA=====//
    usePerspective = true;

    camEye      = vec3(-5, 2, -5);
    camUp       = vec3(0, 1, 0);
    camForward  = vec3(0, 0, 1);
    camRight    = cross( camForward, camUp);

    camForward  = multMat4ToVec3(rotate(-15, camRight), camForward);

    camForward  = multMat4ToVec3(rotate(45, camUp), camForward);
    camRight    = multMat4ToVec3(rotate(45, camUp), camRight);

    render();
};

function render()
{
    gl.clear( gl.COLOR_BUFFER_BIT | gl.DEPTH_BUFFER_BIT);

    gl.clearColor( 0.05, 0.05, 0.1, 1.0 );
    
    if(camRotateAround)
    {
        camEye = multMat4ToVec3(rotate(camRotationSpeed, vec3(0, 1, 0)), camEye);
        camForward = multMat4ToVec3(rotate(camRotationSpeed, vec3(0, 1, 0)), camForward);
    }

    camAt = add(camEye, camForward);
    MVMatrix = lookAt(camEye, camAt, camUp);
    
    if(usePerspective)
    {
        PMatrix = perspective(perspFOVY, perspAspect, perspNear, perspFar);
    }
    else
    {
        PMatrix = ortho( orthoLeft, orthoRight, orthoBottom, orthoTop, orthoNear, orthoFar );
    }
    
    gl.uniformMatrix4fv( SHADER_MODELVIEW_MATRIX, false, flatten(MVMatrix) );
    gl.uniformMatrix4fv( SHADER_PROJECTION_MATRIX, false, flatten(PMatrix) );
    
    // grid.setWebGLToDraw(gl);
    // grid.drawLines(gl);

    cube.setWebGLToDraw(gl);
    cube.drawLineLoops(gl);

    requestAnimFrame(render);
}