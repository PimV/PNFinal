<?php

namespace Application\Curl;

class cURL {

    protected $ch;
    protected $methods = array(
        'get' => FALSE,
        'post' => TRUE,
        'put' => TRUE,
        'patch' => TRUE,
        'delete' => FALSE,
        'options' => FALSE,
    );
    protected $cookie;
    protected $requestClass = 'Application\Curl\Request';
    protected $responseClass = 'Application\Curl\Response';

    public function getAllowedMethods() {
        return $this->methods;
    }

    public function setRequestClass($class) {
        $this->requestClass = $class;
    }

    public function setResponseClass($class) {
        $this->responseClass = $class;
    }

    public function generate_cookie_path() {
        $this->cookie = APPLICATION_PATH . DIRECTORY_SEPARATOR . 'public' . DIRECTORY_SEPARATOR . 'resources' . DIRECTORY_SEPARATOR . 'cookie';
    }

    public function writeCookie() {
        curl_setopt($this->ch, CURLOPT_COOKIEJAR, $this->cookie);
    }

    public function readCookie() {
        curl_setopt($this->ch, CURLOPT_COOKIEFILE, $this->cookie);
    }

    public function buildUrl($url, array $query) {
        if (!empty($query)) {
            $queryString = http_build_query($query);
            $url .= '?' . $queryString;
        }

        return $url;
    }

    public function newRequest($method, $url, $functionCall, $data = array(), $encoding = Request::ENCODING_QUERY) {
       
        $class = $this->requestClass;
        $request = new $class($this);

        $request->setMethod($method);
        $request->setUrl($url);
        $request->setFunctionCall($functionCall);
        $request->setData($data);
        $request->setEncoding($encoding);

        return $request;
    }

    public function newJsonRequest($method, $url, array $data = array()) {
        return $this->newRequest($method, $url, $data, Request::ENCODING_JSON);
    }

    public function newRawRequest($method, $url, array $data = array()) {
        return $this->newRequest($method, $url, $data, Request::ENCODING_RAW);
    }

    public function prepareRequest(Request $request) {
        set_time_limit(0);
        $this->ch = curl_init();


        if (!isset($this->cookie) && $this->cookie === null) {
            $this->generate_cookie_path();
        }

        if ($request->getFunctionCall() === '/auth') {
            $this->writeCookie();
        } else {
            $this->readCookie();
        }

        curl_setopt($this->ch, CURLOPT_RETURNTRANSFER, 1);
        curl_setopt($this->ch, CURLOPT_HEADER, 1);
        curl_setopt($this->ch, CURLOPT_URL, $request->getUrl());
        curl_setopt($this->ch, CURLOPT_SSL_VERIFYPEER, 0); //Custom
        curl_setopt($this->ch, CURLOPT_HTTP_VERSION, CURL_HTTP_VERSION_1_0); //Custom
        curl_setopt($this->ch, CURLOPT_VERBOSE, true);
        curl_setopt($this->ch, CURLOPT_CONNECTTIMEOUT, 0);
        curl_setopt($this->ch, CURLOPT_TIMEOUT, 90);

        $options = $request->getOptions();
        if (!empty($options)) {
            curl_setopt_array($this->ch, $options);
        }

        $method = $request->getMethod();
        if ($method === 'post') {
            curl_setopt($this->ch, CURLOPT_POST, 1);
        } elseif ($method !== 'get') {
            curl_setopt($this->ch, CURLOPT_CUSTOMREQUEST, strtoupper($method));
        }

        curl_setopt($this->ch, CURLOPT_HTTPHEADER, $request->formatHeaders());

        if ($this->methods[$method] === TRUE) {
            curl_setopt($this->ch, CURLOPT_POSTFIELDS, $request->encodeData());
        }
    }

    public function sendRequest(Request $request) {
        $this->prepareRequest($request);
        $result = curl_exec($this->ch);

        if ($result === FALSE) {
            throw new \RuntimeException("cURL Request failed with error: " . curl_error($this->ch));
        }

        $response = $this->createResponseObject($result);



        curl_close($this->ch);

        return $response;
    }

    protected function createResponseObject($response) {
        $info = curl_getinfo($this->ch);

        $headerSize = curl_getinfo($this->ch, CURLINFO_HEADER_SIZE);
        $headerText = substr($response, 0, $headerSize);
        $headers = $this->headerToArray($headerText);

        $body = substr($response, $headerSize);

        $class = $this->responseClass;
        $obj = new $class($body, $headers, $info);

        return $obj;
    }

    protected function headerToArray($header) {
        $tmp = explode("\r\n", $header);
        $headers = array();
        foreach ($tmp as $singleHeader) {
            $delimiter = strpos($singleHeader, ': ');
            if ($delimiter !== false) {
                $key = substr($singleHeader, 0, $delimiter);
                $val = substr($singleHeader, $delimiter + 2);
                $headers[$key] = $val;
            } else {
                $delimiter = strpos($singleHeader, ' ');
                if ($delimiter !== false) {
                    $key = substr($singleHeader, 0, $delimiter);
                    $val = substr($singleHeader, $delimiter + 1);
                    $headers[$key] = $val;
                }
            }
        }

        return $headers;
    }

    /**
     * Handle dynamic calls to the class
     * 
     * @param string $method
     * @param array $args
     * @return mixed
     * @throws \InvalidArgumentException
     */
    public function __call($method, $args) {
        $method = strtolower($method);

        $encoding = Request::ENCODING_QUERY;

        if (substr($method, 0, 4) === 'json') {
            $encoding = Request::ENCODING_JSON;
            $method = substr($method, 4);
        } elseif (substr($method, 0, 3) === 'raw') {
            $encoding = Request::ENCODING_RAW;
            $method = substr($method, 3);
        }

        if (!array_key_exists($method, $this->methods)) {
            throw new \InvalidArgumentException("Method [$method] not a valid HTTP method.");
        }

        $url = $args[0];

        $functionCall = '/';
        if (isset($args[1])) {
            $functionCall = $args[1];
            $url .= $functionCall;
        }

        $allowData = $this->methods[$method];

        if ($allowData && isset($args[2])) {
            $data = $args[2];
        } else {
            $data = array();
        }

        $request = $this->newRequest($method, $url, $functionCall, $data, $encoding);

        return $this->sendRequest($request);
    }

}
