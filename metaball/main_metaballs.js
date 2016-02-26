var canvas;
var gl;

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

    CAMEYE: null,
    LIGHT_POS: null,
    BALLS_POS: null,
    BALLS_COLORS: null
};

//=====Projections=====//

var perspFOVY = 45.0;
var perspNear = 0.2;
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

var plane = new RenderObject();
plane.instanceName = "renderPlane";
// plane.init(36, CubeVertices, CubeColors, CubeIndices);
plane.init(6, PlaneVertices, PlaneColors, PlaneIndices);
plane.setScale(vec3(0.345, 0.246, 1.0));
plane.setPosition(vec3(0.0, 0.0, 0.3));

var light = new RenderObject();
light.instanceName = "light";
light.position = vec3(10.0, 0.0, 10.0);

var camEye = new RenderObject();
camEye.instanceName = "camEye";
camEye.position = vec3(0.0, 0.0, 0.0);
camEye.children.push(plane);

camEye.translateWithChildren(vec3(0.0, 0.0, -10.0));
// camEye.setPositionWithChildren(vec3(-10, 0.0, -10.0));

//=====Control Variables=====//

var usePerspective = true;
var camRotateAround = true;
var camRotationSpeed = 0.1;

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

    simpleShaderRef.SHADER_MODELVIEW_MATRIX     = gl.getUniformLocation( simpleShaderRef.PROGRAM, "modelView" );
    simpleShaderRef.SHADER_PROJECTION_MATRIX    = gl.getUniformLocation( simpleShaderRef.PROGRAM, "projection" );

    simpleShaderRef.SHADER_ROTATION_MATRIX      = gl.getUniformLocation( simpleShaderRef.PROGRAM, "rotation" );
    simpleShaderRef.SHADER_TRANSLATION_MATRIX   = gl.getUniformLocation( simpleShaderRef.PROGRAM, "translate" );
    simpleShaderRef.SHADER_SCALE_MATRIX         = gl.getUniformLocation( simpleShaderRef.PROGRAM, "scale" );

    metaballShaderRef.VERTEX_POSITION           = gl.getAttribLocation( metaballShaderRef.PROGRAM, "vPosition" );

    metaballShaderRef.SHADER_MODELVIEW_MATRIX   = gl.getUniformLocation( metaballShaderRef.PROGRAM, "modelView" );
    metaballShaderRef.SHADER_PROJECTION_MATRIX  = gl.getUniformLocation( metaballShaderRef.PROGRAM, "projection" );

    metaballShaderRef.SHADER_ROTATION_MATRIX    = gl.getUniformLocation( metaballShaderRef.PROGRAM, "rotation" );
    metaballShaderRef.SHADER_TRANSLATION_MATRIX = gl.getUniformLocation( metaballShaderRef.PROGRAM, "translate" );
    metaballShaderRef.SHADER_SCALE_MATRIX       = gl.getUniformLocation( metaballShaderRef.PROGRAM, "scale" );

    metaballShaderRef.CAMEYE        = gl.getUniformLocation( metaballShaderRef.PROGRAM, "camEye" );
    metaballShaderRef.LIGHT_POS     = gl.getUniformLocation( metaballShaderRef.PROGRAM, "lightPosition" );
    metaballShaderRef.BALLS_POS     = gl.getUniformLocation( metaballShaderRef.PROGRAM, "ballsPos" );
    metaballShaderRef.BALLS_COLORS  = gl.getUniformLocation( metaballShaderRef.PROGRAM, "ballsColors" );

    //=====Start shader PROGRAM=====//

    currentShader = simpleShaderRef;

    //=====Load objects=====//

    plane.loadBuffers();

    //=====CAMERA=====//
    usePerspective = true;

    FPSDiv = document.getElementById("fps");

    render();
};

var ballAnimControl = 0.0;
var ballAnimUp = true;
var camAt;

