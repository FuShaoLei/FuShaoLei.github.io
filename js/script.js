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




// 页面加载时检查并应用主题
document.addEventListener("DOMContentLoaded", function () {
    const savedTheme = localStorage.getItem("theme") || "light";
    document.documentElement.setAttribute("data-theme", savedTheme);

    const currentThemeObject = themeObjectArray.find(item => item.theme === savedTheme);

    console.log("currentThemeObject = ", currentThemeObject)

    const themeEle = document.getElementById("theme-change-btn");
    themeEle.innerText = currentThemeObject.name
});

document.getElementById("theme-change-btn").addEventListener("click", function () {
    const html = document.documentElement;
    const currentTheme = html.getAttribute("data-theme")

    // const nextTheme

    const currentIndex = themeObjectArray.findIndex(item => item.theme === currentTheme);

    const nextIndex = currentIndex === themeObjectArray.length - 1 ? 0 : currentIndex + 1;

    const newTheme = themeObjectArray[nextIndex].theme;

    html.setAttribute("data-theme", newTheme);
    localStorage.setItem("theme", newTheme);

    const themeEle = document.getElementById("theme-change-btn");
    themeEle.innerText = themeObjectArray[nextIndex].name


});