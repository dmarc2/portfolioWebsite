//GLOBAL VARIABLES
var projects = [];
var tagInfo = [];

window.addEventListener("DOMContentLoaded",()=>{
    fetchTagInfo();
    fetchProjectData().then(() => {
        loadDynamicContent();
    });

    $("body").on("click", e=> {
        if(e.target.nodeName != "NAV" && e.target.parentNode.nodeName != "NAV" && $(".hamburger-menu-nav").length > 0) {
        $('.hamburger-menu-nav').css('display','none');
        }
    })
});

/*
    This function is used to remove a cookie from the document.cookie.
    @param cName - The name of the cookie
*/
function removeCookie(cName) {
    if(cookie_isset(cName)) {
        document.cookie = cName + "=; expires=Thu, 01 Jan 1970 00:00:00 GMT; path=/;";
    }
}

/*
    This function is used to set a cookie to document.cookie. Note: If
    cValue is empty and the cookie is already set then the cookie will
    be removed.
    @param cName - The name of the cookie
    @param cValue - The value of the cookie
    @param exdays - The number of days until expiration (default=1)
    @param path - The cookie's domain path (default="/")
*/
function setCookie(cName, cValue, exdays=1, path="/") {
    if(exdays < 1) exdays = 1;  //Range check!

    const d = new Date();
    d.setTime(d.getTime() + (exdays * 24 * 60 * 60 * 1000));

    if(cookie_isset(cName)) {
    if(cValue.trim() == "")
        removeCookie(cName);
        return;
    }

    if(cName.trim() != "" && cValue.trim() != "")
    document.cookie = cName + "=" + cValue + "; expires="+d.toUTCString()+"; path=" + path + ";";
}

/*
    This function is used to get a cookie from document.cookie.
    @param cName - The name of the cookie
    @return - Returns the cookie's key:value pair.
*/
function getCookie(cName) {
    if(cookie_isset(cName)) {
    let cookies = document.cookie.split(";");
    for(let i = 0; i < cookies.length; i++) {
        if(cookies[i].includes(cName+"=")) {
        return cookies[i].trim();
        }
    }
    }
}

/*
    This function is used to test if a cookie is set
    to a certain value. If the cValue isn't provided
    then the function tests if the cookie is in
    the document.cookie variable regardless of value.
    @param cName - The name of the cookie
    @param cValue - The cookie value expected (default=null)
*/
function cookie_isset(cName, cValue=null) {
    if(cValue != null) {
        if(document.cookie.includes(cName+"="+cValue))
            return true;
        return false;
    }
    else if(document.cookie.includes(cName+"="))
        return true;

    return false;
}

/*
    This function is used to fetch project data from
    json file and store results in projects global array.
*/
function fetchProjectData() {
    return fetch("projects.json")
        .then(response => response.json())
        .then(data => {
            for(let i = 0; i < data.projects.length; i++) {
                projects.push(data.projects[i]);
            }
        });
}

/*
    This function is used to fetch tag info data from
    json file and store results in tagInfo global array.
*/
function fetchTagInfo() {
    return fetch("taginfo.json")
        .then(response => response.json())
        .then(data => {
            for(let i = 0; i < data.tagInfo.length; i++) {
                tagInfo.push(data.tagInfo[i]);
            }
        });
}

/*
    This function is used to get the html content of all the projects
    stored in the global projects array. 
    @return - Returns the html content as a string.
*/
function getAllProjects() {
    return getProjects(projects.length);
}

/*
    This function is used to get the html content of a number of
    projects based on the argument provided.
    @param howMany - The number of projects to return.
    @return - Returns the html content as a string.
*/
function getProjects(howMany) {
    let htmlContent = "";
    for(let i = 0; i < howMany && i < projects.length; i++) {
        htmlContent += "<div class='project' onclick='showMore("+i+")'>";
        htmlContent += "<img src='" +projects[i].images[0]+ "' alt='Project Image'>";
        htmlContent += "<h3>" +projects[i].title+ "</h3>";
        htmlContent += "<p>" +projects[i].description.replace("<br>"," ").substring(0,150)+ "...</p>";
        htmlContent += "<div class='tags'><ul>";
        projects[i].tags.forEach(tag=>{
            htmlContent += "<li class='tag' style='border: dashed 3px " +getTagColor(tag)+ "'>" +tag+ "</li>";
        });
        htmlContent += "</ul></div></div>"
    }
    return htmlContent;
}

/*
    This function is used to get the color of a tag.
    @param tag - The name of the tag.
    @return - Returns the color as a string if tag found; otherwise, returns undefined.
*/
function getTagColor(tag) {
    for(let i = 0; i < tagInfo.length; i++) {
        if(tag == tagInfo[i].name) {
            return tagInfo[i].color;
        }
    }
    return undefined;
}

