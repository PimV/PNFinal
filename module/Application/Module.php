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
use Zend\Session\Container;
use Zend\Session\SessionManager;

class Module {

    public function onBootstrap(MvcEvent $e) {
        $eventManager = $e->getApplication()->getEventManager();
        $moduleRouteListener = new ModuleRouteListener();
        $moduleRouteListener->attach($eventManager);
        $app = $e->getApplication();
        $sm = $app->getServiceManager();
        $auth = $sm->get('zfcuser_auth_service');
        $viewModel = $app->getMvcEvent()->getViewModel();


        $this->bootstrapSession($sm, $auth);
        $this->setUserInformation($auth, $viewModel);
        $this->setUserNavigation($app, $sm, $auth, $viewModel);
        $this->setCurrentPageActive($eventManager, $e);
    }

    public function bootstrapSession($sm, $auth) {
        $session = $sm->get('Zend\Session\SessionManager');
        $session->start();

        $container = new Container('role');
        if (!isset($container->role)) {
            if ($auth->hasIdentity()) {
                $container->role = $auth->getIdentity()->getRoles()[0];
            } else {
                unset($container->role);
            }
        }
    }

    public function getServiceConfig() {
        return array(
            'factories' => array(
                'Zend\Session\SessionManager' => function($sm) {
            $config = $sm->get('config');
            if (isset($config['session'])) {
                $session = $config['session'];
                $sessionConfig = null;
                if (isset($session['config'])) {
                    $class = isset($session['config']['class']) ? $session['config']['class'] : 'Zend\Session\Config\SessionConfig';
                    $options = isset($session['config']['options']) ? $session['config']['options'] : array();
                    $sessionConfig = new $class();
                    $sessionConfig->setOptions($options);
                }

                $sessionStorage = null;
                if (isset($session['storage'])) {
                    $class = $session['storage'];
                    $sessionStorage = new $class();
                }

                $sessionSaveHandler = null;
                if (isset($session['save_handler'])) {
                    //Class should be fetched from service manager since it will require constructor arguments
                    $sessionSaveHandler = $sm->get($session['save_handler']);
                }

                $sessionManager = new SessionManager($sessionConfig, $sessionStorage, $sessionSaveHandler);

                if (isset($session['validators'])) {
                    $chain = $sessionManager->getValidatorChain();
                    foreach ($session['validators'] as $validator) {
                        $validator = new $validator();
                        $chain->attach('session.validate', array($validator, 'isValid'));
                    }
                } else {
                    $sessionManager = new SessionManager();
                }
                Container::setDefaultManager($sessionManager);
                return $sessionManager;
            }
        },
            ),
        );
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

    /**
     * Set the ZfcUser buttons (login/logout/profile) to show/hide where needed.
     */
    private function setUserNavigation($app, $sm, $auth, $viewModel) {
        //Get user navigation buttons
        $stdNavContainer = $sm->get('user_navigation');
        $loginPage = $stdNavContainer->findOneBy('label', 'Login');
        $profilePage = $stdNavContainer->findOneBy('label', 'Profile');
        $logoutPage = $stdNavContainer->findOneBy('label', 'Logout');

        if ($auth->hasIdentity()) { //If user is logged in
            $loginPage->setVisible(false);
            $profilePage->setVisible(true);
            $logoutPage->setVisible(true);
        } else {
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

    private function setUserInformation($auth, $viewModel) {
        $container = new Container('role');

        $role = null;
        $username = null;
        if ($auth->hasIdentity()) {
            $viewModel->roles = $auth->getIdentity()->getRoles();
            $viewModel->username = explode('@', $auth->getIdentity()->getEmail())[0];

            if (isset($container)) {
                if ($container->role !== null) {
                    $role = $container->role;
                }
            }
        }
        if ($role === null) {
            unset($container->role);
        }
        $viewModel->role = $role;
    }

}
