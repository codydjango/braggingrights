const ghpages = require('gh-pages');

ghpages.publish('dist', function(err) {
    console.log((err) ? err : 'success')
});
