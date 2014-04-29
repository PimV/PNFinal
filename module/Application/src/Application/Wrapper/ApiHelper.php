<?php

/* !
 * PubNxt v0.01
 * Copyright 2014 Source Republic
 * Author: Pim Verlangen
 */

namespace Application\Wrapper;

define('ENDPOINT', 'https://beta.flxone.com/api');
//define('ENDPOINT', 'https://platform.flxone.com/api');
define('APPLICATION_PATH', getcwd());
define('CACHE_PATH', APPLICATION_PATH . DIRECTORY_SEPARATOR . 'public' . DIRECTORY_SEPARATOR . 'resources' . DIRECTORY_SEPARATOR . 'cache' . DIRECTORY_SEPARATOR . 'api' . DIRECTORY_SEPARATOR);

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
            $this->getCurrentUser();
        } else {
            $this->authorizedUser = null;
        }
        $this->loginCount++;
        return $response;
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
                        "date_start" => "2014-04-20",
                        "date_end" => "2014-04-28",
                        "date_dynamic" => null
                    ),
                    $beaconFilter//,
//                    array(
//                        "measure" => "flx_pixels_sum",
//                        "min" => "10"
//                    )
                ),
                "limit" => "1000",
                "order" => array(array(
                        "key" => $measure,
                        "order" => "desc"
                    ))
            ),
        );
//        $dataParams = array(
//            array(
//                "dimensions" => array($dimension),
//                "measures" => array($measure),
//                "filters" => array(
//                    array(
//                        "dimension" => "date",
//                        "date_start" => "2013-04-15",
//                        "date_end" => "2014-04-22",
//                        "date_dynamic" => null
//                    ),
//                    $beaconFilter
//                ),
//                "limit" => $limit,
//                "order" => array(array(
//                        "key" => $measure,
//                        "order" => "desc"
//                    ))
//            ),
//        );

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
        return $this->vizDataMultiple(array("date"), array("flx_pixels_sum"), $beaconIds, null, true, "asc", $date_start, $date_end);
    }

    public function trackingBeacon($beacon_array = false, $id = array()) {
        if ($this->authorizedUser === null) {
            $this->login();
        }

        $functionCall = '/tracking/beacon';

        if (isset($id) && $id !== null) {
            $functionCall .= '?id=' . $id;
        }
        //get only pixels
        //$functionCall .= ?type=smart_pixel;

        $hash = md5($functionCall);
        $cachePath = CACHE_PATH . 'tracking_beacon_' . $hash . ".cache";
        if (file_exists($cachePath) && (time() - filemtime($cachePath) < 6 * 3600)) {
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

    public function vizData($dimension, $measure, $beaconIds = null, $orderByDimension = false, $orderType = null, $date_start = null, $date_end = null, $limit = null) {
        if ($this->authorizedUser === null) {
            $this->login();
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

    public function vizDataMultiple($dimensions, $measures, $beaconIds = null, $limit = null, $orderByDimension = null, $orderType = null, $date_start = null, $date_end = null) {
        if ($this->authorizedUser === null) {
            $this->login();
        }

        //Default order by dimension
        if (null === $orderByDimension) {
            $orderByDimension = false;
        }

        //Default end date
        if (null === $date_end) {
            $date_end = date('Y-m-d');
        }

        //Default start date
        if (null === $date_start) {
            $date_start = "2013-12-01";
        }

        //Default limit
        if (null === $limit) {
            $limit = null;
        }

        //Default order type
        if (null === $orderType) {
            $orderType = "asc";
        }

        $beaconFilter = null;
        if (isset($beaconIds) && !empty($beaconIds)) {
            $beaconFilter = array(
                "dimension" => "flx_pixel_id",
                "include" => $beaconIds
            );
        }



        $limiter = null;
        if (isset($limit) && !empty($limit)) {
            $limiter = array(
                "limit" => $limit
            );
        }
        $queries = array();
        $queryHashes = array();
        //$dimensions = array(array("flx_geo_city", "flx_geo_long", "flx_geo_lat"));
        //$measures = array("flx_pixels_sum");

        for ($i = 0; $i < count($dimensions); $i++) {
            $dimension = $dimensions[$i];
            $measure = $measures[$i];

//            $orderBy = $measure;
//            if ($orderByDimension === true) {
//                $orderBy = $dimension;
//            }
            $dimensionPiece = array($dimension);
            if (is_array($dimension)) {
                $dimensionPiece = array_values($dimension);
                $dimension = $dimensionPiece[0];
            }

            $measurePiece = array($measure);
            if (is_array($measure)) {
                $measurePiece = array_values($measure);
                $measure = $measurePiece[0];
            }

            $orderBy = $measure;
            if ($orderByDimension === true) {
                $orderBy = $dimension;
            }
            $query = array(
                "dimensions" => $dimensionPiece,
                "measures" => $measurePiece,
                "filters" => array(
                    array(
                        "dimension" => "date",
                        "date_start" => $date_start,
                        "date_end" => $date_end,
                        "date_dynamic" => null
                    ),
                    $beaconFilter,
                    array(
                        "measure" => "flx_pixels_sum",
                        "min" => "10"
                    )
                ),
                "limit" => $limit,
                "order" => array(array(
                        "key" => $orderBy,
                        "order" => $orderType
                    ))
            );
            $queryHash = md5(\Zend\Json\Json::encode($query));
            $cachePath = CACHE_PATH . 'viz_data_' . $queryHash . ".cache";
            $queryHashes[] = $cachePath;
            $queries[] = $query;
        }

        $count = -1;
        $cachedResults = array();
        foreach ($queryHashes as $key => $value) {
            $count++;
            if (file_exists($value)) {
                if (time() - filemtime($value) < 6 * 3600) {
                    $cachedResults[$key] = $value;
                    unset($queries[$count]);
                }
            }
        }

        if (count($queries) > 0) {
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
        } else {
            $data = array('response' => array('data'));
        }
        //$response = $this->addParamsToResponse($response, $dataParams);
        //echo $response;
        if (!isset($data)) {
            $response = \Zend\Json\JSON::decode($response, true);
            $data = $response['response']['data'];
        }

        $data = $this->readFromCache($data, $cachedResults);
        $this->writeToCache($data, $queries, $queryHashes);
        // echo \Zend\Json\JSON::encode($data);
        // die;
        return \Zend\Json\JSON::encode($data);

        //return $response;
    }

    private function addParamsToResponse($response, $params) {
        $decoded_result = json_decode($response, true);
        $decoded_result['params'] = $params;
        return json_encode($decoded_result);
    }

    private function writeToCache($response, $queries, $queryHashes) {
        foreach ($queryHashes as $key => $value) {
            if (!file_exists($value) || (time() - filemtime($value) > 6 * 3600)) {
                if (isset($response[$key]['data']) && !empty($response[$key]['data'])) {
                    file_put_contents($value, \Zend\Json\JSON::encode($response[$key]));
                } else {
                    // echo "Response has no content";
                }
            } else {
                //echo "File exists and is younger than 1 hour";
            }
        }
    }

    private function readFromCache($response, $cachedResults) {
        foreach ($cachedResults as $key => $value) {
            $result = file_get_contents($value);
            $resultArray = \Zend\Json\JSON::decode($result, true);
            $tempKey = $key;
            $tempData = $response[$tempKey];
            while (isset($response[$tempKey])) {
                $tempKey++;
            }
            $response[$tempKey] = $tempData;
            $response[$key] = $resultArray;
        }

        //$newResponse = \Zend\Json\JSON::encode($responseArray);

        return $response;
    }

}
