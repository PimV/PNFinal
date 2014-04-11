<?php

namespace Application\Curl;

class Request {

    const ENCODING_QUERY = 0;
    const ENCODING_JSON = 1;
    const ENCODING_RAW = 2;

    private $method = 'get';
    private $url = '';
    private $functionCall;
    private $headers = array();
    private $data = array();
    private $options = array();
    private $encoding = Request::ENCODING_QUERY;

    public function __construct(cURL $curl) {
        $this->curl = $curl;
    }

    public function setMethod($method) {
        $method = strtolower($method);

        if (!array_key_exists($method, $this->curl->getAllowedMethods())) {
            throw new \InvalidArgumentException("Method [$method] is not a valid HTTP method.");
        }

        $this->method = $method;

        return $this;
    }

    public function getMethod() {
        return $this->method;
    }

    public function setUrl($url) {
        $this->url = $url;
        return $this;
    }

    public function getUrl() {
        return $this->url;
    }

    public function setFunctionCall($functionCall) {
        $this->functionCall = $functionCall;
        return $this;
    }

    public function getFunctionCall() {
        return $this->functionCall;
    }

    public function setHeaders(array $headers) {
        $this->headers = $headers;
        return $this;
    }

    public function getHeaders() {
        return $this->headers;
    }

    public function formatHeaders() {
        $headers = array();

        foreach ($this->headers as $key => $val) {
            if (is_string($key)) {
                $headers[] = $key . ': ' . $val;
            } else {
                $headers[] = $val;
            }
        }
        return $headers;
    }

    public function setHeader($key, $value) {
        $this->headers[$key] = $value;
        return $this;
    }

    public function getHeader($key) {
        return isset($this->headers[$key]) ? $this->headers[$key] : null;
    }

    public function setData($data) {
        $this->data = $data;
        return $this;
    }

    public function getData() {
        return $this->data;
    }

    public function setOptions(array $options) {
        $this->options = $options;
        return $this;
    }

    public function getOptions() {
        return $this->options;
    }

    public function setOption($key, $value) {
        $this->options[$key] = $value;
        return this;
    }

    public function getOption($key) {
        return isset($this->options[$key]) ? $this->options[$key] : null;
    }

    public function encodeData() {
        switch ($this->encoding) {
            case Request::ENCODING_QUERY:
                return urlencode(http_build_query($this->data, 'flags_'));
            case Request::ENCODING_JSON:
                return json_encode($this->data);
            case Request::ENCODING_RAW:
                return (string) $this->data;
            default:
                throw new \UnexpectedValueException("Encoding [$encoding] is not a known Request::ENCODING_* constant.");
        }
    }

    public function isJson() {
        return $this->encoding === Request::ENCODING_JSON;
    }

    public function setEncoding($encoding) {
        $encoding = intval($encoding);
        if ($encoding !== Request::ENCODING_QUERY && $encoding !== Request::ENCODING_JSON && $encoding !== Request::ENCODING_RAW) {
            throw new \InvalidArgumentException("Encoding [$encoding] is not a known Request::ENCODING_* constant.");
        }

        if ($encoding === Request::ENCODING_JSON && !$this->getHeader('Content-Type')) {
            $this->setHeader('Content-Type', 'application/json; charset=UTF-8');
        }

        $this->encoding = $encoding;

        return $this;
    }

    public function getEncoding() {
        return $this->encoding;
    }

    public function setJson($toggle) {
        $this->setEncoding($toggle ? Request::ENCODING_JSON : Request::ENCODING__QUERY);
        return $this;
    }

    public function send() {
        return $this->curl->sendRequest($this);
    }

}
