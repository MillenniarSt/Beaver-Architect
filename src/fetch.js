const backendUrl = 'http://localhost:8025';

function Get(url, query, success, unsuccess) {
    let params = ''
    if(query.length > 0) {
        params = '?' + Object.keys(query).map(key => 
            `${encodeURIComponent(key)}=${encodeURIComponent(query[key])}`
        ).join('&')
    } 
    fetch(`${backendUrl}/${url}${params}`)
        .then(response => response.json())
        .then(data => execute(data, success, unsuccess))
        .catch(error => console.error('Error:', error))
}

function Post(url, data, success, unsuccess) {
    fetch(`${backendUrl}/${url}`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json'
        },
        body: JSON.stringify(data)
      })
        .then(response => response.json())
        .then(data => execute(data, success, unsuccess))
        .catch(error => console.error('Error:', error))
}

function Put(url, data, success, unsuccess) {
    fetch(`${backendUrl}/${url}`, {
        method: 'PUT',
        headers: {
          'Content-Type': 'application/json'
        },
        body: JSON.stringify(data)
      })
        .then(response => response.json())
        .then(data => execute(data, success, unsuccess))
        .catch(error => console.error('Error:', error))
}

function Delete(url, id, success, unsuccess) {
    fetch(`${backendUrl}/${url}/${id}`, {
        method: 'DELETE'
      })
        .then(response => response.json())
        .then(data => execute(data, success, unsuccess))
        .catch(error => console.error('Error:', error))
}

function execute(data, success, unsuccess) {
    console.log(data)

    if (data.err) {
        showError(data.err)
    }
    if (data.success) {
        success(data)
    } else {
        unsuccess(data)
    }
}

function showError(err) {
    //TODO
}

export { Get, Post, Put, Delete };