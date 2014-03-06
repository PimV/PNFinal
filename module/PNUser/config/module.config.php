<?php

return array(
    'doctrine' => array(
        'driver' => array(
            'zfcuser_entity' => array(
                'class' => 'Doctrine\ORM\Mapping\Driver\AnnotationDriver',
                'paths' => __DIR__ . '/../src/PNUser/Entity',
            ),
            'orm_default' => array(
                'drivers' => array(
                    'PNUser\Entity' => 'zfcuser_entity',
                ),
            ),
        ),
    ),
    'router' => array(
        'routes' => array(
            'user' => array(
                'type' => 'Literal',
                'options' => array(
                    'route' => '/user',
                    'defaults' => array(
                        'controller' => 'PNUser\Controller\User',
                        'action' => 'index',
                    ),
                ),
                'child_routes' => array(
                    'switch' => array(
                        'type' => 'Segment',
                        'options' => array(
                            'route' => '/role',
                            'constraints' => array(
                                'action' => '[a-zA-Z][a-zA-Z0-9_-]*',
                            ),
                            'defaults' => array(
                                'controller' => 'PNUser\Controller\User',
                                'action' => 'role',
                            ),
                        ),
                    ),
                ),
            ),
        ),
    ),
    'controllers' => array(
        'invokables' => array(
            'PNUser\Controller\User' => 'PNUser\Controller\UserController',
        ),
    ),
    'view_manager' => array(
        'template_path_stack' => array(
            'pn-user' => __DIR__ . '/../user'
        ),
    ),
    'zfcuser' => array(
        'user_entity_class' => 'PNUser\Entity\User',
        'enable_default_entities' => false,
    ),
    'bjyauthorize' => array(
        'identity_provider' => 'BjyAuthorize\Provider\Identity\AuthenticationIdentityProvider',
        'role_providers' => array(
            'BjyAuthorize\Provider\Role\ObjectRepositoryProvider' => array(
                'object_manager' => 'doctrine.entity_manager.orm_default',
                'role_entity_class' => 'PNUser\Entity\Role',
            ),
        ),
    ),
);
