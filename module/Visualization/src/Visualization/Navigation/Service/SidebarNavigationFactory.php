<?php

/*
 * To change this license header, choose License Headers in Project Properties.
 * To change this template file, choose Tools | Templates
 * and open the template in the editor.
 */

namespace Visualization\Navigation\Service;

use Zend\Navigation\Service\ConstructedNavigationFactory;

/**
 * Description of SidebarNavigationFactory
 *
 * @author Pim
 */
class SidebarNavigationFactory extends ConstructedNavigationFactory {

    public function __construct($config = array()) {
        $this->config = $config;
    }

    public function setConfig($config) {
        $this->config = $config;
    }

}
