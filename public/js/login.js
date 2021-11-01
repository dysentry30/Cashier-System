const inputUsername = document.querySelector("#username");
const inputPassword = document.querySelector("#password");
const inputSeePassword = document.querySelector("#see-password");
const errorUsernameElt = document.querySelector("#error-username");
const errorPasswordElt = document.querySelector("#error-password");
const form = document.querySelector("form");

inputSeePassword.addEventListener("change", e => {
    const checked = e.target.checked;
    if(checked) {
        inputPassword.setAttribute("type", "text");
    } else {
        inputPassword.setAttribute("type", "password");
    }
});

form.addEventListener("submit", e => {
    e.preventDefault();
    const formData = new FormData(form);
    const username = formData.get("username").toString();
    const password = formData.get("password").toString();
    
    if(!username) {
        inputUsername.classList.add("border-danger");
        errorUsernameElt.classList.remove("hide");
        errorUsernameElt.querySelector("small").textContent = "Fill up this field above";
        return;
    } else if (!password) {
        inputPassword.classList.add("border-danger");
        errorPasswordElt.classList.remove("hide");
        errorPasswordElt.querySelector("small").textContent = "Fill up this field above";
        return;
    }else {
        inputUsername.classList.remove("border-danger");
        errorUsernameElt.classList.add("hide");
        errorUsernameElt.querySelector("small").textContent = "";
        inputPassword.classList.remove("border-danger");
        errorPasswordElt.classList.add("hide");
        errorPasswordElt.querySelector("small").textContent = "";
    }
    const data = {
        username,
        password
    }

    // ! connect to database

})