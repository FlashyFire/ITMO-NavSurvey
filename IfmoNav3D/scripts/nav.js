export function setupNav(onactivate) {
  var acc = document.getElementsByClassName("accordion");

  for (var i = 0; i < acc.length; i++) {
    acc[i].addEventListener("click", accClick);
  }

  function accClick() {
    for (var i = 0; i < acc.length; i++) {
      var panel = acc[i].nextElementSibling;
      if (acc[i] == this) {
        if (!acc[i].classList.contains("active")) {
          acc[i].classList.add("active");
          panel.style.display = "block";
          onactivate(panel.id);
        }
      } else {
        acc[i].classList.remove("active");
        panel.style.display = "none";
      }
    }
  }
}
