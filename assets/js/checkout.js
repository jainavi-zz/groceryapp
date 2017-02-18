$(document).ready(renderCart);

$('.row-cart').on('click', '.btn-number', addSubtractItemQuantity);

$('#btn-place-order').click(placeOrder);

function placeOrder() {

	$('.form-delivery').submit();

	var isValid = $('.form-delivery').has('.has-error').length == 0;
	if (isValid) {
		var street = $('#street').val();
		var house_number = $('#house').val();
		var city = $('#city').val();
		var postal_code = $('#postal_code').val();
		var delivery_address = street + ' ' + house_number + ', ' + city + ' - ' + postal_code;

		var order_description = JSON.parse(localStorage.getItem('cart'));
		order_description.forEach(function(item) { delete item.item_name; });

		var payload = {
			order_summary: {
				customer_email: $('#customer_email').val(),
				delivery_address: delivery_address,
				phone: $('#phone').val(),
				net_bill: $('#order-subtotal').data('subtotal'),
				net_discount: $('#total-discount').data('totaldiscount'),
				currency_code: 'EUR',
				payment_option: "1"
			},
			order_description: order_description
		};

		$.ajax({
			type: 'POST',
			url: '/order',
			data: JSON.stringify(payload),
			contentType: 'application/json',
			dataType: 'json',
			success: function(response) {
				if (response.status == 'OK') {
					localStorage.removeItem('cart');
					//TODO: Show success message;
				} else {

				}
			}
		});
	}
}

function validateDeliveryForm() {
	$('.form-delivery').bootstrapValidator({
		feedbackIcons: {
            valid: 'glyphicon glyphicon-ok',
            invalid: 'glyphicon glyphicon-remove',
            validating: 'glyphicon glyphicon-refresh'
        },
        fields: {
        	customer_name: {
        		validators: {
        			notEmpty: {
        				message: 'The full name is required and cannot be empty'
        			}
        		}
        	},
        	customer_email: {
        		validators: {
        			notEmpty: {
        				message: 'The email address is required and cannot be empty'
        			},
        			emailAddress: {
                        message: 'The email address is not valid'
                    }
        		}
        	},
        	phone: {
        		validators: {
        			notEmpty: {
        				message: 'Please supply your phone number'
        			},
        			phone: {
                        country: 'DE',
                        message: 'Please supply a vaild phone number with area code'
                    }
        		}
        	},
        	street: {
        		validators: {
        			stringLength: {
                        min: 6,
                    },
                    notEmpty: {
                        message: 'Please supply your street address'
                    }
        		}
        	},
        	city: {
                validators: {
                     stringLength: {
                        min: 4,
                    },
                    notEmpty: {
                        message: 'Please supply your city'
                    }
                }
            },
            postal_code: {
                validators: {
                    notEmpty: {
                        message: 'Please supply your zip code'
                    },
                    zipCode: {
                        country: 'DE',
                        message: 'Please supply a vaild zip code'
                    }
                }
            }
        }
	});
}

function renderCart() {
	var cart = JSON.parse(localStorage.getItem('cart'));

	var cartTableHTML = '';
	var subTotal = 0.00;
	var totalDiscount = 0.00;
	var currency = '€';

	if (cart && cart.length) {
		$.each(cart, function(idx, item) {
			cartTableHTML += getCartTableHTML(item, currency);
			subTotal += (item.price - item.discount) * item.qty;
			totalDiscount += item.discount * item.qty;
		});
	}

	$('.row-cart').html(cartTableHTML);
	$('#order-subtotal').html(currency + ' ' + parseFloat(subTotal).toFixed(2));	
	$('#order-total').html(currency + ' ' + parseFloat(subTotal).toFixed(2));
	$('#total-discount').html(currency + ' ' + parseFloat(totalDiscount).toFixed(2));
	$('#order-subtotal').data('subtotal', subTotal);
	$('#total-discount').data('totaldiscount', totalDiscount);

	validateDeliveryForm();
}

function getCartTableHTML(item, currency) {
	var html = '<div class="row row-cart-items mmT">' +
		'<div class="col-md-6">' +
			'<span>' + item.item_name + '</span>' +
		'</div>' +
		'<div class="col-md-6">' +
			'<div class="row">' +
				'<div class="col-md-3">' +
					'<span>' + currency + ' ' + parseFloat(item.price).toFixed(2) + '</span>' +
				'</div>' +
				'<div class="col-md-3 block-change-quantity">' +
					getPlusMinusButtonHTML(item.item_id, item.qty) +
				'</div>' +
				'<div class="col-md-3">' +
					'<span class="item-subtotal">' + currency + ' ' + parseFloat((item.price - item.discount) * item.qty).toFixed(2) + '</span>' +
				'</div>' +
				'<div class="col-md-3">' +
					'<span class="item-discount">' + currency + ' ' + parseFloat(item.discount * item.qty).toFixed(2) + '</span>' +
				'</div>' +
			'</div>' +
		'</div>' +
	'</div>' +
	'<hr class="mmT mnB">';

	return html;
}

