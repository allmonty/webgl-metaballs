function initControls()
{
	specularControls();
	cameraControls();
	lightControls();
}

function specularControls()
{
	var specControls = document.getElementById('specular-controls');
	var specOptions = specControls.getElementsByTagName('input');
	for(var i = 0; i < specOptions.length; i++)
	{
		specOptions[i].addEventListener('change', function(){
			if(this.value == 'phong')
			{
				useSpecular = true
				useBlinn = false;
			}
			else if(this.value == 'blinn')
			{
				useSpecular = true
				useBlinn = true;
			}
			else
			{
				useSpecular = false	
			}
		});
	}	
}

function cameraControls()
{
	var cameraRotation = document.getElementById('cam-rotation');
	cameraRotation.addEventListener('click', function(){
		camRotateAround = this.checked;
	});
}

function lightControls()
{
	var cameraRotation = document.getElementById('light-rotation');
	cameraRotation.addEventListener('click', function(){
		lightRotation = this.checked;
	});

}
