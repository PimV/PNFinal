<?php

namespace Visualization\Model;

class Site {

    public $id;
    public $title;
    public $url;
    public $description;
    public $short_link;

    public function exchangeArray($data) {
        $this->id = (isset($data['id'])) ? $data['id'] : null;
        $this->title = (isset($data['title'])) ? $data['title'] : null;
        $this->url = (isset($data['url'])) ? $data['url'] : null;
        $this->description = (isset($data['description'])) ? $data['description'] : null;
        $this->short_link = (isset($data['short_link'])) ? $data['short_link'] : null;
    }

}
