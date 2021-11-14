var ba_jQuery = jQuery;

ba_jQuery(document).ready(function(){
    ba_jQuery('.com-baforms').each(function(){
        var baForm = ba_jQuery(this),
            dialogColor = ba_jQuery(this).find('.message-modal .dialog-color').val(),
            messageModal = ba_jQuery(this).find('.message-modal'),
            form = baForm.find('form'),
            files,
            iframe,
            baTotal = baForm.find('.ba-total-price'),
            cart = baForm.find('.baforms-cart'),
            symbol = baForm.find('.cart-currency').val(),
            symbolPos = baForm.find('.cart-position').val(),
            stripe;

        baForm.find('.ba-tooltip').parent().on('mouseenter', function(){
            var coord = this.getBoundingClientRect(),
                top = coord.top,
                left = coord.left;
            left = left + (coord.right - coord.left) / 2;
            jQuery(this).find('.ba-tooltip').css({
                'top' : top+'px',
                'left' : left+'px'
            })
        });

        baForm.find('input[data-type="calculation"]').on('keyup', function(){
            if (baTotal.length == 0) {
                return;
            }
            var price = ba_jQuery(this).val() * 1,
                name = ba_jQuery(this).attr('name'),
                total = baTotal.find('.ba-price').text()*1,
                label = '';
            if (ba_jQuery(this).closest('.tool').find('> label').length > 0){
                label = ba_jQuery(this).closest('.tool').find('> label > span')[0].innerText;
                label = label.replace(' *', '');
            }
            if (isNaN(price)) {
                ba_jQuery(this).addClass('ba-alert');
                if (prices[name]) {
                    var quantity = 1
                    if (cart.length > 0) {
                        if (cart.find('.product-cell[data-id="'+name+'"]').length > 0) {
                            quantity = Math.round(cart.find('.product-cell[data-id="'+name+'"] .quantity input').val());
                            cart.find('.product-cell[data-id="'+name+'"]').remove();
                        }
                    }
                    total = total - prices[name]  * quantity;
                    prices[name] = 0;
                    total = Math.round10(total, -2);
                    baTotal.find('.ba-price').text(total);
                    baTotal.find('input[name="ba_total"]').val(total);
                }                
                return false;
            }
            ba_jQuery(this).removeClass('ba-alert');
            if (price > 999999999) {
                price = 999999999;
                jQuery(this).val(price)
            }
            if (!label) {
                label = ba_jQuery(this).attr('placeholder');
            }
            if (prices[name]) {
                var quantity = 1
                if (cart.length > 0) {
                    quantity = Math.round(cart.find('.product-cell[data-id="'+name+'"] .quantity input').val());
                    cart.find('.product-cell[data-id="'+name+'"]').remove();
                }
                total = total - prices[name]  * quantity;
            }
            var value;
            if (symbolPos == 'before') {
                value = symbol+price;
            } else {
                value = price+symbol
            }
            addToCart(label, value, name, price);
            if (price == 0) {
                cart.find('.product-cell[data-id="'+name+'"]').remove();
            }
            cart.find('.product-cell[data-id="'+name+'"] .remove-item i').on('click', function(){
                
            });
            prices[name] = price * 1;
            total = total + price * 1;
            total = Math.round10(total, -2);
            baTotal.find('.ba-price').text(total);
            baTotal.find('input[name="ba_total"]').val(total);
        });

        baForm.find('input').on('keydown', function(event){
            if (event.keyCode == 13) {
                event.preventDefault();
                event.stopPropagation();
            }
        });

        baForm.find('.ba-address').each(function(){
            var input = jQuery(this).find('input[type="text"]'),
                autocomplete = new google.maps.places.Autocomplete(input[0]);
        });

        function conditionShow()
        {
            baForm.find('.ba-dropdown > select, .ba-dropdown > .container-icon select').on('change', function(){
                var parent = jQuery(this).closest('.ba-dropdown'),
                    height = 20;                
                if (parent.find('> .condition-area').length == 0) {
                    return;
                }
                jQuery(this).find('option').each(function(ind, el){
                    if (jQuery(this).prop('selected')) {
                        var h,
                            flag = false;
                        if (ind > 0) {
                            ind = ind - 1;
                            flag = true;
                        }
                        parent.parentsUntil('.ba-row').each(function(){
                            this.style.height = '';
                        });
                        if (parent.find('> .condition-area.selected').length > 0) {
                            parent.find('> .condition-area.selected').addClass('close-condition');
                            height = parent.find('.close-condition').height();
                            parent.find(' > [data-condition="'+ind+'"]').height(height);
                            parent.find('> .condition-area').removeClass('selected');
                            parent.find('> .condition-area .condition-area').removeClass('selected');
                        } else {
                            parent.find(' > [data-condition="'+ind+'"]').height(0);
                        }
                        if (flag && parent.find(' > [data-condition="'+ind+'"]').length > 0) {
                            parent.find(' > [data-condition="'+ind+'"]').addClass('selected');
                            parent.find(' > [data-condition="'+ind+'"]')[0].style.height = '';
                            h = parent.find(' > [data-condition="'+ind+'"]').height();
                            parent.find(' > [data-condition="'+ind+'"]').animate({
                                'height' : h * 1 + 3
                            }, 600, function(){
                                parent.find('.close-condition').removeClass('close-condition');
                                var top = parent.find(' > [data-condition="'+ind+'"]').position().top;
                                parent.find(' > [data-condition="'+ind+'"]').css('top', top+'px');
                                parent.closest('.ba-form')[0].style.height = '';
                                height = parent.closest('.ba-form').height();
                                parent.closest('.ba-form').height(height);
                            })
                            parent.closest('.ba-form')[0].style.height = '';
                        }
                        if (!flag || parent.find(' > [data-condition="'+ind+'"]').length == 0) {
                            parent.css('margin-bottom', height+'px');
                            parent.animate({
                                'margin-bottom' : 20
                            }, 600, function(){
                                parent.find('.close-condition').removeClass('close-condition');
                                parent.closest('.ba-form')[0].style.height = '';
                                height = parent.closest('.ba-form').height();
                                parent.closest('.ba-form').height(height);
                            });
                            parent.closest('.ba-form')[0].style.height = '';
                        }
                        var item = parent.find('> .condition-area');
                        clearCondition(item);
                        return false;
                    }
                });
                refreshMap();
            });
            baForm.find('.ba-radioInline > span input, .ba-radioMultiple > span input').on('change', function(){
                var parent = jQuery(this).closest('.tool'),
                    height = 20,
                    $this = this;
                if (parent.find('> .condition-area').length == 0) {
                    return;
                }
                parent.find(' > span input').each(function(ind){
                    if (this == $this) {
                        var h = parent.find(' > [data-condition="'+ind+'"]').height();
                        parent.parentsUntil('.ba-row').each(function(){
                            this.style.height = '';
                        });
                        if (parent.find('> .condition-area.selected').length > 0) {
                            parent.find('> .condition-area.selected').addClass('close-condition');
                            height = parent.find('.close-condition').height();
                            parent.find(' > [data-condition="'+ind+'"]').height(height);
                            parent.find('> .condition-area').removeClass('selected');
                            parent.find('> .condition-area .condition-area').removeClass('selected');
                        } else {
                            parent.find(' > [data-condition="'+ind+'"]').height(0);
                        }
                        parent.find(' > [data-condition="'+ind+'"]').addClass('selected').animate({
                            'height' : h * 1 + 3
                        }, 600, function(){
                            parent.find('.close-condition').removeClass('close-condition');
                            var top = parent.find(' > [data-condition="'+ind+'"]').position().top;
                            parent.find(' > [data-condition="'+ind+'"]').css('top', top+'px');
                            parent.closest('.ba-form')[0].style.height = '';
                            height = parent.closest('.ba-form').height();
                            parent.closest('.ba-form').height(height);
                        })
                        parent.closest('.ba-form')[0].style.height = '';
                        if (parent.find(' > [data-condition="'+ind+'"]').length == 0) {
                            parent.css('margin-bottom', height+'px');
                            parent.animate({
                                'margin-bottom' : 20
                            }, 600, function(){
                                parent.find('.close-condition').removeClass('close-condition');
                                parent.closest('.ba-form')[0].style.height = '';
                                height = parent.closest('.ba-form').height();
                                parent.closest('.ba-form').height(height);
                            })
                        }
                        var item = parent.find('> .condition-area');
                        clearCondition(item);
                        return false;
                    }
                });
                refreshMap();
            });
        }

        function clearCondition(item)
        {
            var total = baTotal.find('input[name="ba_total"]').val(),
                totalPrice = 0;
            item.find('.ba-alert').removeClass('ba-alert');
            item.find('input').each(function(){
                var type = ba_jQuery(this).attr('type');
                if (type == 'radio' || type == 'checkbox') {
                    if (ba_jQuery(this).prop('checked') && ba_jQuery(this).attr('data-price')) {
                        totalPrice += ba_jQuery(this).attr('data-price') * 1;
                        var name = this.name;
                        if (prices[name]) {
                            delete(prices[name]);
                        }
                        cart.find('.product-cell[data-id="'+name+'"]').find('.remove-item i.zmdi').trigger('click');
                    }
                    ba_jQuery(this).removeAttr('checked');
                }
                if (type == 'email') {
                    ba_jQuery(this).val('');
                }
                if (ba_jQuery(this).parent().hasClass('ba-textInput') || ba_jQuery(this).parent().parent().hasClass('ba-textInput')) {
                    ba_jQuery(this).val('');
                }
            });
            item.find('textarea').each(function () {
                ba_jQuery(this).val('');
            });
            item.find('select').each(function(){
                ba_jQuery(this).find('option').each(function(){
                    if (ba_jQuery(this).prop('selected') && ba_jQuery(this).attr('data-price')) {
                        totalPrice += ba_jQuery(this).attr('data-price') * 1;
                        var name = jQuery(this).parent()[0].name.replace('[]', '');
                        if (prices[name]) {
                            delete(prices[name]);
                        }
                        cart.find('.product-cell[data-id="'+name+'"]').find('.remove-item i.zmdi').trigger('click');
                    }
                    ba_jQuery(this).removeAttr('selected');
                });
            });
            total = total - totalPrice;
            baTotal.find('input[name="ba_total"]').val(total);
            baTotal.find('.ba-price').text(total);
        }
        
        function refreshMap()
        {
            ba_jQuery('.ba-map.tool').each(function(){
                var options = ba_jQuery(this).parent().find('.ba-options').val(),
                    zoom = true,
                    draggable = true,
                    image;
                options = options.replace('-_-', "'");
                options = options.split(';');
                if (options[8] == 0) {
                    zoom = false;
                }
                if (options[9] == 0) {
                    draggable = false;
                }
                if (options[0] != '') {
                    var option = JSON.parse(options[0]);
                    if (typeof(option.center) == 'string') {
                        option.center = option.center.split(',');
                        option.center = {
                            lat : option.center[0]*1,
                            lng : option.center[1]*1
                        }
                    }
                    if (options[6] == 1) {
                        option.scrollwheel = zoom;
                        option.navigationControl = true;
                        option.mapTypeControl = true;
                        option.scaleControl = true;
                        option.draggable = draggable;
                        option.zoomControl = true;
                        option.disableDefaultUI = false;
                        option.disableDoubleClickZoom = false;
                    }
                } else {
                    if (options[6] == 0) {
                        option = {
                            center : {
                                lat : 42.345573,
                                lng : -71.098326
                            },
                            zoom: 14,
                            scrollwheel: zoom,
                            navigationControl: false,
                            mapTypeControl: false,
                            scaleControl: false,
                            draggable: draggable,
                            zoomControl: false,
                            disableDefaultUI: true,
                            disableDoubleClickZoom: true,
                        }
                    } else {
                        option = {
                            center : {
                                lat : 42.345573,
                                lng : -71.098326
                            },
                            zoom: 14,
                            scrollwheel: zoom,
                            navigationControl: true,
                            mapTypeControl: true,
                            scaleControl: true,
                            draggable: draggable,
                            zoomControl: true,
                            disableDefaultUI: false,
                            disableDoubleClickZoom: false,
                        }
                    }
                }
                if (options[7] != '') {
                    image = ba_jQuery('.admin-dirrectory').val()+options[7];
                } else {
                    image = options[7];
                }
                var content = options[2],
                    flag = options[5],
                    map = new google.maps.Map(jQuery(this)[0], option),
                    marker = '';
                if (options[1] != '') {
                    var mark = JSON.parse(options[1]);
                    var keys = [];
                    for (var key in mark) {
                        keys.push(key);
                    }
                    marker = new google.maps.Marker({
                        position: {
                            lat : mark[keys[0]]*1,
                            lng : mark[keys[1]]*1
                        },
                        map: map,
                        icon : image
                    });
                    if (content != '') {
                        var infowindow = new google.maps.InfoWindow({
                            content : content
                        });
                        if (flag == 1) {
                            infowindow.open(map, marker);
                        }
                        marker.addListener('click', function(event){
                            infowindow.open(map, marker);
                        });
                    }
                }
            });
        }
        
        function prepareUpload(event)
        {
            ba_jQuery(this).parent().find('.upl-error').val('');
            ba_jQuery(this).removeClass('ba-alert');
            files = event.target.files;
            if (files.length != 0) {
                var size = ba_jQuery(this).parent().find('.upl-size').val(),
                    types = ba_jQuery(this).parent().find('.upl-type').val(),
                    len = files.length,
                    tLen;
                types = types.split(',');
                size = 1048576 * size;
                tLen = types.length;
                for (var i = 0; i < len; i++) {
                    if (files[i].size < size) {
                        var type = files[i].name.split('.'),
                            flag = true;
                        type = type[type.length-1].toLowerCase()
                        for (var j = 0; j < tLen; j++) {
                            if (type != ba_jQuery.trim(types[j].toLowerCase())) {
                                flag = false;
                            } else {
                                flag = true;
                                break;
                            }
                        }
                        if (!flag) {
                            ba_jQuery(this).addClass('ba-alert');
                            ba_jQuery(this).parent().find('.upl-error').val('error');
                            break;
                        }
                    }  else {
                        ba_jQuery(this).addClass('ba-alert');
                        ba_jQuery(this).parent().find('.upl-error').val('error');
                        break;
                    }
                }
            } else {
                if (ba_jQuery(this).prop('required')) {
                    ba_jQuery(this).parent().find('.upl-error').val('error');
                    ba_jQuery(this).addClass('ba-alert');
                } else {
                    ba_jQuery(this).parent().find('.upl-error').val('');
                    ba_jQuery(this).removeClass('ba-alert');
                }                
            }
        }

        function checkAlert(item)
        {
            item.find('.tool').each(function() {
                var tool = ba_jQuery(this),
                    condArea = jQuery(this).closest('.condition-area');
                if (condArea.length > 0 && !condArea.hasClass('selected')) {
                    return;
                }
                if (tool.hasClass('ba-email')) {
                    var reg = /^\w+([\.-]?\w+)*@\w+([\.-]?\w+)*(\.\w{2,6})+$/,
                        value = tool.find('input[type="email"]').val();
                    if(!reg.test(value)) {
                        tool.find('input[type="email"]').addClass('ba-alert');
                    } else {
                        tool.find('input[type="email"]').removeClass('ba-alert');
                    }
                } else if (tool.hasClass('ba-upload')) {
                    var item = tool.find('.ba-upload')
                        required = item.prop('required'),
                        value = item.val();
                    if (tool.find('.upl-error').val() == 'error' || (required && item[0].files.length == 0)) {
                        item.addClass('ba-alert');
                    } else {
                        item.removeClass('ba-alert');
                    }                    
                } else if (tool.hasClass('ba-textarea')) {
                    var required = tool.find('textarea').prop('required'),
                        value = tool.find('textarea').val();
                    if (required) {
                        if(ba_jQuery.trim(value) == '') {
                            tool.find('textarea').addClass('ba-alert');
                        } else {
                            tool.find('textarea').removeClass('ba-alert');
                        }
                    }
                } else if (tool.hasClass('ba-textInput')) {
                    var required = tool.find('input[type="text"]').prop('required'),
                        type = tool.find('input[type="text"]').attr('data-type'),
                        value = tool.find('input[type="text"]').val();
                    if (required) {
                        if(ba_jQuery.trim(value) == '') {
                            tool.find('input[type="text"]').addClass('ba-alert');
                        } else {
                            if (type == 'number') {
                                if (ba_jQuery.isNumeric(value)) {
                                    tool.find('input[type="text"]').removeClass('ba-alert');
                                } else {
                                    tool.find('input[type="text"]').addClass('ba-alert');
                                }
                            } else {
                                tool.find('input[type="text"]').removeClass('ba-alert');
                            }
                        }
                    }
                } else if (tool.hasClass('ba-chekInline') || tool.hasClass('ba-checkMultiple')) {
                    var checkFlag = false;
                    if (tool.find('.required').length == 0) {
                        return;
                    }
                    tool.find('.required input[type="checkbox"]').each(function(){
                        if (ba_jQuery(this).prop('checked')) {
                            checkFlag = true;
                            return false;
                        }
                    });
                    if(!checkFlag) {
                        tool.addClass('ba-alert');
                    } else {
                        tool.removeClass('ba-alert');
                    }
                } else if (tool.hasClass('ba-radioInline') || tool.hasClass('ba-radioMultiple')) {
                    var checkFlag = false,
                        required = tool.find(' > span input[type="radio"]').first().prop('required');
                    if (required) {
                        tool.find(' > span input[type="radio"]').each(function(){
                            if (ba_jQuery(this).prop('checked')) {
                                checkFlag = true;
                                return false;
                            }
                        });
                        if(!checkFlag) {
                            tool.addClass('ba-alert');
                        } else {
                            tool.removeClass('ba-alert');
                        }
                    }                    
                } else if (tool.hasClass('ba-dropdown') || tool.hasClass('ba-selectMultiple')) {
                    var select = tool.find('> select'),
                        checkFlag = false,
                        required;
                    if (select.length == 0) {
                        select = tool.find('> .container-icon select');
                    }
                    required = select.prop('required');
                    if (required) {
                        select.find('option').each(function(){
                            if (ba_jQuery(this).prop('selected') && ba_jQuery(this).val()) {
                                checkFlag = true;
                                return false;
                            }
                        });
                        if(!checkFlag) {
                            select.addClass('ba-alert');
                        } else {
                            select.removeClass('ba-alert');
                        }
                    }
                } else if (tool.hasClass('ba-address')) {
                    var required = tool.find('input[type="text"]').prop('required'),
                        value = tool.find('input[type="text"]').val();
                    if (required) {
                        if(ba_jQuery.trim(value) == '') {
                            tool.find('input[type="text"]').addClass('ba-alert');
                        } else {
                            tool.find('input[type="text"]').removeClass('ba-alert');
                        }
                    }
                } else if (tool.hasClass('ba-date')) {
                    var required = tool.hasClass('required'),
                        value = tool.find('input[type="text"]').val();
                    if (required) {
                        if(ba_jQuery.trim(value) == '') {
                            tool.find('input[type="text"]').addClass('ba-alert');
                        } else {
                            tool.find('input[type="text"]').removeClass('ba-alert');
                        }
                    }
                }
            });
            if (item.find('.ba-captcha input[type="text"]').length != 0) {
                var captcha = item.find('.ba-captcha input[type="text"]').val();
                if (captcha == '') {
                    item.find('.ba-captcha input[type="text"]').addClass('ba-alert');
                } else {
                    item.find('.ba-captcha input[type="text"]').removeClass('ba-alert');
                }
            }
        }
        
        function sendMassage(event) 
        {
            checkAlert(form);
            if (form.find('.ba-alert').length > 0) {
                event.stopPropagation();
                event.preventDefault();
                var alert = form.find('.ba-alert').first();
                if (!alert.hasClass('tool')) {
                    alert = alert.closest('.tool');
                }
                var position = alert.offset().top
                ba_jQuery('html, body').animate({
                    scrollTop: position - 150
                }, 'slow');
            } else {
                if (cart.length > 0) {
                    var obj = {},
                        str = new Array(),
                        quantity = cart.find('.product-cell').first().find('.quantity').text();
                    cart.find('.product-cell').each(function(){
                        var id = jQuery(this).attr('data-id');
                        if (id) {
                            obj.id = id.replace('[]', '');
                            obj.product = jQuery(this).attr('data-product');
                            obj.quantity = Math.round(jQuery(this).find('.quantity input').val())
                            var real = obj.product.split(' - ');
                            real[0] += ' ('+jQuery.trim(quantity)+': '+obj.quantity+')';
                            real[1] = real[1].replace(symbol, '');
                            real[1] = obj.quantity * real[1];
                            if (symbolPos == 'before') {
                                real[1] = symbol + real[1];
                            } else {
                                real[1] = real[1] + symbol;
                            }
                            real = real.join(' - ');
                            obj.str = real;
                            str.push(JSON.stringify(obj));
                        }
                    });
                    str = str.join(';');
                    jQuery(this).find('.forms-cart').val(str)
                }
                var payment = jQuery(this).find('[name="task"]').val();
                if (payment == 'form.save' || payment == 'form.mollie') {
                    jQuery(this).removeClass('ba-payment');
                    ba_jQuery(this).attr('target', 'form-target');
                } else if (payment == 'form.stripe') {
                    jQuery(this).addClass('ba-payment');
                    ba_jQuery(this).attr('target', 'form-target');
                    iframe = ba_jQuery('<iframe/>', {
                        name:'form-target',
                        id:'form-target'
                    });
                    ba_jQuery('#form-target').remove();
                    iframe.appendTo(ba_jQuery('body'));
                    ba_jQuery(iframe).attr('style', 'display:none');
                    var api_key = form.find('[value="form.stripe"]').attr('data-api-key'),
                        image = form.find('[value="form.stripe"]').attr('data-image'),
                        total = baTotal.find('.ba-price').text() * 100,
                        name = form.find('[value="form.stripe"]').attr('data-name'),
                        description = form.find('[value="form.stripe"]').attr('data-description');
                    if (!stripe) {
                        stripe = StripeCheckout.configure({
                            key: api_key,
                            image: image,
                            name: name,
                            description: description,
                            locale: 'auto',
                            currency: form.find('.currency-code').val(),
                            token: function(token) {
                                form.append('<input type="hidden" name="stripeTokenId" value="'+token.id+'" />');
                                HTMLFormElement.prototype.submit.call(form[0]);
                            }
                        });
                    }
                    stripe.open({
                        amount: total
                    });
                } else {
                    jQuery(this).addClass('ba-payment');
                    ba_jQuery(this).removeAttr('target');
                }
                if (!jQuery(this).hasClass('ba-payment')) {
                    iframe = ba_jQuery('<iframe/>', {
                        name:'form-target',
                        id:'form-target'
                    });
                    ba_jQuery('#form-target').remove();
                    iframe.appendTo(ba_jQuery('body'));
                    ba_jQuery(iframe).attr('style', 'display:none');
                    var item = ba_jQuery(this),
                        dir = ba_jQuery('.admin-dirrectory').val();
                    ba_jQuery('body .modal-scrollable').css('background-color', dialogColor);
                    messageModal.ba_modal();
                    messageModal.parent().show();
                    messageModal.find('.message').html('<img src="'+dir+'components/com_baforms/assets/images/reload.svg">');    
                }
            }
        }
        
        function listenMessage(event) {
            if (event.origin != location.origin) {
                return;
            }
            var payment = form.find('[name="task"]').val();
            if (payment == 'form.mollie') {
                
                var message = event.data
                if (event.data.indexOf('http') == -1) {
                    setTimeout(function(){
                        messageModal.find('.message img').addClass('reload-hide');
                        setTimeout(function(){
                            messageModal.find('.message').html('<div class="message-text">'+event.data+'</div>');
                        }, 500);
                    }, 1500);
                } else {
                    location.href = event.data;
                }
                return false;
            }
            window.removeEventListener("message", listenMessage, false);
            form.find('.ba-captcha').find('input[type="text"]').val('');
            var mesage = ba_jQuery(iframe).contents().find('#form-sys-mesage').val();
            setTimeout(function(){
                messageModal.find('.message img').addClass('reload-hide');
                setTimeout(function(){
                    messageModal.find('.message').html('<div class="message-text">'+mesage+'</div>');
                }, 500);
            }, 1500);
            var success = form.find('.sent-massage').val();
            if (ba_jQuery('.popup-form').hasClass('popup-form')) {
                form.closest('.popup-form').ba_modal('hide');
                form.closest('modal-scrollable').hide();
            }
            if (success == mesage) {
                form.find('input').each(function(){
                    var type = ba_jQuery(this).attr('type');
                    if (type == 'radio' || type == 'checkbox') {
                        ba_jQuery(this).removeAttr('checked');
                    }
                    if (type == 'email') {
                        ba_jQuery(this).val('');
                    }
                    if (ba_jQuery(this).closest('.tool').hasClass('ba-textInput') ||
                        ba_jQuery(this).closest('.tool').hasClass('ba-address')) {
                        ba_jQuery(this).val('');
                    }
                });
                baTotal.find('input[name="ba_total"]').val('0');
                baTotal.find('.ba-price').text('0');
                prices = [];
                form.find('textarea').each(function () {
                    ba_jQuery(this).val('');
                });
                cart.find('.product-cell').not('.ba-cart-headline').remove();
                form.find('select').each(function(){
                    ba_jQuery(this).find('option').each(function(){
                        ba_jQuery(this).removeAttr('selected');
                    });
                });
                form.find('.condition-area').removeClass('selected');
                form.find('.ba-form')[0].style.height = ''
                var redirect =  form.find('.redirect').val();
                if (redirect != '') {
                    setTimeout(function(){
                        var redirect =  form.find('.redirect').val();
                        window.location = redirect;
                    }, 2000);
                }
            }
        }
        
        messageModal.on('show', function(){
            window.addEventListener("message", listenMessage, false);
        });
        messageModal.on('hide', function(){
            window.removeEventListener("message", listenMessage, false);
            messageModal.parent().addClass('hide-animation');
            setTimeout(function(){
                messageModal.parent().removeClass('hide-animation');
            }, 500);
        });
        
        baForm.find('.modal-scrollable').hide();
        baForm.find('body .modal-scrollable').css('background-color', dialogColor);

        baForm.find('.tool.ba-date').each(function(){
            var text = ba_jQuery(this).find('input[type="text"]').attr('id');
            Calendar.setup({
                inputField: text,
                ifFormat: "%d %B %Y",
                align: "Tl",
                singleClick: true,
                firstDay: 0
                });
        });
        
        baForm.find('.ba-textInput input').on('keyup', function(){
            var type = ba_jQuery(this).attr('data-type'),
                value = ba_jQuery(this).val();
            if (type == 'number') {
                if (ba_jQuery.isNumeric(value)) {
                    ba_jQuery(this).removeClass('ba-alert');
                } else {
                    ba_jQuery(this).addClass('ba-alert');
                }
            }
        });
        
        baForm.find('.ba-form .btn-next').on('click', function() {
            setTimeout(refreshMap, 100)
            var parent = ba_jQuery(this).parent().parent(),
                id = parent.attr('class'),
                n = id.substr(5);
            checkAlert(parent);
            if (parent.find('.ba-alert').length == 0) {
                var height = parent.height(),
                    el = n*1 + 1,
                    nextHeight,
                    title = parent.closest('.ba-form').find(' > .ba-row');
                if (title.length > 0) {
                    title = title.height();
                    height += title;
                }
                parent.closest('.ba-form').height(height);
                parent.hide();
                parent.parent().find('.page-'+(++n)).show();
                nextHeight = parent.parent().find('.page-'+(el)).height();
                if (typeof(title) == 'number') {
                    nextHeight += title;
                }
                parent.closest('.ba-form').height(nextHeight);
            } else {
                var alert = parent.find('.ba-alert').first();
                if (!alert.hasClass('tool')) {
                    alert = alert.closest('.tool');
                }
                var position = alert.offset().top;
                ba_jQuery('html, body').animate({
                    scrollTop: position - 150
                }, 'slow');
            }
        });
        
        baForm.find('.tool input[type="text"], .tool textarea').on('blur', function(){
            if (ba_jQuery(this).hasClass('ba-alert')) {
                var value = ba_jQuery(this).val(),
                    type = ba_jQuery(this).attr('data-type');
                if (ba_jQuery.trim(value) != '') {
                    if (type == 'number') {
                        if (ba_jQuery.isNumeric(value)) {
                            ba_jQuery(this).removeClass('ba-alert');
                        }
                    } else if (type == 'calculation') {

                    } else {
                        ba_jQuery(this).removeClass('ba-alert');
                    }
                }
            }
        });
        
        baForm.find('.tool input[type="email"]').on('blur', function(){
            if (ba_jQuery(this).hasClass('ba-alert')) {
                var reg = /^\w+([\.-]?\w+)*@\w+([\.-]?\w+)*(\.\w{2,6})+$/,
                    value = ba_jQuery(this).val();
                if(reg.test(value)) {
                    ba_jQuery(this).removeClass('ba-alert');
                }                
            }
        });
        
        baForm.find('.tool select').on('change', function(){
            if (ba_jQuery(this).hasClass('ba-alert')) {
                var value = ba_jQuery(this).val();
                if (ba_jQuery.trim(value) != '') {
                    ba_jQuery(this).removeClass('ba-alert');
                }
            }
        });
        
        baForm.find('.tool input[type="checkbox"], .tool input[type="radio"]').on('click', function(){
            ba_jQuery(this).closest('.tool').removeClass('ba-alert');
        });
        
        baForm.find('.ba-form .btn-prev').on('click', function() {
            setTimeout(refreshMap, 50)
            var parent = ba_jQuery(this).parent().parent(),
                id = parent.attr('class'),
                n = id.substr(5),
                height = parent.height(),
                el = n*1 - 1,
                nextHeight,
                title = parent.closest('.ba-form').find(' > .ba-row');
            if (title.length > 0) {
                title = title.height();
                height += title;
            }
            parent.closest('.ba-form').height(height);
            parent.hide();
            parent.parent().find('.page-'+(--n)).show();
            nextHeight = parent.parent().find('.page-'+(el)).height();
            if (typeof(title) == 'number') {
                nextHeight += title;
            }
            parent.closest('.ba-form').height(nextHeight);
        });
        
        refreshMap();
        conditionShow();

        baForm.find('.ba-slider').each(function(){
            var options = ba_jQuery(this).parent().find('.ba-options').val();
            options = options.split(';');
            var minimum = options[2];
            var maximum = options[3];
            var step = options[4];
            ba_jQuery(this).slider({
                min: minimum,
                max: maximum,
                step: step,
                value: [minimum, maximum]
            });
        });

        function decimalAdjust(type, value, exp)
        {
            if (typeof exp === 'undefined' || +exp === 0) {
                return Math[type](value);
            }
            value = +value;
            exp = +exp;
            if (isNaN(value) || !(typeof exp === 'number' && exp % 1 === 0)) {
                return NaN;
            }
            value = value.toString().split('e');
            value = Math[type](+(value[0] + 'e' + (value[1] ? (+value[1] - exp) : -exp)));
            value = value.toString().split('e');
            return +(value[0] + 'e' + (value[1] ? (+value[1] + exp) : exp));
        }

        if (!Math.round10) {
            Math.round10 = function(value, exp) {
                return decimalAdjust('round', value, exp);
            };
        }
        
        var prices = new Array();
        baForm.find('input[data-price]').on('change', function(event){
            var price = jQuery(this).attr('data-price')*1,
                name = jQuery(this).attr('name'),
                total = baTotal.find('.ba-price').text()*1,
                label = jQuery(this).val();
            label = label.split(' - ');
            if (jQuery(this).attr('type') == 'radio') {
                if (!prices[name]) {
                    prices[name] = price;
                    addToCart(label[0], label[1], name, price);
                    var radio = jQuery(this).closest('div').find('input[name="'+name+'"]').not('[data-price]');
                    radio.off('click.ba_total')
                    radio.one('click.ba_total', function(){
                        var name = jQuery(this).attr('name'),
                            total = baTotal.find('.ba-price').text()*1
                        if (cart.length > 0) {
                            var quantity = Math.round(cart.find('.product-cell[data-id="'+name+'"] .quantity input').val());
                            total = total - prices[name]  * quantity;
                        } else {
                            total = total - prices[name] * 1;
                        }
                        prices[name] = 0;
                        total = Math.round10(total, -2);
                        baTotal.find('.ba-price').text(total);
                        baTotal.find('input[name="ba_total"]').val(total);
                    });
                } else {
                    if (cart.length > 0) {
                        var quantity = Math.round(cart.find('.product-cell[data-id="'+name+'"] .quantity input').val());
                        total = total - prices[name]  * quantity;
                    } else {
                        total = total - prices[name] * 1;
                    }
                    cart.find('.product-cell[data-id="'+name+'"]').remove();
                    addToCart(label[0], label[1], name, price);
                    prices[name] = price;
                }
                total = total + price;
            } else {
                if (jQuery(this).prop('checked')) {
                    addToCart(label[0], label[1], name, price);
                    total = total + price;
                } else {
                    var str = '.product-cell[data-id="'+name+'"][data-product="';
                    str += jQuery(event.currentTarget).val()+'"]';
                    if (cart.length > 0) {
                        var quantity = Math.round(cart.find(str).find('.quantity input').val());
                        total = total - price * quantity;
                    } else {
                        total = total - price * 1;
                    }
                    cart.find(str).remove();
                }
            }
            total = Math.round10(total, -2);
            baTotal.find('.ba-price').text(total);
            baTotal.find('input[name="ba_total"]').val(total);
        });
        
        baForm.find('.tool select').on('change', function(){
            if (jQuery(this).find('[data-price]').length > 0) {
                var value = jQuery(this).val(),
                    option = jQuery(this).find('option[value="'+value+'"]'),
                    price = option.attr('data-price')*1,
                    name = jQuery(this).attr('name'),
                    total = baTotal.find('.ba-price').text() * 1,
                    label = jQuery(this).val();
                if (isNaN(price)) {
                    price = 0;
                }
                if (jQuery(this).attr('multiple')) {
                    if (!prices[name]) {
                        prices[name] = new Array();
                    } else {
                        for (var i = 0; i < prices[name].length; i++) {
                            var str = '.product-cell[data-id="'+name+'"]';
                                str += '[data-product="'+prices[name][i].value+'"]'
                            if (cart.length > 0) {
                                var quantity = Math.round(cart.find(str).find('.quantity input').val());
                                total = total - prices[name][i].price  * quantity;
                            } else {
                                total = total - prices[name][i].price * 1;
                            }
                            cart.find(str).first().remove();
                        }
                        prices[name] = [];
                    }
                    if (jQuery(this).val()) {
                        for (var i = 0; i < value.length; i++) {
                            label = value[i].split(' - ');
                            option = jQuery(this).find('option[value="'+value[i]+'"]');
                            price = option.attr('data-price')*1
                            if (!isNaN(price)) {
                                addToCart(label[0], label[1], name, price);
                                var obj = {
                                    price : price,
                                    value : value[i]
                                }
                                prices[name].push(obj);
                                total  = total + price;
                            }                            
                        }
                    }
                } else {
                    label = label.split(' - ');
                    if (!prices[name]) {
                        if (label[1]) {
                            prices[name] = price;
                            addToCart(label[0], label[1], name, price);
                        }                        
                    } else {
                        if (cart.length > 0) {
                            var quantity = Math.round(cart.find('.product-cell[data-id="'+name+'"] .quantity input').val());
                            total = total - prices[name]  * quantity;
                        } else {
                            total = total - prices[name] * 1;
                        }
                        prices[name] = price;
                        cart.find('.product-cell[data-id="'+name+'"]').remove();
                        if (label[1]) {
                            addToCart(label[0], label[1], name, price);
                        }
                    }
                    total = total + price;
                }
                total = Math.round10(total, -2);
                baTotal.find('.ba-price').text(total);
                baTotal.find('input[name="ba_total"]').val(total);
            }
        });



        if (!form.parent().hasClass('ba-modal-body')) {
            form.find('.tool select').trigger('change');
            form.find('input[checked]').trigger('change');
        }
        
        baForm.find('.popup-btn').on('click', function(event){
            event.preventDefault();
            var target = ba_jQuery(this).attr('data-popup');
            ba_jQuery('body .modal-scrollable').css('background-color', dialogColor);
            ba_jQuery('body').addClass('ba-forms-modal');
            ba_jQuery('#'+target).ba_modal();
            ba_jQuery('#'+target).on('hide', function(){
                var scrollable = ba_jQuery(this).parent();
                ba_jQuery('body').removeClass('ba-forms-modal');
                scrollable.addClass('hide-animation');
                setTimeout(function(){
                    scrollable.removeClass('hide-animation');
                }, 500);
            });
            setTimeout(function(){
                form.find('.tool select').trigger('change');
                form.find('input[checked]').trigger('change');
            }, 600);
            ba_jQuery('#'+target).parent().show();
            setTimeout(refreshMap, 300);
        });
        
        baForm.find('.tool').find('input[type=file]').on('change', prepareUpload);
        
        baForm.find('.ba-form').parent().on('submit', sendMassage);
        if (baForm.find('.popup-btn').length > 0) {
            if (baForm.find('.popup-btn')[0].localName == 'a') {
                var id = baForm.find('[name="form_id"]').val();
                jQuery('.baform-replace').each(function(){
                    if (jQuery.trim(jQuery(this).text()) == '[forms ID='+id+']') {
                        jQuery(this).replaceWith(baForm.find('.popup-btn')[0])
                        return false;
                    }
                })
            }
        }

        baForm.find('.ba-modal-close').on('click', function(event){
            event.preventDefault();
            ba_jQuery(this).parent().ba_modal('hide');
        });
        baForm.find('.ba-lightbox-image img').on('click.lightbox', function(){
            jQuery('.ba-image-backdrop').remove();
            var div = document.createElement('div'),
                width = this.width,
                height = this.height,
                backdrop = document.createElement('div'),
                offset = jQuery(this).offset(),
                imgHeight = this.naturalHeight,
                modalTop,
                imgWidth = this.naturalWidth,
                modal = jQuery(div),
                target = jQuery(window).height()-100,
                flag = true,
                img = document.createElement('img'),
                left,
                wWidth = jQuery(window).width()*1,
                wHeigth = jQuery(window).height()*1,
                bg = jQuery(this).attr('data-lightbox');
            img.src = this.src;
            div.className = 'ba-image-modal';
            div.style.top = offset.top * 1 - jQuery(window).scrollTop() * 1+'px';
            div.style.left = offset.left+'px';
            div.style.width = width+'px';
            div.appendChild(img);
            img.style.width = width+'px';
            img.style.height = height+'px';
            backdrop.className = 'ba-image-backdrop';
            backdrop.style.backgroundColor = bg;
            jQuery(backdrop).on('click', function(){
                jQuery(this).addClass('image-lightbox-out');
                modal.animate({
                    'width' : width,
                    'height' : height,
                    'left' : offset.left,
                    'top' : offset.top * 1 - jQuery(window).scrollTop() * 1
                }, '500', function(){
                    jQuery('.ba-image-backdrop').remove();
                });
                modal.find('img').animate({
                    'width' : width,
                    'height' : height,
                    'left' : offset.left,
                    'top' : offset.top * 1 - jQuery(window).scrollTop() * 1
                }, '500');
            });
            jQuery('body').append(div);
            modal.wrap(backdrop);
            if (wWidth > 1024) {
                if (imgWidth * 1 < wWidth && imgHeight * 1 < wHeigth) {
                
                } else {
                    if (imgWidth > imgHeight) {
                        var percent = target/imgWidth;
                        flag = false;
                    } else {
                        var percent = target/imgHeight;
                        flag = true;
                    }
                    imgWidth = imgWidth * percent;
                    imgHeight = imgHeight * percent;
                    if (imgWidth > wWidth) {
                        imgWidth = imgWidth * percent;
                        imgHeight = imgHeight * percent;
                    }
                    if (!flag) {
                        var percent = imgWidth / imgHeight;
                        imgHeight = target;
                        imgWidth = imgHeight * percent;
                        if (wWidth - 100 < imgWidth) {
                            imgWidth = wHeigth - 100;
                            imgHeight = imgWidth / percent;
                        }
                    }
                }
            } else {
                var percent = imgWidth / imgHeight;
                if (percent >= 1) {
                    imgWidth = wWidth * 0.90;
                    imgHeight = imgWidth / percent;
                    if (wHeigth - imgHeight < wHeigth * 0.1) {
                        imgHeight = wHeigth * 0.90;
                        imgWidth = imgHeight * percent;
                    }
                } else {
                    imgHeight = wHeigth * 0.90;
                    imgWidth = imgHeight * percent;
                    if (wWidth -imgWidth < wWidth * 0.1) {
                        imgWidth = wWidth * 0.90;
                        imgHeight = imgWidth / percent;
                    }
                }
            }
            modalTop = (wHeigth - imgHeight)/2;
            left = (wWidth - imgWidth)/2;
            modal.animate({
                'width' : Math.round(imgWidth),
                'height' : Math.round(imgHeight),
                'left' : Math.round(left),
                'top' : Math.round(modalTop)
            }, '500');
            modal.find('img').animate({
                'width' : Math.round(imgWidth),
                'height' : Math.round(imgHeight),
                'left' : Math.round(left),
                'top' : Math.round(modalTop)
            }, '500');
        });
            
        function addToCart(product, price, id, cost)
        {
            if (cart.length > 0) {
                var str = '<div class="product-cell" data-id="'+id;
                str += '" data-product="'+product+' - '+price;
                str += '"><div class="product">';
                str += product+'</div><div class="price">'+price;
                str += '</div><div class="quantity"><input type="number" ';
                str += 'value="1" min="1" step="1" data-cost="'+cost;
                str += '"></div><div class="total">'+price;
                str += '</div><div class="remove-item"><i class="zmdi zmdi';
                str += '-close"></i></div></div>';
                cart.append(str);
                cart.find('.remove-item i.zmdi').off('click');
                cart.find('.remove-item i.zmdi').on('click', removeCart);
                cart.find('.quantity input').off();
                cart.find('.quantity input').on('click keyup', function(){
                    var value = jQuery(this).val(),
                        price = jQuery(this).attr('data-cost'),
                        cost;
                    if (value < 1) {
                        value = 1;
                        jQuery(this).val(1);
                    }
                    value = Math.round(value);
                    cost = value * price;
                    if (symbolPos == 'before') {
                        cost = symbol + cost;
                    } else {
                        cost = cost + symbol;
                    }
                    var total = baTotal.find('.ba-price').text()*1,
                        currentPrice = jQuery(this).closest('.product-cell').find('.total').text();
                    currentPrice = currentPrice.replace(symbol, '');
                    total = total - currentPrice;
                    total = total + price * value;
                    total = Math.round10(total, -2);
                    baTotal.find('.ba-price').text(total);
                    baTotal.find('input[name="ba_total"]').val(total);
                    jQuery(this).closest('.product-cell').find('.total').text(cost);
                });
                cart.closest('.ba-form')[0].style.height = '';
            }
        }

        function removeCart()
        {
            var item = jQuery(this).closest('.product-cell'),
                id = item.attr('data-id'),
                value = item.attr('data-product'),
                element = jQuery('[name="'+id+'"]'),
                price = item.find('.total').text();
            if (element.attr('type') == 'checkbox') {
                jQuery('[name="'+id+'"][value="'+value+'"]').removeAttr('checked').trigger('change');
            } else if (element.attr('type') == 'radio') {
                var total = baTotal.find('.ba-price').text()*1,
                    quantity = Math.round(cart.find('.product-cell[data-id="'+id+'"] .quantity input').val());
                total = total - prices[id]  * quantity;
                delete(prices[id]);
                total = Math.round10(total, -2);
                baTotal.find('.ba-price').text(total);
                baTotal.find('input[name="ba_total"]').val(total);
                item.remove();
                var input = jQuery('[name="'+id+'"][value="'+value+'"]');
                input.removeAttr('checked');
                if (input.closest('.tool').find('> .condition-area').length > 0) {
                    clearCondition(input.closest('.tool').find('> .condition-area'))
                }
                
            } else {
                element.find('option[value="'+value+'"]').removeAttr('selected');
                if (!element.attr('multiple')) {
                    element.find('option').first().attr('selected', true);
                }
                element.trigger('change');
            }
            element.closest('.ba-form')[0].style.height = '';
        }
    });
});