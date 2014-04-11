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

    public function setUserInfo() {
        $this->authorizedUser = \Zend\Json\Json::decode($this->cURL->get('/user/current'));
    }

    public function test() {
        $params = array('q' => 'London,uk');
        $response = $this->cURL->newRequest('get', 'http://api.openweathermap.org/data/2.5/weather?q=Gemert,nl', '/2.5/weather', $params)->send();
        return $response;
    }

    public function vizData($dimension, $measure) {
        if ($this->authorizedUser === null) {
            $this->login();
        }
        $dataParams = array(array(
                "dimensions" => array($dimension),
                "measures" => array($measure),
                "filters" => array(array(
                        "dimension" => "date",
                        "date_start" => "2014-04-01",
                        "date_end" => "2014-04-01",
                        "date_dynamic" => null
                    )),
                "order" => array(array(
                        "key" => $measure,
                        "order" => "desc"
                    ))
        ));


        $x = \Zend\Json\Json::encode($dataParams);
        $x_signature = md5(\Zend\Json\Json::encode($dataParams) . '~' . $this->authorizedUser->getId());
        // var_dump($x);
        // var_dump($x_signature);
        // die;

        $params = array(
            'x' => $x,
            'x_signature' => $x_signature
        );

        $paramString = http_build_query($params);
        // $response = $this->cURL->post(ENDPOINT, '/viz/data', $params);
        $request = $this->cURL->newRequest('post', ENDPOINT . '/viz/data', '/viz/data', $params)
                ->setHeader('Content-type', 'application/json; charset=utf-8')
                //->setHeader('Content-length', strlen($paramString))
                //->setHeader('User-Agent', 'Mozilla/5.0 (Windows NT 6.1; WOW64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/33.0.1750.154 Safari/537.36')
                //->setHeader('Accept', '*/*')
                //->setHeader('Accept-Encoding', 'gzip,deflate,sdch')
                ->setHeader('Accept-Language', 'en-US,en;q=0.8,nl;q=0.6');

        $response = $this->cURL->sendRequest($request);
        $response = $this->addParamsToResponse($response, $dataParams);
        return $response;
    }

    private function addParamsToResponse($response, $params) {
        $decoded_result = json_decode($response, true);
        $decoded_result['params'] = $params;
        return json_encode($decoded_result);
    }

}
