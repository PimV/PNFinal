<?php

namespace Visualization\Controller;

use Zend\Mvc\Controller\AbstractActionController;
use Zend\View\Model\ViewModel;
use Visualization\Model\Report;

class AdvertiserController extends AbstractActionController {

    protected $siteTable;

    public function indexAction() {
        //Initialize Sidebar
        $sm = $this->getServiceLocator();
        $sidebar = $sm->get('sidebar_navigation');
        $sidebar->addPages($this->generateNavPages('index'));
        //End Initialization
        return array();
    }

    public function revenueHomeAction() {
        return new ViewModel(array('sites' => $this->getSiteTable()->fetchAll()));
    }

    public function revenueAction() {
        //Initialize Sidebar
        $sm = $this->getServiceLocator();
        $sidebar = $sm->get('sidebar_navigation');
        $sidebar->addPages($this->generateNavPages('index'));
        //End Initialization

        $id = $this->params()->fromRoute('id', 0);
        if (!$id) {
            return $this->redirect()->toUrl('/visualization/advertiser/revenue-home');
        }

        $report = new Report($sm->get('db'), $id);




        return array('report' => $report);
    }

    public function generalAction() {
        //Initialize Sidebar
        $sm = $this->getServiceLocator();
        $sidebar = $sm->get('sidebar_navigation');
        $sidebar->addPages($this->generateNavPages('index'));
        //End Initialization

        return array();
    }

    public function getSiteTable() {
        if (!$this->siteTable) {
            $sm = $this->getServiceLocator();
            $this->siteTable = $sm->get('Visualization\Model\SiteTable');
        }
        return $this->siteTable;
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
