# Fake News Blacklist
    
### About
**A browser extension that blocks fake news sites according to a content-agnostic ML classifier**

This extension detects and blocks known and/or possible fake news sites based a
ML algorithm that analyzes their behaviour. It follows [this paper](https://scholar.google.gr/citations?view_op=view_citation&hl=el&user=Wk7e-kIAAAAJ&sortby=pubdate&citation_for_view=Wk7e-kIAAAAJ:_OXeSy2IsFwC)
and aims to make use of this information to help curb the spread of these sites.

It leverages a blacklist provided by an external host that performs the analysis.
The backend API can be found [here](https://github.com/dimspith/fnapi).

### Tooling used
- [Bulma CSS](https://bulma.io/): Styling.
- [Feather Icons](https://github.com/feathericons/feather): JS library for loading svg icons.
- [Umbrella JS](https://umbrellajs.com/): Tiny DOM Manipulation library, similar to JQuery.
 
