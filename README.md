# Fake News Blacklist
    
### About
**A browser extension that blocks fake news sites according to a content-agnostic ML classifier**

This extension detects and blocks known and/or possible fake news sites.
It leverages a blacklist provided by an external API that collects and serves the domains.
It can be found [here](https://github.com/dimspith/fn-api).

### Tooling used
- [Bulma CSS](https://bulma.io/): Styling.
- [Feather Icons](https://github.com/feathericons/feather): JS library for loading svg icons.
- [Umbrella JS](https://umbrellajs.com/): Tiny DOM Manipulation library, similar to JQuery.
 
### How to Install
1. Clone the repository
```bash
git clone https://github.com/dimspith/fn-blacklist.git
`````
2. Enable **Developer Mode** in Chrome/Chromium, click **Load Unpacked** and select the extension folder.
3. Install and run [fn-api](https://github.com/dimspith/fnapi)
4. Configure the API URL in the extension settings to match the one in fn-api

### How to Test and Customize
- After loading the unpacked extension you can customize any file and reload it from chrome/chromium
- In order to customize colors and other styling options offered by [Bulma](https://bulma.io/), **nodejs** needs to be installed
- After installing nodejs, run `npm install` and `npm run build` to generate the `bulma.min.css` file used throughout the extension.
- To customize this file, modify the `sass/custom.scss` file and run `npm run build` again.
