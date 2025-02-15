<?php

namespace Leantime\Plugins\OmniSearch\Controllers;

use Leantime\Core\Controller\Controller;
use Leantime\Core\Controller\Frontcontroller;
use Symfony\Component\HttpFoundation\RedirectResponse;
use Symfony\Component\HttpFoundation\Response;
use Leantime\Domain\Setting\Repositories\Setting as SettingRepository;

/**
 * Settings Controller for Omnisearch plugin
 *
 * @package    leantime
 * @subpackage plugins
 */
class Settings extends Controller
{
    private SettingRepository $settingsRepo;


    /**
     * constructor
     * @access public
     *
     * @return void
     */
    public function init(SettingRepository $settingsRepo): void
    {
        $this->settingsRepo = $settingsRepo;
    }

    /**
     * get method
     *
     * @return Response
     */
    public function get(): Response
    {
        $projectCacheExpiration = (int) ($this->settingsRepo->getSetting('omnisearchsettings.projectscache') ?: 60);
        $ticketCacheExpiration = (int) ($this->settingsRepo->getSetting('omnisearchsettings.ticketscache') ?: 30);

        $this->tpl->assign('projectCacheExpiration', $projectCacheExpiration);
        $this->tpl->assign('ticketCacheExpiration', $ticketCacheExpiration);

        return $this->tpl->display('omniSearch.settings');
    }

    /**
     * post method
     * @param array<string, mixed> $params
* @return \Symfony\Component\HttpFoundation\RedirectResponse
     */
    public function post(array $params): RedirectResponse
    {

        $this->settingsRepo->saveSetting('omnisearchsettings.projectscache', (int) ($params['projectCacheExpiration'] ?? 0));
        $this->settingsRepo->saveSetting('omnisearchsettings.ticketscache', (int) ($params['ticketCacheExpiration'] ?? 0));
        $this->tpl->setNotification('The settings were successfully saved.', 'success');

        return Frontcontroller::redirect(BASE_URL . '/OmniSearch/settings');
    }
}
