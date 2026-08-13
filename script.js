/* =====================================================
   START WEBSITE
===================================================== */

loadGallery();


/* =====================================================
   WEBSITE PROTECTION
===================================================== */

/* منع الزر الأيمن */
document.addEventListener("contextmenu", function (event) {
    event.preventDefault();
});


/* منع سحب الصور */
document.addEventListener("dragstart", function (event) {

    if (event.target.tagName === "IMG") {
        event.preventDefault();
    }

});


/* منع النسخ */
document.addEventListener("copy", function (event) {
    event.preventDefault();
});


/* منع القص */
document.addEventListener("cut", function (event) {
    event.preventDefault();
});


/* منع تحديد النص */
document.addEventListener("selectstart", function (event) {

    if (
        event.target.tagName !== "INPUT" &&
        event.target.tagName !== "TEXTAREA"
    ) {

        event.preventDefault();

    }

});


/* منع اختصارات الحفظ والنسخ ومصدر الصفحة */
document.addEventListener("keydown", function (event) {

    const key =
        event.key.toLowerCase();


    /* Ctrl + S */
    if (
        event.ctrlKey &&
        key === "s"
    ) {

        event.preventDefault();

    }


    /* Ctrl + C */
    if (
        event.ctrlKey &&
        key === "c"
    ) {

        event.preventDefault();

    }


    /* Ctrl + U */
    if (
        event.ctrlKey &&
        key === "u"
    ) {

        event.preventDefault();

    }


    /* Ctrl + Shift + I */
    if (
        event.ctrlKey &&
        event.shiftKey &&
        key === "i"
    ) {

        event.preventDefault();

    }


    /* Ctrl + Shift + J */
    if (
        event.ctrlKey &&
        event.shiftKey &&
        key === "j"
    ) {

        event.preventDefault();

    }


    /* Ctrl + Shift + C */
    if (
        event.ctrlKey &&
        event.shiftKey &&
        key === "c"
    ) {

        event.preventDefault();

    }


    /* F12 */
    if (
        event.key === "F12"
    ) {

        event.preventDefault();

    }

});
