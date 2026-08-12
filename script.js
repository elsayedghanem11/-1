/* =====================================================
   GITHUB SETTINGS
===================================================== */

/*
    مهم جدًا:

    غيّر فقط:

    GITHUB_USERNAME
    GITHUB_REPO

    مثال:

    لو رابط GitHub:

    https://github.com/ahmed123/maktaba-zaeem

    يبقى:

    GITHUB_USERNAME = "ahmed123";
    GITHUB_REPO = "maktaba-zaeem";
*/

const GITHUB_USERNAME = "ضع_اسم_حسابك_هنا";

const GITHUB_REPO = "ضع_اسم_المستودع_هنا";

const GITHUB_BRANCH = "main";


/* =====================================================
   CATEGORIES
===================================================== */

const categories = [

    "شهادات تقدير",

    "كروت سبوع",

    "كروت أفراح وكتب كتاب",

    "بصمات أفراح",

    "مناديل كتب كتاب",

    "صور شخصية"

];


/* =====================================================
   ELEMENTS
===================================================== */

const filters =
    document.getElementById("filters");

const galleryGrid =
    document.getElementById("galleryGrid");

const themeBtn =
    document.getElementById("themeBtn");

const lightbox =
    document.getElementById("lightbox");

const lightboxImage =
    document.getElementById("lightboxImage");

const lightboxInfo =
    document.getElementById("lightboxInfo");

const lightboxClose =
    document.getElementById("lightboxClose");

const prevBtn =
    document.getElementById("prevBtn");

const nextBtn =
    document.getElementById("nextBtn");


/* =====================================================
   DATA
===================================================== */

let galleryData = [];

let currentImages = [];

let currentIndex = 0;


/* =====================================================
   CREATE GITHUB API URL
===================================================== */

function getGitHubUrl(category) {

    return (
        `https://api.github.com/repos/` +
        `${GITHUB_USERNAME}/` +
        `${GITHUB_REPO}/contents/images/` +
        encodeURIComponent(category) +
        `?ref=${GITHUB_BRANCH}`
    );

}


/* =====================================================
   CHECK IMAGE
===================================================== */

function isImage(fileName) {

    const extensions = [

        ".jpg",
        ".jpeg",
        ".png",
        ".webp",
        ".gif",
        ".bmp"

    ];


    const lower =
        fileName.toLowerCase();


    return extensions.some(
        extension =>
            lower.endsWith(extension)
    );

}


/* =====================================================
   GET IMAGE NAME
===================================================== */

function getImageName(fileName) {

    return fileName
        .replace(/\.[^/.]+$/, "")
        .replace(/[-_]/g, " ");

}


/* =====================================================
   LOAD GITHUB GALLERY
===================================================== */

async function loadGallery() {

    galleryGrid.innerHTML = `

        <div class="loading">

            <div class="loader"></div>

            <h3>
                جاري تحميل الأعمال
            </h3>

            <p>
                بنجيب الصور من GitHub...
            </p>

        </div>

    `;


    try {

        /*
            نتأكد أن البيانات الأساسية صحيحة
        */

        if (
            GITHUB_USERNAME.includes("ضع_") ||
            GITHUB_REPO.includes("ضع_")
        ) {

            throw new Error(
                "قم بتعديل بيانات GitHub داخل script.js"
            );

        }


        const requests =
            categories.map(
                async category => {

                    const response =
                        await fetch(
                            getGitHubUrl(category)
                        );


                    if (!response.ok) {

                        /*
                            لو الفولدر مش موجود
                            نرجع قسم فاضي
                        */

                        if (
                            response.status === 404
                        ) {

                            return {

                                name: category,

                                images: []

                            };

                        }


                        throw new Error(
                            `GitHub Error ${response.status}`
                        );

                    }


                    const files =
                        await response.json();


                    const images =
                        files
                            .filter(file =>
                                file.type === "file" &&
                                isImage(file.name)
                            )
                            .map(file => ({

                                name:
                                    getImageName(
                                        file.name
                                    ),

                                fileName:
                                    file.name,

                                url:
                                    file.download_url,

                                category:
                                    category

                            }));


                    return {

                        name:
                            category,

                        images:
                            images

                    };

                }
            );


        galleryData =
            await Promise.all(requests);


        createFilters();


        showGallery("all");

    }

    catch (error) {

        console.error(error);


        createFilters();


        galleryGrid.innerHTML = `

            <div class="error">

                <i class="fa-solid fa-triangle-exclamation"></i>

                <h3>
                    حصل خطأ في تحميل الأعمال
                </h3>

                <p>
                    تأكد من بيانات GitHub داخل
                    script.js
                </p>

            </div>

        `;

    }

}


/* =====================================================
   CREATE FILTER BUTTONS
===================================================== */

function createFilters() {

    filters.innerHTML = "";


    /*
        زر الكل
    */

    createFilterButton(
        "الكل",
        "all",
        true
    );


    /*
        الأقسام
    */

    categories.forEach(category => {

        createFilterButton(
            category,
            category
        );

    });

}


/* =====================================================
   CREATE BUTTON
===================================================== */

