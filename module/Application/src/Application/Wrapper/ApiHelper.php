<?php

namespace Application\Wrapper;

define('ENDPOINT', 'https://beta.flxone.com/api');
//define('ENDPOINT', 'https://platform.flxone.com/api');
define('APPLICATION_PATH', getcwd());

use Application\Curl\cURL;

class ApiHelper {

    private $cURL;
    private $authorizedUser;
    public $loginCount = 0;

    public function __construct() {
        $this->cURL = new cURL();
    }

    public function getCurl() {
        return $this->cURL;
    }

    public function login() {
        $username = 'pim@sourcerepublic.com';
        $password = 'c04E419379006f2203f1Ba51829cA87e';
        $userInfo = array(
            'username' => $username,
            'password' => $password
        );

        $response = $this->cURL->post(ENDPOINT, '/auth', $userInfo);
        if ($response->statusText === "200 OK") {
            //$this->authorizedUser = new User($this->cURL->get(ENDPOINT, '/user/current'));
            $this->getCurrentUser();
        } else {
            $this->authorizedUser = null;
        }
        $this->loginCount++;
        return $response;
    }

    public function getUniqueUserCount($date_start, $date_end) {
        if (!isset($date_start)) {
            //$date_start = date('Y-m-d');
        }

        if (!isset($date_end)) {
            //$date_end = date('Y-m-d');
        }

        $date_start = "2014-04-01";
        $date_end = "2014-04-01";

        $response = $this->vizData("flx_uuid", "flx_pixels_sum", false, "asc", $date_start, $date_end);
        $uu_count = -1;
        $response = json_decode($response, true);
        return count($response['response']['data'][0]['data']);
    }

    public function test($dimension, $measure, $beaconIds = null) {

        $this->getCurrentUser();
        $beaconFilter = null;
        if (isset($beaconIds) && !empty($beaconIds)) {
            $beaconFilter = array(
                "dimension" => "flx_pixel_id",
                "include" => $beaconIds
            );
        }

        $dataParams = array(
            array(
                "dimensions" => array($dimension),
                "measures" => array($measure),
                "filters" => array(
                    array(
                        "dimension" => "date",
                        "date_start" => "2013-04-01",
                        "date_end" => "2014-04-22",
                        "date_dynamic" => null
                    ),
                    $beaconFilter
                ),
                "order" => array(array(
                        "key" => $measure,
                        "order" => "desc"
                    ))
            ),
        );

        if (isset($this->authorizedUser)) {

            $x = \Zend\Json\Json::encode($dataParams);
            $x_signature = md5(\Zend\Json\Json::encode($dataParams) . '~' . $this->authorizedUser->getId());
        }

        $params = array(
            'x' => $x,
            'x_signature' => $x_signature
        );

        $retries = 0;
        while (empty($response) && $retries <= 3) {
            $request = $this->cURL->newRequest('post', ENDPOINT . '/viz/data', '/viz/data', $params);

            $response = $this->cURL->sendRequest($request);

            $retries++;
        }

        if ($this->isAuthorized($response) === false) {

            $this->login();
            $this->test($dimension, $measure, $beaconIds);
        }



        $response = $this->addParamsToResponse($response, $dataParams);
        return $response;
    }

    public function getCurrentUser() {
        $response = $this->cURL->get(ENDPOINT, '/user/current');
        if ($this->isAuthorized($response) === false) {
            $this->login();
            $this->getCurrentUser();
        }
        $this->authorizedUser = new User($response);
    }

    public function isAuthorized($response) {
        if (empty($response)) {
            return false;
        }
        $response = json_decode($response, true);
        if ($response === null) {
            return false;
        }
        if ($response['response']['status'] === "ERROR") {
            if ($response['response']['error'] === "Not authenticated") {
                return false;
            }
            if ($response['response']['error'] === "Signature invalid") {
                return false;
            }
            /* COMMENTED THIS OUT TO VIEW THE ERROR MESSAGE */
            //return false; 
        }
        return true;
    }

    public function getViewsOverTime($date_start, $date_end, $beaconIds) {
        return $this->vizDataMultiple(array("date"), array("flx_pixels_sum"), $beaconIds, true, "asc", $date_start, $date_end);
    }

