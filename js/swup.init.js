function init() {


    // const swup = new Swup({
    //     containers: ['#swup'], // 你要替换的容器
    //     plugins: [], // 使用渐变效果插件
    //     linkSelector: 'a[nav_link]'
    // });

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

    // let commentWrapper = document.getElementById("article_comment")
    //
    // if (commentWrapper) {
    // //     commentWrapper.style.visibility = "visible"
    // }


    console.log('Swup Page Init');
}

function triggerSwupPageLoad(url) {
    console.log("triggerSwupPageLoad = ", url)

    swup.navigate(url);
}