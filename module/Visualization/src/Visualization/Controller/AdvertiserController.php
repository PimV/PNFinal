<?php

namespace Visualization\Controller;

use Zend\Mvc\Controller\AbstractActionController;
use Zend\Mvc\View\ViewModel;

class AdvertiserController extends AbstractActionController {

    public function indexAction() {
        //Initialize Sidebar
        $sm = $this->getServiceLocator();
        $sidebar = $sm->get('sidebar_navigation');
        $sidebar->addPages($this->generateNavPages('index'));
        //End Initialization
        return array();
    }

    public function revenueAction() {
        //Initialize Sidebar
        $sm = $this->getServiceLocator();
        $sidebar = $sm->get('sidebar_navigation');
        $sidebar->addPages($this->generateNavPages('index'));
        //End Initialization

        $id = $this->params()->fromRoute('id', 0);
        if (!$id) {
            return $this->redirect()->toRoute('visualization/advertiser');
        }



        return array();
    }

    public function generalAction() {
        //Initialize Sidebar
        $sm = $this->getServiceLocator();
        $sidebar = $sm->get('sidebar_navigation');
        $sidebar->addPages($this->generateNavPages('index'));
        //End Initialization

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
                        'uri' => '/visualization/advertiser/revenue',
                    ),
                    array(
                        'label' => 'General Information',
                        'uri' => '/visualization/advertiser/general',
                    ),
                );
                break;
        }
        return $pages;
    }

}
