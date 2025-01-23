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
     * @var array<string, string>
     */
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
     * @var array<string, string>
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

    public function getAllComments(): array
    {
        return $this->omniSearchRepository->getAllComments();
    }

    public function getAllTimelogDescriptions(): array
    {
        return $this->omniSearchRepository->getAllTimelogDescriptions();
    }
}