/*
    This function is used to load project content into website based on
    current page.
*/
function loadDynamicContent() {
    let currentPage = location.href.substring(location.href.lastIndexOf("/")+1);
    if(currentPage == "index.html") {
        $(".projects-showcase").html(getProjects(6));
    }
    else if(currentPage == "projects.html") {
        $("main").html(getAllProjects());
    }
}

/*
    This helper function is used to get the html of the project content to show in its pop-up dialog.
    @index - The index of the project in the global projects array.
    @return - Returns the html of the project's content as a string.
*/
function getProjContent(index) {
    //TODO: fix issue with onclick for <> btns
    //"<div><div><div class='prevNextBtns' onclick='goToPrevBubble("+index+","+(-1)+")'><</div><img id='projMoreVisual' src='" +projects[index].images[0]+ "' alt='Project Image'><div class='prevNextBtns' onclick='goToNextBubble("+index+","+(1)+")'>></div></div><div class='bubbles'>"+getBubbles(index)+"</div></div>" + 
    let content = "<div class='project-more-container'>" +
    "<div><div><div class='prevNextBtns'><</div><img id='projMoreVisual' src='" +projects[index].images[0]+ "' alt='Project Image'><div class='prevNextBtns'>></div></div><div class='bubbles'>"+getBubbles(index)+"</div></div>" + 
    "<div><h1>" +projects[index].title+ "</h1><article><p>" +projects[index].description+ "</p></article><div class='project-links'><div class='resource-links'>" +
    getResourceLinks(index) + "</div><div class='external-links'>" +
    getExternalLinks(index) +
    "</div></div><div class='tags'><ul>";
    projects[index].tags.forEach(tag=>{
        content += "<li class='tag' style='border: dashed 1px " +getTagColor(tag)+ "'>" +tag+ "</li>";
    });
    content += "</ul></div></div></div>"
    return content;
}

function goToPrevBubble(projIndex, selectedBubbleIndex) {
    let isInImagesArray = false;
    if(selectedBubbleIndex >= 0 && selectedBubbleIndex < projects[projIndex].images.length) {
        isInImagesArray = true;
    }

    if(!isInImagesArray) {
        let videoArrayIndex = selectedBubbleIndex - projects[projIndex].images.length;
        //if not check if videos array has elements and if index is in range of videos array
        if(0 <= videoArrayIndex && videoArrayIndex < projects[projIndex].videos.length) {
            //if so, change video and highlight bubble
            //changeProjMoreContent("video", videoArrayIndex);
            $(".selected-bubble").removeClass("selected-bubble");
            $(".bubbles> div:nth-child("+(selectedBubbleIndex+1)+")").addClass("selected-bubble");
            $(".prevNextBtns:first-of-type").off("click");
            $(".prevNextBtns:last-of-type").off("click");
            $(".prevNextBtns:first-of-type").on("click",function(){goToPrevBubble(projIndex,selectedBubbleIndex-1);});
            $(".prevNextBtns:last-of-type").on("click",function(){goToNextBubble(projIndex,selectedBubbleIndex+1);});
            $("#projMoreVisual").attr("src",projects[projIndex].videos[videoArrayIndex]);//TODO: Change img tag to <video>
            return;
        }
    }

    //Check if index is in range of images array
    if(0 <= selectedBubbleIndex && selectedBubbleIndex < projects[projIndex].images.length) {
        //if so, change image and highlight bubble
        //changeProjMoreContent("image", videoArrayIndex);
        $(".selected-bubble").removeClass("selected-bubble");
        $(".bubbles> div:nth-child("+(selectedBubbleIndex+1)+")").addClass("selected-bubble");
        $(".prevNextBtns:first-of-type").off("click");
        $(".prevNextBtns:last-of-type").off("click");
        $(".prevNextBtns:first-of-type").on("click",function(){goToPrevBubble(projIndex,selectedBubbleIndex-1);});
        $(".prevNextBtns:last-of-type").on("click",function(){goToNextBubble(projIndex,selectedBubbleIndex+1);});
        $("#projMoreVisual").attr("src",projects[projIndex].images[selectedBubbleIndex]);
    }

    //otherwise, do nothing
}

function changeProjMoreContent(type, index) {
    $(".selected-bubble").removeClass("selected-bubble");
    if(type == "video") {
        $(".bubbles> div:nth-child("+(index+projects[index].images.length+1)+")").addClass("selected-bubble");
    }
    else {
        $(".bubbles> div:nth-child("+(index+1)+")").addClass("selected-bubble");
    }
}

