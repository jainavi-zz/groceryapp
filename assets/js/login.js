
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
	$('.modal-footer > small').addClass('hidden');
	$('#modal-forgot-password').modal('show');
});

$('#form-forgot-password').submit(function(e) {
	e.preventDefault();

	$.ajax({
		type: 'POST',
		url: '/password_forgot',
		data: $('#form-forgot-password').serialize(),
		dataType: 'json',
		success: function(response) {
			if (response.status == 'OK') {
				$('.modal-content').css({ 'height': '250px' });
				$('.modal-body').html('<p>We have sent a password reset email to <b>' +
					$('#form-forgot-password input[name=email]').val() +
					'</b></p>' +
					'<p class="mxlT">Please check your inbox to continue</p>'
				);
			} else if (response.status == 'FAIL') {
				$('.modal-footer > small').html(response.errors);
				$('.modal-footer > small').removeClass('hidden');
			}
		}
	});
});
