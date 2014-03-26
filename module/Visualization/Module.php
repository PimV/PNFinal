<?php

namespace Visualization;

use Zend\Mvc\MvcEvent;
use Zend\Mvc\ModuleRouteListener;
use Visualization\Model\Site;
use Visualization\Model\SiteTable;
use Visualization\Model\SiteUser;
use Visualization\Model\SiteUserTable;
use Zend\Db\ResultSet\ResultSet;
use Zend\Db\TableGateway\TableGateway;

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
            'factories' => array(
                'Visualization\Model\SiteTable' => function($sm) {
            $tableGateway = $sm->get('SiteTableGateway');
            $table = new SiteTable($tableGateway);
            return $table;
        },
                'SiteTableGateway' => function($sm) {
            $dbAdapter = $sm->get('db');
            $resultSetPrototype = new ResultSet();
            $resultSetPrototype->setArrayObjectPrototype(new Site());
            return new TableGateway('site', $dbAdapter, null, $resultSetPrototype);
        },
                'Visualization\Model\SiteUserTable' => function($sm) {
            $tableGateway = $sm->get('SiteUserTableGateway');
            $table = new SiteUserTable($tableGateway);
            return $table;
        },
                'SiteUserTableGateway' => function($sm) {
            $dbAdapter = $sm->get('db');
            $resultSetPrototype = new ResultSet();
            $resultSetPrototype->setArrayObjectPrototype(new SiteUser());
            return new TableGateway('site_user', $dbAdapter, null, $resultSetPrototype);
        }
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
