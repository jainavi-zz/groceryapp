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
		$('.alert-danger').addClass('hidden');
		$('.row-order-details').addClass('hidden');
		$('#btn-track-order > img').removeClass('hidden');
		fetchOrderDetails();
	});
}

function fetchOrderDetails() {
	var form = $('#form-track-order');
	var payload = getFormData(form);
	$.ajax({
		type: 'POST',
		url: '/trackmyorder',
		data: JSON.stringify(payload),
		contentType: 'application/json',
		dataType: 'json',
		success: function(response) {
			$('#btn-track-order > img').addClass('hidden');
			if (response.status == 'OK') {
				renderOrderSummary(response.data, payload.order_id);
			} else {
				$('.alert-danger').removeClass('hidden');
			}
		}
	});
}

function renderOrderSummary(data, order_id) {
	var html = '<td>' + order_id + '</td>' +
		'<td class="text-center">' + 'Mr. John Doe' + '</td>' +
		'<td class="text-center">21-02-2017 7:30 PM</td>' +
		'<td class="text-center">' + data.delivery_address + '</td>' +
		'<td class="text-center">' + data.status + '</td>' +
		'<td class="text-right">' + getCurrencySymbol(data.currency_code) + ' ' + parseFloat(data.net_bill).toFixed(2) + '</td>';

	$('tr.thick-line').html(html);
	$('.row-order-details').removeClass('hidden');
}