function getPlusMinusButtonHTML(item_id, qty) {
	return '<div class="input-group">' +
		'<span class="input-group-btn">' +
		'<button type="button" class="btn btn-number btn-quantity"  data-type="minus" data-item_id="' + item_id + '">' +
		'<span class="glyphicon glyphicon-minus" style="top: -2px; right: 7px;"></span>' +
		'</button>' +
		'</span>' +
		'<input type="text" name="item-qty" class="form-control input-number" value="' + qty + '" min="1" max="100">' +
		'<span class="input-group-btn">' +
		'<button type="button" class="btn btn-number btn-quantity" data-type="plus" data-item_id="' + item_id + '">' +
		'<span class="glyphicon glyphicon-plus" style="top: -2px; right: 7px;"></span>' +
		'</button>' +
		'</span>' +
	'</div>';
}

function addSubtractItemQuantity() {
	var type      	= $(this).data('type');
    var input 	= $("input[name=item-qty]");
    var item_id = $(this).data('item_id');
    var currentVal = parseInt(input.val());
    var itemSubTotalEl = $(this).parents('.block-change-quantity').next().find('.item-subtotal');
    var itemDiscountEl = $(this).parents('.block-change-quantity').next().next().find('.item-discount');

    if (!isNaN(currentVal)) {
    	var cart = JSON.parse(localStorage.getItem('cart'));
    	var subTotal = parseFloat($("#order-subtotal").data('subtotal'));
		var totalDiscount = parseFloat($("#total-discount").data('totaldiscount'));

        if(type == 'minus') {

            if(currentVal > input.attr('min')) {
                input.val(currentVal - 1).change();
                $.each(cart, function(idx, item) {
					if (item.item_id == item_id) {
						item.qty = +item.qty - 1;
						subTotal -= (item.price - item.discount);
						totalDiscount -= item.discount;
						$(itemSubTotalEl).html(item.currency + ' ' + parseFloat((item.price - item.discount) * item.qty).toFixed(2));
						$(itemDiscountEl).html(item.currency + ' ' + parseFloat(item.discount * item.qty).toFixed(2));
						$("#order-subtotal").html(item.currency + ' ' + parseFloat(subTotal).toFixed(2));
						$("#order-total").html(item.currency + ' ' + parseFloat(subTotal).toFixed(2));
						$('#total-discount').html(item.currency + ' ' + parseFloat(totalDiscount).toFixed(2));
						$("#order-subtotal").data('subtotal', subTotal);
						$('#total-discount').data('totaldiscount', totalDiscount);
						return false;
					}
				});
				localStorage.setItem('cart', JSON.stringify(cart));
            }
            if(parseInt(input.val()) == input.attr('min')) {
                $(this).attr('disabled', true);
            }

        } else if(type == 'plus') {
            if(currentVal < input.attr('max')) {
                input.val(currentVal + 1).change();
                $.each(cart, function(idx, item) {
					if (item.item_id == item_id) {
						item.qty = +item.qty + 1;
						subTotal += (item.price - item.discount);
						totalDiscount += +item.discount;
						$(itemSubTotalEl).html(item.currency + ' ' + parseFloat((item.price - item.discount) * item.qty).toFixed(2));
						$(itemDiscountEl).html(item.currency + ' ' + parseFloat(item.discount * item.qty).toFixed(2));
						$("#order-subtotal").html(item.currency + ' ' + parseFloat(subTotal).toFixed(2));
						$("#order-total").html(item.currency + ' ' + parseFloat(subTotal).toFixed(2));
						$('#total-discount').html(item.currency + ' ' + parseFloat(totalDiscount).toFixed(2));
						$("#order-subtotal").data('subtotal', subTotal);
						$('#total-discount').data('totaldiscount', totalDiscount);
						return false;
					}
				});
				localStorage.setItem('cart', JSON.stringify(cart));
            }
            if(parseInt(input.val()) == input.attr('max')) {
                $(this).attr('disabled', true);
            }

        }
    } else {
        input.val(0);
    }
}

$('.row-cart').on('focus', '.input-number', function() {
   $(this).data('oldValue', $(this).val());
});

$('.row-cart').on('change', '.input-number', function() {
    minValue =  parseInt($(this).attr('min'));
    maxValue =  parseInt($(this).attr('max'));
    valueCurrent = parseInt($(this).val());

    name = $(this).attr('name');
    if(valueCurrent >= minValue) {
        $(".btn-number[data-type='minus']").removeAttr('disabled')
    } else {
        alert('Sorry, the minimum value was reached');
        $(this).val($(this).data('oldValue'));
    }
    if(valueCurrent <= maxValue) {
        $(".btn-number[data-type='plus']").removeAttr('disabled')
    } else {
        alert('Sorry, the maximum value was reached');
        $(this).val($(this).data('oldValue'));
    }
});

$('.row-cart').on('keydown', '.input-number', function (e) {
        // Allow: backspace, delete, tab, escape, enter and .
    if ($.inArray(e.keyCode, [46, 8, 9, 27, 13, 190]) !== -1 ||
         // Allow: Ctrl+A
        (e.keyCode == 65 && e.ctrlKey === true) ||
         // Allow: home, end, left, right
        (e.keyCode >= 35 && e.keyCode <= 39)) {
             // let it happen, don't do anything
             return;
    }
    // Ensure that it is a number and stop the keypress
    if ((e.shiftKey || (e.keyCode < 48 || e.keyCode > 57)) && (e.keyCode < 96 || e.keyCode > 105)) {
        e.preventDefault();
    }
});