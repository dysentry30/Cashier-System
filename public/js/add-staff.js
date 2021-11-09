const generatingIdUser = () => {
    const id = Math.floor(Math.random() * 99999999);
    const stringID = id.toString();
    if (stringID.length < 7) {
        return generatingIdUser();
    }
    return id;
}

const generatingPassword = () => {
    const pw = uuidv4().toString().split("-").pop();
    return pw;
}

const idUser = generatingIdUser();
const passwordUser = generatingPassword();

selector("#id-user").value = idUser;
selector("#password").value = passwordUser;
selector(".loading").style.opacity = "0";
selector("#see-password").addEventListener("change", e => {
    const checked = e.target.checked;
    if (checked) {
        selector("#password").setAttribute("type", "text");
        return;
    }
    selector("#password").setAttribute("type", "password");
    return;
});
setTimeout(() => {
    selector(".loading").classList.add("hide");
}, 500);

selector("form").addEventListener("submit", e => {
    e.preventDefault();
    const formData = new FormData(selector("form"));
    const data = {
        id_user: formData.get("id-user"),
        name: formData.get("name"),
        username: formData.get("username"),
        password: formData.get("password"),
    }
    if (!data.name) {
        selector("#name-error").textContent = "This field must be filled";
        selector("#name-error").classList.remove("hide");
        selector("#name").focus();
        selector("#name").classList.add("is-invalid");
        return;
    }
    selector("#name-error").classList.add("hide");
    selector("#name").classList.remove("is-invalid");

    if (!data.username) {
        selector("#username-error").textContent = "This field must be filled";
        selector("#username-error").classList.remove("hide");
        selector("#username").classList.add("is-invalid");
        selector("#username").focus();
        selector("#username-error").classList.add("text-danger");
        return;
    }
    selector("#username").classList.remove("is-invalid");
    selector("#username-error").classList.add("hide");

    console.log(data);
});

selector("#username").addEventListener("focusout", async e => {
    const username = e.target.value.toString();

    selector("#loading").classList.remove("hide");
    const result = await myFetch({
        url: "/find-username",
        body: {
            username
        }
    });

    if (result.status === "Success") {
        selector("#loading").classList.add("hide");
        selector("#username").classList.add("is-valid");
        selector("#username").classList.remove("is-invalid");
        selector("#username-error").classList.remove("hide");
        selector("#username-error").textContent = result.message;
        selector("#username-error").classList.remove("text-danger");
        selector("#username-error").classList.add("text-success");
        return;
    }

    if (result.status === "Found") {
        selector("#loading").classList.add("hide");
        selector("#username").classList.add("is-invalid");
        selector("#username").classList.remove("is-valid");
        selector("#username").focus();
        selector("#username-error").classList.remove("hide");
        selector("#username-error").textContent = result.message;
        selector("#username-error").classList.add("text-danger");
        selector("#username-error").classList.remove("text-success");
        return;
    }

    if (result.status === "Error") {
        selector("#loading").classList.add("hide");
        selector("#username").classList.add("is-invalid");
        selector("#username").classList.remove("is-valid");
        selector("#username").focus();
        selector("#username-error").classList.remove("hide");
        selector("#username-error").textContent = "There is an error while validating your username";
        selector("#username-error").classList.add("text-danger");
        selector("#username-error").classList.remove("text-success");
        myAlert({
            icon: result.status.toLowerCase(),
            title: result.status,
            html: `There is an error while validating your username\n<div class="d-grid mt-2">
                    <button data-error="${result.errorMessage}" onclick="reportError(this)" class="btn btn-link">Report this error</button>
                </div>`,
        })
    }


    // fetch("/find-username", {
    //     method: "POST",

    // })
})