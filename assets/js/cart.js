$(document).ready(function() {
	if (localStorage.getItem('cart') == null) {
		$('.cart-item-icon').hide();
	} else {
		$('.cart-item-icon').show();
	}
})

$('.form-items').submit(addItemToCart);
$('#btn-view-cart').click(displayCartModal);

// Delegate events
$('.modal-body').on('click', '.btn-cart-remove', removeItemFromCart);
$('.modal-body').on('click', '.btn-number', addSubtractItemQuantity);

function displayCartModal(e) {
	var orderDiscription = localStorage.getItem('cart');
	var cartHTML = '';

	if (orderDiscription == null) {
		cartHTML = getEmptyCartHTML();
	} else {
		var items = JSON.parse(orderDiscription);
		var subTotal = 0.00;
		var currency = '€';
		items.forEach(function(item) {
			cartHTML += getCartHTML(item, currency);
			subTotal += (item.price - item.discount) * item.qty;
		});

		var subTotalHTML = getSubTotalHTML(currency, subTotal);
	}

	$('#modal-cart .modal-body > ul').html(cartHTML);

	if (orderDiscription) {
		$('#modal-cart .modal-footer').html(subTotalHTML);
	}

	$('#modal-cart').modal({
		backdrop: 'static',
		keyboard: false
	});

	$('#modal-cart').modal('show');
}

function addItemToCart(e) {
	e.preventDefault();

	$('.cart-item-icon').show();
	var itemDetails = {
		item_id: $(this).find('input[name=item_id]').val(),
		item_name: $(this).find('input[name=item_name]').val(),
		price: $(this).find('input[name=amount]').val(),
		discount: $(this).find('input[name=discount_amount]').val(),
		qty: $(this).find('input[name=item_qty]').val()
	};

	var orderDiscription = localStorage.getItem('cart');

	if (orderDiscription == null) {
		localStorage.setItem('cart', JSON.stringify([itemDetails]));
	} else {
		orderDiscription = JSON.parse(orderDiscription);
		var itemFound = false;
		$.each(orderDiscription, function(idx, item) {
			if (item.item_id == itemDetails.item_id) {
				item.qty = +item.qty + +itemDetails.qty;
				itemFound = true;
				return false;
			}
		});

		if (!itemFound) {
			orderDiscription. push(itemDetails);
		}

		localStorage.setItem('cart', JSON.stringify(orderDiscription));
	}
}

function getEmptyCartHTML() {
	return '<p style="font-size: 20px; font-style: italic">Your cart is empty. Please add some items</p>';
}

function getCartHTML(item, currency) {
	var html = '<li class="cart-item">' +
		'<div class="cart-details-name">' +
			'<a class="minicart-name" href="http://127.0.0.1:8000/">' + item.item_name + '</a>' +
			'<ul class="cart-attributes">' +
				'<li>Discount: ' + item.discount + '</li>' +
			'</ul>' +
		'</div>' +
		'<div class="cart-details-quantity">' +
			getPlusMinusButtonHTML(item.item_id, item.qty) +
		'</div>' +
		'<div class="cart-details-remove">' +
			'<span class="glyphicon glyphicon-trash btn-cart-remove msT" aria-hidden="true" data-item_id="' + item.item_id + '"></span>' +
		'</div>' +
		'<div class="cart-details-price">' +
			'<span class="minicart-price">' + currency + ' ' + item.price + '</span>' +
		'</div>'
	'</li>';

	return html;
}

function getSubTotalHTML(currency, subTotal) {
	var html = '<div id="cart-subtotal" class="cart-subtotal" data-subtotal="' + subTotal + '">' +
		'Subtotal: ' + currency + parseFloat(subTotal).toFixed(2) + '</div>';
	html += '<a href="checkout" type="button" class="btn btn-success btn-green">Checkout</a>';

	return html;
}

