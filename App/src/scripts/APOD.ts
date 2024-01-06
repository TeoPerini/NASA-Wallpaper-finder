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

function setErrorToImage() {
    console.warn("Erroring image")

    EL_IMAGE.classList.remove("loading") 
    EL_IMAGE.classList.add("error")

    if (NASA_API.shared.requestState.remaining == "0") {
        //@ts-ignore
        EL_IMAGE.alt = "Depleted requests, retry later :P"

    } else {
        //@ts-ignore
        EL_IMAGE.alt = "Unknown Error"
    }
}

function updateView(response: APODResponse | null) {
    EL_REQUEST_STATE_P.innerText = NASA_API.shared.getRequestString()

    if (NASA_API.shared.requestState.remaining == "0") {
        console.warn("Depleted requests: disabling buttons")

        EL_BUTTON_LOAD.setAttribute("disabled", "")
        EL_BUTTON_LOAD_RANDOM.setAttribute("disabled", "")
        EL_INPUT_DATE.setAttribute("disabled", "")

        //@ts-ignore
        EL_IMAGE.alt = "Depleted requests, retry later :P"
        EL_REQUEST_STATE_P.classList.add("depleted")

    } else {
        EL_BUTTON_LOAD.removeAttribute("disabled")
        EL_BUTTON_LOAD_RANDOM.removeAttribute("disabled")
        EL_INPUT_DATE.removeAttribute("disabled")

        EL_REQUEST_STATE_P.classList.remove("depleted")
    }

    //@ts-ignore
    EL_IMAGE.src = response?.hdurl ?? response?.thumbnail_url ?? response?.url ?? ""

    //@ts-ignore
    if (response == null || EL_IMAGE.src == "") {
        if (response == null)
            console.warn("While updating view found response null");
        else 
            console.warn("While updating view found src null");

        EL_TITLE_P.innerHTML = ""
        EL_EXPLANATION_P.innerHTML = ""
        EL_COPYRIGHT_P.innerHTML = ""

        setErrorToImage()
        return
    }

    //@ts-ignore
    EL_IMAGE.alt = response.title
    EL_TITLE_P.innerHTML = `<b>Title</b>: ${response.title}`
    EL_INPUT_DATE.setAttribute("value", response.date!)

    if (response.explanation != null)
        EL_EXPLANATION_P.innerHTML = `<b>Explanation</b>: ${response.explanation}`

    if (response.copyright != null)
        EL_COPYRIGHT_P.innerHTML = `<b>Copyright</b>: ${response.copyright}`
}

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

    //@ts-ignore
    RESPONSE = RESPONSE == null ? null : RESPONSE[0]
    updateView(RESPONSE)
}

function preventSpam(image_loader: Promise<void>) {
    console.log("Requested to API: loading data, disabling buttons")

    EL_BUTTON_LOAD_RANDOM.setAttribute("disabled", "")
    EL_BUTTON_LOAD.setAttribute("disabled", "")
    EL_INPUT_DATE.setAttribute("disabled", "")

    EL_IMAGE.classList.remove("error")
    EL_IMAGE.classList.add("loading")

    //@ts-ignore
    EL_IMAGE.src = ""
    //@ts-ignore
    EL_IMAGE.alt = "Loading..."

    image_loader.finally(() => {
        EL_IMAGE.classList.remove("loading")

        if (NASA_API.shared.requestState.remaining == "0") return

        console.log("Finished request successfully: enabling buttons")
        EL_BUTTON_LOAD_RANDOM.removeAttribute("disabled")
        EL_BUTTON_LOAD.removeAttribute("disabled")
        EL_INPUT_DATE.removeAttribute("disabled")
    })
}