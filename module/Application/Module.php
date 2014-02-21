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
use Zend\Mvc\Router\RouteMatch;

class Module {

    //protected $whitelist = array('login', 'home', 'login/process/authenticate', 'login/process/success');
    protected $whitelist = array(
        'login',
        'home',
        'success',
        'login/process',
    );

    public function onBootstrap(MvcEvent $e) {
        $eventManager = $e->getApplication()->getEventManager();
        $moduleRouteListener = new ModuleRouteListener();
        $moduleRouteListener->attach($eventManager);
        $app = $e->getApplication();
        $sm = $app->getServiceManager();

        $container = $sm->get('navigation');
        if ($sm->get('AuthService')->hasIdentity()) {
            $loginPage = $container->findBy('route', 'login');
            $container->removePage($loginPage);
            $logoutPage = $container->findBy('route', 'logout');
            $container->addPage($logoutPage);
            $container->addPage($container->findBy('route', 'performance'));
            $container->addPage($container->findBy('route', 'seo-metrics'));
            $container->addPage($container->findBy('route', 'rankings'));
            $container->addPage($container->findBy('route', 'search'));
            $container->addPage($container->findBy('route', 'social-engagement'));
        } else {
            $logoutPage = $container->findBy('route', 'logout');
            $container->removePage($logoutPage);
            $loginPage = $container->findBy('route', 'login');
            $container->addPage($loginPage);
            $container->removePage($container->findBy('route', 'performance'));
            $container->removePage($container->findBy('route', 'seo-metrics'));
            $container->removePage($container->findBy('route', 'rankings'));
            $container->removePage($container->findBy('route', 'search'));
            $container->removePage($container->findBy('route', 'social-engagement'));
        }

        $list = $this->whitelist;
        $auth = $sm->get('AuthService');

        $eventManager->attach(MvcEvent::EVENT_ROUTE, function($e) use ($list, $auth) {
            if ($auth->hasIdentity()) {
                return;
            }

            $match = $e->getRouteMatch();
            if (!$match instanceof RouteMatch) {
                return;
            }
            $name = $match->getMatchedRouteName();
            if (in_array($name, $list)) {
                return;
            }


            $router = $e->getRouter();
            $url = $router->assemble(array(), array(
                'name' => 'login'
            ));
            $response = $e->getResponse();
            $response->getHeaders()->addHeaderLine('Location', $url);
            $response->setStatusCode(302);

            return $response;
        }, -100);
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

}
