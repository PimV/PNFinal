<?php

return array(
    'bjyauthorize' => array(
// set the 'guest' role as default (must be defined in a role provider)
        'default_role' => 'guest',
        /* this module uses a meta-role that inherits from any roles that should
         * be applied to the active user. the identity provider tells us which
         * roles the "identity role" should inherit from.
         *
         * for ZfcUser, this will be your default identity provider
         */
//'identity_provider' => 'BjyAuthorize\Provider\Identity\ZfcUserDoctrineEntity',
        /* If you only have a default role and an authenticated role, you can
         * use the 'AuthenticationIdentityProvider' to allow/restrict access
         * with the guards based on the state 'logged in' and 'not logged in'.
         *
         * 'default_role'       => 'guest',         // not authenticated
         * 'authenticated_role' => 'user',          // authenticated
         * 'identity_provider'  => 'BjyAuthorize\Provider\Identity\AuthenticationIdentityProvider',
         */
        'identity_provider' => 'BjyAuthorize\Provider\Identity\AuthenticationIdentityProvider',
        /* role providers simply provide a list of roles that should be inserted
         * into the Zend\Acl instance. the module comes with two providers, one
         * to specify roles in a config file and one to load roles using a
         * Zend\Db adapter.
         */
        'role_providers' => array(
            /* here, 'guest' and 'user are defined as top-level roles, with
             * 'admin' inheriting from user
             */
            'BjyAuthorize\Provider\Role\Config' => array(
                'guest' => array(),
                'advertiser' => array(),
                'publisher' => array(),
                'administrator' => array(),
            ),
            // this will load roles from
// the 'BjyAuthorize\Provider\Role\ObjectRepositoryProvider' service
            'BjyAuthorize\Provider\Role\ObjectRepositoryProvider' => array(
// class name of the entity representing the role
                'role_entity_class' => 'PNUser\Entity\Role',
                // service name of the object manager
                'object_manager' => 'doctrine.entitymanager.orm_default',
            ),
        ),
        // resource providers provide a list of resources that will be tracked
// in the ACL. like roles, they can be hierarchical
        'resource_providers' => array(
            'BjyAuthorize\Provider\Resource\Config' => array(),
        ),
        /* rules can be specified here with the format:
         * array(roles (array), resource, [privilege (array|string), assertion])
         * assertions will be loaded using the service manager and must implement
         * Zend\Acl\Assertion\AssertionInterface.
         * *if you use assertions, define them using the service manager!*
         */
        'rule_providers' => array(
            'BjyAuthorize\Provider\Rule\Config' => array(
                'allow' => array(),
                'deny' => array(),
            ),
        ),
        /* Currently, only controller and route guards exist
         *
         * Consider enabling either the controller or the route guard depending on your needs.
         */
        'guards' => array(
            /* If this guard is specified here (i.e. it is enabled), it will block
             * access to all controllers and actions unless they are specified here.
             * You may omit the 'action' index to allow access to the entire controller
             */
            'BjyAuthorize\Guard\Controller' => array(
                //Allow access to home to anyone.
                array(
                    'controller' => 'Application\Controller\Index',
                    'roles' => array(
                        'guest',
                        'advertiser',
                        'publisher',
                        'administrator',
                    ),
                ),
                //Enable static routes
                array(
                    'controller' => 'PNUser\Controller\User',
                    'action' => array(
                        'role',
                    ),
                    'roles' => array(
                        'publisher',
                        'advertiser',
                        'administrator',
                    ),
                ),
                //Enable zfcuser routes
                array(
                    'controller' => array(
                        'zfcuser',
                    ),
                    'action' => array(
                        'index',
                        'logout',
                    ),
                    'roles' => array(
                        'publisher',
                        'advertiser',
                        'administrator',
                    ),
                ),
                array(
                    'controller' => array(
                        'zfcuser',
                    ),
                    'action' => array(
                        'login',
                        'register',
                    ),
                    'roles' => array(
                        'guest',
                    ),
                ),
                //Enable search controllers home page (ALL)
                array(
                    'controller' => array(
                        'Search\Controller\Index',
                    ),
                    'action' => array(
                        'index',
                    ),
                    'roles' => array(
                        'publisher',
                        'advertiser',
                        'administrator',
                    )
                ),
                //Enable search for advertisers
                array(
                    'controller' => array(
                        'Search\Controller\Advertiser',
                    ),
                    'action' => array(
                        'index', 'search',
                    ),
                    'roles' => array(
                        'advertiser',
                    )
                ),
                //Enable search for publishers
                array(
                    'controller' => array(
                        'Search\Controller\Publisher',
                    ),
                    'action' => array(
                        'index', 'search',
                    ),
                    'roles' => array(
                        'publisher',
                    )
                ),
                //Enable Search Results
                array(
                    'controller' => array(
                        'Search\Controller\Index',
                    ),
                    'action' => array(
                        'index', 'search', 'results',
                    ),
                    'roles' => array(
                        'publisher', 'advertiser', 'administrator'
                    )
                ),
                //Enable visualization for advertisers
                array(
                    'controller' => array(
                        'Visualization\Controller\Advertiser',
                    ),
                    'action' => array(
                        'index', 'search', 'revenue'
                    ),
                    'roles' => array(
                        'advertiser',
                    )
                ),
                //Enable visualization for publishers
                array(
                    'controller' => array(
                        'Visualization\Controller\Publisher',
                    ),
                    'action' => array(
                        'index', 'search',
                    ),
                    'roles' => array(
                        'publisher',
                    )
                ),
            ),
        /* If this guard is specified here (i.e. it is enabled), it will block
         * access to all routes unless they are specified here.
         */
//            'BjyAuthorize\Guard\Route' => array(
//                //Allow zfcuser routes
//                array(
//                    'route' => 'zfcuser',
//                    'roles' => array('advertiser', 'publisher')
//                ),
//                array(
//                    'route' => 'zfcuser/logout',
//                    'roles' => array('advertiser', 'publisher')
//                ),
//                array(
//                    'route' => 'zfcuser/login',
//                    'roles' => array('guest')
//                ),
//                array(
//                    'route' => 'zfcuser/register',
//                    'roles' => array('guest')
//                ),
//                //Allow advertiser routes for advertisers
//                array(
//                    'route' => 'advertiser/mod4ad',
//                    'roles' => array('advertiser'),
//                ),
//                array(
//                    'route' => 'advertiser/mod5ad',
//                    'roles' => array('advertiser')
//                ),
//                //Allow publisher routes for publishers                
//                array(
//                    'route' => 'publisher/mod2pub',
//                    'roles' => array('publisher')
//                ),
//                array(
//                    'route' => 'publisher/mod3pub',
//                    'roles' => array('publisher')
//                ),
//                // Below is the default index action used by the ZendSkeletonApplication
//                array(
//                    'route' => 'home',
//                    'roles' => array('guest', 'advertiser', 'publisher')
//                ),
        //),
        ),
        ));
