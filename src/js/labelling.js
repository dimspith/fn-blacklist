// Configure Toast
bulmaToast.setDefaults({
  duration: 3000,
  position: "top-center",
  closeOnClick: true,
  dismissible: true,
});

// Prevent form from redirecting
u('form').handle('submit', async e => {
    chrome.storage.local.get(['api', 'token'], data => {
        const formData = new FormData(e.target);
        formData.append('token', data.token);
        if(formData.get("bias") === "none") {
            formData.delete("bias");
        }
        for (var pair of formData.entries()) {
            console.log( pair[0] + ' - ' + pair[1] );
        }
        const options = {
            method: 'POST',
            body: formData
        };
        fetch(data.api + "/api/label", options )
            .then( response => response.json() )
            .then( response => {
                switch(response.result) {
                case "success":
                    bulmaToast.toast({
                        message: "Label submitted successfully!",
                        type: "is-success",
                    });
                    break;
                case "failure":
                    bulmaToast.toast({
                        message: response.error,
                        type: "is-danger",
                    });
                    break;
                }
            }).catch((_err) => {
                bulmaToast.toast({
                    message: "Unable to submit. Try again later.",
                    type: "is-danger",
                });
            });;
    });
});

const urlParams = new URLSearchParams(window.location.search);
if(urlParams.has('domain')) {
    const domain = urlParams.get('domain');
    u('.domain').attr('value', domain);
}
