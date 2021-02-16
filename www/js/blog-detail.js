(function($) {
    "use strict";
    $('.blog-detail-slider').owlCarousel({
        items: 1,
        nav: true,
        dots: false,
        navText: ['<img src="../images/agency/testimonial/left.png">', '<img src="../images/agency/testimonial/right.png">'],
        autoplay: true,
        slideSpeed: 300,
        paginationSpeed: 400,
        loop: true,
    });
})(jQuery);