
$('#form-singup').submit(function(e) {
	e.preventDefault();
	$.ajax({
		type: 'POST',
		url: '/signup',
		data: $('#form-singup').serialize(),
		dataType: 'json',
		success: function(response) {
			console.log(response)
		}
	});
});

$('.toggle').click(function(){
	// Switches the Icon
	$(this).children('i').toggleClass('fa-pencil');
	// Switches the forms
	$('.form').animate({
		height: "toggle",
		'padding-top': 'toggle',
		'padding-bottom': 'toggle',
		opacity: "toggle"
	}, "slow");
});

$('.cta a').click(function(e) {
	e.preventDefault();

	$('#modal-forgot-password').modal({
		backdrop: 'static',
		keyboard: false
	});
	$('#modal-forgot-password').modal('show');
});

$('#form-forgot-password').submit(function(e) {
	e.preventDefault();
	console.log('Yahoo!');
});
