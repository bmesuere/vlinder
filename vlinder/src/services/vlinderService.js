import axios from 'axios'

class VlinderService {
    baseUrl = process.env.VUE_APP_API_URL;
    headers = {'Content-Type': 'application/json'};

    getStations(callback) {
        return axios.get(this.baseUrl + 'stations', {headers: this.headers})
            .then(callback)
    }

    getVlinderData(id, start, end, callback) {
        return axios.get(this.baseUrl + 'vlinder/' + id, {
            headers: this.headers,
            params: {
                start: start,
                end: end
            }
        })
            .then(callback)
    }
}

export default new VlinderService();