    public function trackingBeacon($beacon_array = false, $id = array()) {
        if ($this->authorizedUser === null) {
            $this->login();
        }

        $functionCall = '/tracking/beacon';

        if (isset($id) && $id !== null) {
            $functionCall .= '?id=' . $id;
        }

        $hash = md5($functionCall);
        $cachePath = APPLICATION_PATH .
                DIRECTORY_SEPARATOR .
                'public' .
                DIRECTORY_SEPARATOR .
                'resources' .
                DIRECTORY_SEPARATOR .
                'cache' .
                DIRECTORY_SEPARATOR .
                'api' .
                DIRECTORY_SEPARATOR .
                'tracking_beacon_' . $hash . ".cache";
        if (file_exists($cachePath) && (time() - filemtime($cachePath) < 1 * 3600)) {
            $response = file_get_contents($cachePath);
        } else {
            while (empty($response) && $retries <= 3) {
                $response = $this->cURL->get(ENDPOINT . $functionCall, $functionCall);

                $retries++;
            }

            if ($this->isAuthorized($response) === false) {
                $this->login();
                $this->trackingBeacon($beacon_array, $id);
            }
            file_put_contents($cachePath, $response);
        }

        if ($beacon_array === true) {
            $response = json_decode($response, true);
            $beacons = [];
            if (isset($response['response']['beacon']) && $response['response']['beacon'] !== null) {
                foreach ($response['response']['beacon'] as $beacon) {
                    $beaconEntity = new \Application\Wrapper\BeaconEntity();
                    $beaconEntity->setId($beacon['id']);
                    $beaconEntity->setCustomerId($beacon['customer']);
                    $beaconEntity->setTrackingGroup($beacon['trackingGroup']);
                    $beaconEntity->setType($beacon['type']);
                    $beaconEntity->setName($beacon['name']);
                    $beaconEntity->setSettings($beacon['settings']);
                    $beaconEntity->setScriptHash($beacon['scriptHash']);
                    $beaconEntity->setDeleted($beacon['deleted']);
                    $beaconEntity->setCreated($beacon['created']);
                    $beaconEntity->setModified($beacon['modified']);
                    $beacons[] = $beaconEntity;
                }
            }
            return $beacons;
        }

        return $response;
    }

    public function vizData($dimension, $measure, $beaconIds = null, $orderByDimension = false, $orderType = "asc", $date_start = "2013-04-01", $date_end = "2014-04-05", $limit = "10000") {
        if ($this->authorizedUser === null) {
            $this->login();
        }

        if ($date_end === "2014-04-05") {
            $date_end = date('Y-m-d');
        }

        $orderBy = $measure;
        if ($orderByDimension === true) {
            $orderBy = $dimension;
        }

        $beaconFilter = null;
        if (isset($beaconIds) && !empty($beaconIds)) {
            $beaconFilter = array(
                "dimension" => "flx_pixel_id",
                "include" => $beaconIds
            );
        }


        $dataParams = array(
            array(
                "dimensions" => array($dimension),
                "measures" => array($measure),
                "filters" => array(
                    array(
                        "dimension" => "date",
                        "date_start" => $date_start,
                        "date_end" => $date_end,
                        "date_dynamic" => null
                    ),
                    $beaconFilter
                ),
                "order" => array(array(
                        "key" => $orderBy,
                        "order" => $orderType
                    ))
            ),
        );


        $x = \Zend\Json\Json::encode($dataParams);
        $x_signature = md5(\Zend\Json\Json::encode($dataParams) . '~' . $this->authorizedUser->getId());

        $params = array(
            'x' => $x,
            'x_signature' => $x_signature
        );


        $retries = 0;
        while (empty($response) && $retries <= 3) {
            $request = $this->cURL->newRequest('post', ENDPOINT . '/viz/data', '/viz/data', $params);
            $response = $this->cURL->sendRequest($request);

            $retries++;
        }

        if ($this->isAuthorized($response) === false) {
            $this->login();
            $this->vizData($dimension, $measure, $beaconIds, $orderByDimension, $orderType, $date_start, $date_end, $limit);
        }

        $response = $this->addParamsToResponse($response, $dataParams);
        return $response;
    }