function goToNextBubble(projIndex, selectedBubbleIndex) {
    let isInImagesArray = true;
    if(selectedBubbleIndex >= projects[projIndex].images.length) {
        isInImagesArray = false;
    }

    if(!isInImagesArray) {
        let videoArrayIndex = selectedBubbleIndex - projects[projIndex].images.length;
        //if not check if videos array has elements and if index is in range of videos array
        if(0 <= videoArrayIndex && videoArrayIndex < projects[projIndex].videos.length) {
            //if so, change video and highlight bubble
            //changeProjMoreContent("video", videoArrayIndex);
            $(".selected-bubble").removeClass("selected-bubble");
            $(".bubbles> div:nth-child("+(selectedBubbleIndex+1)+")").addClass("selected-bubble");
            $(".prevNextBtns:first-of-type").off("click");
            $(".prevNextBtns:last-of-type").off("click");
            $(".prevNextBtns:first-of-type").on("click",function(){goToPrevBubble(projIndex,selectedBubbleIndex-1);});
            $(".prevNextBtns:last-of-type").on("click",function(){goToNextBubble(projIndex,selectedBubbleIndex+1);});
            $("#projMoreVisual").attr("src",projects[projIndex].videos[videoArrayIndex]);//TODO: Change img tag to <video>
            return;
        }
    }

    //Check if index is in range of images array
    if(0 <= selectedBubbleIndex && selectedBubbleIndex < projects[projIndex].images.length) {
        //if so, change image and highlight bubble
        //changeProjMoreContent("image", videoArrayIndex);
        $(".selected-bubble").removeClass("selected-bubble");
        $(".bubbles> div:nth-child("+(selectedBubbleIndex+1)+")").addClass("selected-bubble");
        $(".prevNextBtns:first-of-type").off("click");
        $(".prevNextBtns:last-of-type").off("click");
        $(".prevNextBtns:first-of-type").on("click",function(){goToPrevBubble(projIndex,selectedBubbleIndex-1);});
        $(".prevNextBtns:last-of-type").on("click",function(){goToNextBubble(projIndex,selectedBubbleIndex+1);});
        $("#projMoreVisual").attr("src",projects[projIndex].images[selectedBubbleIndex]);
    }

    //otherwise, do nothing
}

function getBubbles(index) {
    let bubblesHTML = "";

    for(let i = 0; i < projects[index].images.length; i++) {
        if(i == 0)
            bubblesHTML += "<div class='selected-bubble'></div>";
        else
            bubblesHTML += "<div></div>";
    }
    for(let i = 0; i < projects[index].videos.length; i++) {
        bubblesHTML += "<div class='video-bubble'></div>";
    }
    
    return bubblesHTML;
}

function getResourceLinks(index) {
    let content = "";
    projects[index].resourceLinks.forEach(link=>{
        if(link.type == "pdf")
            content += "<a href='" +link.url+ "' download>Download project pdf</a>";
        else if(link.type == "powerpoint")
            content += "<a href='" +link.url+ "' download>Download project powerpoint</a>";
    });
 
    return content;
}

function getExternalLinks(index) {
    let content = "";
    projects[index].externalLinks.forEach(link=>{
        if(link.site == "github")
            content += "<a href='" +link.url+ "' target='_blank'><img src='Images/github-logo.png' alt='" +link.url+ "'></a>";
    });
 
    return content;
}

/*
    This function is used to show the pop-up dialog for a project's contents.
    @index - The index of the project in the global projects array.
*/
function showMore(index) {
    let htmlContent = $("<div class='project-more'><div><div class='exit-btn'>X</div></div>" +getProjContent(index)+ "</div>");

    //Append to document body
    $("body").append(htmlContent);

    //"<div><div><div class='prevNextBtns' onclick='goToPrevBubble("+index+","+(-1)+")'><</div><img id='projMoreVisual' src='" +projects[index].images[0]+ "' alt='Project Image'><div class='prevNextBtns' onclick='goToNextBubble("+index+","+(1)+")'>></div></div><div class='bubbles'>"+getBubbles(index)+"</div></div>" + 
    $(".prevNextBtns:first-of-type").click(function(){goToPrevBubble(index,-1);});
    $(".prevNextBtns:last-of-type").click(function(){goToNextBubble(index,1);});

    $(".exit-btn").click(e => {
        $(".project-more").remove();
    });
}

/*
    This function is used to toggle the display attribute of the resume/cv drop-down links & content.
*/
function toggleDisplay(type) {
    if(type == "cv") {
        if($("#cv-content").css("display") == "none") {
            $("#cv-content").css("display", "block");
            $("#cv-triangle").css({"border-left":"20px solid white","border-bottom":"15px solid transparent", "border-top":"15px solid transparent"});
        }
        else {
            $("#cv-content").css("display", "none");
            $("#cv-triangle").css({"border-left":"15px solid transparent","border-right":"15px solid transparent", "border-top":"20px solid white"});
        }
    }
}

function toggleHamburgerNav() {
    if($(".hamburger-menu-nav").css("display") == "none") {
        $(".hamburger-menu-nav").css("display", "block");
    }
    else {
        $(".hamburger-menu-nav").css("display", "none");
    }
}