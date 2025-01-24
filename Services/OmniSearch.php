<?php

namespace Leantime\Plugins\OmniSearch\Services;

use Leantime\Plugins\OmniSearch\Repositories\OmniSearch as OmniSearchRepository;

/**
 * OmniSearch plugin.
 */
final class OmniSearch
{
    private OmniSearchRepository $omniSearchRepository;

    /**
     * constructor
     *
     * @param  OmniSearchRepository $omniSearchRepository
     * @return void
     */
    public function __construct(OmniSearchRepository $omniSearchRepository)
    {
        $this->omniSearchRepository = $omniSearchRepository;
    }

    /**
     * @var array<string, string> $assets Array of source => target paths.
     */
    private static array $assets = [
        // source => target
        __DIR__ . '/../dist/js/omniSearch.js' => APP_ROOT . '/public/dist/js/omniSearch.v%%VERSION%%.js',
    ];

    /**
     * Install plugin.
     *
     * @return void
     */
    public function install(): void
    {
        foreach (static::$assets as $source => $target) {
            if (file_exists($target)) {
                unlink($target);
            }
            symlink($source, $target);
        }
    }

    /**
     * Uninstall plugin.
     *
     * @return void
     */
    public function uninstall(): void
    {
        foreach (static::$assets as $target) {
            if (file_exists($target)) {
                unlink($target);
            }
        }
    }

    /**
     * Retrieves all comments from the repository
     *
     * @return array<string, string> The list of all comments
     */
    public function getAllComments(): array
    {
        return $this->omniSearchRepository->getAllComments();
    }

    /**
     * Retrieves all timelog descriptions.
     *
     * @return array<string, string> An array containing all timelog descriptions.
     */
    public function getAllTimelogDescriptions(): array
    {
        return $this->omniSearchRepository->getAllTimelogDescriptions();
    }
}
