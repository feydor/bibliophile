/**
 * javascript for nav elements of views/header
 */
(function () {
  "use strict";

  /**
   * Toggle .header-scrolled class to #header when page is scrolled
   */
  let selectHeader = document.getElementById("header");
  if (selectHeader) {
    window.addEventListener("scroll", () => {
      if (window.pageYOffset > 50) {
        selectHeader.classList.add("header-scrolled");
      } else {
        selectHeader.classList.remove("header-scrolled");
      }
    });
  }
  /**
   * Mobile nav toggle (open hamburger menu)
   */
  let navbar = document.getElementById("navbar");
  let mobileNavbarToggle = document.querySelector(".mobile-nav-toggle");
  let dropdown = document.getElementById("dropdownMenu");
  if (mobileNavbarToggle) {
    mobileNavbarToggle.addEventListener("click", () => {
      navbar.classList.toggle("navbar-mobile");
      mobileNavbarToggle.classList.toggle("bi-list");
      mobileNavbarToggle.classList.toggle("bi-x");

      // popout sidebar
      let mobileSidebar = document.querySelector(".mobile-sidebar");
      if (mobileSidebar) {
        mobileSidebar.classList.toggle("show");
      }
    });
  }

  /**
   * Mobile nav dropdowns activate
   */
  if (navbar) {
    navbar.addEventListener("click", (event) => {
      if (navbar.classList.contains("navbar-mobile")) {
        event.preventDefault();
        navbar.firstChild.classList.toggle("dropdown-active");
      }
    });
  }
})();
