/* ==========================================================
   Bill Viewer Pro
   script.js
   Part 1 - Core Engine
========================================================== */

"use strict";

/* ==========================================================
   DOM ELEMENTS
========================================================== */

const paper = document.getElementById("paper");
const paperContainer = document.getElementById("paperContainer");
const templateContainer = document.getElementById("templateContainer");

const workspace = document.querySelector(".workspace");

const paperSize = document.getElementById("paperSize");

const zoomSelect = document.getElementById("zoomSelect");

const zoomIn = document.getElementById("zoomIn");
const zoomOut = document.getElementById("zoomOut");

const fitBtn = document.getElementById("fitBtn");
const resetBtn = document.getElementById("resetBtn");

const printBtn = document.getElementById("printBtn");


/* ==========================================================
   APPLICATION STATE
========================================================== */

const state = {

    template: "bill",

    paper: "a4",

    zoom: 1,

    minZoom: 0.25,

    maxZoom: 3,

    fitPadding: 80

};


/* ==========================================================
   PAPER DEFINITIONS
========================================================== */

const PAPER = {

    a4: {

        width: 794,
        height: 1123,

        print: "A4 portrait"

    },

    a3: {

        width: 1123,
        height: 1587,

        print: "A3 portrait"

    },

    legal: {

        width: 816,
        height: 1344,

        print: "Legal portrait"

    },

    letter: {

        width: 816,
        height: 1056,

        print: "Letter portrait"

    }

};


/* ==========================================================
   SET PAPER SIZE
========================================================== */

function setPaper(size){

    state.paper = size;

    paper.className = `paper ${size}`;

    updatePrintPage(size);

    applyTemplatePaperClass();

}


/* ==========================================================
   APPLY PAPER CLASS TO TEMPLATE
========================================================== */

function applyTemplatePaperClass(){

    if(!templateContainer) return;

    templateContainer.classList.remove(
        "a4",
        "a3",
        "legal",
        "letter"
    );

    templateContainer.classList.add(state.paper);

}


/* ==========================================================
   PRINT PAGE
========================================================== */

function updatePrintPage(size){

    let style = document.getElementById("print-page-style");

    if(!style){

        style = document.createElement("style");

        style.id = "print-page-style";

        document.head.appendChild(style);

    }

    style.innerHTML = `
        @page{
            size:${PAPER[size].print};
            margin:0;
        }
    `;

}


/* ==========================================================
   PAPER SIZE DROPDOWN
========================================================== */

paperSize.addEventListener("change",(e)=>{

    setPaper(e.target.value);

    fitScreen();

});


/* ==========================================================
   TEMPLATE LOADER
========================================================== */

async function loadTemplate(name="bill"){

    state.template = name;

    try{

        /* Remove previous CSS */

        document
            .querySelectorAll(".template-css")
            .forEach(link=>link.remove());


        /* Load CSS */

        const css=document.createElement("link");

        css.rel="stylesheet";

        css.href=`templates/${name}.css`;

        css.className="template-css";

        document.head.appendChild(css);


        /* Load HTML */

        const response=await fetch(`templates/${name}.html`);

        if(!response.ok){

            throw new Error("Template not found.");

        }

        const html=await response.text();

        templateContainer.innerHTML=html;

        applyTemplatePaperClass();

    }

    catch(error){

        console.error(error);

        templateContainer.innerHTML=`

        <div class="placeholder">

            <h2>Unable to load template</h2>

            <p>${error.message}</p>

        </div>

        `;

    }

}




/* ==========================================================
   PART 2 - ZOOM ENGINE
========================================================== */

/* ==========================================================
   APPLY ZOOM
========================================================== */

function applyZoom() {

    paperContainer.style.transform = `scale(${state.zoom})`;
    paperContainer.style.transformOrigin = "top center";

}


/* ==========================================================
   UPDATE ZOOM UI
========================================================== */

function updateZoomUI() {

    const percent = Math.round(state.zoom * 100);

    const option = [...zoomSelect.options].find(
        item => item.value === String(percent)
    );

    if (option) {

        zoomSelect.value = String(percent);

    } else {

        zoomSelect.value = "fit";

    }

}


/* ==========================================================
   FIT TO SCREEN
========================================================== */

function fitScreen() {

    const paperInfo = PAPER[state.paper];

    const availableWidth =
        workspace.clientWidth - state.fitPadding;

    const availableHeight =
        workspace.clientHeight - state.fitPadding;

    const scaleX = availableWidth / paperInfo.width;
    const scaleY = availableHeight / paperInfo.height;

    state.zoom = Math.min(scaleX, scaleY);

    if (state.zoom > 1)
        state.zoom = 1;

    if (state.zoom < state.minZoom)
        state.zoom = state.minZoom;

    applyZoom();

    zoomSelect.value = "fit";

}


/* ==========================================================
   SET ZOOM
========================================================== */

