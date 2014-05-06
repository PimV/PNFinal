<?php

/* !
 * PubNxt v0.01
 * Copyright 2014 Source Republic
 * Author: Pim Verlangen
 */

namespace Application\Wrapper;

define('ENDPOINT', 'https://analytics.pubnxt.net/index.php?module=API');
define('APPLICATION_PATH', getcwd());
define('CACHE_PATH', APPLICATION_PATH . DIRECTORY_SEPARATOR . 'public' . DIRECTORY_SEPARATOR . 'resources' . DIRECTORY_SEPARATOR . 'cache' . DIRECTORY_SEPARATOR . 'api' . DIRECTORY_SEPARATOR);

use Application\Curl\cURL;

class ApiHelper {

    private $cURL;
    private $authorizedUser;
    protected $services;
    public $loginCount = 0;
    private $ttl = 6; //Cache Maximum Time
    private $format = "&format=json";
    private $token = "&token_auth=81f5f971b84c7f4892355209b462404e";
    private $latestRequest;

    public function __construct() {
        
    }

    public function test($siteIds, $methods) {
        $url = ENDPOINT;

        /* Add the usual parameters */
        $url .= "&method=API.getBulkRequest";
        $url .= $this->format;
        $url .= $this->token;

        /* Add all requests */
        for ($i = 0; $i < count($methods); $i++) {
            $newRequest = "&urls[" . $i . "]=";
            $newMethod = "&method=" . $methods[$i]['method'];
            $newMethodParameters = "";
            foreach ($methods[$i]['params'] as $methodParamKey => $methodParamValue) {
                $newMethodParameters .= "&" . $methodParamKey . "=" . $methodParamValue;
            }

            $newRequest .= urlencode($newMethod . $newMethodParameters);
            $url .= $newRequest;
        }

        /* For which site IDs */
        $idSite = "&idSite=";
        if (isset($siteIds) && !empty($siteIds)) {
            foreach ($siteIds as $site) {
                $idSite .= $site . ",";
            }
            $idSite = substr($idSite, 0, strlen($idSite) - 1);
        } else {
            $idSite .= "all";
        }

        $url .= $idSite;
        
        return $url;
    }

    /**
     * Creates a request out of the given methods. If siteIds is empty or invalid,
     * will take all siteIds
     * 
     * @param type $siteIds
     * @param array $methods
     */
    public function createRequest($siteIds, $methods) {
        /* Starting endpoint */
        $url = ENDPOINT;

        /* Add the usual parameters */
        $url .= "&method=API.getBulkRequest";
        $url .= $this->format;
        $url .= $this->token;

        /* Add all requests */
        for ($i = 0; $i < count($methods); $i++) {
            $newRequest = "&urls[" . $i . "]=";
            $newMethod = "&method=" . $methods[$i]['method'];
            $newMethodParameters = "";
            foreach ($methods[$i]['params'] as $methodParamKey => $methodParamValue) {
                $newMethodParameters .= "&" . $methodParamKey . "=" . $methodParamValue;
            }

            $newRequest .= urlencode($newMethod . $newMethodParameters);
            $url .= $newRequest;
        }

        /* For which site IDs */
        $idSite = "&idSite=";
        if (isset($siteIds) && !empty($siteIds)) {
            foreach ($siteIds as $site) {
                $idSite .= $site . ",";
            }
            $idSite = substr($idSite, 0, strlen($idSite) - 1);
        } else {
            $idSite .= "all";
        }

        $url .= $idSite;
    }

    /**
     * Fires the created request with a 5-retry count.
     * 
     * @param String $query
     * @return JSON rawResponse
     */
    public function fireRequest($query) {
        $retryCount = 0;
        $rawResponse;
        while ($retryCount < 5 && empty($rawResponse)) {
            $rawResponse = file_get_contents($query);
            $retryCount++;
        }
        $this->latestResponse = $rawResponse;
        return $rawResponse;
    }

    public function echoResponse() {
        echo $this->latestResponse;
    }

}
