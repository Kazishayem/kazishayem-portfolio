$(document).ready(function(){
    $(window).scroll(function(){
        if(this.scrollY > 20){
            $('.navber').addClass("sticky");

        }else{
            $('.navber').removeClass("sticky");

        }
        if(this.scrollY > 500){
            $('.scroll-up-btn').addClass("show");
        }
        else{
            $('.scroll-up-btn').removeClass("show");
        }

    });

    // slide-up script

    $('.scroll-up-btn').click(function(){
        $('html').animate({scrollTop: 0});
    });
    // toggle menu/navber script
    $('.menu-btn').click(function(){

        $('.navber .menu').toggleClass("active");
        $('.menu-btn i').toggleClass("active");
    });

    // typing animation script
var typed = new Typed(".typing", {
    strings: ["Junior Flutter Developer", "Flutter Developer", "Mobile App Developer"],
    typeSpeed: 50,
    backSpeed: 20,
    loop: true
});

var typed = new Typed(".typing-2", {
    strings: ["Junior Flutter Developer", "Flutter Developer", "Mobile App Developer"],
    typeSpeed: 50,
    backSpeed: 20,
    loop: true
});



    // owl carousel script
    $('.carousel').owlCarousel({

        margin: 20,
        loop: true,
        autoplayTimeOut: 2000,
        autoplayHoverPause: true,
        responsive: {
            0:{
                items: 1,
                nav: false
            },
            600:{
                items: 2,
                nav: false
            },
            1000:{
                items: 3,
                nav: false
            }
        }
        
    });
});

window.addEventListener("DOMContentLoaded", function() {

    // get the form elements defined in your form HTML above
    
    var form = document.getElementById("my-form");
    var button = document.getElementById("my-form-button");
    var status = document.getElementById("my-form-status");

    // Success and Error functions for after the form is submitted
    
    function success() {
      form.reset();
      status.innerHTML = "<span class='sent-message'>Your message has been sent. Thank you!</span>";
    }

    function error() {
      status.innerHTML = "<span class='error-message'>Oops! There was a problem  &times;</span>";
    }
    $(document).ready(function(){
      $("#my-form-status").click(function(){
        status.innerHTML ="<span style='display:none;'> </span>";
      });
    });

    // handle the form submission event

    form.addEventListener("submit", function(ev) {
      ev.preventDefault();
      var data = new FormData(form);
      ajax(form.method, form.action, data, success, error);
    });
  });
  
  // helper function for sending an AJAX request

  function ajax(method, url, data, success, error) {
    var xhr = new XMLHttpRequest();
    xhr.open(method, url);
    xhr.setRequestHeader("Accept", "application/json");
    xhr.onreadystatechange = function() {
      if (xhr.readyState !== XMLHttpRequest.DONE) return;
      if (xhr.status === 200) {
        success(xhr.response, xhr.responseType);
      } else {
        error(xhr.status, xhr.response, xhr.responseType);
      }
    };
    xhr.send(data);
  }

  // image lightbox for projects and certificates
  (function() {
      var lightbox = document.getElementById("image-lightbox");
      var lightboxImg = document.getElementById("lightbox-img");
      var lightboxClose = document.getElementById("lightbox-close");

      function openLightbox(src, alt) {
          lightboxImg.src = src;
          lightboxImg.alt = alt || "Preview image";
          lightbox.classList.add("show");
      }

      function closeLightbox() {
          lightbox.classList.remove("show");
          lightboxImg.src = "";
      }

      document.addEventListener("click", function(e) {
          var img = e.target.closest(".projects img, .certificates img");
          if (img && !lightbox.classList.contains("show")) {
              openLightbox(img.src, img.alt);
          }
      });

      lightbox.addEventListener("click", function(e) {
          if (e.target === lightbox || e.target === lightboxImg) {
              closeLightbox();
          }
      });

      lightboxClose.addEventListener("click", function() {
          closeLightbox();
      });

      document.addEventListener("keydown", function(e) {
          if (e.key === "Escape") {
              closeLightbox();
          }
      });
  })();

// reveal on scroll
window.addEventListener("DOMContentLoaded", function() {
  var revealTargets = document.querySelectorAll(
    ".title, .about-content .column, .services .card, .experience .left, .experience .right, .skills .column, .projects .card, .contact .column, .contact .row, footer, .projects .swiper-button-next, .projects .swiper-button-prev, .projects .swiper-pagination"
  );

  revealTargets.forEach(function(el) {
    el.classList.add("reveal");
  });

  if ("IntersectionObserver" in window) {
    var observer = new IntersectionObserver(function(entries) {
      entries.forEach(function(entry) {
        if (entry.isIntersecting) {
          entry.target.classList.add("is-visible");
          observer.unobserve(entry.target);
        }
      });
    }, { threshold: 0.2, rootMargin: "0px 0px -10% 0px" });

    revealTargets.forEach(function(el) {
      observer.observe(el);
    });
  } else {
    revealTargets.forEach(function(el) {
      el.classList.add("is-visible");
    });
  }
});

if (window.Swiper) {
  var swiper = new Swiper(".mySwiper", {
      slidesPerView: 3,
      spaceBetween: 30,
      slidesPerGroup: 3,
      loop: true,
      loopFillGroupWithBlank: true,
      pagination: {
        el: ".swiper-pagination",
        clickable: true,
      },
      navigation: {
        nextEl: ".swiper-button-next",
        prevEl: ".swiper-button-prev",
      },
    });
}
