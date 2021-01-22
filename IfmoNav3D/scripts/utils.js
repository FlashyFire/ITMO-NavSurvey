export function removeElements(parent, className) {
    const elements = parent.getElementsByClassName(className);
    while (elements.length > 0) elements[0].remove();
}

export function hideElements(parent, className, keepVisible) {
    const elements = parent.getElementsByClassName(className);
    for (let i = 0; i < elements.length; i++) {
        if (elements[i] != keepVisible) elements[i].style.display = "none";
    }
}

export function addHandlers(inputName, handler) {
    document.getElementById("show-" + inputName).onclick = handler;
    document.getElementById(inputName).onkeypress = function (e) {
        if (!e) e = window.event;
        var keyCode = e.code || e.key;
        if (keyCode == "Enter") {
            handler.call();
        }
    };
}

export function strEq(str1, str2) {
    if (str1 === null && str2 === null)
        return true;
    if (str1 === null || str2 === null)
        return false;
    return str1.toUpperCase() === str2.toUpperCase();
}
