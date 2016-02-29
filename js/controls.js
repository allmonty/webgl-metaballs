// var radios = document.forms["formA"].elements["myradio"];
// for(var i = 0, max = radios.length; i < max; i++) {
//     radios[i].onclick = function() {
//         alert(this.value);
//     }
// }

function initControls()
{
	specularControls();
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
