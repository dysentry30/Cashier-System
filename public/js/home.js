const form = document.querySelector("form");
let itemsProduct = [];
let myUser = {};
fetch("/get-user", {
        method: "POST",
        headers: {
            "Content-Type": "application/json",
        }
    })
    .then(resolve => resolve.json())
    .then(user => {
        myUser = {
            id_user: user.id_user,
            name: user.name
        };
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

    if (idProduct.match(/\D/gi)) {
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
    itemsProduct = [...result.itemsProduct];
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
    itemsProduct = [...result.itemsProduct];
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
                "Content-Type": "application/json",
                "Pragma": "no-cache",
                "Cache-Control": "no-cache",
                'Expires': '0',
            },
            cache: "no-cache",
        }).then(resolve => resolve.json());
        return result;
    }
    const result = await fetch(url, {
        method: "POST",
        headers: {
            "Content-Type": "application/json",
            "Pragma": "no-cache",
            "Cache-Control": {
                "Max-Age": 0
            },
            'Expires': 0,
        },
        cache: "no-cache",
        body: JSON.stringify({
            ...body
        }),
    }).then(resolve => resolve.json());
    return result;
}

const addItems = async (idProduct) => {
    const result = await myFetch({
        url: "/add-item",
        body: {
            idProduct
        }
    })
    itemsProduct = [...result.itemsProduct];
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

const scanInputFocus = () => {
    document.querySelector("#id-product").focus();
    return;
}

const confirmDialog = () => {
    let confirmDialog = new bootstrap.Modal(document.getElementById('confirmDialog'));
    let emptyDialog = new bootstrap.Modal(document.getElementById("emptyDialog"));

    document.querySelector("#text-confirm").classList.add("text-primary");
    document.querySelector(".progress-bar").setAttribute("aria-valuenow", 50);
    document.querySelector(".progress-bar").style.width = "50%";
    document.querySelector(".progress-bar").textContent = "50%";


    let html = ""

    if (itemsProduct.length > 0) {
        let totalPrice = 0;
        itemsProduct.forEach(item => {
            const price = Intl.NumberFormat("id").format(item.price.toString());
            const totalPricePerItem = item.price * item.quantity;
            totalPrice += totalPricePerItem;
            const totalPricePerItemFormatted = Intl.NumberFormat("id").format(totalPricePerItem.toString());
            html += `<li class="list-group-item d-flex justify-content-between align-items-center">
            <h6 style="max-width: 80px;">${item.name}</h6>
            <h6>${item.quantity}</h6>
            <div class="row">
                <h6><b>Rp ${totalPricePerItemFormatted}</b></h6>
                <small class="text-muted"><b>Rp ${price}</b> per item</small>
            </div>
        </li>`
        });

        const totalPriceFormatted = Intl.NumberFormat("id").format(totalPrice.toString());
        document.querySelector("#total-price-confirm").textContent = `Rp ${totalPriceFormatted}`;
        document.querySelector("#list-items-confirm").innerHTML = html;

        confirmDialog.show();

        const paymentTab = new bootstrap.Tab(document.querySelector("#payment-tab"));
        const confirmTab = new bootstrap.Tab(document.querySelector("#confirm-tab"));
        const addTransaction = async e => {
            e.preventDefault();
            if (parseInt(amount) == 0 || parseInt(amount) < totalPrice) {
                console.log("error");
                return;
            }
            const transaction = {
                itemsProduct,
                user: myUser,
                amount: parseInt(amount),
                totalPrice

            };
            const result = await myFetch({
                url: "/add-transaction",
                body: transaction
            });
            if (result.status === "Success") {
                const changesFormatted = Intl.NumberFormat("id").format(result.changes.toString());
                Swal.fire({
                    icon: result.status.toLowerCase(),
                    title: result.status,
                    html: `${result.message}\nChanges: <u><b>Rp ${changesFormatted}</b></u>`,
                });
            } else {
                Swal.fire({
                    icon: result.status.toLowerCase(),
                    title: result.status,
                    html: `${result.message}\n<div class="d-grid mt-2">
                    <button data-error="${result.errorMessage}" onclick="reportError()" class="btn btn-link">Report this error</button>
                </div>`,
                });
            }
            await clearAllItems()
            amount = 0;
            totalPrice = 0;
            document.querySelector("#btn-confirm").removeEventListener("click", addTransaction);
            document.querySelector("#btn-back").click();
            document.querySelector("#btn-cancel").click();
            return;
        };

        document.querySelector("#btn-next").addEventListener("click", e => {
            document.querySelector(".progress-bar").setAttribute("aria-valuenow", 100);
            document.querySelector(".progress-bar").style.width = "100%";
            document.querySelector(".progress-bar").textContent = "100%";

            document.querySelector("#btn-next").classList.add("hide");
            document.querySelector("#btn-confirm").classList.remove("hide");

            document.querySelector("#text-payment").classList.add("text-primary");

            document.querySelector("#total-price-payment").textContent = `Rp ${totalPriceFormatted}`;


            paymentTab.show();
            document.querySelector("#btn-cancel").classList.add("hide");
            document.querySelector("#btn-back").classList.remove("hide");

            document.querySelector("#btn-back").addEventListener("show.bs.tab", e => {
                // paymentTab.
                confirmTab.show();
                document.querySelector(".progress-bar").setAttribute("aria-valuenow", 0);
                document.querySelector(".progress-bar").style.width = "0%";
                document.querySelector(".progress-bar").textContent = "0%";

                document.querySelector("#btn-cancel").classList.remove("hide");
                document.querySelector("#btn-back").classList.add("hide");
                document.querySelector("#btn-next").classList.remove("hide");
                document.querySelector("#btn-confirm").classList.add("hide");

                document.querySelector("#text-payment").classList.remove("text-primary");
                document.querySelector(".progress-bar").setAttribute("aria-valuenow", 50);
                document.querySelector(".progress-bar").style.width = "50%";
                document.querySelector(".progress-bar").textContent = "50%";

            });

        });

        document.querySelector("#btn-cancel").addEventListener("click", e => {
            document.querySelector("#id-product").focus();
        });

        document.querySelector("#price-pay").value = "0";
        const amountValue = parseInt(document.querySelector("#price-pay").value);
        if (amountValue === 0) {
            // document.querySelector("#btn-confirm").removeEventListener("click", this.event);
            // document.querySelector("#btn-confirm").classList.add("disabled");
            document.querySelector("#changes-text").textContent = `Rp 0`;
        }

        if ((amountValue < totalPrice)) {
            // document.querySelector("#btn-confirm").removeEventListener("click", this.event);
            document.querySelector("#btn-confirm").classList.add("disabled");
            document.querySelector("#payment-error").textContent = "Amount must be greater than total price";
            document.querySelector("#payment-error").classList.remove("hide");
            document.querySelector("#price-pay").classList.add("border-danger");
            document.querySelector("#changes-text").textContent = `Rp 0`;
        }

        let amount = 0;
        document.querySelector("#price-pay").addEventListener("keyup", e => {
            amount = e.target.value.toString().replaceAll(new RegExp(/\D/gi), "").trim();
            const moneyChanges = amount - totalPrice;
            const amountFormatted = Intl.NumberFormat("id").format(amount.toString());
            const moneyChangesFormatted = Intl.NumberFormat("id").format(moneyChanges.toString());
            document.querySelector("#price-pay").value = amountFormatted;

            if (!amount || document.querySelector("#btn-confirm").removeEventListener("click", this.event)) {
                document.querySelector("#btn-confirm").removeEventListener("click", this.event);
                document.querySelector("#btn-confirm").classList.add("disabled");
                document.querySelector("#changes-text").textContent = `Rp 0`;
                return;
            }

            if ((amount < totalPrice) || document.querySelector("#btn-confirm").removeEventListener("click", this.event)) {
                document.querySelector("#btn-confirm").removeEventListener("click", this.event);
                document.querySelector("#btn-confirm").classList.add("disabled");
                document.querySelector("#payment-error").textContent = "Amount must be greater than total price";
                document.querySelector("#payment-error").classList.remove("hide");
                document.querySelector("#price-pay").classList.add("border-danger");
                document.querySelector("#changes-text").textContent = `Rp 0`;
                return;
            }
            document.querySelector("#btn-confirm").classList.remove("disabled");
            document.querySelector("#payment-error").textContent = "";
            document.querySelector("#payment-error").classList.add("hide");
            document.querySelector("#price-pay").classList.remove("border-danger");
            document.querySelector("#changes-text").textContent = `Rp ${moneyChangesFormatted}`;

            return;
        });

        document.querySelector("#btn-confirm").addEventListener("click", addTransaction);

    } else {
        emptyDialog.show();
        return;
    }
}




// document.querySelector("#btn-back").addEventListener("show.bs.tab", e => {
//     // paymentTab.
//     confirmTab.show();
// });