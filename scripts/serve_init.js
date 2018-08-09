/** Used for initializing the test server. */
var fs = require('fs');

//Symlink the folder if it doesn't exist.
if (!fs.existsSync('../tests/MochiKit')) {
    fs.symlinkSync('../MochiKit/', '../tests/MochiKit', 'dir');
}