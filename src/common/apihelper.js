import API from '@aws-amplify/api';
export default {
  postToRegister: function(imageUrl) {
    const apiName = 'AutoCheckInAPI';
    const path = '/register';
    const params = {
      // OPTIONAL
      headers: {}, // OPTIONAL
      response: true, // OPTIONAL (return the entire Axios response object instead of only response.data)
      body: {
        // OPTIONAL
        image: imageUrl,
      },
    };

    return API.post(apiName, path, params);
  },
  postToLogin: function(imageUrl) {
    const apiName = 'AutoCheckInAPI';
    const path = '/checkin';
    const params = {
      // OPTIONAL
      headers: {}, // OPTIONAL
      response: true, // OPTIONAL (return the entire Axios response object instead of only response.data)
      body: {
        // OPTIONAL
        image: imageUrl,
      },
    };

    return API.post(apiName, path, params);
  },
};
