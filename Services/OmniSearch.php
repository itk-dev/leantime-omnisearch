<?php

namespace Leantime\Plugins\OmniSearch\Services;

class OmniSearch {

  public function install() {
    $omniSelectEngine = file_get_contents(dirname(__DIR__). "/assets/js/omniSelectEngine.js");
    $fp = fopen($_SERVER['DOCUMENT_ROOT'] . "/dist/js/omniSearch.js", "wb");
    fwrite($fp,$omniSelectEngine);

    $omniSelectStyle = file_get_contents(dirname(__DIR__). "/assets/css/omniSelectStyle.css");
    $fp = fopen($_SERVER['DOCUMENT_ROOT'] . "/dist/css/omniSearch.css", "wb");
    fwrite($fp,$omniSelectStyle);

    fclose($fp);
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
