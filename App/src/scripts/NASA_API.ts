const API_KEY:string = "DEMO_KEY"

export class NASA_API {
	static shared: NASA_API = new NASA_API()

    requestState: RequestState = {
        limit: "?",
        remaining: "?"
    }

	private constructor() { }

	getRequestString() {
		return `${NASA_API.shared.requestState.remaining}/${NASA_API.shared.requestState.limit}`
	}

	craftURL(callback: (api_key: string) => string): string {
		return callback(API_KEY)
	}
	
	async fetchFromNASA(URL: string): Promise<Object | null> {
		const res_blob = await fetch(URL)

		this.requestState.limit = res_blob.headers.get("x-ratelimit-limit")
		this.requestState.remaining = res_blob.headers.get("x-ratelimit-remaining")
		console.info(`Requested data from NASA, limit [${this.requestState.remaining}/${this.requestState.limit}]`)

		const res_json = await res_blob.json()
		/* != null */
		if(res_json.error != undefined) {
			console.error(`Error requesting from NASA API with url "${URL}"\nmessage: ${res_json.error.message}`)
			return null
		}

		return res_json
	}


}

export interface RequestState {
	limit: string | null,
	remaining: string | null
}

export interface APODResponse {
    resource?: any;
    concept_tags?: any;

    title?: string;
    date?: string;
    
    url?: string;
    hdurl?: string;

    media_type?: string;
    explanation?: string;

    concepts?: any; 
    thumbnail_url?: any 

    copyright?: string; 
    service_version?: string; 
}
