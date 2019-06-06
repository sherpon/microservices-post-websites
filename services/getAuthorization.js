import axios from 'axios';

/**
 * @param {string} token
 * @param {string} userId
 * @param {number} websiteId
 */
const getAuthorization = (token, userId, websiteId) => {
  return axios({
    method: 'post',
    url: `${process.env.MICROSERVICES_ENDPOINT}/getAuthorization`,
    headers: {
      'Authorization': `Bearer ${token}`
    },
    data: {
      userId: userId,
      websiteId: websiteId,
    }
  });
};

module.exports = getAuthorization;