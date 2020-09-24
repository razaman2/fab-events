import axios
    from 'axios';
import env
    from 'app/env';

export default class Geocoder {
    public getAddress(coords: { lat: number, lng: number }) {
        return axios.request({
            method: 'get',
            url: `${env.GEOCOD_API_URL}/reverse?limit=1&q=${encodeURIComponent(`${coords.lat},${coords.lng}`)}&api_key=${env.GEOCOD_API_KEY}`
        });
    }

    public getCoords(address: string) {
        return axios.request({
            method: 'get',
            url: `${env.GEOCOD_API_URL}/geocode?q=${encodeURIComponent(address)}&api_key=${env.GEOCOD_API_KEY}`
        });
    }
}
