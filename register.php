<?php

use Leantime\Core\Events;

Events::add_event_listener(
    "leantime.core.template.tpl.*.afterScriptLibTags",

    function ($payload) {
        if (isset($_SESSION['userdata']['id']) && !is_null($_SESSION['userdata']['id'])) {
            echo '<input type="hidden" name="userid" value="'.$_SESSION['userdata']['id'].'" />';
            echo '<link href="https://cdn.jsdelivr.net/npm/select2@4.1.0-rc.0/dist/css/select2.min.css" rel="stylesheet" />';
            echo '<script src="https://cdn.jsdelivr.net/npm/select2@4.1.0-rc.0/dist/js/select2.min.js"></script>';
            echo '<link rel="stylesheet" href="/dist/css/omniSearch.css"></link>';
            echo '<script type="text/javascript" src="/dist/js/omniSearch.js"></script>';
        }
    },
    5
);
