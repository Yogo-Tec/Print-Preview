/* ==========================================================
   Bill Viewer
   script.js
   ========================================================== */

const paper = document.getElementById("paper");
const paperContainer = document.getElementById("paperContainer");

const paperSize = document.getElementById("paperSize");

const zoomSelect = document.getElementById("zoomSelect");

const zoomIn = document.getElementById("zoomIn");

const zoomOut = document.getElementById("zoomOut");

const fitBtn = document.getElementById("fitBtn");

const resetBtn = document.getElementById("resetBtn");

const printBtn = document.getElementById("printBtn");


/* ==========================================================
   PAPER DIMENSIONS
   ========================================================== */

const paperDimensions = {

    a4: {
        width:794,
        height:1123,
        print:"A4 portrait"
    },

    a3:{
        width:1123,
        height:1587,
        print:"A3 portrait"
    },

    legal:{
        width:816,
        height:1344,
        print:"Legal portrait"
    },

    letter:{
        width:816,
        height:1056,
        print:"Letter portrait"
    }

};


/* ==========================================================
   STATE
   ========================================================== */

let zoom = 1;


/* ==========================================================
   PAPER SIZE
   ========================================================== */

function changePaper(size){

    paper.className="paper "+size;

    updatePrintPage(size);

    fitScreen();

}

paperSize.addEventListener("change",(e)=>{

    changePaper(e.target.value);

});


/* ==========================================================
   PRINT PAGE SIZE
   ========================================================== */

function updatePrintPage(size){

    let style=document.getElementById("print-page-style");

    if(!style){

        style=document.createElement("style");

        style.id="print-page-style";

        document.head.appendChild(style);

    }

    style.innerHTML=`
    @page{
        size:${paperDimensions[size].print};
        margin:0;
    }
    `;

}


/* ==========================================================
   APPLY ZOOM
   ========================================================== */

function applyZoom() {

    paperContainer.style.transform = `scale(${zoom})`;
    paperContainer.style.transformOrigin = "top center";

}


/* ==========================================================
   ZOOM IN
   ========================================================== */

zoomIn.onclick=()=>{

    zoom+=0.10;

    if(zoom>3) zoom=3;

    applyZoom();

    updateZoomUI();

};


/* ==========================================================
   ZOOM OUT
   ========================================================== */

zoomOut.onclick=()=>{

    zoom-=0.10;

    if(zoom<0.25) zoom=.25;

    applyZoom();

    updateZoomUI();

};


/* ==========================================================
   RESET
   ========================================================== */

resetBtn.onclick=()=>{

    zoom=1;

    applyZoom();

    zoomSelect.value="100";

};


/* ==========================================================
   ZOOM SELECT
   ========================================================== */

zoomSelect.onchange=function(){

    if(this.value==="fit"){

        fitScreen();

        return;

    }

    zoom=parseInt(this.value)/100;

    applyZoom();

};


/* ==========================================================
   FIT SCREEN
   ========================================================== */

function fitScreen(){

    const workspace=document.querySelector(".workspace");

    const size=paperDimensions[paperSize.value];

    const padding=80;

    const scaleX=(workspace.clientWidth-padding)/size.width;

    const scaleY=(workspace.clientHeight-padding)/size.height;

    zoom=Math.min(scaleX,scaleY);

    if(zoom>1) zoom=1;

    if(zoom<0.25) zoom=0.25;

    applyZoom();

    zoomSelect.value="fit";

}


/* ==========================================================
   UPDATE UI
   ========================================================== */

function updateZoomUI(){

    zoomSelect.value=Math.round(zoom*100);

}


/* ==========================================================
   WINDOW RESIZE
   ========================================================== */

window.addEventListener("resize",()=>{

    if(zoomSelect.value==="fit"){

        fitScreen();

    }

});


/* ==========================================================
   PRINT
   ========================================================== */

printBtn.onclick=()=>{

    window.print();

};


/* ==========================================================
   CTRL + MOUSE WHEEL
   ========================================================== */

window.addEventListener("wheel",(e)=>{

    if(!e.ctrlKey) return;

    e.preventDefault();

    if(e.deltaY<0){

        zoom+=0.05;

    }else{

        zoom-=0.05;

    }

    zoom=Math.max(.25,Math.min(3,zoom));

    applyZoom();

},{passive:false});


/* ==========================================================
   SHORTCUTS
   ========================================================== */

window.addEventListener("keydown",(e)=>{

    if(e.ctrlKey && e.key==="p"){

        e.preventDefault();

        window.print();

    }

    if(e.ctrlKey && (e.key==="+" || e.key==="=")){

        e.preventDefault();

        zoom+=0.10;

        applyZoom();

    }

    if(e.ctrlKey && e.key==="-"){

        e.preventDefault();

        zoom-=0.10;

        zoom=Math.max(.25,zoom);

        applyZoom();

    }

    if(e.ctrlKey && e.key==="0"){

        e.preventDefault();

        zoom=1;

        applyZoom();

    }

});


/* ==========================================================
   LOAD TEMPLATE
========================================================== */

async function loadTemplate(template = "bill") {

    try {

        // Remove old template CSS
        document
            .querySelectorAll(".template-css")
            .forEach(link => link.remove());

        // Load template CSS
        const css = document.createElement("link");
        css.rel = "stylesheet";
        css.href = `templates/${template}.css`;
        css.className = "template-css";

        document.head.appendChild(css);

        // Wait until CSS is loaded
        await new Promise((resolve, reject) => {
            css.onload = resolve;
            css.onerror = reject;
        });

        // Load template HTML
        const response = await fetch(`templates/${template}.html`);

        if (!response.ok) {
            throw new Error(`Cannot load ${template}.html`);
        }

        const html = await response.text();

        document.getElementById("templateContainer").innerHTML = html;

    } catch (error) {

        console.error(error);

        document.getElementById("templateContainer").innerHTML = `
            <div class="placeholder">
                <h2>Failed to load template.</h2>
            </div>
        `;
    }
}


/* ==========================================================
   INITIALIZE
========================================================== */

document.addEventListener("DOMContentLoaded", async () => {

    // Set default paper
    changePaper("a4");

    // Load bill template
    await loadTemplate("bill");

});