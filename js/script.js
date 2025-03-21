let links = document.querySelectorAll(".nav_link");

function isActive(pathname) {
    let rootPath = window.location.pathname
    let path = pathname + "/"
    return pathname === rootPath || path === rootPath;
}

for (let link of links) {
    let linkPath = link.getAttribute("href");


    if (isActive(linkPath)) {
        console.log("active linkPath => "+linkPath)
        link.className = "nav_link active_link";
    } else {
        link.className = "nav_link"
    }
}
