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

const selector = (element) => {
    return document.querySelector(element);
}

const myAlert = ({
    icon,
    title,
    html
}) => {
    return Swal.fire({
        icon: icon,
        title: title,
        html: html,
    });
}

const reportError = (e) => {
    const errorMessage = e.getAttribute("data-error");
}