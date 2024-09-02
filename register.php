<?php

use Leantime\Core\Events\EventDispatcher;
use Leantime\Domain\Setting\Services\Setting as SettingsService;

EventDispatcher::add_event_listener(
    'leantime.core.template.tpl.*.afterScriptLibTags',
    function () {
        if (session('userdata.id') !== null) {
            $userId  = session('userdata.id'); // you need to set the value for $userId
            $projectCacheExpiration = app()->make(SettingsService::class)->getSetting('omnisearchsettings.projectscache') ?: '2400';
            $ticketCacheExpiration = app()->make(SettingsService::class)->getSetting('omnisearchsettings.ticketscache') ?: '1200';
            echo '<script>const omniSearch = ' . json_encode(['settings' => ['userId' => $userId, 'projectCacheExpiration' => $projectCacheExpiration, 'ticketCacheExpiration' => $ticketCacheExpiration]]) . '</script>';
            echo '<script src="/dist/js/omniSearch.v' . urlencode('%%VERSION%%') . '.js"></script>';
        }
    },
    5
);
