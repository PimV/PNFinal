<?php

define('ENDPOINT', 'https://platform.flxone.com/api');
define('APPLICATION_PATH', getcwd());

class ApiHelperStatic {

    private static $_cookie;
    private static $_authorized = false;
    private static $_user;

    public function __construct() {
        self::$_cookie = tempnam(APPLICATION_PATH . DIRECTORY_SEPARATOR . 'cookies', 'CURLCOOKIE');
    }

    public static function post($api_function, $query_params = null, $body_params = array(), $json = false) {
        $curl = self::initialize_curl($api_function, $query_params);

        curl_setopt($curl, CURLOPT_POST, 1);

        if ($json === true) {
            curl_setopt($curl, CURLOPT_HTTPHEADER, array(
                'Content-Type: application/json'
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

    public static function get($api_function, $query_params = null) {
        $curl = self::initialize_curl($api_function, $query_params);
        curl_setopt($curl, CURLOPT_CUSTOMREQUEST, "GET");
        $enc_result = curl_exec($curl);

        if ($enc_result === FALSE) {
            echo 'Error: ' . curl_error($curl) . ' (code: ' . curl_errno($curl) . ')';
        }
        curl_close($curl);
        return $enc_result;
    }

    public static function put($api_function, $parameters = null) {
        $curl = self::initialize_curl($api_function);

        curl_setopt($curl, CURLOPT_PUT, 1);
        curl_close($curl);
    }

    public static function del($api_function, $parameters = null) {
        $curl = self::initialize_curl($api_function);

        curl_setopt($curl, CURLOPT_CUSTOMREQUEST, "DELETE");
        curl_close($curl);
    }

    public static function decode_result($encoded_result) {
        return json_decode($encoded_result, true);
    }

    public static function response_isValid($response) {
        $success = false;
        $error = '-';

        if ($response['response']['status'] === 'OK') {
            $success = true;
        } else {
            $error = $response['response']['error'];
        }

        return array('success' => $success, 'error' => $error);
    }

    public static function generate_cookie_path() {
        self::$_cookie = APPLICATION_PATH . DIRECTORY_SEPARATOR . 'mycookie';
    }

    private static function initialize_curl($api_function = null, $query_params = null) {
        $curl = curl_init();

        if ($api_function !== '/auth') {
            self::login();
        }


        if (!isset(self::$_cookie) && self::$_cookie === null) {
            self::generate_cookie_path();
        }


        if ($api_function === '/auth') {
            curl_setopt($curl, CURLOPT_COOKIEJAR, self::$_cookie);
        } else {
            curl_setopt($curl, CURLOPT_COOKIEFILE, self::$_cookie);
        }
        $url = self::append_url($api_function, $query_params);

        curl_setopt($curl, CURLOPT_URL, $url);
        curl_setopt($curl, CURLOPT_SSL_VERIFYPEER, 0);
        curl_setopt($curl, CURLOPT_SSL_VERIFYHOST, 0);
        curl_setopt($curl, CURLOPT_RETURNTRANSFER, 1);
        curl_setopt($curl, CURLOPT_HTTP_VERSION, CURL_HTTP_VERSION_1_0);
        curl_setopt($curl, CURLOPT_USERAGENT, 'Mozilla/5.0 (Windows NT 6.1; WOW64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/33.0.1750.154 Safari/537.36');
        return $curl;
    }

    public static function login() {
        if (self::$_authorized !== true) {
            $username = 'pim@sourcerepublic.com';
            $password = 'c04E419379006f2203f1Ba51829cA87e';

            $encoded_result = self::post('/auth', null, array(
                        'username' => $username,
                        'password' => $password
            ));
            $decoded_result = self::decode_result($encoded_result);
            $valid_result = self::response_isValid($decoded_result);
            if ($valid_result['success'] === true) {
                self::$_authorized = true;
                self::setUser($decoded_result);
            }
        } else {
            
        }
    }

    private static function append_url($appendix, $query_params) {
        $url = ENDPOINT . $appendix;
        if ($query_params !== null) {
            $url .= '?' . http_build_query($query_params);
        }
        return $url;
    }

    public static function isAuthorized() {
        return self::$_authorized;
    }

    public static function setUser() {
        self::$_user = json_decode(self::get('/user/current'), true);
    }

    public static function getUser() {
        return self::$_user;
    }

}
