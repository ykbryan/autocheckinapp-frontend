import API from '@aws-amplify/api';
export default {
  postToRegister: function(userdata, imageUrls) {
    const apiName = 'AutoCheckInAPI';
    const path = '/register';
    const { name, email } = userdata;
    const params = {
      // OPTIONAL
      headers: {}, // OPTIONAL
      response: true, // OPTIONAL (return the entire Axios response object instead of only response.data)
      body: {
        name,
        email,
        images: imageUrls,
      },
    };

    return API.post(apiName, path, params)
      .then((response) => {
        return response;
      })
      .catch((error) => {
        console.log(error);
        return error.response;
      });
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

    return API.post(apiName, path, params)
      .then((response) => {
        return response;
      })
      .catch((error) => {
        console.log(error);
        return error.response;
      });
  },
};
