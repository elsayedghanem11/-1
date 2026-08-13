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
    "بصمات افراح",
    "شهادات تقدير",
    "صور شخصية",
    "كروت أفراح وكتب كتاب",
    "كروت سبوع",
    "مناديل كتب كتاب"
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
   GET GITHUB TREE URL
===================================================== */

function getGitHubTreeUrl() {

    return (
        "https://api.github.com/repos/" +
        encodeURIComponent(GITHUB_USERNAME) +
        "/" +
        encodeURIComponent(GITHUB_REPO) +
        "/git/trees/" +
        encodeURIComponent(GITHUB_BRANCH) +
        "?recursive=1"
    );

}


/* =====================================================
   GET RAW IMAGE URL
===================================================== */

function getRawImageUrl(path) {

    return (
        "https://raw.githubusercontent.com/" +
        encodeURIComponent(GITHUB_USERNAME) +
        "/" +
        encodeURIComponent(GITHUB_REPO) +
        "/" +
        encodeURIComponent(GITHUB_BRANCH) +
        "/" +
        path
            .split("/")
            .map(
                part =>
                    encodeURIComponent(part)
            )
            .join("/")
    );

}


/* =====================================================
   LOAD ALL IMAGES
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

        /* =================================================
           طلب واحد فقط إلى GitHub
        ================================================= */

        const response =
            await fetch(
                getGitHubTreeUrl(),
                {
                    cache: "no-store"
                }
            );


        /* =================================================
           التأكد من نجاح الطلب
        ================================================= */

        if (!response.ok) {

            throw new Error(
                "GitHub API Error: " +
                response.status
            );

        }


        const data =
            await response.json();


        /* =================================================
           التأكد من وجود الملفات
        ================================================= */

        if (
            !data.tree ||
            !Array.isArray(data.tree)
        ) {

            throw new Error(
                "GitHub did not return a file tree"
            );

        }


        /* =================================================
           إنشاء الأقسام بالترتيب المحدد
        ================================================= */

        galleryData =
            categories.map(
                category => ({

                    name: category,

                    images: []

                })
            );


        /* =================================================
           البحث عن الصور داخل images
        ================================================= */

        data.tree

            .filter(item =>
                item.type === "blob" &&
                item.path.startsWith("images/")
            )

            .filter(item =>
                isImage(item.path)
            )

            .forEach(item => {

                const parts =
                    item.path.split("/");


                /*
                    images
                    اسم القسم
                    اسم الصورة
                */

                if (
                    parts.length < 3
                ) {

                    return;

                }


                const category =
                    parts[1];


                const fileName =
                    parts[
                        parts.length - 1
                    ];


                const folder =
                    galleryData.find(
                        item =>
                            item.name ===
                            category
                    );


                if (!folder) {

                    return;

                }


                folder.images.push({

                    name:
                        getImageName(
                            fileName
                        ),

                    fileName:
                        fileName,

                    url:
                        getRawImageUrl(
                            item.path
                        ),

                    category:
                        category

                });

            });


        /* =================================================
           إنشاء أزرار الأقسام
        ================================================= */

        createFilters();


        /* =================================================
           عرض كل الصور
        ================================================= */

        showGallery("all");

    }

    catch (error) {

        console.error(
            "Gallery Error:",
            error
        );


        createFilters();


        galleryGrid.innerHTML = `

            <div class="error">

                <i
                    class="fa-solid fa-triangle-exclamation"
                ></i>

                <h3>
                    حصل خطأ في تحميل الصور
                </h3>

                <p>
                    حاول تحديث الصفحة مرة أخرى
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


    /* زر الكل */

    createFilterButton(
        "الكل",
        "all",
        true
    );


    /* الأقسام بالترتيب */

    categories.forEach(
        category => {

            createFilterButton(
                category,
                category
            );

        }
    );

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
        document.createElement(
            "button"
        );


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
                .querySelectorAll(
                    ".filter"
                )
                .forEach(
                    btn => {

                        btn.classList.remove(
                            "active"
                        );

                    }
                );


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
       عرض كل الصور
    ================================================= */

    if (
        category === "all"
    ) {

        galleryData.forEach(
            folder => {

                images.push(
                    ...folder.images
                );

            }
        );

    }


    /* =================================================
       عرض قسم معين
    ================================================= */

    else {

        const folder =
            galleryData.find(
                item =>
                    item.name ===
                    category
            );


        if (folder) {

            images =
                folder.images;

        }

    }


    /* حفظ الصور الحالية */

    currentImages =
        images;


    /* =================================================
       لا توجد صور
    ================================================= */

    if (
        images.length === 0
    ) {

        galleryGrid.innerHTML = `

            <div class="empty">

                <i
                    class="fa-regular fa-images"
                ></i>

                <h3>
                    لا توجد صور هنا
                </h3>

            </div>

        `;

        return;

    }


    /* =================================================
       إنشاء كروت الصور
    ================================================= */

    images.forEach(
        (image, index) => {

            const card =
                document.createElement(
                    "div"
                );


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

                <div
                    class="gallery-overlay"
                >

                    <div
                        class="gallery-info"
                    >

                        <small>
                            ${image.category}
                        </small>

                        <h3>
                            ${image.name}
                        </h3>

                    </div>


                    <div
                        class="view-image"
                    >

                        <i
                            class="fa-solid fa-expand"
                        ></i>

                    </div>

                </div>

            `;


            /* فتح الصورة */

            card.addEventListener(
                "click",
                () => {

                    openLightbox(
                        index
                    );

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
        currentImages[
            currentIndex
        ];


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
   CLICK OUTSIDE LIGHTBOX
===================================================== */

lightbox.addEventListener(
    "click",
    event => {

        if (
            event.target ===
            lightbox
        ) {

            closeLightbox();

        }

    }
);


/* =====================================================
   KEYBOARD CONTROLS
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


        /* سهم اليمين */

        if (
            event.key ===
            "ArrowRight"
        ) {

            previousImage();

        }


        /* سهم الشمال */

        if (
            event.key ===
            "ArrowLeft"
        ) {

            nextImage();

        }


        /* Escape */

        if (
            event.key ===
            "Escape"
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
            themeBtn.querySelector(
                "i"
            );


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
