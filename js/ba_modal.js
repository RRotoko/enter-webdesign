!function ($) {
    var ba_modal = function (element) {
        this.element = $(element)
        .on('click.ba_modal', '[data-dismiss="ba_modal"]', $.proxy(this.hide, this));
        this.element.parent().children()
        .on('mouseenter', this, function(){
            $(this).parent().off('click.ba_modal');
        }).on('mouseleave', $.proxy(this.scrollable, this));
        this.scrollable();
        $('body').append(this.element.parent());
    }
    
    ba_modal.prototype = {
        show: function () {
            var event = $.Event('show');
            this.element.trigger(event);
            this.element.show();
            this.element.addClass('in');
            this.element.parent().show();
        },
        hide: function (event) {
            var element = this.element;
            event && event.preventDefault();
            var that = this
            event = $.Event('hide');
            this.element.trigger(event);
            setTimeout(function(){
                element.removeClass('in');
                element.hide();
                element.parent().hide();
            }, 500);
        },
        scrollable : function(){
            this.element.parent().on('click.ba_modal', $.proxy(this.hide, this));
        }
    }
    
    $.fn.ba_modal = function (option) {
        return this.each(function () {
            var data = $(this).data('ba_modal');
            if (!data) {
                $(this).data('ba_modal', (data = new ba_modal(this)));
            }
            if (typeof option == 'string') {
                data[option]();
            } else {
                data.show();
            }
        });
    }
    
    $.fn.ba_modal.Constructor = ba_modal
    
}(window.jQuery);