function setZoom(value) {

    state.zoom = Math.max(
        state.minZoom,
        Math.min(state.maxZoom, value)
    );

    applyZoom();

    updateZoomUI();

}


/* ==========================================================
   ZOOM IN
========================================================== */

function zoomStepIn() {

    setZoom(state.zoom + 0.10);

}


/* ==========================================================
   ZOOM OUT
========================================================== */

function zoomStepOut() {

    setZoom(state.zoom - 0.10);

}


/* ==========================================================
   RESET ZOOM
========================================================== */

function resetZoom() {

    setZoom(1);

    zoomSelect.value = "100";

}


/* ==========================================================
   BUTTON EVENTS
========================================================== */

zoomIn.addEventListener("click", zoomStepIn);

zoomOut.addEventListener("click", zoomStepOut);

fitBtn.addEventListener("click", fitScreen);

resetBtn.addEventListener("click", resetZoom);


/* ==========================================================
   ZOOM DROPDOWN
========================================================== */

zoomSelect.addEventListener("change", function () {

    if (this.value === "fit") {

        fitScreen();

        return;

    }

    setZoom(parseInt(this.value, 10) / 100);

});


/* ==========================================================
   CTRL + MOUSE WHEEL
========================================================== */

window.addEventListener("wheel", (event) => {

    if (!event.ctrlKey)
        return;

    event.preventDefault();

    if (event.deltaY < 0) {

        zoomStepIn();

    } else {

        zoomStepOut();

    }

}, {
    passive: false
});


/* ==========================================================
   WINDOW RESIZE
========================================================== */

window.addEventListener("resize", () => {

    if (zoomSelect.value === "fit") {

        fitScreen();

    }

});


/* ==========================================================
   PART 3 - TEMPLATE ENGINE
========================================================== */

/* ==========================================================
   TEMPLATE CACHE
========================================================== */

const templateCache = new Map();

/* ==========================================================
   SHOW LOADING
========================================================== */

function showLoading() {

    templateContainer.innerHTML = `
        <div class="template-loading">
            <div class="loader"></div>
            <h3>Loading Template...</h3>
        </div>
    `;

}

/* ==========================================================
   SHOW ERROR
========================================================== */

function showTemplateError(message) {

    templateContainer.innerHTML = `
        <div class="template-error">
            <h2>Unable to load template</h2>
            <p>${message}</p>
        </div>
    `;

}

/* ==========================================================
   REMOVE OLD CSS
========================================================== */

function removeTemplateCSS() {

    document
        .querySelectorAll(".template-css")
        .forEach(link => link.remove());

}

/* ==========================================================
   REMOVE OLD JS
========================================================== */

function removeTemplateJS() {

    document
        .querySelectorAll(".template-js")
        .forEach(script => script.remove());

}

/* ==========================================================
   LOAD TEMPLATE CSS
========================================================== */

function loadTemplateCSS(name) {

    return new Promise((resolve, reject) => {

        const css = document.createElement("link");

        css.rel = "stylesheet";
        css.href = `templates/${name}.css`;
        css.className = "template-css";

        css.onload = resolve;
        css.onerror = () => reject("Cannot load CSS.");

        document.head.appendChild(css);

    });

}

/* ==========================================================
   LOAD TEMPLATE JS (OPTIONAL)
========================================================== */

function loadTemplateJS(name) {

    return new Promise(resolve => {

        const script = document.createElement("script");

        script.src = `templates/${name}.js`;
        script.className = "template-js";

        script.onload = resolve;

        script.onerror = () => {

            console.log("No template JS found.");

            resolve();

        };

        document.body.appendChild(script);

    });

}

/* ==========================================================
   LOAD TEMPLATE HTML
========================================================== */

async function loadTemplateHTML(name) {

    if (templateCache.has(name)) {

        return templateCache.get(name);

    }

    const response = await fetch(`templates/${name}.html`);

    if (!response.ok) {

        throw new Error(`Cannot load ${name}.html`);

    }

    const html = await response.text();

    templateCache.set(name, html);

    return html;

}

/* ==========================================================
   LOAD COMPLETE TEMPLATE
========================================================== */

async function loadTemplate(name = "bill") {

    state.template = name;

    showLoading();

    try {

        removeTemplateCSS();
        removeTemplateJS();

        await loadTemplateCSS(name);

        const html = await loadTemplateHTML(name);

        templateContainer.innerHTML = html;

        applyTemplatePaperClass();

        await loadTemplateJS(name);

        fitScreen();

        console.log(`${name} template loaded.`);

    }

    catch (error) {

        console.error(error);

        showTemplateError(error.message);

    }

}

/* ==========================================================
   RELOAD CURRENT TEMPLATE
========================================================== */

async function reloadTemplate() {

    await loadTemplate(state.template);

}

