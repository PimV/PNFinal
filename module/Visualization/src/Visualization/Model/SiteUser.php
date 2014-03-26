<?php

namespace Visualization\Model;

class SiteUser {

    public $id;
    public $user_id;
    public $site_id;

    public function exchangeArray($data) {
        $this->id = (isset($data['id'])) ? $data['id'] : null;
        $this->user_id = (isset($data['user_id'])) ? $data['user_id'] : null;
        $this->site_id = (isset($data['site_id'])) ? $data['site_id'] : null;
    }

    public function getSite() {
        return SiteTable::getInstance()->getSite($this->site_id);
    }

}