function render()
{
    gl.clear( gl.COLOR_BUFFER_BIT | gl.DEPTH_BUFFER_BIT);

    gl.clearColor( 0.05, 0.05, 0.1, 1.0 );
    
    if(camRotateAround)
    {
        camEye.rotateInPivotWithChildren(3.0, vec3(0, 1, 0), vec3(0, 0, 0));
        console.log(Math.acos(dot(camEye.transformForward, normalize(subtract(vec3(0,0,0),camEye.position)))));
        //camEye.rotateInPivotWithChildren(Math.acos(dot(camEye.transformForward, normalize(subtract(vec3(0,0,0),camEye.position)))), vec3(0, 1, 0) , camEye.position);
    }

    camAt = add(camEye.position, camEye.transformForward);
    MVMatrix = lookAt(camEye.position, camAt, camEye.transformUp);
    
    if(usePerspective)
    {
        PMatrix = perspective(perspFOVY, perspAspect, perspNear, perspFar);
    }
    else
    {
        PMatrix = ortho( orthoLeft, orthoRight, orthoBottom, orthoTop, orthoNear, orthoFar );
    }
    
    // light.rotateInPivot(3.0, vec3(0,1,0), vec3(0,0,0));

    currentShader = metaballShaderRef;
    // currentShader = simpleShaderRef;
    gl.useProgram( currentShader.PROGRAM );

    gl.uniformMatrix4fv( currentShader.SHADER_MODELVIEW_MATRIX, false, flatten(MVMatrix) );
    gl.uniformMatrix4fv( currentShader.SHADER_PROJECTION_MATRIX, false, flatten(PMatrix) );
    gl.uniform4fv( currentShader.CAMEYE, vec3To4(camEye.position) );
    gl.uniform4fv( currentShader.LIGHT_POS, vec3To4(light.position) );    

    if(ballAnimUp)
    {
        ballAnimControl += 0.02;
        if(ballAnimControl >= 1.5)
        {
            ballAnimUp = false;
        }
    }
    else
    {
        ballAnimControl -= 0.02;
        if(ballAnimControl <= -1.5)
        {
            ballAnimUp = true;
        }
    }

    var balls = [];
    balls[0] = vec3To4(vec3(0,0,0));
    balls[1] = vec3To4(add(vec3(0,0,0), vec3(0.0, -ballAnimControl, 0)));
    balls[2] = vec3To4(add(vec3(0,0,0), vec3(-0.0, ballAnimControl, 0)));
    balls[3] = vec3To4(add(vec3(0,0,0), vec3(ballAnimControl, ballAnimControl, ballAnimControl)));
    balls[4] = vec3To4(add(vec3(0,0,0), vec3(-ballAnimControl, ballAnimControl, ballAnimControl)));
    balls[5] = vec3To4(add(vec3(0,0,0), vec3(ballAnimControl, -ballAnimControl, ballAnimControl)));
    balls[6] = vec3To4(add(vec3(0,0,0), vec3(ballAnimControl, ballAnimControl, -ballAnimControl)));
    balls[7] = vec3To4(add(vec3(0,0,0), vec3(-ballAnimControl, ballAnimControl, -ballAnimControl)));
    balls[8] = vec3To4(add(vec3(0,0,0), vec3(ballAnimControl, -ballAnimControl, -ballAnimControl)));
    balls[9] = vec3To4(add(vec3(0,0,0), vec3(-ballAnimControl, -ballAnimControl, ballAnimControl)));
    gl.uniform4fv( currentShader.BALLS_POS, flatten(balls));

    var ballsColors = [];
    ballsColors[0] = vec4(1.0, 0.0, 0.0, 1.0);
    ballsColors[1] = vec4(0.0, 1.0, 0.0, 1.0);
    ballsColors[2] = vec4(0.0, 0.0, 1.0, 1.0);
    ballsColors[3] = vec4(1.0, 1.0, 0.0, 1.0);
    ballsColors[4] = vec4(0.0, 1.0, 1.0, 1.0);
    ballsColors[5] = vec4(1.0, 0.0, 1.0, 1.0);
    ballsColors[6] = vec4(1.0, 0.5, 0.5, 1.0);
    ballsColors[7] = vec4(0.5, 1.0, 0.5, 1.0);
    ballsColors[8] = vec4(0.5, 0.5, 1.0, 1.0);
    ballsColors[9] = vec4(0.5, 0.5, 0.5, 1.0);
    gl.uniform4fv( currentShader.BALLS_COLORS, flatten(ballsColors));

    plane.setWebGLToDraw(gl, currentShader);
    plane.drawTriangles(gl);

    currentShader = simpleShaderRef;
    gl.useProgram( currentShader.PROGRAM );

    gl.uniformMatrix4fv( currentShader.SHADER_MODELVIEW_MATRIX, false, flatten(MVMatrix) );
    gl.uniformMatrix4fv( currentShader.SHADER_PROJECTION_MATRIX, false, flatten(PMatrix) );

    plane.setWebGLToDraw(gl, currentShader);
    plane.drawLineLoops(gl);
    // plane.drawTriangles(gl);

    FPSDiv.innerHTML = FPS.getFPS();

    requestAnimFrame(render);
}