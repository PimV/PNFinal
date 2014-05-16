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
    private $latestUrl;

    public function __construct() {
        $this->cURL = new cURL();
    }

    public function testCurl() {
        $url = 'https://analytics.pubnxt.net/index.php?module=API&method=API.getBulkRequest&format=json&token_auth=81f5f971b84c7f4892355209b462404e&urls%5B0%5D=%26method%3DSitesManager.getAllSites%26idSite%3Dall';
        //$response = file_get_contents($url);
        $response = $this->cURL->get($url);
        
       return $response;
        //return
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
            if (isset($methods[$i]['params'])) {
                foreach ($methods[$i]['params'] as $methodParamKey => $methodParamValue) {
                    $newMethodParameters .= "&" . $methodParamKey . "=" . $methodParamValue;
                }
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

        /* Add all requests */
        for ($i = 0; $i < count($methods); $i++) {
            $newRequest = "&urls[" . $i . "]=";
            $newMethod = "&method=" . $methods[$i]['method'];
            $newMethodParameters = "";
            if (isset($methods[$i]['params'])) {
                foreach ($methods[$i]['params'] as $methodParamKey => $methodParamValue) {
                    $newMethodParameters .= "&" . $methodParamKey . "=" . $methodParamValue;
                }
            }
            $newMethodParameters .= $idSite;
            $newRequest .= urlencode($newMethod . $newMethodParameters);
            $url .= $newRequest;
        }

        $url = str_replace(']', '%5D', str_replace('[', '%5B', $url));

        return $url;
    }

    /**
     * Fires the created request with a 5-retry count.
     * 
     * @param String $query
     * @return JSON rawResponse
     */
    public function fireRequest($url) {
        $retryCount = 0;
        $this->latestUrl = $url;
        $rawResponse;
        while ($retryCount < 5 && empty($rawResponse)) {
            $rawResponse = $this->cURL->get($url);
            $retryCount++;
        }
        $this->latestResponse = $rawResponse;
        return $rawResponse;
    }

    public function echoResponse() {
        echo $this->latestResponse;
    }

    //  https://analytics.pubnxt.net/index.php?module=API&method=API.getBulkRequest&format=json&token_auth=81f5f971b84c7f4892355209b462404e&urls%5B0%5D=%26method%3DLive.getCounters%26lastMinutes%3D1&idSite=all
    public function getLatestUrl() {
        echo $this->latestUrl;
    }

    public function getSites() {
        $methods = array(array(
                "method" => "SitesManager.getAllSites",
                "params" =>
                null
        ));
        $request = $this->createRequest(null, $methods);
        $arrayResponse = json_decode($this->fireRequest($request), true);
        if (isset($arrayResponse[0])) {
            return $arrayResponse[0];
        }
        return array();
    }

}
