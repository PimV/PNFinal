<?php

/**
 * Zend Framework (http://framework.zend.com/)
 *
 * @link      http://github.com/zendframework/ZendSkeletonApplication for the canonical source repository
 * @copyright Copyright (c) 2005-2014 Zend Technologies USA Inc. (http://www.zend.com)
 * @license   http://framework.zend.com/license/new-bsd New BSD License
 */

namespace Application\Controller;

use Zend\Mvc\Controller\AbstractActionController;
use Zend\View\Model\JsonModel;
use Application\Wrapper\ApiHelper;

class ApiController extends AbstractActionController {

    public function indexAction() {
        echo "Not implemented";
        die;
    }

    public function pixelAction() {
        echo "Not implemented";
        die;
    }

    public function realTimeAction() {
        echo "Not implemented";
        die;
    }

    public function trackingBeaconAction() {
        echo "Not implemented";
        die;
    }

    public function testAction() {

        return array();
    }

    public function testDataAction() {
        $helper = new ApiHelper();
        $siteIds = $_POST['siteIds'];
        $method = $_POST['method'];
        $methodParameters = $_POST['methodParameters'];
        $methods = $_POST['methods'];

        $helper->fireRequest($helper->test($siteIds, $methods));
        $helper->echoResponse();
        die;
    }

    public function callDataAction() {
        $helper = new ApiHelper();
        $siteIds = $_POST['siteIds'];
        $methods = $_POST['methods'];

        $helper->fireRequest($helper->test($siteIds, $methods));
        $helper->echoResponse();
        die;
    }

    public function viewsOverTimeAction() {
        echo "Not implemented";
        die;
    }

    public function vizDataAction() {
        echo "Not implemented";
        die;
    }

    public function vizDataMultipleAction() {
        echo "Not implemented";
        die;
    }

}
