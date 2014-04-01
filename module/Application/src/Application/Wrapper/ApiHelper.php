<?php

namespace Application\Wrapper;

define('ENDPOINT', 'https://platform.flxone.com/api');
define('APPLICATION_PATH', getcwd());

class ApiHelper {

    private static $_cookie;

    public function __construct() {
        self::$_cookie = tempnam(APPLICATION_PATH . DIRECTORY_SEPARATOR . '..' . DIRECTORY_SEPARATOR . '..' . DIRECTORY_SEPARATOR . 'resource' . DIRECTORY_SEPARATOR . 'cookies', 'CURLCOOKIE');
    }

    public static function post($api_function, $token = null, $parameters = null) {
        $curl = self::initialize_curl($api_function);

        curl_setopt($curl, CURLOPT_POST, 1);
        curl_setopt($curl, CURLOPT_POSTFIELDS, http_build_query($parameters));

        $enc_result = curl_exec($curl);

        if ($enc_result === FALSE) {
            echo 'Error: ' . curl_error($curl) . ' (code: ' . curl_errno($curl) . ')';
        }


        curl_close($curl);

        return $enc_result;
    }

    public static function get($api_function, $parameters = null) {
        $curl = self::initialize_curl($api_function);

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
        //self::$_cookie = APPLICATION_PATH . DIRECTORY_SEPARATOR . 'mycookie';
        self::$_cookie = APPLICATION_PATH . DIRECTORY_SEPARATOR . '..' . DIRECTORY_SEPARATOR . '..' . DIRECTORY_SEPARATOR . 'resource' . DIRECTORY_SEPARATOR . 'cookies' . DIRECTORY_SEPARATOR . 'cookie.tmp';
        //APPLICATION_PATH . DIRECTORY_SEPARATOR . '..' . DIRECTORY_SEPARATOR . '..' . DIRECTORY_SEPARATOR . 'resource' . DIRECTORY_SEPARATOR . 'cookies'
    }

    private static function initialize_curl($api_function = null) {
        $curl = curl_init();


        if (!isset(self::$_cookie) && self::$_cookie === null) {
            self::generate_cookie_path();
        }

        if ($api_function === '/auth') {
            curl_setopt($curl, CURLOPT_COOKIEJAR, self::$_cookie);
        } else {
            curl_setopt($curl, CURLOPT_COOKIEFILE, self::$_cookie);
        }
        $url = self::append_url($api_function);

        curl_setopt($curl, CURLOPT_URL, $url);
        curl_setopt($curl, CURLOPT_SSL_VERIFYPEER, 0);
        curl_setopt($curl, CURLOPT_SSL_VERIFYHOST, 0);
        curl_setopt($curl, CURLOPT_RETURNTRANSFER, 1);

        curl_setopt($curl, CURLOPT_USERAGENT, 'Mozilla/5.0 (Windows NT 6.1; WOW64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/33.0.1750.154 Safari/537.36');

        return $curl;
    }

    private static function append_url($appendix) {
        return ENDPOINT . $appendix . '/';
    }

}
