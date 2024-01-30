<?php

namespace Leantime\Plugins\OmniSearch\Services;

class OmniSearch {

  public function install() {
    symlink(dirname(__DIR__). "/assets/js/omniSearch.js", $_SERVER['DOCUMENT_ROOT'] . "/dist/js/omniSearch.js");
    symlink(dirname(__DIR__). "/assets/css/omniSearch.css", $_SERVER['DOCUMENT_ROOT'] . "/dist/css/omniSearch.css");
  }

  public function uninstall() {
    $omniSelectFiles = [
        $_SERVER['DOCUMENT_ROOT'] . "/dist/js/omniSearch.js",
        $_SERVER['DOCUMENT_ROOT'] . "/dist/css/omniSearch.css"
      ];

      foreach ($omniSelectFiles as $file) {
        if (file_exists($file)) {
          unlink($file);
        }
      }
  }
}
