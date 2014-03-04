<?php

/**
 * Zend Framework (http://framework.zend.com/)
 *
 * @link      http://github.com/zendframework/ZendSkeletonApplication for the canonical source repository
 * @copyright Copyright (c) 2005-2014 Zend Technologies USA Inc. (http://www.zend.com)
 * @license   http://framework.zend.com/license/new-bsd New BSD License
 */

namespace Application;

use Zend\Mvc\ModuleRouteListener;
use Zend\Mvc\MvcEvent;

class Module {

    public function onBootstrap(MvcEvent $e) {
        $eventManager = $e->getApplication()->getEventManager();
        $moduleRouteListener = new ModuleRouteListener();
        $moduleRouteListener->attach($eventManager);

        $this->setUserNavigation($e);
        $this->setCurrentPageActive($eventManager, $e);
    }

    public function getConfig() {
        return include __DIR__ . '/config/module.config.php';
    }

    public function getAutoloaderConfig() {
        return array(
            'Zend\Loader\StandardAutoloader' => array(
                'namespaces' => array(
                    __NAMESPACE__ => __DIR__ . '/src/' . __NAMESPACE__,
                ),
            ),
        );
    }

    private function setUserNavigation($e) {
        $sm = $e->getApplication()->getServiceManager();
        $auth = $sm->get('zfcuser_auth_service');
        //Get user navigation buttons
        $stdNavContainer = $sm->get('user_navigation');
        $loginPage = $stdNavContainer->findOneBy('label', 'Login');
        $profilePage = $stdNavContainer->findOneBy('label', 'Profile');
        $logoutPage = $stdNavContainer->findOneBy('label', 'Logout');
        if ($auth->hasIdentity()) { //If user is logged in
            //Toggle user navigation buttons
            $loginPage->setVisible(false);
            $profilePage->setVisible(true);
            $logoutPage->setVisible(true);
            //Enable buttons for role navigation
        } else {
            //Toggle user navigation buttons
            $loginPage->setVisible(true);
            $profilePage->setVisible(false);
            $logoutPage->setVisible(false);
        }
    }

    /**
     * Has to be improved!
     * @param type $eventManager
     * @return type
     */
    private function setCurrentPageActive($eventManager) {
        $eventManager->attach(MvcEvent::EVENT_ROUTE, function($e) {
            $sm = $e->getApplication()->getServiceManager();
            $match = $e->getRouteMatch();
            $config = $sm->get('Config');

            $name = $match->getMatchedRouteName();
            $containerNames = array_keys($config['navigation']);
            try {
                foreach ($containerNames as $containerName) {
                    $container = $sm->get($containerName);
                    if ($container !== null) {
                        $page = $container->findBy('route', $name);
                        if (isset($page) && $page !== null) {
                            $page->setActive(true);
                        }
                        break;
                    }
                }
            } catch (ServiceNotFoundException $ex) {
                return "Could not find active page";
            }
        }, -100);
    }

}
