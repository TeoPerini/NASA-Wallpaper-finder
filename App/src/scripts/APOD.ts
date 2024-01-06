import { NASA_API, type APODResponse } from './NASA_API';
import { formatDate } from "./utils"

const EL_INPUT_DATE = document.getElementById("input_date")!;
const EL_BUTTON_LOAD = document.getElementById("button_load")!;
const EL_BUTTON_LOAD_RANDOM = document.getElementById("button_load_random")!;

const EL_IMAGE = document.getElementById("image")!;

const EL_REQUEST_STATE_P = document.getElementById("state")!;
const EL_TITLE_P = document.getElementById("title")!;
const EL_EXPLANATION_P = document.getElementById("explanation")!;
const EL_COPYRIGHT_P = document.getElementById("copyright")!;


function updateView(response: APODResponse | null) {
    console.info("Updating view")
    console.table(JSON.stringify(response))

    EL_REQUEST_STATE_P.innerText = NASA_API.shared.getRequestString()
    if (NASA_API.shared.requestState.remaining == "0") {
        console.error("Depleted requests, disabling buttons")

        EL_BUTTON_LOAD.setAttribute("disabled", "")
        EL_BUTTON_LOAD_RANDOM.setAttribute("disabled", "")
        EL_INPUT_DATE.setAttribute("disabled", "")

        // EL_IMAGE.classList.add("error")
        EL_REQUEST_STATE_P.classList.add("depleted")
        // setTimeout(() => window.alert("Depleted requests to API, retry in a bit :P"), 1000)
    } else {
        console.info("Undepleted requests?, enabling buttons")

        EL_BUTTON_LOAD.removeAttribute("disabled")
        EL_BUTTON_LOAD_RANDOM.removeAttribute("disabled")
        EL_INPUT_DATE.removeAttribute("disabled")

        EL_REQUEST_STATE_P.classList.remove("depleted")
    }

    EL_IMAGE.onerror = () => {
        console.error("Error loading image")
        EL_IMAGE.classList.remove("loading")
        EL_IMAGE.classList.add("error")
        EL_IMAGE.onerror = null
    }

    if (response == null) {
        EL_TITLE_P.innerHTML = ""
        EL_EXPLANATION_P.innerHTML = ""
        EL_COPYRIGHT_P.innerHTML = ""
        return
    }


    if (response.hdurl != null) {
        //@ts-ignore
        EL_IMAGE.src = response.hdurl

    } else if (response.thumbnail_url != null) {
        //@ts-ignore
        EL_IMAGE.src = response.thumbnail_url

    } else if (response.url != null) {
        //@ts-ignore
        EL_IMAGE.src = response.url

    } else {
        console.error("???? both hdurl, thumbnail_url and url are null", response)
    }

    //@ts-ignore
    EL_IMAGE.alt = response.title
    EL_TITLE_P.innerHTML = `<b>Title</b>: ${response.title}`

    if (response.explanation != null)
        EL_EXPLANATION_P.innerHTML = `<b>Explanation</b>: ${response.explanation}`

    if (response.copyright != null)
        EL_COPYRIGHT_P.innerHTML = `<b>Copyright</b>: ${response.copyright}`

    if(response.date != undefined)
        EL_INPUT_DATE.setAttribute("value", response.date)

    loaded_response = response
}

let loaded_response: APODResponse | null = null

EL_BUTTON_LOAD.onclick = (_) => preventSpam(loadImage())
async function loadImage() {
    //@ts-ignore
    const DATE = formatDate(new Date(EL_INPUT_DATE.value))
    const URL = NASA_API.shared.craftURL((key: string) => `https://api.nasa.gov/planetary/apod?api_key=${key}&date=${DATE}&thumbs=true`)
    const RESPONSE = await NASA_API.shared.fetchFromNASA(URL)

    updateView(RESPONSE)
}


EL_BUTTON_LOAD_RANDOM.onclick = (_) => preventSpam(loadRandomImage())
async function loadRandomImage() {
    const URL = NASA_API.shared.craftURL((key: string) => `https://api.nasa.gov/planetary/apod?api_key=${key}&count=1&thumbs=true`)
    let RESPONSE = await NASA_API.shared.fetchFromNASA(URL)

    RESPONSE = RESPONSE == null ? null : RESPONSE[0]
    updateView(RESPONSE)
}

function preventSpam(image_loader: Promise<void>) {
    EL_IMAGE.classList.remove("error")
    EL_IMAGE.onerror = null
    
    //@ts-ignore
    EL_IMAGE.src = ""
    //@ts-ignore
    EL_IMAGE.alt = "Loading..."

    console.log("Loading image, disabling buttons to avoid spam")
    EL_BUTTON_LOAD_RANDOM.setAttribute("disabled", "")
    EL_BUTTON_LOAD.setAttribute("disabled", "")
    EL_INPUT_DATE.setAttribute("disabled", "")
    EL_IMAGE.classList.add("loading")

    image_loader.finally(() => {
        EL_IMAGE.classList.remove("loading")

        if (NASA_API.shared.requestState.remaining == "0") return

        console.log("Image loaded, enabling buttons")
        EL_BUTTON_LOAD_RANDOM.removeAttribute("disabled")
        EL_BUTTON_LOAD.removeAttribute("disabled")
        EL_INPUT_DATE.removeAttribute("disabled")
    })
}