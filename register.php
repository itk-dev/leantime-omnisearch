<?php

use Leantime\Core\Events;
use Leantime\Domain\Setting\Services\Setting as SettingsService;

Events::add_event_listener(
    'leantime.core.template.tpl.*.afterScriptLibTags',
    function () {
        if (isset($_SESSION['userdata']['id']) && !is_null($_SESSION['userdata']['id'])) {
            $projectCacheExpiration = app()->make(SettingsService::class)->getSetting("omnisearchsettings.projectscache") ?: '2400';
            $ticketCacheExpiration = app()->make(SettingsService::class)->getSetting("omnisearchsettings.ticketscache") ?: '1200';
            $userId = $_SESSION['userdata']['id'];
            echo '<script>const omniSearch = '.json_encode(["settings" => ["userId" => $userId, "projectCacheExpiration" => $projectCacheExpiration, "ticketCacheExpiration" => $ticketCacheExpiration]]).'</script>';
            echo '<script src="/dist/js/omniSearch.v%%VERSION%%.js"></script>';
        }
    },
    5
);
