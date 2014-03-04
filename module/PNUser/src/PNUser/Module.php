<?php

namespace PNUser;

use Zend\Mvc\MvcEvent;

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