/* ==========================================================
   SWITCH TEMPLATE
========================================================== */

async function switchTemplate(name) {

    if (name === state.template)
        return;

    await loadTemplate(name);

}




/* ==========================================================
   PART 4 - PROFESSIONAL PRINT ENGINE
========================================================== */

/* ==========================================================
   PRINT STATE
========================================================== */

let printing = false;


/* ==========================================================
   PREPARE FOR PRINT
========================================================== */

function beforePrint() {

    printing = true;

    document.body.classList.add("printing");

    // Save current zoom
    state.previousZoom = state.zoom;

    // Print at actual size
    paperContainer.style.transform = "scale(1)";
    paperContainer.style.transformOrigin = "top left";

    // Scroll to top
    window.scrollTo({
        top: 0,
        behavior: "instant"
    });

}


/* ==========================================================
   RESTORE AFTER PRINT
========================================================== */

function afterPrint() {

    printing = false;

    document.body.classList.remove("printing");

    // Restore viewer zoom
    state.zoom = state.previousZoom || 1;

    applyZoom();

    updateZoomUI();

}


/* ==========================================================
   PRINT DOCUMENT
========================================================== */

function printDocument() {

    beforePrint();

    // Give browser one frame to update layout
    requestAnimationFrame(() => {

        window.print();

    });

}


/* ==========================================================
   PRINT BUTTON
========================================================== */

printBtn.addEventListener("click", printDocument);


/* ==========================================================
   BROWSER PRINT EVENTS
========================================================== */

window.addEventListener("beforeprint", beforePrint);

window.addEventListener("afterprint", afterPrint);


/* ==========================================================
   KEYBOARD SHORTCUT
========================================================== */

window.addEventListener("keydown", (event) => {

    if (!(event.ctrlKey || event.metaKey))
        return;

    if (event.key.toLowerCase() !== "p")
        return;

    event.preventDefault();

    printDocument();

});


/* ==========================================================
   EXPORT CURRENT PAPER SIZE
========================================================== */

function getCurrentPaper() {

    return PAPER[state.paper];

}


/* ==========================================================
   CURRENT PRINT INFO
========================================================== */

function getPrintInfo() {

    return {

        template: state.template,

        paper: state.paper,

        width: PAPER[state.paper].width,

        height: PAPER[state.paper].height,

        page: PAPER[state.paper].print

    };

}


/* ==========================================================
   DEBUG
========================================================== */

function printDebug() {

    console.table(getPrintInfo());

}


/* ==========================================================
   PART 5 - APPLICATION BOOTSTRAP
========================================================== */

const STORAGE_KEY = "BillViewerSettings";

/* ==========================================================
   SAVE SETTINGS
========================================================== */

function saveSettings() {

    const settings = {
        paper: state.paper,
        zoom: zoomSelect.value,
        template: state.template
    };

    localStorage.setItem(
        STORAGE_KEY,
        JSON.stringify(settings)
    );

}

/* ==========================================================
   LOAD SETTINGS
========================================================== */

function loadSettings() {

    const settings = JSON.parse(
        localStorage.getItem(STORAGE_KEY)
    );

    if (!settings) return;

    if (settings.paper) {

        state.paper = settings.paper;
        paperSize.value = settings.paper;

    }

    if (settings.template) {

        state.template = settings.template;

    }

    if (settings.zoom) {

        zoomSelect.value = settings.zoom;

    }

}

/* ==========================================================
   APPLY SAVED ZOOM
========================================================== */

function applySavedZoom() {

    if (zoomSelect.value === "fit") {

        fitScreen();

        return;

    }

    const value = parseInt(zoomSelect.value, 10);

    if (!isNaN(value)) {

        setZoom(value / 100);

    }

}

/* ==========================================================
   AUTO SAVE EVENTS
========================================================== */

paperSize.addEventListener("change", saveSettings);

zoomSelect.addEventListener("change", saveSettings);

/* ==========================================================
   DOUBLE CLICK = FIT SCREEN
========================================================== */

paperContainer.addEventListener("dblclick", () => {

    fitScreen();

});

/* ==========================================================
   APPLICATION START
========================================================== */

async function initializeApp() {

    console.log("=================================");
    console.log(" Bill Viewer Pro");
    console.log("=================================");

    loadSettings();

    setPaper(state.paper);

    await loadTemplate(state.template);

    applySavedZoom();

    if (zoomSelect.value === "fit") {

        fitScreen();

    }

    console.log("Viewer Ready");

}

/* ==========================================================
   DOM READY
========================================================== */

document.addEventListener("DOMContentLoaded", () => {

    initializeApp();

});

/* ==========================================================
   PUBLIC API
========================================================== */

window.BillViewer = {

    loadTemplate,

    reloadTemplate,

    switchTemplate,

    setPaper,

    fitScreen,

    setZoom,

    printDocument,

    saveSettings,

    state

};