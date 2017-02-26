$(document).ready(function() {
	validatePasswordResetForm();
})

function validatePasswordResetForm() {
	$('#form-password-reset').bootstrapValidator({
		feedbackIcons: {
			valid: 'glyphicon glyphicon-ok-circle',
			invalid: 'glyphicon glyphicon-remove-cricle',
			validating: 'glyphicon glyphicon-refresh'
		},
		fields: {
			new_password: {
				validators: {
					notEmpty: {
        				message: '*Password is required and cannot be empty'
        			},
					stringLength: {
						min: 5,
						message: '*Password should be at-least 5 characters long'
					},
					identical: {
						field: 'password_confirm',
						message: '*The password and its confirm are not the same'
					}
				}
			},
			password_confirm: {
				validators: {
					notEmpty: {
        				message: '*Password is required and cannot be empty'
        			},
					identical: {
						field: 'new_password',
						message: '*The password and its confirm are not the same'
					}
				}	
			}
		}
	})
	.on('success.form.bv', function(e) {
		e.preventDefault();
		resetPassword();
	});
}

function resetPassword() {
	$.ajax({
		type: 'POST',
		url: '/reset_password',
		data: $('#form-password-reset').serialize(),
		dataType: 'json',
		success: function(response) {
			if (response.status == 'OK') {
				$('.alert').html('<p>Your password has been reset successfully! You may now <a href="/login">Login</a></p>');
				$('.alert').addClass('alert-success');
				$('.alert').removeClass('alert-danger');
				$('.alert').removeClass('hidden');				
			} else if (response.status == 'FAIL') {
				$('.alert').html('<p>' + response.errors[0] + '</p>');
				$('.alert').addClass('alert-danger');
				$('.alert').removeClass('alert-success');
				$('.alert').removeClass('hidden');
			}
		}
	});
}
