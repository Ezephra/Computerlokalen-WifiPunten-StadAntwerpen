function setNavbar() {
    let elToggler = document.getElementById("navbar-toggler");
    if(elToggler.textContent == ""){
        elToggler.textContent = "×";
        elToggler.style.backgroundImage = "none";
        elToggler.style.fontSize = "35px";
        elToggler.style.width = "30px";
        elToggler.style.height = "30px";
        elToggler.style.alignContent = "center";
        elToggler.style.lineHeight = "20px";
        elToggler.style.color = "#888";
    } else {
        elToggler.textContent = "";
        elToggler.style.backgroundImage = "";
        elToggler.style.fontSize = "";
    }
}