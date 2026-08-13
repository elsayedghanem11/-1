/* =====================================================
   CATEGORIES
===================================================== */

const categories = [
    "بصمات افراح",
    "شهادات تقدير",
    "صور شخصية",
    "كروت افراح وكتب كتاب",
    "كروت سبوع",
    "مناديل كتب كتاب"
];


/* =====================================================
   ELEMENTS
===================================================== */

const filters = document.getElementById("filters");
const galleryGrid = document.getElementById("galleryGrid");

const themeBtn = document.getElementById("themeBtn");

const lightbox = document.getElementById("lightbox");
const lightboxImage = document.getElementById("lightboxImage");
const lightboxInfo = document.getElementById("lightboxInfo");

const lightboxClose = document.getElementById("lightboxClose");

const prevBtn = document.getElementById("prevBtn");
const nextBtn = document.getElementById("nextBtn");


/* =====================================================
   DATA
===================================================== */

let galleryData = [];
let currentImages = [];
let currentIndex = 0;


/* =====================================================
   GET IMAGE NAME
===================================================== */

function getImageName(path) {

    const fileName =
        path.split("/").pop();

    return fileName
        .replace(/\.[^/.]+$/, "")
        .replace(/[-_]/g, " ");

}


/* =====================================================
   LOAD IMAGES.JSON
===================================================== */

async function loadGallery() {

    galleryGrid.innerHTML = `

        <div class="loading">

            <div class="loader"></div>

            <h3>
                جاري تحميل الأعمال
            </h3>

            <p>
                انتظر لحظة...
            </p>

        </div>

    `;

    try {

        const response = await fetch(
            "images.json?v=" + Date.now()
        );


        if (!response.ok) {

            throw new Error(
                "images.json Error: " +
                response.status
            );

        }


        const data =
            await response.json();


        /* =================================================
           تحويل البيانات إلى الشكل المطلوب
        ================================================= */

        galleryData =
            categories.map(category => {

                const files =
                    data[category] || [];


                const images =
                    files.map(path => ({

                        name:
                            getImageName(path),

                        fileName:
                            path.split("/").pop(),

                        url:
                            path,

                        category:
                            category

                    }));


                return {

                    name:
                        category,

                    images:
                        images

                };

            });


        createFilters();

        showGallery("all");


    }

    catch (error) {

        console.error(
            "Gallery Error:",
            error
        );


        galleryGrid.innerHTML = `

            <div class="error">

                <i class="fa-solid fa-triangle-exclamation"></i>

                <h3>
                    حصل خطأ في تحميل الصور
                </h3>

                <p>
                    تأكد أن ملف images.json موجود بجوار index.html
                </p>

            </div>

        `;

    }

}


/* =====================================================
   CREATE FILTERS
===================================================== */

function createFilters() {

    filters.innerHTML = "";


    createFilterButton(
        "الكل",
        "all",
        true
    );


    categories.forEach(category => {

        createFilterButton(
            category,
            category
        );

    });

}


/* =====================================================
   CREATE FILTER BUTTON
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

        button.classList.add(
            "active"
        );

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


            button.classList.add(
                "active"
            );


            showGallery(value);

        }
    );


    filters.appendChild(
        button
    );

}


/* =====================================================
   SHOW GALLERY
===================================================== */

function showGallery(category) {

    galleryGrid.innerHTML = "";

    let images = [];


    /* =================================================
       ALL
    ================================================= */

    if (category === "all") {

        galleryData.forEach(folder => {

            images.push(
                ...folder.images
            );

        });

    }


    /* =================================================
       CATEGORY
    ================================================= */

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


    /* =================================================
       NO IMAGES
    ================================================= */

    if (images.length === 0) {

        galleryGrid.innerHTML = `

            <div class="empty">

                <i class="fa-regular fa-images"></i>

                <h3>
                    لا توجد صور هنا
                </h3>

            </div>

        `;

        return;

    }


    /* =================================================
       CREATE IMAGE CARDS
    ================================================= */

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
                    src="${encodeURI(image.url)}"
                    alt="${image.name}"
                    loading="lazy"
                    decoding="async"
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

                        <i class="fa-solid fa-expand"></i>

                    </div>

                </div>

            `;


            card.addEventListener(
                "click",
                () => {

                    openLightbox(index);

                }
            );


            galleryGrid.appendChild(
                card
            );

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
        encodeURI(image.url);


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
   PREVIOUS
===================================================== */

function previousImage() {

    if (
        currentImages.length === 0
    ) {

        return;

    }


    currentIndex--;


    if (
        currentIndex < 0
    ) {

        currentIndex =
            currentImages.length - 1;

    }


    updateLightbox();

}


/* =====================================================
   NEXT
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
   BUTTON EVENTS
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
   CLICK OUTSIDE
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
   START WEBSITE
===================================================== */

loadGallery();
