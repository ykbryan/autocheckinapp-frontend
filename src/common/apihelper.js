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
        image: imageUrl.toLowerCase(),
      },
    };

    API.post(apiName, path, params)
      .then((response) => {
        // Add your code here
        console.log(response);
      })
      .catch((error) => {
        console.log(error.response);
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
        image: imageUrl.toLowerCase(),
      },
    };

    API.post(apiName, path, params)
      .then((response) => {
        // Add your code here
        console.log(response);
      })
      .catch((error) => {
        console.log(error.response);
      });
  },
};
