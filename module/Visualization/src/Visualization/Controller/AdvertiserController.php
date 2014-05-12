<?php

namespace Visualization\Controller;

use Zend\Mvc\Controller\AbstractActionController;
use Zend\View\Model\ViewModel;
use Application\Wrapper\ApiHelper;
use Application\Curl\cURL;
use Visualization\Model\Report;

class AdvertiserController extends AbstractActionController {

    protected $siteTable;
    protected $site_user_table;
    private $helper;

    public function indexAction() {
//Initialize Sidebar
        $sm = $this->getServiceLocator();
        $this->initializeSidebar($sm);
//End Initialization


        return array();
    }

    public function revenueHomeAction() {
//Initialize Sidebar
        $sm = $this->getServiceLocator();
        $this->initializeSidebar($sm);
//End Initialization

        $auth = $sm->get('zfcuser_auth_service');
        $user_id = $auth->getIdentity()->getId();

        $view = new ViewModel();
        $sites = $this->getSiteUserTable()->get_sites_by_user($user_id);
        if (count($sites) > 0) {
            $site_ids = array();
            foreach ($this->getSiteUserTable()->get_sites_by_user($user_id) as $site) {
                $site_ids[] = $site->site_id;
            }
            $view->setVariables(array('sites' => $this->getSiteTable()->getSites($site_ids)));
        } else {

            $view->setTemplate('visualization/advertiser/no-site-found');
        }
        return $view;
    }

    public function revenueAction() {
        //Init sidebar
        $sm = $this->getServiceLocator();
        $this->initializeSidebar($sm);

        //Check valid ID
        $id = $this->params()->fromRoute('id', 0);
        if (!$id) {
            return $this->redirect()->toUrl('/visualization/advertiser/revenue-home');
        }

        //Retrieve Dynamic Reports
        $report = new Report($sm->get('db'), $id);
        if ($report->isReportValid() === false) {
            return $this->redirect()->toUrl('/visualization/advertiser/revenue-home');
        }

        //Init APIHelper
        $helper = new \Application\Wrapper\ApiHelper();

        //Retrieve Sites        
        $sites = $helper->getSites();

        return array('report' => $report, 'pixels' => "0", 'sites' => $sites, 'unique_users' => 0);
    }

    public function generalAction() {
//Initialize Sidebar
        $sm = $this->getServiceLocator();
        $this->initializeSidebar($sm);
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

    public function getSiteUserTable() {
        if (!$this->site_user_table) {
            $sm = $this->getServiceLocator();
            $this->site_user_table = $sm->get('Visualization\Model\SiteUserTable');
        }
        return $this->site_user_table;
    }

    private function initializeSidebar($sm) {
//Initialize Sidebar

        $sidebar = $sm->get('sidebar_navigation');
        $sidebar->addPages($this->generateNavPages('index'));
//End Initialization
    }

    private function generateNavPages($action) {
        $pages = array();
        switch ($action) {
            case 'index':
                $pages = array(
                    array(
                        'label' => 'Pixels',
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
