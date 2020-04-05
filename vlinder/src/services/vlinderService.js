import axios from 'axios'

class VlinderService {
    baseUrl = process.env.VUE_APP_API_URL;
    headers = {'Content-Type': 'application/json'};

    getStations(callback) {
        return axios.get(this.baseUrl + 'stations', {headers: this.headers})
            .then(callback)
            .catch(d => console.error(d))
    }

    getVlinderData(id, start, end, callback) {
        return axios.get(this.baseUrl + 'measurements/' + id, {
            headers: this.headers,
            params: {
                start: start,
                end: end
            }
        })
            .then(callback)
            .catch(d => console.error(d))
    }

    getLatestVlinderData(callback) {
        return axios.get(this.baseUrl + 'measurements', {headers: this.headers})
            .then(callback)
            .catch(d => console.error(d))
    }
}

export default new VlinderService();
