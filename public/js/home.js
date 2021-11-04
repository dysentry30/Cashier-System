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
    const idProduct = formData.get("id-product").toString().trim();

    if (!idProduct) {
        document.querySelector("#error-msg").classList.remove("hide");
        document.querySelector("#error-msg").textContent = "This field must be filled";
        document.querySelector("#id-product").classList.add("border-danger");
        return;
    }

    if(idProduct.match(/\D/gi)) {
        document.querySelector("#error-msg").classList.remove("hide");
        document.querySelector("#error-msg").textContent = "This field must be filled with number only";
        document.querySelector("#id-product").classList.add("border-danger");
        return;
    }

    document.querySelector("#error-msg").textContent = "";
    document.querySelector("#error-msg").classList.add("hide");
    document.querySelector("#id-product").classList.remove("border-danger");

    const result = await addItems(idProduct);
    document.querySelector("#id-product").value = "";

    showData(result.itemsProduct);
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
        let totalPrice = 0;
        data.forEach(product => {
            totalPrice += product.quantity * product.price;
            const price = Intl.NumberFormat("id").format(product.price.toString());
            html += `<li class="list-group-item d-flex justify-content-between align-items-center">
            <h6 style="max-width: 80px;">${product.name}</h6>
            <h6>${product.quantity}</h6>
            <h6><b>Rp ${price}</b></h6>
            <button class="btn-close" onclick="deleteItem(this)" data-id-product="${product.id_product}"></button>
        </li>`
        });
        if (document.querySelector("#empty-msg")) {
            document.querySelector("#empty-msg").classList.add("hide");
        }
        if (data.length < 1) {
            document.querySelector("#empty-msg").classList.remove("hide");
            document.querySelector("#total").classList.add("hide");
            document.querySelector("#list-items").innerHTML = html;
            document.querySelector("#list-items").classList.add("hide");
            return;
        }
        document.querySelector("#list-items").innerHTML = html;
        document.querySelector("#list-items").classList.remove("hide");
        document.querySelector("#total").classList.remove("hide");
        document.querySelector("#total-price").textContent = `Rp ${Intl.NumberFormat("id").format(totalPrice.toString())}`;

        return;
    } else {
        throw ": This function need object array parameter not " + typeof data
    }
}

const clearAllItems = async () => {
    const result = await myFetch({
        url: "/clear-all-items"
    });
    showData(result.itemsProduct);
    return;
}

const myFetch = async ({
    url,
    body
}) => {
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

const addItems = async (idProduct) => {
    const result = await myFetch({ url: "/add-item", body: {
        idProduct
    }})
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