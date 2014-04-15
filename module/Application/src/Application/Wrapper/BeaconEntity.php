<?php

namespace Application\Wrapper;

class BeaconEntity {

    
    
    private $id;
    private $customerId;
    private $trackingGroup;
    private $type;
    private $name;
    private $settings;
    private $scriptHash;
    private $deleted;
    private $created;
    private $modified;

    public function __construct() {
        
    }

    //Setters
    public function setId($id) {
        $this->id = $id;
    }

    public function setCustomerId($customerId) {
        $this->customerId = $customerId;
    }

    public function setTrackingGroup($trackingGroup) {
        $this->trackingGroup = $trackingGroup;
    }

    public function setType($type) {
        $this->type = $type;
    }

    public function setName($name) {
        $this->name = $name;
    }

    public function setSettings($settings) {
        $this->settings = $settings;
    }

    public function setScriptHash($scriptHash) {
        $this->scriptHash = $scriptHash;
    }

    public function setDeleted($deleted) {
        $this->deleted = $deleted;
    }

    public function setCreated($created) {
        $this->created = $created;
    }

    public function setModified($modified) {
        $this->modified = $modified;
    }

    //Getters
    public function getId() {
        return $this->id;
    }

    public function getCustomerId() {
        return $this->customerId;
    }

    public function getTrackingGroup() {
        return $this->trackingGroup;
    }

    public function getType() {
        return $this->type;
    }

    public function getName() {
        return $this->name;
    }

    public function getSettings() {
        return $this->settings;
    }

    public function getScriptHash() {
        return $this->scriptHash;
    }

    public function getDeleted() {
        return $this->deleted;
    }

    public function getCreated() {
        return $this->created;
    }

    public function getModified() {
        return $this->modified;
    }

}
