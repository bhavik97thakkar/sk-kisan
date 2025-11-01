$(function(){
    $('.navbar-nav a[href^="#"]').on('click', function(e){
        e.preventDefault();
        var id = $(this).attr('href'),
        targetOffset = $(id).offset().top;

        $('html, body').animate({ 
            scrollTop: targetOffset
        }, 1500, 'easeInOutQuint');
    });

    $('.navbar-brand[href^="#"]').on('click', function(e){
        e.preventDefault();
        var id = $(this).attr('href'),
        targetOffset = $(id).offset().top;

        $('html, body').animate({ 
            scrollTop: targetOffset - 100
        }, 1500, 'easeInOutQuint');
    });
});