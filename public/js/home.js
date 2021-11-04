const form = document.querySelector("form");

fetch("/get-user", {
        method: "POST",
        headers: {
            "Content-Type": "application/json",
        }
    })
    .then(resolve => resolve.json())
    .then(user => {
        document.querySelector("#id-user").textContent = user.id_user;
        document.querySelector("#name-user").textContent = user.name;
        document.querySelector(".loading").style.opacity = 0;
        setTimeout(() => {
            document.querySelector(".loading").style.display = "none";
        }, 1000);
    });

form.addEventListener("submit", async e => {
    e.preventDefault();
    const formData = new FormData(form);
    const idProduct = formData.get("id-product");

    if (!idProduct) {
        document.querySelector("#error-msg").classList.remove("hide");
        document.querySelector("#error-msg").textContent = "This field must be filled";
        document.querySelector("#id-product").classList.add("border-danger");
        return;
    }

    document.querySelector("#error-msg").textContent = "";
    document.querySelector("#error-msg").classList.add("hide");
    document.querySelector("#id-product").classList.remove("border-danger");

    const result = await getItems(idProduct);
    document.querySelector("#id-product").value = "";

    showData(result.itemsProduct);
    // result.itemsProduct.forEach(item => {
    //     html += `<li class="list-group-item d-flex justify-content-between align-items-center">
    //     <h6 style="max-width: 200px;">${item}</h6>
    //     <h6>Quantity</h6>
    //     <h6><b>Rp 200000</b></h6>
    //     <button class="btn-close" onclick="deleteItem(this)" data-id-product="${item}"></button>
    // </li>`
    // });
    // if (document.querySelector("#empty-msg")) {
    //     document.querySelector("#empty-msg").classList.add("hide");
    // }
    // document.querySelector("#list-items").innerHTML = html;
    // document.querySelector("#total").classList.remove("hide");
    // console.log(result);
})

const deleteItem = async (e) => {
    const idProduct = e.getAttribute("data-id-product");
    const result = await myFetch({
        url: "/delete-item",
        body: {
            idProduct
        },
    });
    return showData(result.itemsProduct);
}

const showData = (data) => {
    if (data instanceof Object) {
        let html = "";

        data.forEach(item => {
            html += `<li class="list-group-item d-flex justify-content-between align-items-center">
            <h6 style="max-width: 80px;">${item}</h6>
            <h6>Quantity</h6>
            <h6><b>Rp 200000</b></h6>
            <button class="btn-close" onclick="deleteItem(this)" data-id-product="${item}"></button>
        </li>`
        });
        if (document.querySelector("#empty-msg")) {
            document.querySelector("#empty-msg").classList.add("hide");
        }
        if(data.length < 0) {
            document.querySelector("#empty-msg").classList.remove("hide");
        }
        document.querySelector("#list-items").innerHTML = html;
        document.querySelector("#total").classList.remove("hide");
        return;
    } else {
        throw ": This function need object array parameter not " + typeof data
    }
}

const clearAllItems = async () => {
    const result = await myFetch({
        url: "/clear-all-items"
    });
    document.querySelector("#list-items").innerHTML = "";
    document.querySelector("#empty-msg").classList.remove("hide");



    // result.itemsProduct.forEach(item => {
    //     html += `<li class="list-group-item d-flex justify-content-between align-items-center">
    //     <h6 style="max-width: 200px;">${item}</h6>
    //     <h6>Quantity</h6>
    //     <h6><b>Rp 200000</b></h6>
    // </li>`
    // });
}

const myFetch = async ({
    url,
    body
}) => {
    console.log(body);
    if (!body) {
        const result = await fetch(url, {
            method: "POST",
            headers: {
                "Content-Type": "application/json"
            },
        }).then(resolve => resolve.json());
        return result;
    }
    const result = await fetch(url, {
        method: "POST",
        headers: {
            "Content-Type": "application/json"
        },
        body: JSON.stringify({
            ...body
        }),
    }).then(resolve => resolve.json());
    return result;
}

const getItems = async (idProduct) => {
    const result = await fetch("/add-item", {
        method: "POST",
        headers: {
            "Content-Type": "application/json"
        },
        body: JSON.stringify({
            idProduct
        })
    }).then(resolve => resolve.json());
    return result;
}

const userLogout = () => {
    fetch("/logout", {
            method: "POST",
            headers: {
                "Content-Type": "application/json"
            }
        })
        .then(resolve => resolve.json())
        .then(result => {
            if (result.status === "Success") {
                window.location.href = "/login";
                return;
            }
            Swal.fire({
                icon: "error",
                title: result.status,
                text: result.message,
            });
        })
}