    public function vizDataMultiple($dimensions, $measures, $beaconIds = null, $callbackIds = null, $orderByDimension = false, $orderType = "asc", $date_start = "2013-04-01", $date_end = "2014-04-05", $limit = "10000") {
        if ($this->authorizedUser === null) {
            $this->login();
        }

        if ($date_end === "2014-04-05") {
            $date_end = date('Y-m-d');
        }

//        $dimensions = array("flx_pixel_id", "flx_geo_city", "flx_pixel_id");
//        $measures = array("flx_pixels_sum", "flx_uuid_distinct", "flx_time_on_site_avg");

        $beaconFilter = null;
        if (isset($beaconIds) && !empty($beaconIds)) {
            $beaconFilter = array(
                "dimension" => "flx_pixel_id",
                "include" => $beaconIds
            );
        }
        $queries = array();
        $queryHashes = array();
        for ($i = 0; $i < count($dimensions); $i++) {
            $dimension = $dimensions[$i];
            $measure = $measures[$i];

            $orderBy = $measure;
            if ($orderByDimension === true) {
                $orderBy = $dimension;
            }

            $query = array(
                "dimensions" => array($dimension),
                "measures" => array($measure),
                "filters" => array(
                    array(
                        "dimension" => "date",
                        "date_start" => $date_start,
                        "date_end" => $date_end,
                        "date_dynamic" => null
                    ),
                    $beaconFilter
                ),
                "order" => array(array(
                        "key" => $orderBy,
                        "order" => $orderType
                    ))
            );
            $queryHash = md5(\Zend\Json\Json::encode($query));
            $cachePath = APPLICATION_PATH .
                    DIRECTORY_SEPARATOR .
                    'public' .
                    DIRECTORY_SEPARATOR .
                    'resources' .
                    DIRECTORY_SEPARATOR .
                    'cache' .
                    DIRECTORY_SEPARATOR .
                    'api' .
                    DIRECTORY_SEPARATOR .
                    'viz_data_' . $queryHash . ".cache";
            $queryHashes[] = $cachePath;
            $queries[] = $query;
        }

        $count = -1;
        $cachedResults = array();
        foreach ($queryHashes as $key => $value) {
            $count++;
            if (file_exists($value)) {
                if (time() - filemtime($value) < 1 * 3600) {
                    $cachedResults[$key] = $value;
                    unset($queries[$count]);
                }
            }
        }
        if (count($queries) > 0) {
            
        } else {
            
        }
        $dataParams = $queries;


        $x = \Zend\Json\Json::encode($dataParams);
        $x_signature = md5(\Zend\Json\Json::encode($dataParams) . '~' . $this->authorizedUser->getId());

        $params = array(
            'x' => $x,
            'x_signature' => $x_signature
        );


        $retries = 0;
        while (empty($response) && $retries <= 3) {
            $request = $this->cURL->newRequest('post', ENDPOINT . '/viz/data', '/viz/data', $params);
            $response = $this->cURL->sendRequest($request);

            $retries++;
        }






        if ($this->isAuthorized($response) === false) {
            $this->login();
            $this->vizData($dimension, $measure, $beaconIds, $orderByDimension, $orderType, $date_start, $date_end, $limit);
        }
        $response = $this->readFromCache($response, $cachedResults);
        $this->writeToCache($response, $queries, $queryHashes);

//        $response = \Zend\Json\JSON::decode($response, true);
//        $data = $response['response']['data'];
//        return \Zend\Json\JSON::encode($data);
        //$response = $this->addParamsToResponse($response, $dataParams);

        return $response;
    }

    private function addParamsToResponse($response, $params) {
        $decoded_result = json_decode($response, true);
        $decoded_result['params'] = $params;
        return json_encode($decoded_result);
    }

    private function writeToCache($response, $queries, $queryHashes) {
        $responseArray = \Zend\Json\JSON::decode($response, true);
        foreach ($queryHashes as $key => $value) {
            if (!file_exists($value) || (time() - filemtime($value) > 1 * 3600)) {
                if (isset($responseArray['response']['data'][$key]['data']) && !empty($responseArray['response']['data'][$key]['data'])) {
                    file_put_contents($value, \Zend\Json\JSON::encode($responseArray['response']['data'][$key]));
                } else {
                    // echo "Response has no content";
                }
            } else {
                //echo "File exists and is younger than 1 hour";
            }
        }
    }

    private function readFromCache($response, $cachedResults) {
        $responseArray = \Zend\Json\JSON::decode($response, true);

        foreach ($cachedResults as $key => $value) {
            $result = file_get_contents($value);
            $resultArray = \Zend\Json\JSON::decode($result, true);
            $tempKey = $key;
            $tempData = $responseArray['response']['data'][$tempKey];
            while (isset($responseArray['response']['data'][$tempKey])) {
                $tempKey++;
            }
            $responseArray['response']['data'][$tempKey] = $tempData;
            $responseArray['response']['data'][$key] = $resultArray;
        }

        $newResponse = \Zend\Json\JSON::encode($responseArray);

        return $newResponse;
    }

}
