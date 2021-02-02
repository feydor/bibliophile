(function () {
  "use strict"; // Start of use strict

  // Toggle the side navigation
  const sidebarToggleEventListener = () => {
    document.querySelector("body").classList.toggle("toggled");
    let sidebar = document.querySelector(".sidebar");
    sidebar.classList.toggle("toggled");

    // TODO: what is jquery.collapse('hide') do?
    if (sidebar.classList.contains("toggled")) {
      //sidebar;
      //document.querySelector(".collapse");
    }
  };

  /*
  let sidebarToggle = document.getElementById("sidebarToggle");
  let sidebarToggleTop = document.getElementById("sidebarToggleTop");
  sidebarToggle.addEventListener("click", sidebarToggleEventListener);
  sidebarToggleTop.addEventListener("click", sidebarToggleEventListener);

  // Close any open menu accordions when window is resized below 768px
  window.addEventListener("resize", () => {
    if (window.innerWidth < 768) {
      // TODO:do something
      // $('.sidebar .collapse').collapse('hide');
      document.querySelector("body").classList.toggle("toggled");
      document.querySelector(".sidebar").classList.toggle("toggled");
    }

    // Toggle the side navigation when window is resized below 480px
    if (
      window.innerWidth < 480 &&
      !document.querySelector(".sidebar").classList.contains("toggled")
    ) {
      document.querySelector("body").classList.add("sidebar-toggled");
      document.querySelector(".sidebar").classList.add("toggled");
      // $('.sidebar .collapse').collapse('hide');
    }
  });
  */

  // Toggle the user profile dropdown
  document.getElementById("userDropdown").addEventListener("click", () => {
    document.getElementById("userDropdownMenu").classList.toggle("show");
  });

  // Scroll to top button
  const scrollToTop = () => {
    const c = document.documentElement.scrollTop || document.body.scrollTop;
    if (c > 0) {
      window.requestAnimationFrame(scrollToTop);
      window.scrollTo(0, c - c / 8);
    }
  };

  // document.querySelector(".scroll-to-top").addEventListener("click", () => {
  //  scrollToTop();
  // });

  // Prevent the content wrapper from scrolling when the fixed side navigation hovered over
  // $('body.fixed-nav .sidebar').on('mousewheel DOMMouseScroll wheel', function(e) {
  //   if ($(window).width() > 768) {
  //     var e0 = e.originalEvent,
  //       delta = e0.wheelDelta || -e0.detail;
  //     this.scrollTop += (delta < 0 ? 1 : -1) * 30;
  //     e.preventDefault();
  //   }
  // });

  // // Scroll to top button appear
  // $(document).on('scroll', function() {
  //   var scrollDistance = $(this).scrollTop();
  //   if (scrollDistance > 100) {
  //     $('.scroll-to-top').fadeIn();
  //   } else {
  //     $('.scroll-to-top').fadeOut();
  //   }
  // });

  // // Smooth scrolling using jQuery easing
  // $(document).on('click', 'a.scroll-to-top', function(e) {
  //   var $anchor = $(this);
  //   $('html, body').stop().animate({
  //     scrollTop: ($($anchor.attr('href')).offset().top)
  //   }, 1000, 'easeInOutExpo');
  //   e.preventDefault();
  // });
})(); // End of use strict
