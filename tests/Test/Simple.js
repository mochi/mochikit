// # $Id: Kinetic.pm 1493 2005-04-07 19:20:18Z theory $
// Set up namespace.
function plan (cmds) {
    return Test.Builder.Test.plan(cmds);
}

function ok (val, desc) {
    return Test.Builder.Test.ok(val, desc);
}
