function RenderObject ()
{
	this.instanceName = "";

	this.position         = vec3(0.0, 0.0, 0.0);
	this.scale            = vec3(1.0, 1.0, 1.0);
	this.rotation         = vec3(0.0, 0.0, 0.0);

	this.transformRight   = vec3(1.0, 0.0, 0.0);
	this.transformUp      = vec3(0.0, 1.0, 0.0);
	this.transformForward = vec3(0.0, 0.0, 1.0);

	this.localPivot       = vec3(0.0, 0.0, 0.0);

	this.translationMatrix = mat4();
	this.rotationMatrix    = mat4();
	this.scaleMatrix       = mat4();

    this.updateTranslationMatrix();
    
    this.rotateUpAxis(0);
    this.rotateRightAxis(0);
    this.rotateForwardAxis(0);

    this.updateScaleMatrix();

    this.vertices = [];
    this.colors = [];
    this.indices = [];

	this.numElements = 0;

	this.children = [];
}

RenderObject.prototype.init = function(numOfElements, vertices, colors, indices)
{
	this.numElements = numOfElements;
	this.vertices = vertices;
	this.colors = colors;
	this.indices = indices;
}

RenderObject.prototype.setLocalPivot = function(v)
{
	this.localPivot = add(v, this.position);
}

RenderObject.prototype.setPosition = function(v)
{
	this.position = v;
	this.updateTranslationMatrix();
}

RenderObject.prototype.setPositionWithChildren = function(v)
{
	var dir = subtract(v, this.position);

	var iterator = 0;
	for(iterator = 0; iterator < this.children.length; iterator++)
	{
		this.children[iterator].translateWithChildren(dir);
	}

	this.setPosition(v);
}

RenderObject.prototype.updateTranslationMatrix = function()
{
	this.translationMatrix = translate(this.position);
	this.localPivot = vec4To3( multMat4ToVec4( this.translationMatrix, vec3To4(this.localPivot) ) );
}

RenderObject.prototype.updateScaleMatrix = function()
{
	this.scaleMatrix = scalem(this.scale);
}

RenderObject.prototype.rotateRightAxis = function(angle)
{
	this.rotation[0] = (this.rotation[0] + angle)%360;

	var auxMatrix         = rotate(angle, this.transformRight);
	this.transformUp      = multMat4ToVec3(auxMatrix, this.transformUp);
	this.transformForward = multMat4ToVec3(auxMatrix, this.transformForward);
	this.rotationMatrix   = mult(auxMatrix, this.rotationMatrix);

	this.localPivot = vec4To3( multMat4ToVec4( auxMatrix, vec3To4(this.localPivot) ) );
}

RenderObject.prototype.rotateUpAxis = function(angle)
{
	this.rotation[1] = (this.rotation[1] + angle)%360;

	var auxMatrix         = rotate(angle, this.transformUp);
	this.transformRight   = multMat4ToVec3(auxMatrix, this.transformRight);
	this.transformForward = multMat4ToVec3(auxMatrix, this.transformForward);
	this.rotationMatrix   = mult(auxMatrix, this.rotationMatrix);

	this.localPivot = vec4To3( multMat4ToVec4( auxMatrix, vec3To4(this.localPivot) ) );
}

RenderObject.prototype.rotateForwardAxis = function(angle)
{
	this.rotation[2] = (this.rotation[2] + angle)%360;

	var auxMatrix       = rotate(angle, this.transformForward);
	this.transformRight = multMat4ToVec3(auxMatrix, this.transformRight);
	this.transformUp    = multMat4ToVec3(auxMatrix, this.transformUp);
	this.rotationMatrix = mult(auxMatrix, this.rotationMatrix);

	this.localPivot = vec4To3( multMat4ToVec4( auxMatrix, vec3To4(this.localPivot) ) );
}

RenderObject.prototype.rotateInAxis = function(angle, axis)
{
	this.rotation[0] = (this.rotation[0] + angle*axis[0])%360;
	this.rotation[1] = (this.rotation[1] + angle*axis[1])%360;
	this.rotation[2] = (this.rotation[2] + angle*axis[2])%360;

	var auxMatrix         = rotate(angle, axis);
	this.transformRight   = multMat4ToVec3(auxMatrix, this.transformRight);
	this.transformUp      = multMat4ToVec3(auxMatrix, this.transformUp);
	this.transformForward = multMat4ToVec3(auxMatrix, this.transformForward);
	this.rotationMatrix   = mult(auxMatrix, this.rotationMatrix);

	this.localPivot = vec4To3( multMat4ToVec4( auxMatrix, vec3To4(this.localPivot) ) );
}

