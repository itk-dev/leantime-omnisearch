<?php

namespace Leantime\Plugins\OmniSearch\Controllers;

use Leantime\Core\Controller\Controller;
use Leantime\Core\Controller\Frontcontroller;
use Leantime\Domain\Users\Services\Users;
use Symfony\Component\HttpFoundation\JsonResponse;
use Symfony\Component\HttpFoundation\RedirectResponse;

class OmniSearch extends Controller
{
    private readonly Users $userService;
    /**
     * Constructor for the ClassName.
     */
    public function init(Users $userService)
    {
        $this->userService = $userService;
    }

    /**
     * Post method.
     *
     * @return RedirectResponse
     */
    public function post(): JsonResponse
    {

        if ($_SERVER['REQUEST_METHOD'] == 'POST') {
            $input = file_get_contents('php://input');
            $data = json_decode($input, true);

            foreach ($data as $id => $checkedValue) {
                $enabled = $checkedValue ? 1 : 0;

                $savedSuccessfully = $this->userService->updateUserSettings('omnisearch', $id, $enabled);

                if (!$savedSuccessfully) {
                    return new JsonResponse(['error' => "An error occurred while saving the setting for: $id"], 400);
                }
            }
        }
        // Return updated usersettings
        return new JsonResponse(session('usersettings.omnisearch'));
    }
    /**
     * Get method.
     *
     * @param mixed $param
     * @return RedirectResponse
     */
    public function get(): RedirectResponse
    {
        return Frontcontroller::redirect('/');
    }
}
