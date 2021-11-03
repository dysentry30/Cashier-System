const inputUsername = document.querySelector("#username");
const inputPassword = document.querySelector("#password");
const inputSeePassword = document.querySelector("#see-password");
const errorUsernameElt = document.querySelector("#error-username");
const errorPasswordElt = document.querySelector("#error-password");
const form = document.querySelector("form");

inputSeePassword.addEventListener("change", e => {
    const checked = e.target.checked;
    if (checked) {
        inputPassword.setAttribute("type", "text");
    } else {
        inputPassword.setAttribute("type", "password");
    }
});

form.addEventListener("submit", async e => {
    e.preventDefault();
    const formData = new FormData(form);
    const username = formData.get("username").toString();
    const password = formData.get("password").toString();

    if (!username) {
        inputUsername.classList.add("border-danger");
        errorUsernameElt.classList.remove("hide");
        errorUsernameElt.querySelector("small").textContent = "Fill up this field above";
        return;
    } else if (!password) {
        inputPassword.classList.add("border-danger");
        errorPasswordElt.classList.remove("hide");
        errorPasswordElt.querySelector("small").textContent = "Fill up this field above";
        return;
    } else {
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

    const result = await fetch("/login", {
        method: "POST",
        headers: {
            "Content-Type": "application/json"
        },
        body: JSON.stringify(data),
    }).then(resolve => resolve.json());
    if (result.status !== "Failed") {
        return location.href = "/";
    }
    Swal.fire({
        icon: "error",
        title: result.status,
        text: result.message,
    });
    // ! connect to database

});

// fetch(`/readMe.txt`)
//     .then(resolve => resolve.body)
//     .then(async body => {
//         const reader = body.pipeThrough(new TextDecoderStream()).getReader();
//         while(true) {
//             const { value, done } = await reader.read();
//             if (done) break;
//             console.log("Received\n", value);
//         }
//         console.log("done");
//         // return new ReadableStream({
//         //     start(controller) {

//         //         // const pump = () => {

//         //         //     return pump();
//         //         // }
//         //     }
//         // })
//     })
// .then(stream => new Response(stream))
// .then(response => response.text())
// .then(text => {
//     const p = document.createElement("p");
//     document.querySelector("#test").textContent = text;
//     console.log("done");
// })
// .catch(err => console.log(err));