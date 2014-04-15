<?php

namespace Application\Wrapper;

define('ENDPOINT', 'https://platform.flxone.com/api');
define('APPLICATION_PATH', getcwd());

use Application\Curl\cURL;

class ApiHelper {

    private $cURL;
    private $authorizedUser = null;

    public function __construct() {
        $this->cURL = new cURL();
    }

    public function getCurl() {
        if ($this->authorizedUser === null) {
            $this->login();
        }

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
            $this->authorizedUser = new User($this->cURL->get(ENDPOINT, '/user/current'));
        } else {
            $this->authorizedUser = null;
        }
        return $response;
    }

    public function test($dimension, $measure) {
        if ($this->authorizedUser === null) {
            $this->login();
        }
        $dataParams = array(
            array(
                "dimensions" => array("flx_pixels_sum"),
                "measures" => array("flx_uuid"),
                "filters" => array(
                    array(
                        "dimension" => "date",
                        "date_start" => "2014-04-01",
                        "date_end" => "2014-04-01",
                        "date_dynamic" => null
                    )
                ),
                "order" => array(array(
                        "key" => "flx_uuid",
                        "order" => "desc"
                    ))
            ),
        );


        $x = \Zend\Json\Json::encode($dataParams);
        $x_signature = md5(\Zend\Json\Json::encode($dataParams) . '~' . $this->authorizedUser->getId());

        $params = array(
            'x' => $x,
            'x_signature' => $x_signature
        );

        $paramString = http_build_query($params);
        $retries = 0;
        while (empty($response) && $retries <= 3) {
            $request = $this->cURL->newRequest('post', ENDPOINT . '/viz/data', '/viz/data', $params)
                    ->setHeader('Content-type', 'application/json; charset=utf-8')
                    ->setHeader('Accept-Language', 'en-US,en;q=0.8,nl;q=0.6');

            $response = $this->cURL->sendRequest($request);

            $retries++;
        }

        $response = $this->addParamsToResponse($response, $dataParams);
        return $response;
    }

    public function getViewsOverTime($date_start, $date_end) {
        return $this->vizData("date", "flx_pixels_sum", true, "asc", $date_start, $date_end);
    }

    public function trackingBeacon($beacon_array = false, $id = array()) {
        if ($this->authorizedUser === null) {
            $this->login();
        }

        $functionCall = '/tracking/beacon';

        if (isset($id) && $id !== null) {
            $functionCall .= '?id=' . $id;
        }


        while (empty($response) && $retries <= 3) {
            $response = $this->cURL->get(ENDPOINT . $functionCall, $functionCall);

            $retries++;
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

    public function vizData($dimension, $measure, $orderByDimension = false, $orderType = "asc", $date_start = "2013-04-01", $date_end = "2014-04-05", $limit = "10000") {
        if ($this->authorizedUser === null) {
            $this->login();
        }
        $orderBy = $measure;
        if ($orderByDimension === true) {
            $orderBy = $dimension;
        }


        $dataParams = array(
            array(
                "dimensions" => array($dimension),
                "measures" => array($measure),
                "filters" => array(array(
                        "dimension" => "date",
                        "date_start" => $date_start,
                        "date_end" => $date_end,
                        "date_dynamic" => null
                    ),
//                    array(
//                        "dimension" => array("flx_pixel_id"),
//                        "include" => "276"
//                    )
                ),
                "order" => array(array(
                        "key" => $orderBy,
                        "order" => $orderType
                    ))
            //"limit" => $limit
            ),
        );


        $x = \Zend\Json\Json::encode($dataParams);
        $x_signature = md5(\Zend\Json\Json::encode($dataParams) . '~' . $this->authorizedUser->getId());
        // var_dump($x);
        // var_dump($x_signature);
        // die;

        $params = array(
            'x' => $x,
            'x_signature' => $x_signature
        );


        $retries = 0;
        while (empty($response) && $retries <= 3) {
            $request = $this->cURL->newRequest('post', ENDPOINT . '/viz/data', '/viz/data', $params);
            //->setHeader('Content-type', 'application/json');
            //->setHeader('Accept-Language', 'en-US,en;q=0.8,nl;q=0.6');

            $response = $this->cURL->sendRequest($request);

            $retries++;
        }

        //$response = $this->addParamsToResponse($response, $dataParams);
        return $response;
    }

    private function addParamsToResponse($response, $params) {
        $decoded_result = json_decode($response, true);
        $decoded_result['params'] = $params;
        return json_encode($decoded_result);
    }

}
