$(document).ready(initFormValidtor);

function initFormValidtor() {
	$('#form-track-order').bootstrapValidator({
		feedbackIcons: {
            valid: 'glyphicon glyphicon-ok-circle',
            invalid: 'glyphicon glyphicon-remove-cricle',
            validating: 'glyphicon glyphicon-refresh'
        },
        fields: {
        	email: {
        		validators: {
        			notEmpty: {
        				message: '*Email is required and cannot be empty'
        			},
        			emailAddress: {
        				message: '*The email address is not valid'
        			}
        		}
        	},
        	order_id: {
        		validators: {
        			notEmpty: {
        				message: '*Order number is required and cannot be empty'
        			},
        			integer: {
        				message: '*Please provide a valid order number'
        			}
        		}
        	}
        }
	})
	.on('success.form.bv', function(e) {
		// Prevent form submission
		e.preventDefault();
		fetchOrderDetails();
	});
}

function fetchOrderDetails() {
	var form = $('#form-track-order');
	var payload = getFormData(form);
	console.log(JSON.stringify(payload));
}
