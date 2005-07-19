use lib "$ENV{HOME}/jsan/perl/Module-Build-JSAN/trunk/lib";
use Module::Build::JSAN;

my $build = Module::Build::JSAN->new(
    module_name    => 'MochiKit',
    license        => 'open_source',
    dist_author    => 'Bob Ippolito <bob@redivi.com>',
    dist_abstract  => 'Python-inspired JavaScript kit',
    dist_version   => '0.50',
    recommends     => {
        JSAN       => 0.06,
    },
);

$build->create_build_script;
