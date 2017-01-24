$(document).ready(renderCart);

$('.row-cart').on('click', '.btn-number', addSubtractItemQuantity);

function renderCart() {
	var cart = JSON.parse(localStorage.getItem('cart'));

	var cartTableHTML = '';
	var subTotal = 0.00;
	var currency = '€';

	if (cart && cart.length) {
		$.each(cart, function(idx, item) {
			cartTableHTML += getCartTableHTML(item);
			subTotal += (item.price - item.discount) * item.qty;
		});
	}

	$('.row-cart').html(cartTableHTML);
	$('#order-subtotal').html(currency + ' ' + parseFloat(subTotal).toFixed(2));	
	$('#order-total').html(currency + ' ' + parseFloat(subTotal).toFixed(2));
	$('#order-subtotal').data('subtotal', subTotal);
}

function getCartTableHTML(item) {
	var html = '<div class="row row-cart-items mmT">' +
		'<div class="col-md-6">' +
			'<span>' + item.item_name + '</span>' +
		'</div>' +
		'<div class="col-md-6">' +
			'<div class="row">' +
				'<div class="col-md-3">' +
					'<span>' + item.currency + ' ' + parseFloat(item.price).toFixed(2) + '</span>' +
				'</div>' +
				'<div class="col-md-3 block-change-quantity">' +
					getPlusMinusButtonHTML(item.item_id, item.qty) +
				'</div>' +
				'<div class="col-md-3">' +
					'<span class="item-subtotal">' + item.currency + ' ' + parseFloat((item.price - item.discount) * item.qty).toFixed(2) + '</span>' +
				'</div>' +
				'<div class="col-md-3">' +
					'<span class="item-discount">' + item.currency + ' ' + parseFloat(item.discount * item.qty).toFixed(2) + '</span>' +
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

        if(type == 'minus') {

            if(currentVal > input.attr('min')) {
                input.val(currentVal - 1).change();
                $.each(cart, function(idx, item) {
					if (item.item_id == item_id) {
						item.qty = +item.qty - 1;
						subTotal -= (item.price - item.discount);						
						$(itemSubTotalEl).html(item.currency + ' ' + parseFloat((item.price - item.discount) * item.qty).toFixed(2));
						$(itemDiscountEl).html(item.currency + ' ' + parseFloat(item.discount * item.qty).toFixed(2));
						$("#order-subtotal").html(item.currency + ' ' + parseFloat(subTotal).toFixed(2));
						$("#order-total").html(item.currency + ' ' + parseFloat(subTotal).toFixed(2));
						$("#order-subtotal").data('subtotal', subTotal);
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
						$(itemSubTotalEl).html(item.currency + ' ' + parseFloat((item.price - item.discount) * item.qty).toFixed(2));
						$(itemDiscountEl).html(item.currency + ' ' + parseFloat(item.discount * item.qty).toFixed(2));
						$("#order-subtotal").html(item.currency + ' ' + parseFloat(subTotal).toFixed(2));
						$("#order-total").html(item.currency + ' ' + parseFloat(subTotal).toFixed(2));						
						$("#order-subtotal").data('subtotal', subTotal);
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