function createFilterButton(
    text,
    value,
    active = false
) {

    const button =
        document.createElement("button");


    button.className =
        "filter";


    if (active) {

        button.classList.add("active");

    }


    button.textContent =
        text;


    button.addEventListener(
        "click",
        () => {

            document
                .querySelectorAll(".filter")
                .forEach(btn => {

                    btn.classList.remove(
                        "active"
                    );

                });


            button.classList.add("active");


            showGallery(value);

        }
    );


    filters.appendChild(button);

}


/* =====================================================
   SHOW GALLERY
===================================================== */

function showGallery(category) {

    galleryGrid.innerHTML = "";


    let images = [];


    /*
        عرض الكل
    */

    if (category === "all") {

        galleryData.forEach(folder => {

            images.push(
                ...folder.images
            );

        });

    }

    /*
        عرض قسم واحد
    */

    else {

        const folder =
            galleryData.find(
                item =>
                    item.name === category
            );


        if (folder) {

            images =
                folder.images;

        }

    }


    currentImages =
        images;


    /*
        مفيش صور
    */

    if (images.length === 0) {

        galleryGrid.innerHTML = `

            <div class="empty">

                <i class="fa-regular fa-images"></i>

                <h3>
                    لا توجد صور هنا
                </h3>

                <p>
                    أضف الصور إلى فولدر هذا القسم
                    على GitHub
                </p>

            </div>

        `;

        return;

    }


    /*
        إنشاء الكروت
    */

    images.forEach(
        (image, index) => {

            const card =
                document.createElement("div");


            card.className =
                "gallery-item";


            card.style.animationDelay =
                `${index * 0.04}s`;


            card.innerHTML = `

                <img
                    src="${image.url}"
                    alt="${image.name}"
                    loading="lazy"
                >

                <div class="gallery-overlay">

                    <div class="gallery-info">

                        <small>
                            ${image.category}
                        </small>

                        <h3>
                            ${image.name}
                        </h3>

                    </div>

                    <div class="view-image">

                        <i
                            class="fa-solid fa-expand"
                        ></i>

                    </div>

                </div>

            `;


            card.addEventListener(
                "click",
                () => {

                    openLightbox(index);

                }
            );


            galleryGrid.appendChild(card);

        }
    );

}


/* =====================================================
   OPEN LIGHTBOX
===================================================== */

function openLightbox(index) {

    if (
        currentImages.length === 0
    ) {

        return;

    }


    currentIndex =
        index;


    updateLightbox();


    lightbox.classList.add(
        "show"
    );


    document.body.style.overflow =
        "hidden";

}


/* =====================================================
   UPDATE LIGHTBOX
===================================================== */

function updateLightbox() {

    const image =
        currentImages[currentIndex];


    if (!image) {

        return;

    }


    lightboxImage.src =
        image.url;


    lightboxImage.alt =
        image.name;


    lightboxInfo.innerHTML = `

        <strong>
            ${image.name}
        </strong>

        <span>
            ${image.category}
        </span>

        <small>
            ${currentIndex + 1}
            /
            ${currentImages.length}
        </small>

    `;

}


/* =====================================================
   PREVIOUS IMAGE
===================================================== */

function previousImage() {

    if (
        currentImages.length === 0
    ) {

        return;

    }


    currentIndex--;


    if (currentIndex < 0) {

        currentIndex =
            currentImages.length - 1;

    }


    updateLightbox();

}


/* =====================================================
   NEXT IMAGE
===================================================== */

function nextImage() {

    if (
        currentImages.length === 0
    ) {

        return;

    }


    currentIndex++;


    if (
        currentIndex >=
        currentImages.length
    ) {

        currentIndex = 0;

    }


    updateLightbox();

}


/* =====================================================
   CLOSE LIGHTBOX
===================================================== */

function closeLightbox() {

    lightbox.classList.remove(
        "show"
    );


    document.body.style.overflow =
        "";

}


/* =====================================================
   BUTTONS
===================================================== */

prevBtn.addEventListener(
    "click",
    previousImage
);


nextBtn.addEventListener(
    "click",
    nextImage
);


lightboxClose.addEventListener(
    "click",
    closeLightbox
);


/* =====================================================
   CLICK OUTSIDE IMAGE
===================================================== */

lightbox.addEventListener(
    "click",
    event => {

        if (
            event.target === lightbox
        ) {

            closeLightbox();

        }

    }
);


/* =====================================================
   KEYBOARD
===================================================== */

document.addEventListener(
    "keydown",
    event => {

        if (
            !lightbox.classList.contains(
                "show"
            )
        ) {

            return;

        }


        if (
            event.key === "ArrowRight"
        ) {

            previousImage();

        }


        if (
            event.key === "ArrowLeft"
        ) {

            nextImage();

        }


        if (
            event.key === "Escape"
        ) {

            closeLightbox();

        }

    }
);


/* =====================================================
   DARK / LIGHT MODE
===================================================== */

themeBtn.addEventListener(
    "click",
    () => {

        document.body.classList.toggle(
            "light"
        );


        const icon =
            themeBtn.querySelector("i");


        if (
            document.body.classList.contains(
                "light"
            )
        ) {

            icon.className =
                "fa-solid fa-sun";

        }

        else {

            icon.className =
                "fa-solid fa-moon";

        }

    }
);


/* =====================================================
   START
===================================================== */

loadGallery();