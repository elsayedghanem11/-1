/* =====================================================
   GITHUB SETTINGS
===================================================== */

const GITHUB_USERNAME = "elsayedghanem11";
const GITHUB_REPO = "-1";
const GITHUB_BRANCH = "main";


/* =====================================================
   CATEGORIES
===================================================== */

const categories = [
    "شهادات تقدير",
    "كروت سبوع",
    "كروت أفراح وكتب كتاب",
    "بصمات افراح",
    "مناديل كتب كتاب",
    "صور شخصية"
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

let galleryData = categories.map(category => ({
    name: category,
    images: [],
    loaded: false,
    loading: false
}));

let currentImages = [];
let currentIndex = 0;


/* =====================================================
   GITHUB API URL
===================================================== */

function getGitHubUrl(category) {

    return (
        "https://api.github.com/repos/" +
        encodeURIComponent(GITHUB_USERNAME) +
        "/" +
        encodeURIComponent(GITHUB_REPO) +
        "/contents/images/" +
        encodeURIComponent(category) +
        "?ref=" +
        encodeURIComponent(GITHUB_BRANCH)
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
        ".bmp",
        ".jfif",
        ".avif"
    ];

    const lower = fileName.toLowerCase();

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
   LOAD ONE CATEGORY
===================================================== */

async function loadCategory(category) {

    const folder =
        galleryData.find(
            item => item.name === category
        );

    if (!folder) {
        return [];
    }


    /* لو اتحمل قبل كده */

    if (folder.loaded) {
        return folder.images;
    }


    /* لو بيتحمل حاليًا */

    if (folder.loading) {
        return folder.images;
    }


    folder.loading = true;


    try {

        const response =
            await fetch(
                getGitHubUrl(category),
                {
                    cache: "no-store"
                }
            );


        /* الفولدر غير موجود */

        if (response.status === 404) {

            folder.images = [];
            folder.loaded = true;
            folder.loading = false;

            return [];

        }


        /* GitHub API limit */

        if (response.status === 403) {

            console.error(
                "GitHub API limit or permission error."
            );

            folder.loading = false;

            return [];

        }


        if (!response.ok) {

            throw new Error(
                "GitHub Error: " +
                response.status
            );

        }


        const files =
            await response.json();


        folder.images =
            files

                .filter(file =>
                    file.type === "file" &&
                    isImage(file.name)
                )

                .map(file => ({

                    name:
                        getImageName(file.name),

                    fileName:
                        file.name,

                    url:
                        file.download_url,

                    category:
                        category

                }));


        folder.loaded = true;
        folder.loading = false;


        return folder.images;

    }

    catch (error) {

        console.error(
            "Error loading:",
            category,
            error
        );


        folder.loading = false;

        return [];

    }

}


/* =====================================================
   INITIAL PAGE
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


    button.className = "filter";


    if (active) {

        button.classList.add("active");

    }


    button.textContent = text;


    button.addEventListener(
        "click",
        async () => {

            document
                .querySelectorAll(".filter")
                .forEach(btn => {

                    btn.classList.remove(
                        "active"
                    );

                });


            button.classList.add("active");


            await showGallery(value);

        }
    );


    filters.appendChild(button);

}


/* =====================================================
   LOADING MESSAGE
===================================================== */

function showLoading() {

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

}


/* =====================================================
   EMPTY MESSAGE
===================================================== */

function showEmpty() {

    galleryGrid.innerHTML = `

        <div class="empty">

            <i class="fa-regular fa-images"></i>

            <h3>
                لا توجد صور هنا
            </h3>

        </div>

    `;

}


/* =====================================================
   SHOW GALLERY
===================================================== */

async function showGallery(category) {

    showLoading();


    let images = [];


    /* =================================================
       ALL
    ================================================= */

    if (category === "all") {

        /*
           نحمل الأقسام واحدًا واحدًا
           بدل 6 طلبات في نفس اللحظة
        */

        for (const currentCategory of categories) {

            const categoryImages =
                await loadCategory(
                    currentCategory
                );


            images.push(
                ...categoryImages
            );

        }

    }


    /* =================================================
       ONE CATEGORY
    ================================================= */

    else {

        images =
            await loadCategory(
                category
            );

    }


    currentImages =
        images;


    /* لا توجد صور */

    if (images.length === 0) {

        showEmpty();

        return;

    }


    galleryGrid.innerHTML = "";


    /* =================================================
       CREATE CARDS
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
                    src="${image.url}"
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


    lightbox.classList.add("show");


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


    if (
        currentIndex < 0
    ) {

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

createFilters();

/*
   نبدأ بقسم "الكل"
   والأقسام تتحمل بالتتابع
*/

showGallery("all");
