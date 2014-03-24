<?php

/**
 * Zend Framework (http://framework.zend.com/)
 *
 * @link      http://github.com/zendframework/ZendSkeletonModule for the canonical source repository
 * @copyright Copyright (c) 2005-2014 Zend Technologies USA Inc. (http://www.zend.com)
 * @license   http://framework.zend.com/license/new-bsd New BSD License
 */

namespace PNUser\Controller;

use Zend\Mvc\Controller\AbstractActionController;
use Zend\Session\Container;
use Zend\View\Model\ViewModel;

class UserController extends AbstractActionController {

    public function indexAction() {
        return array();
    }

    public function fooAction() {
        // This shows the :controller and :action parameters in default route
        // are working when you browse to /module-specific-root/skeleton/foo
        return array();
    }

    public function roleAction() {
        $contentMsg = 'old text';
        if (isset($_POST['newRole'])) {
            $newRole = $_POST['newRole'];
        } else {
            $newRole = null;
        }
        $this->getServiceLocator()->get('Application')->getServiceManager()->get('zfcuser_auth_service')->getIdentity()->setCurrentRole($newRole);
        $response = $this->getResponse();
        $response->setStatusCode(200);
        $response->setContent($contentMsg);
        // return $response;
        return $this->redirect()->toRoute('home');
    }

}
