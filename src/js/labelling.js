// Prevent form from redirecting
u('form').handle('submit', async e => {
    chrome.storage.local.get(['api', 'token'], data => {
        const formData = new FormData(e.target);
        formData.append('token', data.token);
        const options = {
            method: 'POST',
            body: formData
        };
        console.log(formData);
        fetch(data.api + "/api/label", options )
            .then( response => response.json() )
            .then( response => {
                console.log(response);
            });        
    });
});

const urlParams = new URLSearchParams(window.location.search);
if(urlParams.has('domain')) {
    let domain = urlParams.get('domain');
    u('.domain').attr('value', domain);
}
