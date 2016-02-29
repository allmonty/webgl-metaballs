function initControls()
{
	specularControls();
	cameraControls();
	lightControls();
	ballsControl();
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

function ballsControl()
{
	var ballControlDiv = document.getElementById('balls-controls');

	// Creating radius controllers
	for(var i = 0; i < numOfBalls; i++)
	{
		var ballDiv = document.createElement('div');
		ballDiv.id = 'ball-control-' + i;

		var nameSpan = document.createElement('span');
		nameSpan.innerHTML = 'Ball ' + i;
		ballDiv.appendChild(nameSpan);

		var radiusSpan = document.createElement('span');
		radiusSpan.innerHTML = 'Radius: ';
		ballDiv.appendChild(radiusSpan);

		var slider = document.createElement('input');
		slider.classList.add('radius-slider');
		slider.type  = 'range';
		slider.max   = 2.0;
		slider.min   = 0.1;
		slider.value = 1.0
		slider.step  = 0.1;
		
		ballDiv.appendChild(slider);
		ballControlDiv.appendChild(ballDiv);
	}

	// Adding events to set these radius
	var sliders = document.getElementsByClassName('radius-slider');
	for(var i = 0; i < sliders.length; i++)
	{
		(function(i)
		{
			sliders[i].addEventListener('input', function(ev){
				ballsRadius[i] = this.value; 
			});
		}(i));
	}

}















