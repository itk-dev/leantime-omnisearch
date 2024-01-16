<?php

namespace Leantime\Plugins\OmniSearch\Controllers;

use Leantime\Core\Controller;

/**
 * Settings Controller for Sample Plugin
 *
 * @package    leantime
 * @subpackage plugins
 */
class Settings extends Controller
{
    /**
     * init
     *
     * @return void
     */
    public function init(): void
    {
    }

    /**
     * get
     *
     * @return void
     * @throws \Exception
     */
    public function get(): void
    {
        $this->tpl->display("OmniSearch.settings");
    }

    /**
     * post
     *
     * @param array $params
     * @return void
     */
    public function post(array $params): void
    {
    }
}
