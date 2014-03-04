<?php

namespace PNUser;

use Zend\Mvc\MvcEvent;
use Zend\Session\Container;
use Zend\Session\SessionManager;
class Module {

    public function onBootstrap(MvcEvent $e) {
        $app = $e->getApplication();
        $events = $app->getEventManager();
        $shared = $events->getSharedManager();
        $sm = $app->getServiceManager();

        $this->addRegisterListener($shared, $sm);
        $this->setViewVariables($app, $sm);
    }

    public function bootstrapSession($sm) {
        $session = $sm->get('Zend\Session\SessionManager');
        $session->start();

        $container = new Container('initialized');
        if (!isset($container->init)) {
            $session->regenerateId(true);
            $container->init = 1;
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
                    //Class should be fetched from service manger since it will require constructor arguments
                    $sessionSaveHandler = $sm->get($session['save_handler']);
                }
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
        return include (__DIR__ . '/../../config/module.config.php');
    }

    public function getAutoloaderConfig() {
        return array(
            'Zend\Loader\StandardAutoloader' => array(
                'namespaces' => array(
                    __NAMESPACE__ => __DIR__ . '/../../src/' . __NAMESPACE__,
                ),
            ),
        );
    }

    private function addRegisterListener($shared, $sm) {
        $shared->attach('ZfcUser\Service\User', 'register.post', function($e) use ($sm) {
            $newUser = $e->getParam('user');
            $entityManager = $sm->get('Doctrine\ORM\EntityManager');

            $userRole = new \PNUser\Entity\UserRole(); //Create new UserRole Entity
            $userRole->setUserId($newUser->getId()); //Set the new userId in the UserRole entity

            $entityManager->persist($userRole); //Ready-up the query to insert the UserRole into user_role_linker
            $entityManager->flush(); //Execute the query
        });
    }

}
