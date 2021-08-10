# Fake News Blacklist

### About
**A browser extension that blocks fake news sites according to a content-agnostic ML classifier**

This extension detects and blocks known and/or possible fake news sites based a
ML algorithm that analyzes their behaviour. It follows [this paper](https://scholar.google.gr/citations?view_op=view_citation&hl=el&user=Wk7e-kIAAAAJ&sortby=pubdate&citation_for_view=Wk7e-kIAAAAJ:_OXeSy2IsFwC)
and aims to make use of this information to help curb the spread of these sites.

It leverages a blacklist provided by an external host that performs the analysis.
The backend API can be found [here](https://github.com/dimspith/fnapi).

### Tooling used
- [Bulma CSS](https://bulma.io/) for styling
- [svg-loader](https://github.com/shubhamjain/svg-loader) javascript library for loading  svg icons.
  
### TODO LIST
- [ ] Allow the use of a custom API to fetch blacklist (localhost:5000 is used for now)
- [ ] Fix Popup UI to be more consistent
- [ ] Add the ability to whitelist pages
- [ ] Implement a Settings page
- [ ] Make the page block page more informative
- [ ] Allow auto-updating blacklist
