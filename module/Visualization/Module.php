<?php

namespace Visualization;

use Zend\Mvc\MvcEvent;
use Zend\Mvc\ModuleRouteListener;

class Module {

    public function onBootstrap(MvcEvent $e) {
        $eventManager = $e->getApplication()->getEventManager();
        $moduleRouteListener = new ModuleRouteListener();
        $moduleRouteListener->attach($eventManager);
        $app = $e->getApplication();
        $sm = $app->getServiceManager();
        $viewModel = $app->getMvcEvent()->getViewModel();
    }

    public function getConfig() {
        return include __DIR__ . '/config/module.config.php';
    }

    public function getServiceConfig() {
        return array(
            'invokables' => array(
                'SidebarNavigationFactory' => 'Visualization\Navigation\Service\SidebarNavigationFactory',
            ),
        );
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

}
