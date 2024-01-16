<?php

namespace Leantime\Plugins\OmniSearch\Services;


/**
 * Sample plugin service
 */
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
    $omniSelectEnginePath = "./dist/js/omniSearch.js";
    $omniSelectStylePath = "./dist/css/omniSearch.css";
    unlink($omniSelectEnginePath);
    unlink($omniSelectStylePath);
  }
}
