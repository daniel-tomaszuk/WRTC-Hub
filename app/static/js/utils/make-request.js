function makeRequest(method, url, content, csrf) {
    const headers = {
        'Content-Type': 'application/json'
    };

    if (method.toUpperCase() === 'POST') {
        headers['X-CSRFToken'] = csrf
    }
    return axios({
        method: method,
        url: url,
        data: content,
        headers: headers,
        timeoutSeconds: 5,
    }).then(function (response) {
        return response.data
    }).catch(function (error) {
        errorHandler(error);
        return error
    })
}
