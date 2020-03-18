import axios from 'axios'

export default class VlinderService {
    baseUrl = process.env.VUE_APP_API_URL

    static getHeaders() {
        return {'Content-Type': 'application/json'}
    }


}