RenderObject.prototype.rotateInPivot = function(angle, axis, pivot)
{
	var translationMatrix        = translate( negate(pivot) );
	var inverseTranslationMatrix = inverse( translationMatrix );
	var rotationMatrix           = rotate( angle, axis );

	var newTranslationMatrix = mult( rotationMatrix, translationMatrix );
	var newTranslationMatrix = mult( inverseTranslationMatrix, newTranslationMatrix );
	this.translationMatrix   = mult( newTranslationMatrix, this.translationMatrix );

	this.position = vec4To3( multMat4ToVec4( newTranslationMatrix, vec3To4(this.position) ) );

	this.localPivot = vec4To3( multMat4ToVec4( newTranslationMatrix, vec3To4(this.localPivot) ) );

	this.transformRight   = multMat4ToVec3( rotationMatrix, this.transformRight );
	this.transformUp      = multMat4ToVec3( rotationMatrix, this.transformUp );
	this.transformForward = multMat4ToVec3( rotationMatrix, this.transformForward );
}

RenderObject.prototype.rotateInPivotWithChildren = function(angle, axis, pivot)
{
	this.rotateInPivot(angle, axis, pivot);

	var iterator = 0;
	for(iterator = 0; iterator < this.children.length; iterator++)
	{
		this.children[iterator].rotateInPivotWithChildren(angle, axis, pivot);
	}
}

RenderObject.prototype.translate = function(direction)
{
	this.position = add(direction, this.position);
	var newTranslationMatrix = translate(direction);
	this.translationMatrix = mult(newTranslationMatrix, this.translationMatrix);

	this.localPivot = vec4To3( multMat4ToVec4( newTranslationMatrix, vec3To4(this.localPivot) ) );
}

RenderObject.prototype.translateWithChildren = function(direction)
{
	this.translate(direction);

	var iterator = 0;
	for(iterator = 0; iterator < this.children.length; iterator++)
	{
		this.children[iterator].translateWithChildren(direction);
	}
}

RenderObject.prototype.setScale = function(newScale)
{
	this.scale = newScale;
	this.updateScaleMatrix();
}

RenderObject.prototype.addInScale = function(newScale)
{
	this.scale = add(newScale, this.scale);
	this.updateScaleMatrix();
}

RenderObject.prototype.addInScaleWithChildren = function(newScale)
{
	this.addInScale(newScale);

	var iterator = 0;
	for(iterator = 0; iterator < this.children.length; iterator++)
	{
		this.children[iterator].addInScaleWithChildren(newScale);
	}
}

RenderObject.prototype.drawTriangles = function(gl)
{
	gl.drawElements( gl.TRIANGLES, this.numElements, gl.UNSIGNED_SHORT, 0 );
}

RenderObject.prototype.drawLines = function(gl)
{
	gl.drawElements( gl.LINES, this.numElements, gl.UNSIGNED_SHORT, 0 );
}

RenderObject.prototype.drawLineStrip = function(gl)
{
	gl.drawElements( gl.LINE_STRIP, this.numElements, gl.UNSIGNED_SHORT, 0 );
}

RenderObject.prototype.drawLineLoops = function(gl)
{
	gl.drawElements( gl.LINE_LOOP, this.numElements, gl.UNSIGNED_SHORT, 0 );
}

RenderObject.prototype.setWebGLToDraw = function(gl, shaderRef)
{
	gl.uniformMatrix4fv( shaderRef.SHADER_ROTATION_MATRIX, false, flatten(this.rotationMatrix) );

    gl.uniformMatrix4fv( shaderRef.SHADER_TRANSLATION_MATRIX, false, flatten(this.translationMatrix) );
    
    gl.uniformMatrix4fv( shaderRef.SHADER_SCALE_MATRIX, false, flatten(this.scaleMatrix) );

    gl.bindBuffer( gl.ARRAY_BUFFER, this.posBufferRef );
    gl.vertexAttribPointer( shaderRef.VERTEX_POSITION, 4, gl.FLOAT, false, 0, 0 );
    gl.enableVertexAttribArray( shaderRef.VERTEX_POSITION );

    if(shaderRef.VERTEX_COLOR != null)
    {
    	gl.bindBuffer( gl.ARRAY_BUFFER, this.colorBufferRef );
    	gl.vertexAttribPointer( shaderRef.VERTEX_COLOR, 4, gl.FLOAT, false, 0, 0 );
    	gl.enableVertexAttribArray( shaderRef.VERTEX_COLOR);
	}
	
    gl.bindBuffer( gl.ELEMENT_ARRAY_BUFFER, this.indexBufferRef );
}

RenderObject.prototype.loadBuffers = function()
{
    //create positions buffer
    this.posBufferRef = gl.createBuffer();
    gl.bindBuffer( gl.ARRAY_BUFFER, this.posBufferRef );
    gl.bufferData( gl.ARRAY_BUFFER, flatten(this.vertices), gl.STATIC_DRAW );
    //create colors buffer
    this.colorBufferRef = gl.createBuffer();
    gl.bindBuffer( gl.ARRAY_BUFFER, this.colorBufferRef );
    gl.bufferData( gl.ARRAY_BUFFER, flatten(this.colors), gl.STATIC_DRAW );
    //create indices buffer
    this.indexBufferRef = gl.createBuffer();
    gl.bindBuffer( gl.ELEMENT_ARRAY_BUFFER, this.indexBufferRef );
    gl.bufferData( gl.ELEMENT_ARRAY_BUFFER, new Uint16Array(this.indices), gl.STATIC_DRAW );	
}