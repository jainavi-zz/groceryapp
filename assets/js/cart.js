
$('.form-items').submit(function(e) {
	e.preventDefault();
	var item_name = $(this).find('input[name=item_name]').val();
	var price = $(this).find('input[name=amount]').val();
	var discount = $(this).find('input[name=discount_amount]').val();
	var currency = $(this).find('input[name=currency_code]').val();
});
