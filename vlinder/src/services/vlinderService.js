import axios from 'axios'

class VlinderService {
    baseUrl = process.env.VUE_APP_API_URL;
    headers = {'Content-Type': 'application/json'};

    getStations(callback) {
        return axios.get(this.baseUrl + 'stations', {headers: this.headers})
            .then(callback)
            .catch(d => console.error(d))
    }

    getVlinderDataPromise(id, start, end){
        return axios.get(this.baseUrl + 'vlinder/' + id, {
            headers: this.headers,
            params: {
                start: start,
                end: end
            }
        })
    }
    getVlinderData(id, start, end, callback) {
        return this.getVlinderDataPromise(id, start, end)
            .then(callback)
            .catch(d => console.log(d));
    }


    getLatestVlinderData(callback) {
        return axios.get(this.baseUrl + 'vlinder', {headers: this.headers})
            .then(callback)
            .catch(d => console.error(d))
    }
}

export default new VlinderService();
