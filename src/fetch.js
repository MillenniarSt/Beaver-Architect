import { BaseErrorDialog, ErrorDialog } from "./windows/dialog/dialogs";

const backendUrl = 'http://localhost:8025';

function BackGet(url, query, success, unsuccess) {
    let params = '?' + Object.keys(query).map(key =>
        `${encodeURIComponent(key)}=${encodeURIComponent(query[key])}`
    ).join('&')
    url = `${backendUrl}/${url}${params}`

    fetch(url)
        .then(response => response.json())
        .then(data => execute(url, data, success, unsuccess))
        .catch(error => console.error('Error:', error))
}

function BackPost(url, data, success, unsuccess) {
    url = `${backendUrl}/${url}`

    fetch(url, {
        method: 'POST',
        headers: {
            'Content-Type': 'application/json'
        },
        body: JSON.stringify(data)
    })
        .then(response => response.json())
        .then(data => execute(url, data, success, unsuccess))
        .catch(error => console.error('Error:', error))
}

function BackPut(url, id, data, success, unsuccess) {
    url = `${backendUrl}/${url}/${id}`

    fetch(url, {
        method: 'PUT',
        headers: {
            'Content-Type': 'application/json'
        },
        body: JSON.stringify(data)
    })
        .then(response => response.json())
        .then(data => execute(url, data, success, unsuccess))
        .catch(error => console.error('Error:', error))
}

function BackDelete(url, id, success, unsuccess) {
    url = `${backendUrl}/${url}/${id}`

    fetch(url, {
        method: 'DELETE'
    })
        .then(response => response.json())
        .then(data => execute(url, data, success, unsuccess))
        .catch(error => console.error('Error:', error))
}

function execute(url, data, success, unsuccess) {
    if (data.err) {
        showError(data.err, url)
    }
    if (data.success) {
        success(data)
    } else {
        unsuccess(data)
    }
}

function showError(err, url) {
    console.log(err.stack)
    ErrorDialog(err, url)
}

export { BackGet, BackPost, BackPut, BackDelete };