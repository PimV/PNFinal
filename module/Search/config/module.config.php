<?php

return array(
    'controllers' => array(
        'invokables' => array(
            'Search\Controller\Index' => 'Search\Controller\IndexController',
        ),
    ),
    'router' => array(
        'routes' => array(
            'search' => array(
                'type' => 'segment',
                'options' => array(
                    'route' => '/search[/:action]',
                    'constraints' => array(
                        'action' => '[a-zA-Z][a-zA-Z0-9_-]*'
                    ),
                    'defaults' => array(
                        'controller' => 'Search\Controller\Index',
                        'action' => 'index',
                    ),
                ),
            ),
        ),
    ),
    'view_manager' => array(
        'template_path_stack' => array(
            'search' => __DIR__ . '/../view'
        ),
    ),
);
