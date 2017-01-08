
$('#singup-form').submit(function(e) {
	e.preventDefault();
	$.ajax({
		type: 'POST',
		url: '/signup',
		data: $('#singup-form').serialize(),
		dataType: 'json',
		success: function(response) {
			console.log(response)
		}
	});
});
