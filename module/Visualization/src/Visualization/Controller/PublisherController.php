<?php

namespace Visualization\Controller;

use Zend\Mvc\Controller\AbstractActionController;

class PublisherController extends AbstractActionController {

    public function indexAction() {
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
                        'label' => 'Bounce-back Insights',
                        'uri' => 'http://www.lmgtfy.com/?q=bounceback+insights',
                    ),
                    array(
                        'label' => 'Revenue',
                        'uri' => 'http://www.lmgtfy.com/?q=revenue',
                    ),
                    array(
                        'label' => 'Site information',
                        'uri' => 'http://www.lmgtfy.com/?q=site+information',
                    ),
                );
                break;
        }
        return $pages;
    }

}
