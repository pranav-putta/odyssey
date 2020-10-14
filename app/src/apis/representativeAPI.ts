import qs from 'querystring';
import axios from 'axios';

export function findReps(address: string) {
  let params = {
    key: 'AIzaSyBjX1sd05v_36BG6gmnhUqe3PsSrAnXHlw',
    address: address,
    includeOffices: true,
    levels: 'administrativeArea1',
  };
  let ext =
    qs.stringify(params) +
    '&roles=legislatorUpperBody&roles=legislatorLowerBody';
  let url =
    'https://civicinfo.googleapis.com/civicinfo/v2/representatives?' + ext;
  return axios.get(url);
}
