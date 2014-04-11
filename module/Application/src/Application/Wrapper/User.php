<?php

namespace Application\Wrapper;

use Application\Curl\Response;

class User {

    private $id = -1;
    private $username = "";

    public function __construct(Response $response) {
        $responseArray = \Zend\Json\Json::decode($response, true);
        $this->setId((int) $responseArray['audit']['user_id']);
        $this->setUsername($responseArray['audit']['user']);
    }

    public function setId($id) {
        $this->id = $id;
    }

    public function getId() {
        return $this->id;
    }

    public function setUsername($username) {

        $this->username = $username;
    }

    public function getUsername() {
        if (!empty($this->username)) {
            return $this->username;
        }
        return null;
    }

}
