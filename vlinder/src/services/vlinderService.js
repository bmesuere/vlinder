import axios from 'axios'

class VlinderService {
    baseUrl = process.env.VUE_APP_API_URL;
    headers = {'Content-Type': 'application/json'};

    getStations() {
        return axios.get(this.baseUrl + 'stations', {headers: this.headers})
    }

    getVlinderData(id, start, end) {
        return axios.get(this.baseUrl + 'measurements/' + id, {
            headers: this.headers,
            params: {
                start: start,
                end: end
            }
        })
    }

    getLatestVlinderData() {
        return axios.get(this.baseUrl + 'measurements', {headers: this.headers})
    }
}

export default new VlinderService();
