// Prevent form from redirecting
u('form').handle('submit', async e => {
    const formData = new FormData(e.target);
    const options = {
        method: 'POST',
        body: formData
    };
    chrome.storage.local.get(['api'], data => {
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
