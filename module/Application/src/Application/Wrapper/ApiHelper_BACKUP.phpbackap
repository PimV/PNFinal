<?php

namespace Application\Wrapper;

define('ENDPOINT', 'https://platform.flxone.com/api');
define('APPLICATION_PATH', getcwd());

class ApiHelper {

    private $_cookie;
    private $_authorized = false;
    private $_user;

    public function __construct() {
        set_time_limit(900);
        $this->_cookie = tempnam(APPLICATION_PATH . DIRECTORY_SEPARATOR . 'cookies', 'CURLCOOKIE');
    }

    public function post($api_function, $query_params = null, $body_params = array(), $json = false) {
        $curl = $this->initialize_curl($api_function, $query_params);

        curl_setopt($curl, CURLOPT_POST, 1);

        if ($json === true) {
            curl_setopt($curl, CURLOPT_HTTPHEADER, array(
                'Content-Type: application/json'
            ));
        } else {
            curl_setopt($curl, CURLOPT_HTTPHEADER, array(
                'Content-Type: application/x-www-form-urlencoded'
            ));
        }

        $body_params = http_build_query($body_params);
        curl_setopt($curl, CURLOPT_POSTFIELDS, $body_params);

        $enc_result = curl_exec($curl);

        if ($enc_result === FALSE) {
            echo 'Error: ' . curl_error($curl) . ' (code: ' . curl_errno($curl) . ')';
        }
        curl_close($curl);
        return $enc_result;
    }

    public function get($api_function, $query_params = null) {
        $curl = $this->initialize_curl($api_function, $query_params);
        curl_setopt($curl, CURLOPT_CUSTOMREQUEST, "GET");
        $enc_result = curl_exec($curl);

        if ($enc_result === FALSE) {
            echo 'Error: ' . curl_error($curl) . ' (code: ' . curl_errno($curl) . ')';
        }
        curl_close($curl);
        return $enc_result;
    }

    public function put($api_function, $parameters = null) {
        $curl = $this->initialize_curl($api_function);

        curl_setopt($curl, CURLOPT_PUT, 1);
        curl_close($curl);
    }

    public function del($api_function, $parameters = null) {
        $curl = $this->initialize_curl($api_function);

        curl_setopt($curl, CURLOPT_CUSTOMREQUEST, "DELETE");
        curl_close($curl);
    }

    public function decode_result($encoded_result) {
        return json_decode($encoded_result, true);
    }

    public function response_isValid($response) {
        $success = false;
        $error = '-';

        if ($response['response']['status'] === 'OK') {
            $success = true;
        } else {
            $error = $response['response']['error'];
        }

        return array('success' => $success, 'error' => $error);
    }

    public function generate_cookie_path() {
        $this->_cookie = APPLICATION_PATH . DIRECTORY_SEPARATOR . 'mycookie';
    }

    private function initialize_curl($api_function = null, $query_params = null) {
        $curl = curl_init();

//        if ($api_function !== '/auth') {
//            self::login();
//        }

        if ($api_function !== '/auth') {
            $this->login();
        }


        if (!isset($this->_cookie) && $this->_cookie === null) {
            $this->generate_cookie_path();
        }


        if ($api_function === '/auth') {
            curl_setopt($curl, CURLOPT_COOKIEJAR, $this->_cookie);
        } else {
            curl_setopt($curl, CURLOPT_COOKIEFILE, $this->_cookie);
        }
        $url = $this->append_url($api_function, $query_params);

        curl_setopt($curl, CURLOPT_URL, $url);
        curl_setopt($curl, CURLOPT_SSL_VERIFYPEER, 0);
        curl_setopt($curl, CURLOPT_SSL_VERIFYHOST, 0);
        curl_setopt($curl, CURLOPT_RETURNTRANSFER, 1);
        curl_setopt($curl, CURLOPT_HTTP_VERSION, CURL_HTTP_VERSION_1_0);
        curl_setopt($curl, CURLOPT_USERAGENT, 'Mozilla/5.0 (Windows NT 6.1; WOW64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/33.0.1750.154 Safari/537.36');
        return $curl;
    }

    public function login() {
        if ($this->_authorized !== true) {
            $username = 'pim@sourcerepublic.com';
            $password = 'c04E419379006f2203f1Ba51829cA87e';

            $encoded_result = $this->post('/auth', null, array(
                'username' => $username,
                'password' => $password
            ));
            $decoded_result = $this->decode_result($encoded_result);
            $valid_result = $this->response_isValid($decoded_result);
            if ($valid_result['success'] === true) {
                $this->_authorized = true;
                $this->setUser($decoded_result);
            }
        } else {
            
        }
    }

    private function append_url($appendix, $query_params) {
        $url = ENDPOINT . $appendix;
        if ($query_params !== null) {
            $url .= '?' . http_build_query($query_params);
        }
        return $url;
    }

    public function isAuthorized() {
        return $this->_authorized;
    }

    public function setUser() {
        $this->_user = json_decode($this->get('/user/current'), true);
    }

    public function getUser() {
        return $this->_user;
    }

}
