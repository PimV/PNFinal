<?php

namespace Application\Wrapper;

use Application\Curl\Response;

class User {

    private $id = -1;
    private $username = "";
    private $first_name = "";
    private $last_name = "";
    private $email = "";
    private $status = -1;

    public function __construct(Response $response) {
        $responseArray = \Zend\Json\Json::decode($response, true);
        $this->setId((int) $responseArray['response']['user']['id']);
        $this->setFirstName($responseArray['response']['user']['first_name']);
        $this->setLastName($responseArray['response']['user']['last_name']);
        $this->setEmail($responseArray['response']['user']['email']);
        $this->setStatus($responseArray['response']['user']['status']);
        //$this->setId($responseArray['response']['user']['id']);
//        $this->setId((int) $responseArray['audit']['user_id']);
        //$this->setUsername($responseArray['audit']['user']);
    }

    public function setId($id) {
        $this->id = $id;
    }

    public function setFirstName($first_name) {
        $this->first_name = $first_name;
    }

    public function setLastName($last_name) {
        $this->last_name = $last_name;
    }

    public function setEmail($email) {
        $this->email = $email;
    }

    public function setStatus($status) {
        $this->status = $status;
    }

//    public function setUsername($username) {
//        $this->username = $username;
//    }

    public function getId() {
        return $this->id;
    }

    public function getFirstName() {
        return $this->first_name;
    }

    public function getLastName() {
        return $this->last_name;
    }

    public function getEmail() {
        return $this->email;
    }

    public function getStatus() {
        return $this->status;
    }

//    public function getUsername() {
//        if (!empty($this->username)) {
//            return $this->username;
//        }
//        return null;
//    }
}