function getPlusMinusButtonHTML(item_id, qty) {
	return '<div class="input-group">' +
		'<span class="input-group-btn">' +
		'<button type="button" class="btn btn-danger btn-number"  data-type="minus" data-item_id="' + item_id + '">' +
		'<span class="glyphicon glyphicon-minus" style="top: -2px; right: 7px;"></span>' +
		'</button>' +
		'</span>' +
		'<input type="text" name="item-qty" style="width: 47px; height: 25px;" class="form-control input-number" value="' + qty + '" min="1" max="100">' +
		'<span class="input-group-btn">' +
		'<button type="button" class="btn btn-success grocery-green btn-number" style="margin-right: 13px;" data-type="plus" data-item_id="' + item_id + '">' +
		'<span class="glyphicon glyphicon-plus" style="top: -2px; right: 7px;"></span>' +
		'</button>' +
		'</span>' +
	'</div>';
}

function removeItemFromCart() {
	var cart = JSON.parse(localStorage.getItem('cart'));

	if(cart.length == 1) {
		$('.cart-item-icon').hide();
		$('#modal-cart .modal-body > ul').html(getEmptyCartHTML());
		$('#modal-cart .modal-footer').empty();
		localStorage.removeItem('cart');
	} else {
		var item_id = $(this).data('item_id');
		$(this).closest('.cart-item').remove();
		$.each(cart, function(idx, item) {
			if (item.item_id == item_id) {
				var subTotal = parseFloat($("#cart-subtotal").data('subtotal'));
				subTotal -= (item.price - item.discount) * item.qty;
				$("#cart-subtotal").data('subtotal', subTotal);
				$("#cart-subtotal").html('Subtotal: €' + parseFloat(subTotal).toFixed(2));
				cart.splice(idx, 1);
				return false;
			}
		});
		localStorage.setItem('cart', JSON.stringify(cart));
	}
}

function addSubtractItemQuantity() {
	type      	= $(this).attr('data-type');
    var input 	= $("input[name=item-qty]");
    var item_id = $(this).data('item_id');
    var currentVal = parseInt(input.val());

    if (!isNaN(currentVal)) {
    	var orderDiscription = JSON.parse(localStorage.getItem('cart'));
    	var subTotal = parseFloat($("#cart-subtotal").data('subtotal'));

        if(type == 'minus') {

            if(currentVal > input.attr('min')) {
                input.val(currentVal - 1).change();
                $.each(orderDiscription, function(idx, item) {
					if (item.item_id == item_id) {
						item.qty = +item.qty - 1;
						subTotal -= (item.price - item.discount);
						$("#cart-subtotal").data('subtotal', subTotal);
						$("#cart-subtotal").html('Subtotal: €' + parseFloat(subTotal).toFixed(2));
						return false;
					}
				});
				localStorage.setItem('cart', JSON.stringify(orderDiscription));
            }
            if(parseInt(input.val()) == input.attr('min')) {
                $(this).attr('disabled', true);
            }

        } else if(type == 'plus') {
            if(currentVal < input.attr('max')) {
                input.val(currentVal + 1).change();
                $.each(orderDiscription, function(idx, item) {
					if (item.item_id == item_id) {
						item.qty = +item.qty + 1;
						subTotal += (item.price - item.discount);
						$("#cart-subtotal").data('subtotal', subTotal);
						$("#cart-subtotal").html('Subtotal: €' + parseFloat(subTotal).toFixed(2));
						return false;
					}
				});
				localStorage.setItem('cart', JSON.stringify(orderDiscription));
            }
            if(parseInt(input.val()) == input.attr('max')) {
                $(this).attr('disabled', true);
            }

        }
    } else {
        input.val(0);
    }
}

$('.modal-body').on('focus', '.input-number', function() {
   $(this).data('oldValue', $(this).val());
});

$('.modal-body').on('change', '.input-number', function() {
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

$('.modal-body').on('keydown', '.input-number', function (e) {
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
