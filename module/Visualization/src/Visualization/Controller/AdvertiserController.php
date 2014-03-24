<?php

namespace Visualization\Controller;

use Zend\Mvc\Controller\AbstractActionController;
use Zend\Mvc\View\ViewModel;

class AdvertiserController extends AbstractActionController {

    public function indexAction() {
        $sm = $this->getServiceLocator();
        $sidebar = $sm->get('sidebar_navigation');
        $sidebar->addPages($this->generateNavPages('index'));
        return array();
    }

    public function revenueAction() {
        $sm = $this->getServiceLocator();
        $sidebar = $sm->get('sidebar_navigation');
        $sidebar->addPages($this->generateNavPages('index'));
        return array();
    }

    private function generateNavPages($action) {
        $pages = array();
        switch ($action) {
            case 'index':
                $pages = array(
                    array(
                        'label' => 'LMGTFY',
                        'uri' => 'http://www.lmgtfy.com/',
                    ),
                    array(
                        'label' => 'Revenue',
                        'uri' => 'advertiser/revenue',
                    ),
                    array(
                        'label' => 'Content Value',
                        'uri' => 'http://www.lmgtfy.com/?q=content+value',
                    ),
                );
                break;
        }
        return $pages;
    }

}
