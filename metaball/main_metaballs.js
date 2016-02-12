var canvas;
var gl;

//Camera variables

var camEye;
var camAt;
var camUp;
var camRight;
var camForward;

var MVMatrix;
var PMatrix;

var currentShader;

//Simple Shader references
var simpleShaderRef = {
    PROGRAM: null,

    SHADER_MODELVIEW_MATRIX: null,
    SHADER_PROJECTION_MATRIX: null,

    SHADER_ROTATION_MATRIX: null,
    SHADER_TRANSLATION_MATRIX: null,
    SHADER_SCALE_MATRIX: null,

    VERTEX_POSITION: null,
    VERTEX_COLOR: null
};

//Metaball Shader references
var metaballShaderRef = {
    PROGRAM: null,

    SHADER_MODELVIEW_MATRIX: null,
    SHADER_PROJECTION_MATRIX: null,

    SHADER_ROTATION_MATRIX: null,
    SHADER_TRANSLATION_MATRIX: null,
    SHADER_SCALE_MATRIX: null,

    VERTEX_POSITION: null,
    VERTEX_COLOR: null,

    CAMEYE: null,
    BALLS: null
};

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
var camRotationSpeed = 1;

//=====FPS=====//
var FPSDiv;
var FPS = { 
            startTime : 0,
            frameNumber : 0,
            getFPS : function(){
                this.frameNumber++;
                var d = new Date().getTime();
                var currentTime = ( d - this.startTime ) / 1000;
                var result = Math.floor( ( this.frameNumber / currentTime ) );
                if( currentTime > 1 ){
                    this.startTime = new Date().getTime();
                    this.frameNumber = 0;
                }       
                return result;
            }
        };

window.onload = function init()
{
    canvas = document.getElementById( "gl-canvas" );
    
    gl = WebGLUtils.setupWebGL( canvas );
    if ( !gl ) { alert( "WebGL isn't available" ); }

    gl.viewport( 0, 0, canvas.width, canvas.height );
    gl.clearColor( 0.05, 0.05, 0.1, 1.0 );
    
    gl.enable(gl.CULL_FACE);
    gl.enable(gl.DEPTH_TEST);
    gl.depthFunc(gl.LESS);

    simpleShaderRef.PROGRAM     = initShaders( gl, "simple-vert-shader", "simple-frag-shader" );
    metaballShaderRef.PROGRAM   = initShaders( gl, "metaball-vert-shader", "metaball-frag-shader" );
    
    perspAspect = canvas.width/canvas.height;

    //=====Get vertex attributes=====//

    simpleShaderRef.VERTEX_POSITION = gl.getAttribLocation( simpleShaderRef.PROGRAM, "vPosition" );
    simpleShaderRef.VERTEX_COLOR    = gl.getAttribLocation( simpleShaderRef.PROGRAM, "vColor" );

    simpleShaderRef.SHADER_MODELVIEW_MATRIX = gl.getUniformLocation( simpleShaderRef.PROGRAM, "modelView" );
    simpleShaderRef.SHADER_PROJECTION_MATRIX= gl.getUniformLocation( simpleShaderRef.PROGRAM, "projection" );

    simpleShaderRef.SHADER_ROTATION_MATRIX      = gl.getUniformLocation( simpleShaderRef.PROGRAM, "rotation" );
    simpleShaderRef.SHADER_TRANSLATION_MATRIX   = gl.getUniformLocation( simpleShaderRef.PROGRAM, "translate" );
    simpleShaderRef.SHADER_SCALE_MATRIX         = gl.getUniformLocation( simpleShaderRef.PROGRAM, "scale" );

    metaballShaderRef.VERTEX_POSITION   = gl.getAttribLocation( metaballShaderRef.PROGRAM, "vPosition" );
    metaballShaderRef.VERTEX_COLOR      = gl.getAttribLocation( metaballShaderRef.PROGRAM, "vColor" );

    metaballShaderRef.SHADER_MODELVIEW_MATRIX   = gl.getUniformLocation( metaballShaderRef.PROGRAM, "modelView" );
    metaballShaderRef.SHADER_PROJECTION_MATRIX  = gl.getUniformLocation( metaballShaderRef.PROGRAM, "projection" );

    metaballShaderRef.SHADER_ROTATION_MATRIX    = gl.getUniformLocation( metaballShaderRef.PROGRAM, "rotation" );
    metaballShaderRef.SHADER_TRANSLATION_MATRIX = gl.getUniformLocation( metaballShaderRef.PROGRAM, "translate" );
    metaballShaderRef.SHADER_SCALE_MATRIX       = gl.getUniformLocation( metaballShaderRef.PROGRAM, "scale" );

    metaballShaderRef.CAMEYE    = gl.getUniformLocation( metaballShaderRef.PROGRAM, "camEye" );
    metaballShaderRef.BALLS     = gl.getUniformLocation( metaballShaderRef.PROGRAM, "balls" );

    //=====Start shader PROGRAM=====//

    currentShader = simpleShaderRef;

    //=====Load objects=====//

    cube.loadBuffers();

    cube.translate(vec3(1, 0, 1));

    //=====CAMERA=====//
    usePerspective = true;

    camEye      = vec3(-5, 2, -5);
    camUp       = vec3(0, 1, 0);
    camForward  = vec3(0, 0, 1);
    camRight    = cross( camForward, camUp);

    camForward  = multMat4ToVec3(rotate(-15, camRight), camForward);

    camForward  = multMat4ToVec3(rotate(45, camUp), camForward);
    camRight    = multMat4ToVec3(rotate(45, camUp), camRight);

    FPSDiv = document.getElementById("fps");

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
    
    currentShader = metaballShaderRef;
    // currentShader = simpleShaderRef;
    gl.useProgram( currentShader.PROGRAM );

    gl.uniformMatrix4fv( currentShader.SHADER_MODELVIEW_MATRIX, false, flatten(MVMatrix) );
    gl.uniformMatrix4fv( currentShader.SHADER_PROJECTION_MATRIX, false, flatten(PMatrix) );
    gl.uniform4fv( currentShader.CAMEYE, vec3To4(camEye) );

    var balls = [];
    balls[0] = vec3To4(cube.position);
    balls[1] = vec3To4(add(cube.position, vec3(0.5, 0.5, 0)));
    gl.uniform4fv( currentShader.BALLS, flatten(balls));

    cube.setWebGLToDraw(gl, currentShader);
    cube.drawTriangles(gl);

    currentShader = simpleShaderRef;
    gl.useProgram( currentShader.PROGRAM );

    gl.uniformMatrix4fv( currentShader.SHADER_MODELVIEW_MATRIX, false, flatten(MVMatrix) );
    gl.uniformMatrix4fv( currentShader.SHADER_PROJECTION_MATRIX, false, flatten(PMatrix) );

    cube.setWebGLToDraw(gl, currentShader);
    cube.drawLineLoops(gl);

    FPSDiv.innerHTML = FPS.getFPS();

    requestAnimFrame(render);
}