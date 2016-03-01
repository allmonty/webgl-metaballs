function initControls()
{
	specularControls();
	cameraControls();
	lightControls();
	animationControls();
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

	var shineSlider = document.getElementById('shine-slider');
	if(shineSlider)
	{
		shineSlider.addEventListener('input', function(){
			shininess = this.value;
			console.log(shininess);
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
	var rotateLight = document.getElementById('light-rotation');
	rotateLight.addEventListener('click', function(){
		lightRotation = this.checked;
	});

	var ambLightSlider = document.getElementById('amb-light-slider');
	if(ambLightSlider)
	{
		ambLightSlider.addEventListener('input', function(){
			ambLightIntensity = this.value;		
		});
	}

	var diffbLightSlider = document.getElementById('diff-light-slider');
	if(diffbLightSlider)
	{
		diffbLightSlider.addEventListener('input', function(){
			diffLightIntensity = this.value;		
		});
	}

	var specLightSlider = document.getElementById('spec-light-slider');
	if(specLightSlider)
	{
		specLightSlider.addEventListener('input', function(){
			specLightIntensity = this.value;		
		});
	}
}

function animationControls()
{
	var animToggle = document.getElementById('anim-toggle');
	animToggle.addEventListener('click', function(){
		animation = this.checked;
	});

	var animSlider = document.getElementById('anim-speed-slider');
	if(animSlider)
	{
		animSlider.addEventListener('input', function(){
			resetPosition();
			animSpeed = this.value;		
		});
	}
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
		nameSpan.innerHTML = '<br>Ball ' + i + ' (radius/color)<br>';
		ballDiv.appendChild(nameSpan);

		// RADIUS SLIDER
		var radiusSpan = document.createElement('span');
		radiusSpan.innerHTML = 'Radius: ';
		ballDiv.appendChild(radiusSpan);

		var slider = document.createElement('input');
		slider.classList.add('radius-slider');
		slider.type  = 'range';
		slider.max   = 2.0;
		slider.min   = 0.0;
		slider.value = 1.0
		slider.step  = 0.1;		
		ballDiv.appendChild(slider);

		// COLOR PICKER
		var input = document.createElement('input');
		// input.class = 'jscolor';
		input.classList.add('jscolor');
		input.classList.add('color-picker');
        var picker = new jscolor(input);

        // Adding event to set ball color
        (function(i)
		{
			
			input.addEventListener('change', function(){
	        	console.log(i);
	        	var color = this.style.backgroundColor;
	        	color = color.replace(/[^\d,-]/g, '');
	        	color = color.split(','); // Example format: "123,255,18"

	        	var rawR = parseFloat(color[0]) / 255;
	        	var rawG = parseFloat(color[1]) / 255;
	        	var rawB = parseFloat(color[2]) / 255;

	        	var r = (Math.round(rawR * 10) / 10) / 1.0;
	        	var g = Math.round(rawG * 10) / 10;
	        	var b = Math.round(rawB * 10) / 10;

	        	// var rawR = ( (color[0]) / 255 ).toFixed(1);
	        	// var rawG = ( (color[1]) / 255 ).toFixed(1);
	        	// var rawB = ( (color[2]) / 255 ).toFixed(1);

	        	// var r = parseFloat(rawR);
	        	// var g = Math.round(rawG * 10) / 10;
	        	// var b = Math.round(rawB * 10) / 10;
	        	// console.log(r + " " +rawG + " " +rawB + " ");

	        	console.log(r + " " +g + " " +b + " ");

	        	ballsColors[i] = vec4(r, g, b, 1.0);
        	})

		}(i));

    
		ballDiv.appendChild(input);
		ballControlDiv.appendChild(ballDiv);
	}

	// Adding events to set radius
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








