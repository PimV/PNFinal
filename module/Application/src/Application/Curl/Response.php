<?php

namespace Application\Curl;

class Response {

    public $headers = array();
    public $body;
    public $info;
    public $code;
    public $statusText;

    public function __construct($body, $headers, $info = array()) {
        $this->body = $body;
        $this->headers = $headers;
        $this->info = $info;
        if (isset($this->headers['HTTP/1.1'])) {
            $this->setCode($this->headers['HTTP/1.1']);
        } elseif (isset($this->headers['HTTP/1.0'])) {

            $this->setCode($this->headers['HTTP/1.0']);
        }
    }

    public function setCode($code) {
        $this->code = $code;
        $this->statusText = $code;
        list($this->statusCode, ) = explode(' ', $code);
    }

    public function getHeader($key) {
        return array_key_exists($key, $this->headers) ? $this->headers[$key] : null;
    }

    public function getHeaders() {
        return $this->headers;
    }

    public function toArray() {
        return array(
            'headers' => $this->headers,
            'body' => $this->body,
            'info' => $this->info
        );
    }

    public function toJson() {
        return json_encode($this->toArray());
    }

    /**
     * Covnert the object to its string representation by returning the body
     * @return string
     */
    public function __toString() {
        return (string) $this->body;
    }

}
