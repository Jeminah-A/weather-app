import axios from "axios"

const base_url = "https://api.open-meteo.com/v1/forecast"
const reverseGeocode_url = "https://nominatim.openstreetmap.org/reverse"

export default class ApiClient {
    async responseStatusCheck(responseObject) {
        if (responseObject.status >= 200 && responseObject.status < 300){
            return responseObject
        }
        throw new Error(responseObject.statusText)
    }

    async getRequest(url, endpoint, params = {}) {
        try {
            const response = await axios.get(`${url}${endpoint}`, {
                params
            })
            return this.responseStatusCheck(response)
        } catch (error) {
            throw new Error("Oops! Something went wrong...")
        }
    }

    async getForecast({location}){
        const params = {
            latitude : location.latitude,
            longitude : location.longitude,
            daily : "weathercode,temperature_2m_max,temperature_2m_min,wind_speed_10m_max",
            timezone: "GB"
        }
        return this.getRequest(base_url, "", params)
    }

    async getLocationName({location}){
        const params = {
            format: "json",
            lat : location.latitude,
            lon : location.longitude,
            zoom: 12
        }
        return this.getRequest(reverseGeocode_url, "", params)
    }
}